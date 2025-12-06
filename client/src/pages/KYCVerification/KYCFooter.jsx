import React from "react";
import { Card, Button, Space } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import "./KYCVerification.css";

/**
 * Footer Previous / Next Navigation Buttons
 */
const KYCFooter = ({ currentStep, requirements, uploadedFiles, setCurrentStep }) => {
  const canProceedToNext = () => {
    if (currentStep >= requirements.length) return false;
    const currentReq = requirements[currentStep];
    const uploaded = uploadedFiles[currentReq.code];
    return uploaded && (uploaded.status === "approved" || uploaded.status === "pending");
  };

  return (
    <Card bordered={false} className="kyc-footer-actions" style={{ marginTop: 16 }}>
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        {currentStep < requirements.length && (
          <>
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

            <div>
              {currentStep < requirements.length - 1 && (
                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  onClick={() => setCurrentStep((s) => Math.min(requirements.length - 1, s + 1))}
                  disabled={!canProceedToNext()}
                  iconPosition="end"
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
