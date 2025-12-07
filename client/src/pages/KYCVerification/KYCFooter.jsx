import React from "react";
import { Card, Button, Space } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import "./KYCVerification.css";

/**
 * Footer navigation for KYC steps.
 *
 * Shows **Previous** and **Next** buttons based on current step.
 * Next button gets disabled if required document is not uploaded
 * or not in approved/pending status.
 *
 * @component
 * @param {Object} props
 * @param {number} props.currentStep - Active step index.
 * @param {Array} props.requirements - List of required KYC documents.
 * @param {Object} props.uploadedFiles - Uploaded documents mapped by code.
 * @param {Function} props.setCurrentStep - Updates the active step.
 */
const KYCFooter = ({
  currentStep,
  requirements,
  uploadedFiles,
  setCurrentStep,
}) => {
  /**
   * Checks if user can move to next document step.
   *
   * @returns {boolean} True if the current file is approved/pending.
   */
  const canProceedToNext = () => {
    if (currentStep >= requirements.length) return false;

    const currentReq = requirements[currentStep];
    const uploaded = uploadedFiles[currentReq.code];

    return (
      uploaded &&
      (uploaded.status === "approved" || uploaded.status === "pending")
    );
  };

  return (
    <Card
      bordered={false}
      className="kyc-footer-actions"
      style={{ marginTop: 16 }}
    >
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        {currentStep < requirements.length && (
          <>
            {/* Previous Button */}
            <div>
              {currentStep > 0 && (
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                >
                  Previous
                </Button>
              )}
            </div>

            {/* Next Button */}
            <div>
              {currentStep < requirements.length - 1 && (
                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  iconPosition="end"
                  onClick={() =>
                    setCurrentStep((s) =>
                      Math.min(requirements.length - 1, s + 1),
                    )
                  }
                  disabled={!canProceedToNext()}
                >
                  Next
                </Button>
              )}
            </div>
          </>
        )}
      </Space>
    </Card>
  );
};

export default KYCFooter;
