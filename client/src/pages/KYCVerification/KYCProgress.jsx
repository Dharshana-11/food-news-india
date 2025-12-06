import React from "react";
import { Card, Progress, Typography } from "antd";
import "./KYCVerification.css";

const { Text } = Typography;

/**
 * KYC Progress Bar
 */
const KYCProgress = ({ profile }) => {
  const progress = profile?.kycProgress ?? 0;

  return (
    <Card className="kyc-card kyc-progress-card" bordered={false}>
      <div className="kyc-progress-wrap">
        <div className="kyc-progress-left">
          <Text strong className="kyc-progress-label">KYC Progress</Text>
          <Text type="secondary" className="kyc-progress-sublabel">
            {Math.round(progress)}% Complete
          </Text>
        </div>
        <div className="kyc-progress-right">
          <Progress
            percent={progress}
            showInfo={false}
            strokeColor={{
              "0%": "#ff7a3d",
              "50%": "#ff914d",
              "100%": "#ffb07c",
            }}
            trailColor="#fff2e6"
            strokeWidth={14}
            strokeLinecap="round"
          />
        </div>
      </div>
    </Card>
  );
};

export default KYCProgress;
