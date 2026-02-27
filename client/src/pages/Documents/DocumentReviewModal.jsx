// pages/Documents/DocumentReviewModal.jsx
import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Input,
  message,
  Radio,
  Space,
  Divider,
  Tag,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { reviewDocument } from "../../services/documentService";
import { formatDate } from "../../utils/dateFormatter";

const { TextArea } = Input;

/**
 * Modal for reviewing a document (approve, reject, or mark as expired)
 *
 * @param {Object} props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Object} props.document - Document object to review
 * @param {Function} props.onSuccess - Callback after successful review
 * @param {Function} props.onCancel - Callback to close the modal
 * @returns {JSX.Element|null}
 */
const DocumentReviewModal = ({ visible, document, onSuccess, onCancel }) => {
  const [reviewStatus, setReviewStatus] = useState("approved");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset state whenever a new document is opened
    if (document) {
      setReviewStatus("approved");
      setNotes("");
    }
  }, [document]);

  /**
   * Get document type tag
   */
  const getDocumentTypeTag = () => {
    if (!document) return null;

    if (document.kycDocumentId) {
      return <Tag color="blue">KYC Document</Tag>;
    } else if (document.complianceItemId) {
      return <Tag color="purple">Compliance Document</Tag>;
    } else if (document.serviceProviderServiceId) {
      return <Tag color="orange">Service Authorization</Tag>;
    }
    return <Tag color="default">Unknown Type</Tag>;
  };

  /**
   * Get document type name
   */
  const getDocumentTypeName = () => {
    if (!document) return "N/A";

    if (document.kycDocumentId) {
      return `KYC: ${document.kycDocumentId?.name || "N/A"}`;
    } else if (document.complianceItemId) {
      return `Compliance: ${document.complianceItemId?.name || "N/A"}`;
    } else if (document.serviceProviderServiceId) {
      return "Service Authorization Document";
    }
    return "N/A";
  };

  /**
   * Submit the review
   */
  const handleReview = async () => {
    if (!document) return;

    setLoading(true);
    try {
      await reviewDocument(document._id, {
        status: reviewStatus,
        notes,
      });

      message.success(`Document ${reviewStatus} successfully`);
      onSuccess();
    } catch (error) {
      message.error(error.response?.data?.message || "Review failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset and close modal
   */
  const handleModalCancel = () => {
    setReviewStatus("approved");
    setNotes("");
    onCancel();
  };

  if (!document) return null;

  const fileUrl = document.file
    ? `${import.meta.env.VITE_API_URL}/api/files/documents/${document._id}`
    : "#";

  return (
    <Modal
      title="Review Document"
      open={visible}
      onCancel={handleModalCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={handleModalCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleReview}
          icon={
            reviewStatus === "approved" ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
          danger={reviewStatus === "rejected"}
        >
          {reviewStatus === "approved" ? "Approve" : "Reject"}
        </Button>,
      ]}
      className="document-review-modal"
    >
      <div className="review-modal-content">
        {/* Document Details */}
        <div className="document-details-section">
          <h4>Document Details</h4>

          {/* Document Type Tag */}
          <div style={{ marginBottom: "1rem" }}>{getDocumentTypeTag()}</div>

          <div className="detail-row">
            <span className="detail-label">File Name:</span>
            <span className="detail-value">
              {document.file?.originalName || "N/A"}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Document Type:</span>
            <span className="detail-value">{getDocumentTypeName()}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Uploaded By:</span>
            <span className="detail-value">
              {document.uploadedByUser?.name || "N/A"}
              {document.uploadedByUser?.email &&
                ` (${document.uploadedByUser.email})`}
            </span>
          </div>
          {document.uploadedForUser && (
            <div className="detail-row">
              <span className="detail-label">Uploaded For:</span>
              <span className="detail-value">
                {document.uploadedForUser?.name || "N/A"}
                {document.uploadedForUser?.email &&
                  ` (${document.uploadedForUser.email})`}
              </span>
            </div>
          )}
          {document.validFrom && (
            <>
              <div className="detail-row">
                <span className="detail-label">Valid From:</span>
                <span className="detail-value">
                  {formatDate(document.validFrom)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Valid Until:</span>
                <span className="detail-value">
                  {document.validUntil
                    ? formatDate(document.validUntil)
                    : "No Expiry"}
                </span>
              </div>
            </>
          )}
          <div className="detail-row">
            <span className="detail-label">File Size:</span>
            <span className="detail-value">
              {(document.file?.fileSize / 1024).toFixed(2)} KB
            </span>
          </div>
          {document.file && (
            <Button
              type="link"
              onClick={() => window.open(fileUrl, "_blank")}
              style={{ padding: 0, marginTop: 8 }}
            >
              View Document →
            </Button>
          )}
        </div>

        <Divider />

        {/* Review Section */}
        <div className="review-section">
          <h4>Review Decision</h4>
          <Radio.Group
            value={reviewStatus}
            onChange={(e) => setReviewStatus(e.target.value)}
            style={{ width: "100%", marginBottom: 16 }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Radio value="approved" className="review-option review-approve">
                <CheckCircleOutlined style={{ color: "#10b981" }} />
                <span style={{ marginLeft: 8 }}>Approve Document</span>
              </Radio>
              <Radio value="rejected" className="review-option review-reject">
                <CloseCircleOutlined style={{ color: "#ef4444" }} />
                <span style={{ marginLeft: 8 }}>Reject Document</span>
              </Radio>
              <Radio value="expired" className="review-option review-expired">
                <ClockCircleOutlined style={{ color: "#6b7280" }} />
                <span style={{ marginLeft: 8 }}>Mark as Expired</span>
              </Radio>
            </Space>
          </Radio.Group>

          <h4 style={{ marginTop: 20 }}>Review Notes</h4>
          <TextArea
            rows={4}
            placeholder="Add any notes or reasons for your decision..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default DocumentReviewModal;
