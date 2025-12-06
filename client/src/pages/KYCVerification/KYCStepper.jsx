import React from "react";
import { Card, Steps } from "antd";
import "./KYCVerification.css";

const { Step } = Steps;

/**
 * Horizontal Stepper for KYC documents
 */
const KYCStepper = ({ requirements, uploadedFiles, currentStep, setCurrentStep }) => {
  return (
    <Card className="kyc-card kyc-stepper-card" bordered={false}>
      <Steps
        current={Math.min(currentStep, Math.max(0, requirements.length - 1))}
        responsive
        className="kyc-steps-horizontal"
      >
        {requirements.map((req, idx) => {
          const uploaded = uploadedFiles[req.code];
          const status = uploaded?.status;
          let stepStatus = "wait";
          if (status === "approved") stepStatus = "finish";
          else if (status === "pending") stepStatus = "process";
          else if (status === "rejected" || status === "expired") stepStatus = "error";
          else if (idx === currentStep) stepStatus = "process";

          return (
            <Step
              key={req.code}
              title={req.name}
              status={stepStatus}
              onClick={() => setCurrentStep(idx)}
            />
          );
        })}
      </Steps>
    </Card>
  );
};

export default KYCStepper;
