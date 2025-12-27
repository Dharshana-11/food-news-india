import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Spin, Alert, Tag, Button, Empty, Progress } from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ShoppingOutlined,
  FolderOpenOutlined,
  TeamOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";

// Components
import StatCard from "../../components/dashboard/StatCard";
import KYCGuard from "../../components/KYCGuard/KYCGuard";

// Services
import bookingService from "../../services/bookingService";
import {
  getDocumentStats,
  getMyDocuments,
} from "../../services/documentVaultService";
import agentService from "../../services/myAgentService";
import myServicesService from "../../services/myServicesService";

// Constants
import ROLES from "../../constants/roles";
import { ROUTES } from "../../routes";

// Styles
import "./BusinessOwnerDashboard.css";

const BusinessOwnerDashboard = () => {
  const navigate = useNavigate();

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data States
  const [stats, setStats] = useState({
    totalServices: 0,
    activeBookings: 0,
    totalBookings: 0,
    completedBookings: 0,
    totalDocuments: 0,
    approvedDocuments: 0,
    pendingDocuments: 0,
    expiredDocuments: 0,
    activeAgents: 0,
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [myServices, setMyServices] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [bookingsRes, docsStatsRes, docsListRes, agentsRes, servicesRes] =
        await Promise.allSettled([
          bookingService.getMyBookings({
            limit: 3,
            sortBy: "bookedAt",
            sortOrder: "desc",
          }),
          getDocumentStats(),
          getMyDocuments({ expiry: "expiring_soon" }),
          agentService.getMyAgents(),
          myServicesService.getServices({ limit: 3 }),
        ]);

      const newStats = { ...stats };

      // Process Bookings
      if (bookingsRes.status === "fulfilled" && bookingsRes.value?.success) {
        const bookingsData = bookingsRes.value.data;
        setRecentBookings(
          Array.isArray(bookingsData) ? bookingsData.slice(0, 3) : []
        );
        newStats.totalBookings = bookingsRes.value.pagination?.total || 0;

        // Count active bookings (pending, accepted, in_progress)
        if (Array.isArray(bookingsData)) {
          newStats.activeBookings = bookingsData.filter((b) =>
            [
              "pending",
              "accepted",
              "in_progress",
              "documents_submitted",
            ].includes(b.status)
          ).length;
          newStats.completedBookings = bookingsData.filter(
            (b) => b.status === "completed"
          ).length;
        }
      }

      // Process Document Stats
      if (docsStatsRes.status === "fulfilled" && docsStatsRes.value?.success) {
        const docStats = docsStatsRes.value.data;
        newStats.totalDocuments = docStats.total || 0;
        newStats.approvedDocuments = docStats.approved || 0;
        newStats.pendingDocuments = docStats.pending || 0;
        newStats.expiredDocuments = docStats.expired || 0;
      }
      // Process Services
      if (servicesRes.status === "fulfilled" && servicesRes.value?.success) {
        setMyServices(servicesRes.value.data || []);
        newStats.totalServices = servicesRes.value.pagination?.total || 0;
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
      title: "Book Services",
      icon: <ShoppingOutlined />,
      path: ROUTES.BUSINESS_OWNER_MY_SERVICES,
      color: "#ff6c1f",
      bg: "var(--color-bg-orange)",
    },
    {
      title: "My Bookings",
      icon: <FileTextOutlined />,
      path: ROUTES.BUSINESS_OWNER_MY_BOOKINGS,
      color: "#4bb78f",
      bg: "var(--color-bg-green)",
    },
    {
      title: "Document Vault",
      icon: <FolderOpenOutlined />,
      path: ROUTES.BUSINESS_OWNER_DOCUMENT_VAULT,
      color: "#667eea",
      bg: "#ede9fe",
    },
    {
      title: "My Agents",
      icon: <TeamOutlined />,
      path: ROUTES.BUSINESS_OWNER_MY_AGENTS,
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

  if (loading) {
    return (
      <KYCGuard userRole={ROLES.BUSINESS_OWNER}>
        <div className="bo-dashboard-loading">
          <Spin size="large" tip="Loading dashboard..." />
        </div>
      </KYCGuard>
    );
  }

  return (
    <KYCGuard userRole={ROLES.BUSINESS_OWNER}>
      <div className="bo-dashboard">
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            className="bo-error-alert"
          />
        )}

        {/* Header */}
        <div className="bo-dashboard-header">
          <h1>Welcome Back!</h1>
          <p>Manage your compliance, bookings, and documents efficiently</p>
        </div>

        {/* Stats Grid */}
        <div className="bo-stats-grid">
          <StatCard
            title="Available Services"
            value={stats.totalServices}
            icon={<ShoppingOutlined />}
            bgColor="var(--color-primary-orange)"
            iconBg="var(--color-bg-orange)"
          />
          <StatCard
            title="Active Bookings"
            value={stats.activeBookings}
            icon={<ClockCircleOutlined />}
            bgColor="var(--color-primary-orange)"
            iconBg="var(--color-bg-orange)"
          />
          <StatCard
            title="Total Documents"
            value={stats.totalDocuments}
            icon={<FileTextOutlined />}
            bgColor="var(--color-primary-orange)"
            iconBg="var(--color-bg-orange)"
          />
          <StatCard
            title="Active Agents"
            value={stats.activeAgents}
            icon={<TeamOutlined />}
            bgColor="var(--color-primary-orange)"
            iconBg="var(--color-bg-orange)"
          />
        </div>

        {/* Quick Actions */}
        <section className="bo-section">
          <h2 className="bo-section-title">Quick Actions</h2>
          <div className="bo-quick-actions">
            {quickActions.map((action) => (
              <Card
                key={action.path}
                className="bo-action-card"
                hoverable
                onClick={() => navigate(action.path)}
              >
                <div
                  className="bo-action-icon"
                  style={{
                    backgroundColor: action.bg,
                    color: action.color,
                  }}
                >
                  {action.icon}
                </div>
                <h3>{action.title}</h3>
                <ArrowRightOutlined className="bo-action-arrow" />
              </Card>
            ))}
          </div>
        </section>

        {/* Two Column Layout for Desktop */}
        <div className="bo-two-column-layout">
          {/* Left Column */}
          <div className="bo-column-left">
            {/* Recent Bookings */}
            <section className="bo-section">
              <div className="bo-section-header">
                <h2 className="bo-section-title">Recent Bookings</h2>
                {recentBookings.length > 0 && (
                  <Button
                    type="link"
                    onClick={() => navigate(ROUTES.BUSINESS_OWNER_MY_BOOKINGS)}
                  >
                    View All
                  </Button>
                )}
              </div>

              {recentBookings.length > 0 ? (
                <div className="bo-bookings-list">
                  {recentBookings.map((booking) => (
                    <Card key={booking._id} className="bo-booking-card">
                      <div className="bo-booking-header">
                        <h3>{booking.complianceItemId?.name || "Service"}</h3>
                        <Tag color={getStatusColor(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </Tag>
                      </div>
                      <p className="bo-booking-provider">
                        Provider: {booking.providerId?.companyName || "N/A"}
                      </p>
                      <div className="bo-booking-footer">
                        <span className="bo-booking-price">
                          ₹{booking.agreedPrice?.toLocaleString() || 0}
                        </span>
                        <span className="bo-booking-date">
                          {new Date(
                            booking.bookedAt || booking.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No bookings yet"
                  >
                    <Button
                      type="primary"
                      onClick={() =>
                        navigate(ROUTES.BUSINESS_OWNER_MY_SERVICES)
                      }
                    >
                      Book Your First Service
                    </Button>
                  </Empty>
                </Card>
              )}
            </section>
          </div>

          {/* Right Column */}
          <div className="bo-column-right">
            <Card className="bo-right-panel">
              {/* Document Overview */}
              <div className="bo-panel-section">
                <div className="bo-section-header">
                  <h2 className="bo-section-title">Document Overview</h2>
                  <Button
                    type="link"
                    onClick={() =>
                      navigate(ROUTES.BUSINESS_OWNER_DOCUMENT_VAULT)
                    }
                  >
                    View Vault
                  </Button>
                </div>

                <div className="bo-doc-overview">
                  <div className="bo-doc-progress-row">
                    <Progress
                      percent={
                        stats.totalDocuments
                          ? Math.round(
                              (stats.approvedDocuments / stats.totalDocuments) *
                                100
                            )
                          : 0
                      }
                      showInfo={false}
                    />
                    <span className="bo-doc-percent">
                      {stats.totalDocuments
                        ? Math.round(
                            (stats.approvedDocuments / stats.totalDocuments) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>

                  <div className="bo-doc-meta">
                    <div>
                      <CheckCircleOutlined />
                      Approved <strong>{stats.approvedDocuments}</strong>
                    </div>
                    <div>
                      <ClockCircleOutlined />
                      Pending <strong>{stats.pendingDocuments}</strong>
                    </div>
                    <div>
                      <WarningOutlined />
                      Expired <strong>{stats.expiredDocuments}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="bo-panel-divider" />

              {/* My Services */}
              {myServices.length > 0 && (
                <div className="bo-panel-section">
                  <div className="bo-section-header">
                    <h2 className="bo-section-title">My Services</h2>
                    <Button
                      type="link"
                      onClick={() =>
                        navigate(ROUTES.BUSINESS_OWNER_MY_SERVICES)
                      }
                    >
                      View All
                    </Button>
                  </div>

                  {myServices.slice(0, 3).map((service) => (
                    <div key={service._id} className="bo-my-service-item">
                      <div>
                        <h4>{service.name}</h4>
                        <p>{service.category?.name || "Service"}</p>
                      </div>
                      <ArrowRightOutlined />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </KYCGuard>
  );
};

export default BusinessOwnerDashboard;
