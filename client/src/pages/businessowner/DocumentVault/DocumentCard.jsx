// pages/BusinessOwner/DocumentVault/DocumentCard.jsx
import { Card, Tag, Button, Dropdown, Tooltip } from "antd";
import {
  FilePdfOutlined,
  FileImageOutlined,
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  MoreOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  formatDate,
  getDaysUntilExpiry,
  isExpiringSoon,
} from "../../../utils/dateHelpers";

const DocumentCard = ({ document, onView, onDownload, onDelete }) => {
  const { file, status, validUntil, kycDocumentId, complianceItemId } =
    document;

  // File icon based on type
  const getFileIcon = () => {
    if (file.fileType === "pdf") {
      return <FilePdfOutlined className="file-icon pdf-icon" />;
    }
    return <FileImageOutlined className="file-icon image-icon" />;
  };

  // Status config
  const statusConfig = {
    pending: {
      color: "orange",
      icon: <ClockCircleOutlined />,
      text: "Pending Review",
    },
    approved: {
      color: "green",
      icon: <CheckCircleOutlined />,
      text: "Approved",
    },
    rejected: {
      color: "red",
      icon: <CloseCircleOutlined />,
      text: "Rejected",
    },
    expired: {
      color: "gray",
      icon: <ExclamationCircleOutlined />,
      text: "Expired",
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.pending;

  // Expiry badge
  const renderExpiryBadge = () => {
    if (!validUntil) return null;

    const daysLeft = getDaysUntilExpiry(validUntil);
    const expiring = isExpiringSoon(validUntil);

    if (daysLeft < 0) {
      return (
        <div className="expiry-badge expired">
          <ExclamationCircleOutlined /> Expired
        </div>
      );
    } else if (expiring) {
      return (
        <div className="expiry-badge expiring">
          <ClockCircleOutlined /> Expires in {daysLeft} days
        </div>
      );
    }
    return null;
  };

  // Dropdown menu
  const menuItems = [
    {
      key: "view",
      label: "View",
      icon: <EyeOutlined />,
      onClick: onView,
    },
    {
      key: "download",
      label: "Download",
      icon: <DownloadOutlined />,
      onClick: onDownload,
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      label: "Delete",
      icon: <DeleteOutlined />,
      onClick: onDelete,
      danger: true,
    },
  ];

  return (
    <Card className="document-card" hoverable>
      {/* Card Header */}
      <div className="card-header">
        <div className="card-icon-wrapper">{getFileIcon()}</div>
        <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
          <Button
            type="text"
            icon={<MoreOutlined />}
            className="card-menu-btn"
          />
        </Dropdown>
      </div>

      {/* Card Body */}
      <div className="card-body">
        <Tooltip title={file.originalName}>
          <h3 className="card-title">{file.originalName}</h3>
        </Tooltip>

        {/* Document Type */}
        <div className="card-type">
          {kycDocumentId ? (
            <Tag color="blue">KYC: {kycDocumentId.name}</Tag>
          ) : complianceItemId ? (
            <Tag color="purple">Compliance: {complianceItemId.name}</Tag>
          ) : (
            <Tag>Document</Tag>
          )}
        </div>

        {/* Metadata */}
        <div className="card-meta">
          <span className="meta-item">
            {file.fileType.toUpperCase()} • {(file.fileSize / 1024).toFixed(1)}{" "}
            KB
          </span>
        </div>

        {/* Valid Until */}
        {validUntil && (
          <div className="card-validity">
            Valid until: {formatDate(validUntil)}
          </div>
        )}

        {/* Expiry Badge */}
        {renderExpiryBadge()}

        {/* Status */}
        <div className="card-status">
          <Tag color={currentStatus.color} icon={currentStatus.icon}>
            {currentStatus.text}
          </Tag>
        </div>
      </div>

      {/* Card Actions */}
      <div className="card-actions">
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={onView}
          className="action-btn"
        >
          View
        </Button>
        <Button
          type="text"
          icon={<DownloadOutlined />}
          onClick={onDownload}
          className="action-btn"
        >
          Download
        </Button>
      </div>
    </Card>
  );
};

export default DocumentCard;
