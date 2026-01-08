import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Spin, Alert, Tag, Button, Empty, Progress } from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ShoppingOutlined,
  FolderOpenOutlined,
  ShopOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  InboxOutlined,
} from "@ant-design/icons";

// Components
import StatCard from "../../components/dashboard/StatCard";
import ComplianceScoreCard from "../../components/dashboard/ComplianceScoreCard";

// Services
import agentBusinessService from "../../services/agentBusinessService";
import agentInviteService from "../../services/agentInviteService";
import bookingService from "../../services/bookingService";

// Constants
import { ROUTES } from "../../routes";

// Styles
import "./AgentDashboard.css";

const AgentDashboard = () => {
  const navigate = useNavigate();

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data States
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    pendingInvites: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalDocuments: 0,
    pendingDocuments: 0,
  });

  const [businesses, setBusinesses] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [worstCompliance, setWorstCompliance] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [businessesRes, invitesRes, bookingsRes] = await Promise.allSettled(
        [
          agentBusinessService.getMyBusinesses(),
          agentInviteService.getMyInvites(),
          bookingService.getMyBookings({
            limit: 3,
            sortBy: "bookedAt",
            sortOrder: "desc",
          }),
        ]
      );

      const newStats = { ...stats };

      // Process Businesses
      if (
        businessesRes.status === "fulfilled" &&
        businessesRes.value?.success
      ) {
        const businessList = businessesRes.value.businesses || [];
        setBusinesses(businessList);
        newStats.totalBusinesses = businessList.length;

        // Calculate aggregate document stats
        newStats.totalDocuments = businessList.reduce(
          (sum, b) => sum + (b.documentStats?.total || 0),
          0
        );
        newStats.pendingDocuments = businessList.reduce(
          (sum, b) => sum + (b.documentStats?.pending || 0),
          0
        );

        // Find business with worst compliance
        if (businessList.length > 0) {
          const worst = businessList.reduce((prev, curr) =>
            (curr.complianceScore || 0) < (prev.complianceScore || 0)
              ? curr
              : prev
          );
          setWorstCompliance(worst);
        }

        // Calculate active bookings across all businesses
        newStats.activeBookings = businessList.reduce(
          (sum, b) => sum + (b.activeBookings || 0),
          0
        );
      }

      // Process Invites
      if (invitesRes.status === "fulfilled" && invitesRes.value?.success) {
        newStats.pendingInvites = invitesRes.value.count || 0;
      }

      // Process Bookings
      if (bookingsRes.status === "fulfilled" && bookingsRes.value?.success) {
        const bookingsData = bookingsRes.value.data || [];
        setRecentBookings(bookingsData);

        // Count completed bookings
        newStats.completedBookings = bookingsData.filter(
          (b) => b.status === "completed"
        ).length;
      }

      setStats(newStats);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "My Businesses",
      icon: <ShopOutlined />,
      path: ROUTES.AGENT_MY_BUSINESSES,
      color: "#667eea",
      bg: "#ede9fe",
    },
    {
      title: "My Requests",
      icon: <InboxOutlined />,
      path: ROUTES.AGENT_MY_REQUESTS,
      color: "#ff6c1f",
      bg: "var(--color-bg-orange)",
      badge: stats.pendingInvites > 0 ? stats.pendingInvites : null,
    },
    {
      title: "Document Vault",
      icon: <FolderOpenOutlined />,
      path: ROUTES.AGENT_DOCUMENT_VAULT,
      color: "#4bb78f",
      bg: "var(--color-bg-green)",
    },
    {
      title: "Book Services",
      icon: <ShoppingOutlined />,
      path: ROUTES.AGENT_BOOK_SERVICES,
      color: "#ffd166",
      bg: "var(--color-bg-yellow)",
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: "orange",
      accepted: "blue",
      in_progress: "cyan",
      documents_submitted: "purple",
      completed: "green",
      cancelled: "red",
      rejected: "red",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      in_progress: "In Progress",
      documents_submitted: "Docs Submitted",
    };
    return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getComplianceColor = (score) => {
    if (score >= 80) return "#52c41a";
    if (score >= 50) return "#faad14";
    return "#ff4d4f";
  };

  if (loading) {
    return (
      <div className="agent-dashboard-loading">
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="agent-dashboard">
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          className="agent-error-alert"
        />
      )}

      {/* Header */}
      <div className="agent-dashboard-header">
        <h1>Agent Dashboard</h1>
        <p>Manage compliance and services for your assigned businesses</p>
      </div>

      {/* Stats Grid */}
      <div className="agent-stats-grid">
        <StatCard
          title="Active Businesses"
          value={stats.totalBusinesses}
          icon={<ShopOutlined />}
          onClick={() => navigate(ROUTES.AGENT_MY_BUSINESSES)}
        />
        <StatCard
          title="Pending Invites"
          value={stats.pendingInvites}
          icon={<InboxOutlined />}
          onClick={() => navigate(ROUTES.AGENT_MY_REQUESTS)}
        />
        <StatCard
          title="Active Bookings"
          value={stats.activeBookings}
          icon={<ShoppingOutlined />}
          onClick={() => navigate(ROUTES.AGENT_MY_BOOKINGS)}
        />
        <StatCard
          title="Total Documents"
          value={stats.totalDocuments}
          icon={<FileTextOutlined />}
          onClick={() => navigate(ROUTES.AGENT_DOCUMENT_VAULT)}
        />
      </div>

      {/* Quick Actions */}
      <section className="agent-section">
        <h2 className="agent-section-title">Quick Actions</h2>
        <div className="agent-quick-actions">
          {quickActions.map((action) => (
            <Card
              key={action.path}
              className="agent-action-card"
              hoverable
              onClick={() => navigate(action.path)}
            >
              <div
                className="agent-action-icon"
                style={{
                  backgroundColor: action.bg,
                  color: action.color,
                }}
              >
                {action.icon}
                {action.badge && (
                  <div className="agent-action-badge">{action.badge}</div>
                )}
              </div>
              <h3>{action.title}</h3>
              <ArrowRightOutlined className="agent-action-arrow" />
            </Card>
          ))}
        </div>
      </section>

      {/* Two Column Layout */}
      <div className="agent-two-column-layout">
        {/* Left Column */}
        <div className="agent-column-left">
          {/* My Businesses */}
          <section className="agent-section">
            <div className="agent-section-header">
              <h2 className="agent-section-title">My Businesses</h2>
              {businesses.length > 0 && (
                <Button
                  type="link"
                  onClick={() => navigate(ROUTES.AGENT_MY_BUSINESSES)}
                >
                  View All
                </Button>
              )}
            </div>

            {businesses.length > 0 ? (
              <div className="agent-businesses-list">
                {businesses.slice(0, 3).map((business) => (
                  <Card
                    key={business.relationId}
                    className="agent-business-card"
                    hoverable
                    onClick={() =>
                      navigate(
                        ROUTES.AGENT_BUSINESS_WORKSPACE.replace(
                          ":relationId",
                          business.relationId
                        )
                      )
                    }
                  >
                    <div className="agent-business-header">
                      <div>
                        <h3>{business.businessName}</h3>
                        <p className="agent-business-owner">
                          {business.ownerName}
                        </p>
                      </div>
                      <div className="agent-business-compliance">
                        <span
                          style={{
                            color: getComplianceColor(business.complianceScore),
                          }}
                        >
                          {business.complianceScore}%
                        </span>
                      </div>
                    </div>
                    <div className="agent-business-stats">
                      <div>
                        <FileTextOutlined />{" "}
                        {business.documentStats?.total || 0}
                      </div>
                      <div>
                        <ShoppingOutlined /> {business.activeBookings || 0}{" "}
                        active
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No businesses assigned yet"
                >
                  <p className="agent-empty-hint">
                    Accept invitations to start managing businesses
                  </p>
                </Empty>
              </Card>
            )}
          </section>

          {/* Recent Bookings */}
          {recentBookings.length > 0 && (
            <section className="agent-section">
              <div className="agent-section-header">
                <h2 className="agent-section-title">Recent Bookings</h2>
                <Button
                  type="link"
                  onClick={() => navigate(ROUTES.AGENT_MY_BOOKINGS)}
                >
                  View All
                </Button>
              </div>

              <div className="agent-bookings-list">
                {recentBookings.map((booking) => (
                  <Card
                    key={booking._id}
                    className="agent-booking-card"
                    hoverable
                    onClick={() =>
                      navigate(
                        ROUTES.AGENT_SERVICE_DETAILS.replace(
                          ":bookingId",
                          booking._id
                        )
                      )
                    }
                  >
                    <div className="agent-booking-header">
                      <h3>{booking.complianceItemId?.name || "Service"}</h3>
                      <Tag color={getStatusColor(booking.status)}>
                        {getStatusLabel(booking.status)}
                      </Tag>
                    </div>
                    <p className="agent-booking-provider">
                      Provider: {booking.providerId?.companyName || "N/A"}
                    </p>
                    <div className="agent-booking-footer">
                      <span className="agent-booking-price">
                        ₹{booking.agreedPrice?.toLocaleString() || 0}
                      </span>
                      <span className="agent-booking-date">
                        {new Date(
                          booking.bookedAt || booking.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="agent-column-right">
          <Card className="agent-right-panel">
            {/* Document Overview */}
            <div className="agent-panel-section">
              <div className="agent-section-header">
                <h2 className="agent-section-title">Document Overview</h2>
                <Button
                  type="link"
                  onClick={() => navigate(ROUTES.AGENT_DOCUMENT_VAULT)}
                >
                  View Vault
                </Button>
              </div>

              <div className="agent-doc-overview">
                <div className="agent-doc-progress-row">
                  <Progress
                    percent={
                      stats.totalDocuments
                        ? Math.round(
                            ((stats.totalDocuments - stats.pendingDocuments) /
                              stats.totalDocuments) *
                              100
                          )
                        : 0
                    }
                    showInfo={false}
                  />
                  <span className="agent-doc-percent">
                    {stats.totalDocuments
                      ? Math.round(
                          ((stats.totalDocuments - stats.pendingDocuments) /
                            stats.totalDocuments) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>

                <div className="agent-doc-meta">
                  <div>
                    <FileTextOutlined />
                    Total <strong>{stats.totalDocuments}</strong>
                  </div>
                  <div>
                    <ClockCircleOutlined />
                    Pending <strong>{stats.pendingDocuments}</strong>
                  </div>
                  <div>
                    <CheckCircleOutlined />
                    Processed{" "}
                    <strong>
                      {stats.totalDocuments - stats.pendingDocuments}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            {worstCompliance && <div className="agent-panel-divider" />}

            {/* Compliance Alert */}
            {worstCompliance && (
              <ComplianceScoreCard
                title={`${worstCompliance.businessName} - Compliance`}
                score={worstCompliance.complianceScore}
                fulfilled={worstCompliance.complianceMeta?.fulfilled}
                totalRequired={worstCompliance.complianceMeta?.totalRequired}
                missing={worstCompliance.complianceMeta?.missing}
                missingItems={
                  worstCompliance.complianceMeta?.missingItems || []
                }
                onFixIssues={() =>
                  navigate(
                    ROUTES.AGENT_BUSINESS_DOCUMENTS.replace(
                      ":relationId",
                      worstCompliance.relationId
                    )
                  )
                }
              />
            )}

            {/* Pending Invites Alert */}
            {stats.pendingInvites > 0 && (
              <>
                <div className="agent-panel-divider" />
                <div className="agent-panel-section">
                  <Card className="agent-invite-alert" bordered={false}>
                    <div className="agent-invite-content">
                      <InboxOutlined className="agent-invite-icon" />
                      <div>
                        <h4>
                          {stats.pendingInvites} Pending Invitation
                          {stats.pendingInvites > 1 ? "s" : ""}
                        </h4>
                        <p>Review and respond to business owner requests</p>
                      </div>
                    </div>
                    <Button
                      type="primary"
                      onClick={() => navigate(ROUTES.AGENT_MY_REQUESTS)}
                    >
                      View Requests
                    </Button>
                  </Card>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
