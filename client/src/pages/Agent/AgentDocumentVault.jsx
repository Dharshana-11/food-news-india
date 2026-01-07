/**
 * AgentDocumentVault.jsx
 * ============================================================================
 * Agent document vault overview showing all assigned businesses
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Empty, Spin, message, Progress, Tag, Alert } from "antd";
import {
  FolderOpenOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  EnvironmentOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import agentDocumentService from "../../services/agentDocumentService";
import { ROUTES } from "../../routes";
import "./AgentDocumentVault.css";

const AgentDocumentVault = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await agentDocumentService.getDocumentOverview();
      setBusinesses(response.businesses || []);
    } catch (error) {
      console.error("Fetch overview error:", error);
      message.error(error.message || "Failed to load document overview");
    } finally {
      setLoading(false);
    }
  };

  const getComplianceColor = (score) => {
    if (score >= 80) return "#52c41a";
    if (score >= 50) return "#faad14";
    return "#ff4d4f";
  };

  if (loading) {
    return (
      <div className="agent-doc-vault-loading">
        <Spin size="large" tip="Loading document vault..." />
      </div>
    );
  }

  return (
    <div className="agent-doc-vault-container">
      {/* Header */}
      <div className="agent-doc-vault-header">
        <div className="agent-doc-vault-header-icon">
          <FolderOpenOutlined />
        </div>
        <div className="agent-doc-vault-header-content">
          <h2>Document Vault</h2>
          <p>Manage documents for all your assigned businesses</p>
        </div>
      </div>

      {/* Business List */}
      {businesses.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No businesses assigned yet"
          />
        </Card>
      ) : (
        <div className="agent-doc-vault-business-list">
          {businesses.map((business) => (
            <Card
              key={business.relationId}
              className="agent-doc-vault-business-card"
              hoverable
              onClick={() =>
                navigate(
                  ROUTES.AGENT_BUSINESS_DOCUMENTS.replace(
                    ":relationId",
                    business.relationId
                  )
                )
              }
            >
              {/* Header */}
              <div className="agent-doc-vault-card-header">
                <div className="agent-doc-vault-business-icon">
                  <FolderOpenOutlined />
                </div>
                <div className="agent-doc-vault-business-info">
                  <h3>{business.businessName}</h3>
                  <div className="agent-doc-vault-owner-name">
                    {business.ownerName}
                  </div>
                  {(business.city || business.state) && (
                    <div className="agent-doc-vault-location">
                      <EnvironmentOutlined />
                      {business.city}
                      {business.state && `, ${business.state}`}
                    </div>
                  )}
                </div>
              </div>

              {/* Compliance Alert */}
              {business.compliance.missing > 0 && (
                <Alert
                  message={`${business.compliance.missing} mandatory document${
                    business.compliance.missing > 1 ? "s" : ""
                  } missing`}
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                  className="agent-doc-vault-compliance-alert"
                />
              )}

              {/* Compliance Score */}
              <div className="agent-doc-vault-compliance">
                <div className="agent-doc-vault-compliance-label">
                  Compliance Score
                </div>
                <div className="agent-doc-vault-compliance-row">
                  <Progress
                    percent={business.compliance.score}
                    strokeColor={getComplianceColor(business.compliance.score)}
                    showInfo={false}
                    size="small"
                  />
                  <span
                    className="agent-doc-vault-compliance-percent"
                    style={{
                      color: getComplianceColor(business.compliance.score),
                    }}
                  >
                    {business.compliance.score}%
                  </span>
                </div>
                {business.compliance.totalRequired > 0 && (
                  <div className="agent-doc-vault-compliance-details">
                    {business.compliance.fulfilled} of{" "}
                    {business.compliance.totalRequired} mandatory documents
                  </div>
                )}
              </div>

              {/* Document Stats */}
              <div className="agent-doc-vault-stats">
                <div className="agent-doc-vault-stat-item">
                  <FileTextOutlined />
                  <div className="agent-doc-vault-stat-content">
                    <div className="agent-doc-vault-stat-number">
                      {business.documentStats.total}
                    </div>
                    <div className="agent-doc-vault-stat-text">
                      Total Documents
                    </div>
                  </div>
                </div>

                <div className="agent-doc-vault-stat-item">
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  <div className="agent-doc-vault-stat-content">
                    <div className="agent-doc-vault-stat-number">
                      {business.documentStats.approved}
                    </div>
                    <div className="agent-doc-vault-stat-text">Approved</div>
                  </div>
                </div>

                <div className="agent-doc-vault-stat-item">
                  <ClockCircleOutlined style={{ color: "#faad14" }} />
                  <div className="agent-doc-vault-stat-content">
                    <div className="agent-doc-vault-stat-number">
                      {business.documentStats.pending}
                    </div>
                    <div className="agent-doc-vault-stat-text">Pending</div>
                  </div>
                </div>

                {business.documentStats.expired > 0 && (
                  <div className="agent-doc-vault-stat-item">
                    <WarningOutlined style={{ color: "#ff4d4f" }} />
                    <div className="agent-doc-vault-stat-content">
                      <div className="agent-doc-vault-stat-number">
                        {business.documentStats.expired}
                      </div>
                      <div className="agent-doc-vault-stat-text">Expired</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Missing Documents */}
              {business.compliance.missing > 0 && (
                <div className="agent-doc-vault-missing-documents">
                  <div className="agent-doc-vault-missing-title">
                    Missing Documents:
                  </div>
                  <div className="agent-doc-vault-missing-tags">
                    {business.compliance.missingItems
                      .slice(0, 3)
                      .map((item) => (
                        <Tag key={item._id} color="red">
                          {item.name}
                        </Tag>
                      ))}
                    {business.compliance.missingItems.length > 3 && (
                      <Tag>
                        +{business.compliance.missingItems.length - 3} more
                      </Tag>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="agent-doc-vault-card-footer">
                {business.permissions.canUploadDocuments ? (
                  <Tag color="green">Can Upload</Tag>
                ) : (
                  <Tag color="default">View Only</Tag>
                )}
                <ArrowRightOutlined className="agent-doc-vault-arrow" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentDocumentVault;
