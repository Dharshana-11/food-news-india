import React from "react";
import { Card, Steps } from "antd";
import "./KYCVerification.css";

const { Step } = Steps;

/**
 * KYC Stepper Component
 *
 * Renders a horizontal stepper showing each KYC requirement's status.
 * Step state is based on uploaded file status:
 * - approved → finish
 * - pending → process
 * - rejected/expired → error
 * - current step → process
 * - default → wait
 *
 * @param {Object[]} requirements - List of KYC requirement objects
 * @param {Object} uploadedFiles - Map of uploaded files keyed by requirement code
 * @param {number} currentStep - Index of the active step
 * @param {Function} setCurrentStep - Step change handler
 */
const KYCStepper = ({
  requirements,
  uploadedFiles,
  currentStep,
  setCurrentStep,
}) => {
  return (
    <Card className="kyc-card kyc-stepper-card" bordered={false}>
      <Steps
        responsive
        className="kyc-steps-horizontal"
        current={Math.min(currentStep, Math.max(0, requirements.length - 1))}
      >
        {requirements.map((req, idx) => {
          const uploaded = uploadedFiles[req.code];
          const status = uploaded?.status;

          // Resolve Ant Design Step Status
          let stepStatus = "wait";
          if (status === "approved") stepStatus = "finish";
          else if (status === "pending") stepStatus = "process";
          else if (status === "rejected" || status === "expired")
            stepStatus = "error";
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
