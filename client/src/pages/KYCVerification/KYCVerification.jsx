import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Progress,
  Button,
  Space,
  Spin,
  Typography,
  Steps,
  message,
  Tag,
  Result,
  Divider
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined
} from "@ant-design/icons";
import AppLayout from "../../layouts/AppLayout";
import ROLES from "../../constants/roles";
import { ROUTES } from "../../routes";
import {
  getKYCRequirements,
  getKYCProfile,
  uploadKYCDocument,
  submitKYCForReview,
} from "../../services/kyc.js";
import BusinessProfileForm from "../../components/BusinessProfileForm/BusinessProfileForm.jsx";
import "./KYCVerification.css";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const KYCVerification = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [showProfileForm, setShowProfileForm] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
const fetchData = async () => {
  try {
    setLoading(true);
    const [profileRes, reqRes] = await Promise.all([
      getKYCProfile(),
      getKYCRequirements(),
    ]);

    setProfile(profileRes.profile);
    setRequirements(reqRes.requirements); // <-- add this

    // Map uploaded docs
    const filesMap = {};
    reqRes.requirements.forEach((req) => {
      if (req.uploaded) {
        filesMap[req.code] = {
          ...req.uploaded,
          status: req.uploaded.status,
          reviewNotes: req.uploaded.reviewNotes,
        };
      }
    });
    setUploadedFiles(filesMap);

    // Determine current step: first incomplete document
    const firstIncomplete = reqRes.requirements.findIndex(
      (req) => !req.uploaded || req.uploaded.status !== "approved"
    );
    setCurrentStep(
      firstIncomplete >= 0 ? firstIncomplete : reqRes.requirements.length
    );
  } catch (error) {
    console.error("Error fetching KYC data:", error);
    message.error("Failed to load KYC data. Please refresh the page.");
  } finally {
    setLoading(false);
  }
};

  const handleFileSelect = (e, requirementCode) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      message.warning("Only PDF, JPG, and PNG files are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      message.warning("File size must be less than 10MB");
      return;
    }

    setUploadedFiles((prev) => ({
  ...prev,
  [requirementCode]: { file }, // remove status: "ready"
}));

  };

  const handleUpload = async (requirementCode) => {
    const fileData = uploadedFiles[requirementCode];
    if (!fileData || !fileData.file) return;

    try {
      setUploading(true);
      await uploadKYCDocument(fileData.file, requirementCode);
      await fetchData();
      message.success("Document uploaded successfully!");
    } catch (error) {
      console.error("Error uploading document:", error);
      message.error(error.response?.data?.error || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitForReview = async () => {
    try {
      setUploading(true);
      await submitKYCForReview();
      await fetchData();
      message.success("KYC submitted for review successfully!");
    } catch (error) {
      console.error("Error submitting KYC:", error);
      message.error(error.response?.data?.error || "Failed to submit KYC");
    } finally {
      setUploading(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate(ROUTES.BUSINESS_OWNER_DASHBOARD);
  };

  const canProceedToNext = () => {
    if (currentStep >= requirements.length) return false;

    const currentReq = requirements[currentStep];
    const uploaded = uploadedFiles[currentReq.code];

    return (
      uploaded &&
      (uploaded.status === "approved" || uploaded.status === "pending")
    );
  };

const allDocsUploaded = () => {
  return requirements.every((req) => {
    const uploaded = uploadedFiles[req.code];
    return uploaded && uploaded.status === "approved";
  });
};

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        icon: <ClockCircleOutlined />,
        color: "processing",
        text: "Pending Review",
      },
      approved: {
        icon: <CheckCircleOutlined />,
        color: "success",
        text: "Approved",
      },
      rejected: {
        icon: <CloseCircleOutlined />,
        color: "error",
        text: "Rejected",
      },
      expired: {
        icon: <ExclamationCircleOutlined />,
        color: "warning",
        text: "Expired",
      },
    };
    return configs[status] || configs.pending;
  };

  /* ---------------- HORIZONTAL WIZARD STEPPER ---------------- */
  const renderHorizontalStepper = () => {
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

  /* ---------------- PROGRESS BAR ---------------- */
  const renderProgressBar = () => {
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
    "0%": "#ff7a3d",   // medium orange start
    "50%": "#ff914d",  // lighter orange mid
    "100%": "#ffb07c", // soft peach end
  }}
  trailColor="#fff2e6" // very light creamy orange background
  strokeWidth={14}      // slightly thicker for emphasis
  strokeLinecap="round" // rounded ends for smoother look
/>

          </div>
        </div>
      </Card>
    );
  };

  /* ---------------- DOCUMENT UPLOAD CARD ---------------- */
/* ---------------- DOCUMENT UPLOAD CARD ---------------- */
const renderDocumentUpload = (requirement) => {
  if (!requirement) return null;

  const uploaded = uploadedFiles[requirement.code];
  const status = uploaded?.status;
  const statusConfig = status && status !== "ready" ? getStatusConfig(status) : null;
  const needsReupload = status === "rejected" || status === "expired";

  return (
    <Card className="kyc-card kyc-document-card" variant={false}>
      {/* Header */}
      <div className="doc-head">
        <Space align="start" size="middle">
          <Title level={4} className="kyc-doc-title">
            {requirement.name}
          </Title>
          {statusConfig && (
            <Tag icon={statusConfig.icon} color={statusConfig.color}>
              {statusConfig.text}
            </Tag>
          )}
        </Space>
        <Paragraph type="secondary" className="kyc-doc-sub">
          {requirement.description}
        </Paragraph>
      </div>

      <Divider />

      {/* Body */}
      <div className="doc-body">
        {/* Show rejected/expired note */}
        {needsReupload && (
          <Text
            type="danger"
            style={{
              fontSize: 12,
              marginBottom: 8,
              display: "block",
            }}
          >
            {status === "rejected"
              ? `Rejected: ${uploaded.reviewNotes || "Please upload a new document."}`
              : "This document has expired. Please upload a new one."}
          </Text>
        )}

        {/* Show file input only if not uploaded or needs reupload */}
        {(needsReupload || !uploaded) && (
          <div className="kyc-file-input-wrapper">
            <input
              type="file"
              id={`file-${requirement.code}`}
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileSelect(e, requirement.code)}
              className="kyc-file-input"
            />
            <label htmlFor={`file-${requirement.code}`} className="kyc-file-label">
              <UploadOutlined style={{ fontSize: 24, marginBottom: 8 }} />
              <div>
                {uploaded?.file?.name || (
                  <>
                    <div>
                      Click to upload {needsReupload ? "new file" : requirement.name}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      PDF, JPG, PNG (Max 10MB)
                    </Text>
                  </>
                )}
              </div>
            </label>
          </div>
        )}

        {/* Upload button only if file selected */}
        {uploaded?.file && (needsReupload || !status || status === "ready") && (
          <Button
            type="primary"
            icon={<UploadOutlined />}
            loading={uploading}
            onClick={() => handleUpload(requirement.code)}
            className="kyc-upload-btn"
            block
            size="large"
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </Button>
        )}

        {/* Show uploaded file and notes if approved or pending */}
        {uploaded && !needsReupload && uploaded._id && (
          <div className={`kyc-upload-status status-${status}`} style={{ marginTop: 16 }}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Space>
                {statusConfig.icon}
                <Text strong>{statusConfig.text}</Text>
              </Space>
              <Text type="secondary">{uploaded.fileName}</Text>
              {uploaded.reviewNotes && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <strong>Review Notes:</strong> {uploaded.reviewNotes}
                </Text>
              )}
            </Space>
          </div>
        )}
      </div>
    </Card>
  );
};


 const renderCompletionScreen = () => {
  if (!requirements.length) return null;

  // All approved → show verified screen
  const allApproved = requirements.every((req) => {
    const uploaded = uploadedFiles[req.code];
    return uploaded && uploaded.status === "approved";
  });

  if (allApproved) {
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

  // Otherwise, ready to submit screen
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
            disabled={uploading || !allDocsUploaded()}
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


  if (loading) {
    return (
      <AppLayout role={ROLES.BUSINESS_OWNER}>
        <div className="kyc-container">
          <div className="kyc-loading">
            <Spin size="large" tip="Loading KYC data..." />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profile?.businessName) {
    return (
      <AppLayout role={ROLES.BUSINESS_OWNER}>
        <div className="kyc-container">
          <Card bordered={false}>
            <Result
              status="info"
              title="Business Profile Required"
              subTitle="Please complete your business profile before KYC verification."
              extra={
                <div style={{ marginTop: 16 }}>
                  <BusinessProfileForm
                    onUpdate={() => {
                      fetchData();
                    }}
                  />
                </div>
              }
            />
          </Card>
        </div>
      </AppLayout>
    );
  }

  // MAIN RENDER
  return (
    <AppLayout role={ROLES.BUSINESS_OWNER}>
      <div className="kyc-container kyc-wizard">
        <div className="kyc-header">
          <Title level={2}>KYC Verification</Title>
          <Paragraph type="secondary">
            Complete your KYC to access all features
          </Paragraph>
        </div>

        <div style={{ marginTop: 24 }}>{renderHorizontalStepper()}</div>
        <div style={{ marginTop: 16 }}>{renderProgressBar()}</div>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24}>
            {currentStep < requirements.length
              ? renderDocumentUpload(requirements[currentStep])
              : renderCompletionScreen()}
          </Col>
        </Row>

        {showProfileForm && (
          <Card bordered={false} style={{ marginTop: 16 }}>
            <BusinessProfileForm
              onUpdate={() => {
                fetchData();
                setShowProfileForm(false);
              }}
            />
          </Card>
        )}
<Card
  bordered={false}
  className="kyc-footer-actions"
  style={{ marginTop: 16 }}
>
  <Space style={{ width: "100%", justifyContent: "space-between" }}>
    {/* Hide Previous/Next if KYC completed */}
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
              onClick={() =>
                setCurrentStep((s) =>
                  Math.min(requirements.length - 1, s + 1)
                )
              }
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

      </div>
    </AppLayout>
  );
};

export default KYCVerification;