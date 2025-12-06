import React from "react";
import { Card, Button, Result } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import "./KYCVerification.css";

/**
 * KYC Completion / Ready to submit screen
 */
const KYCCompletion = ({
  requirements,
  uploadedFiles,
  handleSubmitForReview,
  uploading,
  handleGoToDashboard,
}) => {
  const allDocsUploaded = requirements.every((req) => {
    const uploaded = uploadedFiles[req.code];
    return uploaded && uploaded.status === "approved";
  });

  const allApproved = allDocsUploaded;

  if (allApproved) {
    return (
      <Card className="kyc-card kyc-completion verified" bordered={false}>
        <Result
          status="success"
          title="KYC Verified!"
          subTitle="Your KYC verification is complete. You can now access all features."
          extra={[
            <Button type="primary" size="large" onClick={handleGoToDashboard} key="dashboard">
              Go to Dashboard
            </Button>,
          ]}
        />
      </Card>
    );
  }

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
            disabled={!allDocsUploaded}
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
