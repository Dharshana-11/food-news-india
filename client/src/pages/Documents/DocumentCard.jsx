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

  return (
    <Card key={doc._id} className="doc-card" hoverable>
      {/* Header */}
      <div className="doc-card-header">
        <div className="doc-icon-wrapper">
          <FileOutlined />
        </div>
        <div className="doc-type-badge">
          {doc.kycDocumentId ? (
            <Tag color="blue">KYC</Tag>
          ) : (
            <Tag color="purple">Compliance</Tag>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="doc-card-body">
        <h4 className="doc-filename" title={file.originalName || "-"}>
          {file.originalName || "-"}
        </h4>
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
