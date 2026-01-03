/**
 * KYCVerification.jsx
 *
 * Main wizard page for business owner KYC flow.
 * Handles profile validation, requirement fetching,
 * file uploads, step navigation, and review submission.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Spin, Typography, message, Card } from "antd";
import { ROUTES } from "../../routes";
import {
  getKYCRequirements,
  getKYCProfile,
  uploadKYCDocument,
  submitKYCForReview,
} from "../../services/kyc.js";

import BusinessProfileForm from "../../components/BusinessProfileForm/BusinessProfileForm.jsx";
import KYCStepper from "../KYCVerification/KYCStepper.jsx";
import KYCProgress from "../KYCVerification/KYCProgress.jsx";
import KYCDocumentCard from "../KYCVerification/KYCDocumentCard.jsx";
import KYCCompletion from "../KYCVerification/KYCCompletion.jsx";
import KYCFooter from "../KYCVerification/KYCFooter.jsx";
import { useAuth } from "../../context/AuthContext";
import ROLES from "../../constants/roles";
import AgentProfileForm from "../../components/BusinessProfileForm/AgentProfileForm";

import "./KYCVerification.css";

const { Title, Paragraph } = Typography;

const KYCVerification = () => {
  const navigate = useNavigate();

  // -----------------------------
  // STATE
  // -----------------------------
  const [currentStep, setCurrentStep] = useState(0);
  const [kycProfile, setKycProfile] = useState(null);
  const [roleProfile, setRoleProfile] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const { currentUser } = useAuth();
  const role = currentUser?.role;

  // -----------------------------
  // LIFECYCLE
  // -----------------------------
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ROLE_PROFILE_CONFIG = {
    [ROLES.BUSINESS_OWNER]: {
      isComplete: (profile) => !!profile?.businessName,
      Form: BusinessProfileForm,
    },
    [ROLES.AGENT]: {
      isComplete: (profile) =>
        !!profile?.experience && !!profile?.city && !!profile?.state,
      Form: AgentProfileForm,
    },
    [ROLES.SERVICE_PROVIDER]: {
      isComplete: () => true, // later ServiceProviderProfileForm
      Form: null,
    },
  };

  // -----------------------------
  // HELPERS
  // -----------------------------

  /**
   * Fetches KYC profile & document requirements.
   * Auto-detects next incomplete requirement and sets step.
   */
  const fetchData = async () => {
    try {
      setLoading(true);

      const [profileRes, reqRes] = await Promise.all([
        getKYCProfile(),
        getKYCRequirements(),
      ]);

      setKycProfile(profileRes.kycProfile);
      setRoleProfile(profileRes.roleProfile);
      setRequirements(reqRes.requirements);

      // Build uploaded file map
      const filesMap = {};
      reqRes.requirements.forEach((req) => {
        if (req.uploaded) filesMap[req.code] = { ...req.uploaded };
      });
      setUploadedFiles(filesMap);

      // Determine first incomplete or go to completion
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

  /**
   * Handles file selection and validation for a requirement.
   *
   * @param {Event} e - File input change event
   * @param {string} requirementCode - Requirement identifier
   */
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
      [requirementCode]: { file },
    }));
  };

  /**
   * Uploads a selected document for a requirement.
   *
   * @param {string} requirementCode
   */
  const handleUpload = async (requirementCode) => {
    const fileData = uploadedFiles[requirementCode];
    if (!fileData || !fileData.file) return;

    const previousStep = currentStep;

    try {
      setUploading(true);
      await uploadKYCDocument(fileData.file, requirementCode);
      await fetchData();

      // Keep user on same step after refresh
      setCurrentStep(previousStep);

      message.success("Document uploaded successfully!");
    } catch (error) {
      console.error("Error uploading document:", error);
      message.error(error.response?.data?.error || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  /**
   * Final submission of KYC for admin review.
   */
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

  /**
   * Redirect to business owner dashboard.
   */
  const DASHBOARD_BY_ROLE = {
    [ROLES.BUSINESS_OWNER]: ROUTES.BUSINESS_OWNER_DASHBOARD,
    [ROLES.AGENT]: ROUTES.AGENT_DASHBOARD,
    [ROLES.SERVICE_PROVIDER]: ROUTES.SERVICE_PROVIDER_DASHBOARD,
  };

  const handleGoToDashboard = () =>
    navigate(DASHBOARD_BY_ROLE[role] || ROUTES.LANDING_PAGE);

  const profileConfig = ROLE_PROFILE_CONFIG[role];
  const isProfileComplete = profileConfig?.isComplete(roleProfile);

  if (profileConfig && !isProfileComplete) {
    const ProfileForm = profileConfig.Form;

    return (
      <div className="kyc-container">
        <div className="no-result-padding">
          <ProfileForm onUpdate={fetchData} />
        </div>
      </div>
    );
  }

  return (
    <div className="kyc-container kyc-wizard">
      {/* Header */}
      <div className="kyc-header">
        <Title level={2}>KYC Verification</Title>
        <Paragraph type="secondary">
          Complete your KYC to access all features
        </Paragraph>
      </div>

      {/* Stepper */}
      <KYCStepper
        requirements={requirements}
        uploadedFiles={uploadedFiles}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />

      {/* Progress Summary */}
      <KYCProgress
        requirements={requirements} // pass requirements array
        uploadedFiles={uploadedFiles}
      />

      {/* Main Content */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          {currentStep < requirements.length ? (
            <KYCDocumentCard
              requirement={requirements[currentStep]}
              uploadedFiles={uploadedFiles}
              handleFileSelect={handleFileSelect}
              handleUpload={handleUpload}
              uploading={uploading}
            />
          ) : (
            <KYCCompletion
              requirements={requirements}
              uploadedFiles={uploadedFiles}
              uploading={uploading}
              handleSubmitForReview={handleSubmitForReview}
              handleGoToDashboard={handleGoToDashboard}
            />
          )}
        </Col>
      </Row>

      {/* Optional Profile Update Form */}
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

      {/* Footer Navigation */}
      <KYCFooter
        currentStep={currentStep}
        requirements={requirements}
        uploadedFiles={uploadedFiles}
        setCurrentStep={setCurrentStep}
      />
    </div>
  );
};

export default KYCVerification;
