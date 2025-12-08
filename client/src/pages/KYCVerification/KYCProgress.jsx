import React from "react";
import { Card, Progress, Typography } from "antd";
import "./KYCVerification.css";

const { Text } = Typography;

/**
 * KYCProgress Component
 *
 * Displays a progress bar representing the user's overall KYC completion.
 * The value is derived from `profile.kycProgress`.
 *
 * @param {Object} props
 * @param {Object} props.profile - Business or user profile containing KYC progress.
 * @param {number} props.profile.kycProgress - Completion percentage (0–100).
 */
const KYCProgress = ({ requirements, uploadedFiles }) => {
  const total = requirements.length;
  const approved = requirements.filter(
    (req) => uploadedFiles[req.code]?.status === "approved"
  ).length;

  const progress = total === 0 ? 0 : Math.round((approved / total) * 100);

  return (
    <Card className="kyc-card kyc-progress-card" bordered={false}>
      <div className="kyc-progress-wrap">
        <div className="kyc-progress-left">
          <Text strong className="kyc-progress-label">
            KYC Progress
          </Text>
          <Text type="secondary" className="kyc-progress-sublabel">
            {progress}% Complete
          </Text>
        </div>

        <div className="kyc-progress-right">
          <Progress
            percent={progress}
            showInfo={false}
            strokeWidth={14}
            strokeLinecap="round"
            trailColor="#fff2e6"
            strokeColor={{
              "0%": "#ff7a3d",
              "50%": "#ff914d",
              "100%": "#ffb07c",
            }}
          />
        </div>
      </div>
    </Card>
  );
};

export default KYCProgress;
