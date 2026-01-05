/**
 * AgentBusinessWorkspace.jsx
 * ============================================================================
 * Lite dashboard for agents to manage a specific business
 * Restricted version inspired by BusinessOwnerDashboard
 *
 * Features:
 * - Document overview
 * - Recent bookings
 * - Compliance status
 * - Permission-based actions
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Spin,
  Alert,
  Button,
  Empty,
  Tag,
  Progress,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ShoppingOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";

import agentBusinessService from "../../services/agentBusinessService";
import StatCard from "../../components/dashboard/StatCard";
import { ROUTES } from "../../routes";
import "./AgentBusinessWorkspace.css";

const AgentBusinessWorkspace = () => {
  const { relationId } = useParams();
  const navigate = useNavigate();

  /* =========================================================================
     State
     ========================================================================= */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workspace, setWorkspace] = useState(null);

  /* =========================================================================
     Effects
     ========================================================================= */
  useEffect(() => {
    if (relationId) {
      fetchWorkspace();
    }
  }, [relationId]);

  /* =========================================================================
     API Calls
     ========================================================================= */
  const fetchWorkspace = async () => {
    try {
      setLoading(true);
      setError(null);
      const response =
        await agentBusinessService.getBusinessWorkspace(relationId);
      setWorkspace(response.data);
    } catch (err) {
      console.error("Fetch workspace error:", err);
      setError(err.message || "Failed to load workspace");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================================
     Helpers
     ========================================================================= */
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================================================================
     Loading State
     ========================================================================= */
  if (loading) {
    return (
      <div className="agent-workspace-loading">
        <Spin size="large" tip="Loading workspace..." />
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="agent-workspace-container">
        <Alert
          message="Error"
          description={error || "Workspace not found"}
          type="error"
          showIcon
        />
        <Button
          type="primary"
          onClick={() => navigate(ROUTES.AGENT_MY_BUSINESSES)}
          style={{ marginTop: "1rem" }}
        >
          Back to My Businesses
        </Button>
      </div>
    );
  }

  const { business, documentStats, bookingStats, recentBookings, permissions } =
    workspace;

  /* =========================================================================
     Render
     ========================================================================= */
  return (
    <div className="agent-workspace-container">
      {/* Header */}
      <div className="agent-workspace-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(ROUTES.AGENT_MY_BUSINESSES)}
        />
        <div className="header-content">
          <h2>{business.name}</h2>
          <p>
            {business.ownerName} • {business.city}
            {business.state && `, ${business.state}`}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <Row gutter={[16, 16]} className="agent-workspace-stats">
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Total Documents"
            value={documentStats.total}
            icon={<FileTextOutlined />}
          />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Pending Docs"
            value={documentStats.pending}
            icon={<ClockCircleOutlined />}
          />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Active Bookings"
            value={bookingStats.active}
            icon={<ShoppingOutlined />}
          />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Compliance"
            value={`${documentStats.complianceScore}%`}
            icon={<CheckCircleOutlined />}
          />
        </Col>
      </Row>

      {/* Quick Actions */}
      <section className="agent-workspace-section">
        <h3 className="section-title">Quick Actions</h3>
        <Row gutter={[16, 16]}>
          {permissions.canUploadDocuments && (
            <Col xs={12} sm={8}>
              <Card
                className="action-card"
                hoverable
                onClick={() => navigate(ROUTES.BUSINESS_OWNER_DOCUMENT_VAULT)}
              >
                <div className="action-icon" style={{ background: "#ede9fe" }}>
                  <FolderOpenOutlined style={{ color: "#667eea" }} />
                </div>
                <div className="action-title">Upload Documents</div>
              </Card>
            </Col>
          )}

          {permissions.canSubmitApplications && (
            <Col xs={12} sm={8}>
              <Card
                className="action-card"
                hoverable
                onClick={() => navigate(ROUTES.BUSINESS_OWNER_MY_SERVICES)}
              >
                <div
                  className="action-icon"
                  style={{ background: "var(--color-bg-orange)" }}
                >
                  <ShoppingOutlined style={{ color: "#ff6c1f" }} />
                </div>
                <div className="action-title">Book Services</div>
              </Card>
            </Col>
          )}

          <Col xs={12} sm={8}>
            <Card
              className="action-card"
              hoverable
              onClick={() => navigate(ROUTES.BUSINESS_OWNER_MY_BOOKINGS)}
            >
              <div
                className="action-icon"
                style={{ background: "var(--color-bg-green)" }}
              >
                <FileTextOutlined style={{ color: "#4bb78f" }} />
              </div>
              <div className="action-title">View All Bookings</div>
            </Card>
          </Col>
        </Row>
      </section>

      {/* Two Column Layout */}
      <div className="agent-workspace-layout">
        {/* Left Column - Recent Bookings */}
        <div className="workspace-column-left">
          <section className="agent-workspace-section">
            <div className="section-header">
              <h3 className="section-title">Recent Bookings</h3>
              <Button
                type="link"
                onClick={() => navigate(ROUTES.BUSINESS_OWNER_MY_BOOKINGS)}
              >
                View All
              </Button>
            </div>

            {recentBookings.length === 0 ? (
              <Card>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No bookings yet"
                />
              </Card>
            ) : (
              <div className="bookings-list">
                {recentBookings.map((booking) => (
                  <Card
                    key={booking._id}
                    className="booking-card"
                    hoverable
                    onClick={() =>
                      navigate(
                        ROUTES.BUSINESS_OWNER_SERVICE_DETAILS.replace(
                          ":bookingId",
                          booking._id
                        )
                      )
                    }
                  >
                    <div className="booking-header">
                      <h4>{booking.complianceItemId?.name || "Service"}</h4>
                      <Tag color={getStatusColor(booking.status)}>
                        {getStatusLabel(booking.status)}
                      </Tag>
                    </div>
                    <p className="booking-provider">
                      Provider: {booking.providerId?.companyName || "N/A"}
                    </p>
                    <div className="booking-footer">
                      <span className="booking-price">
                        ₹{booking.agreedPrice?.toLocaleString() || 0}
                      </span>
                      <span className="booking-date">
                        {formatDate(booking.bookedAt || booking.createdAt)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column - Document Overview & Compliance */}
        <div className="workspace-column-right">
          <Card className="info-panel">
            {/* Document Overview */}
            <div className="panel-section">
              <div className="section-header">
                <h3 className="section-title">Document Overview</h3>
                <Button
                  type="link"
                  onClick={() => navigate(ROUTES.BUSINESS_OWNER_DOCUMENT_VAULT)}
                >
                  View Vault
                </Button>
              </div>

              <div className="doc-overview">
                <div className="doc-progress-row">
                  <Progress
                    percent={
                      documentStats.total
                        ? Math.round(
                            (documentStats.approved / documentStats.total) * 100
                          )
                        : 0
                    }
                    showInfo={false}
                  />
                  <span className="doc-percent">
                    {documentStats.total
                      ? Math.round(
                          (documentStats.approved / documentStats.total) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>

                <div className="doc-meta">
                  <div>
                    <CheckCircleOutlined />
                    Approved <strong>{documentStats.approved}</strong>
                  </div>
                  <div>
                    <ClockCircleOutlined />
                    Pending <strong>{documentStats.pending}</strong>
                  </div>
                  <div>
                    <WarningOutlined />
                    Expired <strong>{documentStats.expired}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel-divider" />

            {/* Compliance Score */}
            <div className="panel-section">
              <h3 className="section-title">Compliance Status</h3>

              <div className="compliance-score">
                <Progress
                  type="circle"
                  percent={documentStats.complianceScore}
                  strokeColor={
                    documentStats.complianceScore >= 80
                      ? "#52c41a"
                      : documentStats.complianceScore >= 50
                        ? "#faad14"
                        : "#ff4d4f"
                  }
                />

                <div className="compliance-meta">
                  <p>
                    <strong>{documentStats.approved}</strong> /{" "}
                    <strong>{documentStats.total}</strong> documents approved
                  </p>

                  {documentStats.pending > 0 && (
                    <Tag color="orange" className="compliance-tag">
                      {documentStats.pending} pending document
                      {documentStats.pending > 1 ? "s" : ""}
                    </Tag>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentBusinessWorkspace;
