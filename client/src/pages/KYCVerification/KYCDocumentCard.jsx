import React from "react";
import { Card, Typography, Space, Tag, Divider, Button } from "antd";
import {
  UploadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import "./KYCVerification.css";
import "./KYCVerification.css";

const { Title, Paragraph, Text } = Typography;

/**
 * Single Document Upload Card
 */
const KYCDocumentCard = ({
  requirement,
  uploadedFiles,
  handleFileSelect,
  handleUpload,
  uploading,
}) => {
  if (!requirement) return null;

  const uploaded = uploadedFiles[requirement.code];
  const status = uploaded?.status;

  const statusConfig = status && status !== "ready" ? getStatusConfig(status) : null;
  const needsReupload = status === "rejected" || status === "expired";

  function getStatusConfig(status) {
    const configs = {
      pending: { icon: <ClockCircleOutlined />, color: "processing", text: "Pending Review" },
      approved: { icon: <CheckCircleOutlined />, color: "success", text: "Approved" },
      rejected: { icon: <CloseCircleOutlined />, color: "error", text: "Rejected" },
      expired: { icon: <ExclamationCircleOutlined />, color: "warning", text: "Expired" },
    };
    return configs[status] || configs.pending;
  }

  return (
    <Card className="kyc-card kyc-document-card" variant={false}>
      {/* Header */}
      <div className="doc-head">
        <Space align="start" size="middle">
          <Title level={4} className="kyc-doc-title">{requirement.name}</Title>
          {statusConfig && (
            <Tag icon={statusConfig.icon} color={statusConfig.color}>
              {statusConfig.text}
            </Tag>
          )}
        </Space>
        <Paragraph type="secondary" className="kyc-doc-sub">{requirement.description}</Paragraph>
      </div>

      <Divider />

      {/* Body */}
      <div className="doc-body">
        {/* Rejected or expired note */}
        {needsReupload && (
          <Text type="danger" style={{ fontSize: 12, marginBottom: 8, display: "block" }}>
            {status === "rejected"
              ? `Rejected: ${uploaded.reviewNotes || "Please upload a new document."}`
              : "This document has expired. Please upload a new one."}
          </Text>
        )}

        {/* File input */}
        {(needsReupload || !uploaded) && (
          <div className="kyc-file-input-wrapper">
            <input
              type="file"
              id={`file-${requirement.code}`}
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileSelect(e, requirement.code)}
              className="kyc-file-input"
            />
            <label htmlFor={`file-${requirement.code}`} className="kyc-file-label">
              <UploadOutlined style={{ fontSize: 24, marginBottom: 8 }} />
              <div>
                {uploaded?.file?.name || (
                  <>
                    <div>Click to upload {needsReupload ? "new file" : requirement.name}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>PDF, JPG, PNG (Max 10MB)</Text>
                  </>
                )}
              </div>
            </label>
          </div>
        )}

        {/* Upload button */}
        {uploaded?.file && (needsReupload || !status || status === "ready") && (
          <Button
            type="primary"
            icon={<UploadOutlined />}
            loading={uploading}
            onClick={() => handleUpload(requirement.code)}
            className="kyc-upload-btn"
            block
            size="large"
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </Button>
        )}

        {/* Uploaded file display */}
        {uploaded && !needsReupload && uploaded._id && (
          <div className={`kyc-upload-status status-${status}`} style={{ marginTop: 16 }}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Space>
                {statusConfig.icon}
                <Text strong>{statusConfig.text}</Text>
              </Space>
              <Text type="secondary">{uploaded.fileName}</Text>
              {uploaded.reviewNotes && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <strong>Review Notes:</strong> {uploaded.reviewNotes}
                </Text>
              )}
            </Space>
          </div>
        )}
      </div>
    </Card>
  );
};

export default KYCDocumentCard;
