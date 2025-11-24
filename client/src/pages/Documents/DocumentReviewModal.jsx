// pages/Documents/DocumentReviewModal.jsx
import { useState } from "react";
import { Modal, Button, Input, message, Radio, Space, Divider } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { reviewDocument } from "../../services/documentService";
import { formatDate } from "../../utils/dateFormatter";

const { TextArea } = Input;

const DocumentReviewModal = ({ visible, document, onSuccess, onCancel }) => {
  const [reviewStatus, setReviewStatus] = useState("approved");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReview = async () => {
    if (!document) return;

    setLoading(true);
    try {
      await reviewDocument(document._id, {
        status: reviewStatus,
        notes: notes,
      });
      
      message.success(`Document ${reviewStatus} successfully`);
      setReviewStatus("approved");
      setNotes("");
      onSuccess();
    } catch (error) {
      message.error(error.response?.data?.message || "Review failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setReviewStatus("approved");
    setNotes("");
    onCancel();
  };

  if (!document) return null;

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
          icon={reviewStatus === "approved" ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
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
          <div className="detail-row">
            <span className="detail-label">File Name:</span>
            <span className="detail-value">{document.file?.originalName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Document Type:</span>
            <span className="detail-value">
              {document.kycDocumentId
                ? `KYC: ${document.kycDocumentId?.name}`
                : `Compliance: ${document.complianceItemId?.name}`}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Uploaded By:</span>
            <span className="detail-value">{document.uploadedByUser?.name}</span>
          </div>
          {document.validFrom && (
            <>
              <div className="detail-row">
                <span className="detail-label">Valid From:</span>
                <span className="detail-value">{formatDate(document.validFrom)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Valid Until:</span>
                <span className="detail-value">
                  {document.validUntil ? formatDate(document.validUntil) : "No Expiry"}
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
          
          <Button
            type="link"
            onClick={() => {
              const fileUrl = `http://localhost:5000${document.file?.filePath}`;
              window.open(fileUrl, "_blank");
            }}
            style={{ padding: 0, marginTop: 8 }}
          >
            View Document →
          </Button>
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