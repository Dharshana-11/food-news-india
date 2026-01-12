// src/components/DocumentCard.jsx
import { Card, Button, Tag } from "antd";
import {
  FileOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { formatDate } from "../../utils/dateFormatter";

/**
 * Card component to display a document with actions.
 *
 * @param {Object} props
 * @param {Object} props.doc - Document object
 * @param {Function} props.onView - Callback when "View" is clicked
 * @param {Function} props.onEdit - Callback when "Edit" is clicked
 * @param {Function} props.onDelete - Callback when "Delete" is clicked
 * @param {Function} props.onReview - Callback when "Review" is clicked (for pending documents)
 * @returns {JSX.Element}
 */
const DocumentCard = ({ doc, onView, onEdit, onDelete, onReview }) => {
  const isPending = doc.status === "pending";
  const file = doc.file || {};

  /**
   * Determine document type and return appropriate tag
   */
  const getDocumentTypeTag = () => {
    if (doc.kycDocumentId) {
      return <Tag color="blue">KYC</Tag>;
    } else if (doc.complianceItemId) {
      return <Tag color="purple">Compliance</Tag>;
    } else if (doc.serviceProviderServiceId) {
      return <Tag color="orange">Service Authorization</Tag>;
    }
    return <Tag color="default">Unknown</Tag>;
  };

  /**
   * Get document type label for display
   */
  const getDocumentTypeLabel = () => {
    if (doc.kycDocumentId) {
      return doc.kycDocumentId.name || "KYC Document";
    } else if (doc.complianceItemId) {
      return doc.complianceItemId.name || "Compliance Document";
    } else if (doc.serviceProviderServiceId) {
      return "Service Authorization";
    }
    return "Document";
  };

  return (
    <Card key={doc._id} className="doc-card" hoverable>
      {/* Header */}
      <div className="doc-card-header">
        <div className="doc-icon-wrapper">
          <FileOutlined />
        </div>
        <div className="doc-type-badge">{getDocumentTypeTag()}</div>
      </div>

      {/* Body */}
      <div className="doc-card-body">
        <h4 className="doc-filename" title={file.originalName || "-"}>
          {file.originalName || "-"}
        </h4>
        <p
          className="doc-document-type"
          style={{
            fontSize: "0.875rem",
            color: "#6b7280",
            marginTop: "0.25rem",
          }}
        >
          {getDocumentTypeLabel()}
        </p>
        <div className="doc-meta">
          <span className="doc-type">
            {file.fileType?.toUpperCase() || "-"}
          </span>
          <span className="doc-size">
            {file.fileSize ? (file.fileSize / 1024).toFixed(1) : "-"} KB
          </span>
        </div>
        {doc.uploadedByUser && (
          <p className="doc-uploader">
            By: <strong>{doc.uploadedByUser.name}</strong>
          </p>
        )}
        {doc.uploadedForUser &&
          doc.uploadedForUser._id !== doc.uploadedByUser?._id && (
            <p className="doc-uploader">
              For: <strong>{doc.uploadedForUser.name}</strong>
            </p>
          )}
        {doc.validUntil && (
          <p className="doc-validity">
            Valid until: {formatDate(doc.validUntil)}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="doc-card-actions">
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onView(doc)}
        >
          View
        </Button>
        {isPending && (
          <Button
            type="text"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => onReview(doc)}
          >
            Review
          </Button>
        )}
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={() => onEdit(doc)}
        >
          Edit
        </Button>
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => onDelete(doc)}
          danger
        >
          Delete
        </Button>
      </div>
    </Card>
  );
};

export default DocumentCard;
