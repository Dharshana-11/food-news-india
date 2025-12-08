import React from "react";
import { Card, Button, Result } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import "./KYCVerification.css";

/**
 * KYCCompletion
 *
 * Renders the final state of the KYC verification flow:
 * - If all documents are approved → Shows "KYC Verified" success message.
 * - If all documents are uploaded but pending review → Shows "Ready to Submit".
 *
 * @param {Object} props
 * @param {Array} props.requirements - List of required KYC doc definitions.
 * @param {Object} props.uploadedFiles - Map of uploaded documents keyed by requirement code.
 * @param {Function} props.handleSubmitForReview - Called when user submits documents for review.
 * @param {boolean} props.uploading - Loading state for submit button.
 * @param {Function} props.handleGoToDashboard - Called when KYC is verified and user continues.
 */
const KYCCompletion = ({
  requirements,
  uploadedFiles,
  handleSubmitForReview,
  uploading,
  handleGoToDashboard,
}) => {
  // All docs must be uploaded AND approved to mark KYC as complete
  const allDocsApproved = requirements.every((req) => {
    const uploaded = uploadedFiles[req.code];
    return uploaded && uploaded.status === "approved";
  });

  // When fully approved → show verified screen
  if (allDocsApproved) {
    return (
      <Card className="kyc-card kyc-completion verified" bordered={false}>
        <Result
          status="success"
          title="KYC Verified!"
          subTitle="Your KYC verification is complete. You can now access all features."
          extra={[
            <Button
              type="primary"
              size="large"
              onClick={handleGoToDashboard}
              key="dashboard"
            >
              Go to Dashboard
            </Button>,
          ]}
        />
      </Card>
    );
  }

  // Else → show "Ready to submit" screen (documents uploaded but not yet reviewed)
  return (
    <Card className="kyc-card kyc-completion ready" bordered={false}>
      <Result
        icon={<CheckOutlined style={{ color: "#52c41a", fontSize: 72 }} />}
        title="Ready to Submit"
        subTitle="All required documents uploaded. Submit for verification."
        extra={[
          <Button
            key="submit"
            type="primary"
            size="large"
            onClick={handleSubmitForReview}
            disabled={!allDocsApproved}
            loading={uploading}
            className="kyc-submit-btn"
          >
            {uploading ? "Submitting..." : "Submit for Review"}
          </Button>,
        ]}
      />
    </Card>
  );
};

export default KYCCompletion;
