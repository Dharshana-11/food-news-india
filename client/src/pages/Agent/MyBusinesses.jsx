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
  ShoppingOutlined,
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

  if (loading) {
    return (
      <div className="my-businesses-loading">
        <Spin size="large" />
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
          <Col xs={24} sm={12} md={8}>
            <Card className="my-businesses-stat-card my-businesses-stat-blue">
              <div className="my-businesses-stat-content">
                <div className="my-businesses-stat-icon-wrapper">
                  <ShopOutlined className="my-businesses-stat-icon" />
                </div>
                <div className="my-businesses-stat-text-group">
                  <div className="my-businesses-stat-label">
                    Active Businesses
                  </div>
                  <div className="my-businesses-stat-value">
                    {businesses.length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card className="my-businesses-stat-card my-businesses-stat-green">
              <div className="my-businesses-stat-content">
                <div className="my-businesses-stat-icon-wrapper">
                  <ShoppingOutlined className="my-businesses-stat-icon" />
                </div>
                <div className="my-businesses-stat-text-group">
                  <div className="my-businesses-stat-label">
                    Active Bookings
                  </div>
                  <div className="my-businesses-stat-value">
                    {businesses.reduce((sum, b) => sum + b.activeBookings, 0)}
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card className="my-businesses-stat-card my-businesses-stat-orange">
              <div className="my-businesses-stat-content">
                <div className="my-businesses-stat-icon-wrapper">
                  <FileTextOutlined className="my-businesses-stat-icon" />
                </div>
                <div className="my-businesses-stat-text-group">
                  <div className="my-businesses-stat-label">
                    Pending Documents
                  </div>
                  <div className="my-businesses-stat-value">
                    {businesses.reduce(
                      (sum, b) => sum + b.documentStats.pending,
                      0
                    )}
                  </div>
                </div>
              </div>
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
            <p className="my-businesses-empty-hint">
              You will see businesses here once a business owner invites you.
            </p>
          </Empty>
        </Card>
      ) : (
        <div className="my-businesses-list">
          {businesses.map((business) => (
            <Card
              key={business.relationId}
              className="my-businesses-card"
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
              <div className="my-businesses-card-header">
                <div className="my-businesses-business-icon">
                  <ShopOutlined />
                </div>
                <div className="my-businesses-business-info">
                  <h3>{business.businessName}</h3>
                  <div className="my-businesses-business-owner">
                    {business.ownerName}
                  </div>
                  {(business.city || business.state) && (
                    <div className="my-businesses-business-location">
                      <EnvironmentOutlined />
                      {business.city}
                      {business.state && `, ${business.state}`}
                    </div>
                  )}
                </div>
              </div>

              {/* Compliance Score */}
              <div className="my-businesses-compliance">
                <div className="my-businesses-compliance-label">
                  Compliance Score
                </div>
                <div className="my-businesses-compliance-row">
                  <Progress
                    percent={business.complianceScore}
                    strokeColor={getComplianceColor(business.complianceScore)}
                    showInfo={false}
                    size="small"
                  />
                  <span
                    className="my-businesses-compliance-percent"
                    style={{
                      color: getComplianceColor(business.complianceScore),
                    }}
                  >
                    {business.complianceScore}%
                  </span>

                  {business.complianceMeta && (
                    <div className="my-businesses-compliance-meta-text">
                      {business.complianceMeta.fulfilled} /{" "}
                      {business.complianceMeta.totalRequired} mandatory items
                      fulfilled
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="my-businesses-stats-grid">
                <div className="my-businesses-stat-item">
                  <FileTextOutlined />
                  <div className="my-businesses-stat-content">
                    <div className="my-businesses-stat-number">
                      {business.documentStats.total}
                    </div>
                    <div className="my-businesses-stat-text">
                      Total Documents
                    </div>
                  </div>
                </div>

                <div className="my-businesses-stat-item">
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  <div className="my-businesses-stat-content">
                    <div className="my-businesses-stat-number">
                      {business.documentStats.approved}
                    </div>
                    <div className="my-businesses-stat-text">Approved</div>
                  </div>
                </div>

                <div className="my-businesses-stat-item">
                  <ClockCircleOutlined style={{ color: "#faad14" }} />
                  <div className="my-businesses-stat-content">
                    <div className="my-businesses-stat-number">
                      {business.documentStats.pending}
                    </div>
                    <div className="my-businesses-stat-text">Pending</div>
                  </div>
                </div>

                {business.documentStats.expired > 0 && (
                  <div className="my-businesses-stat-item">
                    <WarningOutlined style={{ color: "#ff4d4f" }} />
                    <div className="my-businesses-stat-content">
                      <div className="my-businesses-stat-number">
                        {business.documentStats.expired}
                      </div>
                      <div className="my-businesses-stat-text">Expired</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="my-businesses-card-footer">
                <div className="my-businesses-business-meta">
                  <Tag color="blue">
                    {business.activeBookings} Active Bookings
                  </Tag>
                  <span className="my-businesses-commission-text">
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
