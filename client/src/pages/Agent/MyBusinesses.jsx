/**
 * MyBusinesses.jsx
 * ============================================================================
 * Agent page to view all assigned active businesses
 *
 * Responsibilities:
 * - Display active business assignments
 * - Show key metrics (compliance, bookings, documents)
 * - Navigate to business workspace
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Empty,
  Spin,
  message,
  Tag,
  Progress,
  Row,
  Col,
} from "antd";
import {
  ArrowRightOutlined,
  ShopOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import agentBusinessService from "../../services/agentBusinessService";
import { ROUTES } from "../../routes";
import "./MyBusinesses.css";

const MyBusinesses = () => {
  /* =========================================================================
     State
     ========================================================================= */
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /* =========================================================================
     Effects
     ========================================================================= */
  useEffect(() => {
    fetchBusinesses();
  }, []);

  /* =========================================================================
     API Calls
     ========================================================================= */
  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const response = await agentBusinessService.getMyBusinesses();
      setBusinesses(response.businesses || []);
    } catch (error) {
      console.error("Fetch businesses error:", error);
      message.error(error.message || "Failed to load businesses");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================================
     Helpers
     ========================================================================= */
  const getComplianceColor = (score) => {
    if (score >= 80) return "#52c41a";
    if (score >= 50) return "#faad14";
    return "#ff4d4f";
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
      <div className="my-businesses-loading">
        <Spin size="large" tip="Loading businesses..." />
      </div>
    );
  }

  /* =========================================================================
     Render
     ========================================================================= */
  return (
    <div className="my-businesses-container">
      {/* Header */}
      <div className="my-businesses-header">
        <h2>My Businesses</h2>
        <p>Manage compliance and services for your assigned businesses</p>
      </div>

      {/* Summary Stats */}
      {businesses.length > 0 && (
        <Row gutter={[16, 16]} className="my-businesses-stats">
          <Col xs={12} sm={8}>
            <Card className="stat-card">
              <div className="stat-value">{businesses.length}</div>
              <div className="stat-label">Active Businesses</div>
            </Card>
          </Col>
          <Col xs={12} sm={8}>
            <Card className="stat-card">
              <div className="stat-value">
                {businesses.reduce((sum, b) => sum + b.activeBookings, 0)}
              </div>
              <div className="stat-label">Active Bookings</div>
            </Card>
          </Col>
          <Col xs={12} sm={8}>
            <Card className="stat-card">
              <div className="stat-value">
                {businesses.reduce(
                  (sum, b) => sum + b.documentStats.pending,
                  0
                )}
              </div>
              <div className="stat-label">Pending Documents</div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Business List */}
      {businesses.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No businesses assigned yet"
          >
            <p className="empty-hint">
              You will see businesses here once a business owner invites you.
            </p>
          </Empty>
        </Card>
      ) : (
        <div className="businesses-list">
          {businesses.map((business) => (
            <Card
              key={business.relationId}
              className="business-card"
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
              {/* Header */}
              <div className="business-card-header">
                <div className="business-icon">
                  <ShopOutlined />
                </div>
                <div className="business-info">
                  <h3>{business.businessName}</h3>
                  <div className="business-owner">{business.ownerName}</div>
                  {(business.city || business.state) && (
                    <div className="business-location">
                      <EnvironmentOutlined />
                      {business.city}
                      {business.state && `, ${business.state}`}
                    </div>
                  )}
                </div>
              </div>

              {/* Compliance Score */}
              <div className="business-compliance">
                <div className="compliance-label">Compliance Score</div>
                <div className="compliance-row">
                  <Progress
                    percent={business.complianceScore}
                    strokeColor={getComplianceColor(business.complianceScore)}
                    showInfo={false}
                    size="small"
                  />
                  <span
                    className="compliance-percent"
                    style={{
                      color: getComplianceColor(business.complianceScore),
                    }}
                  >
                    {business.complianceScore}%
                  </span>
                  {business.complianceMeta && (
                    <div className="compliance-meta-text">
                      {business.complianceMeta.fulfilled} /{" "}
                      {business.complianceMeta.totalRequired} mandatory items
                      fulfilled
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="business-stats">
                <div className="stat-item">
                  <FileTextOutlined />
                  <div className="stat-content">
                    <div className="stat-number">
                      {business.documentStats.total}
                    </div>
                    <div className="stat-text">Total Documents</div>
                  </div>
                </div>

                <div className="stat-item">
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  <div className="stat-content">
                    <div className="stat-number">
                      {business.documentStats.approved}
                    </div>
                    <div className="stat-text">Approved</div>
                  </div>
                </div>

                <div className="stat-item">
                  <ClockCircleOutlined style={{ color: "#faad14" }} />
                  <div className="stat-content">
                    <div className="stat-number">
                      {business.documentStats.pending}
                    </div>
                    <div className="stat-text">Pending</div>
                  </div>
                </div>

                {business.documentStats.expired > 0 && (
                  <div className="stat-item">
                    <WarningOutlined style={{ color: "#ff4d4f" }} />
                    <div className="stat-content">
                      <div className="stat-number">
                        {business.documentStats.expired}
                      </div>
                      <div className="stat-text">Expired</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="business-card-footer">
                <div className="business-meta">
                  <Tag color="blue">
                    {business.activeBookings} Active Bookings
                  </Tag>
                  <span className="commission-text">
                    ₹{business.agreedCommission}/month
                  </span>
                </div>

                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      ROUTES.AGENT_BUSINESS_WORKSPACE.replace(
                        ":relationId",
                        business.relationId
                      )
                    );
                  }}
                >
                  Open Workspace
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBusinesses;
