import React, { useState, useEffect } from "react";
import AppLayout from "../../layouts/AppLayout";
import ROLES from "../../constants/roles";
import {
  getKYCRequirements,
  getKYCProfile,
  uploadKYCDocument,
  updateBusinessProfile,
  submitKYCForReview,
} from "../../api/kyc";
import "./KYCVerification.css";

const KYCVerification = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, reqRes] = await Promise.all([
        getKYCProfile(),
        getKYCRequirements(),
      ]);

      setProfile(profileRes.profile);
      setRequirements(reqRes.requirements);

      // Pre-fill uploaded files
      const filesMap = {};
      reqRes.requirements.forEach((req) => {
        if (req.uploaded) {
          filesMap[req.code] = req.uploaded;
        }
      });
      setUploadedFiles(filesMap);

      // Determine current step based on progress
      if (profileRes.profile.kycStatus === "verified") {
        setCurrentStep(reqRes.requirements.length); // Show completion
      } else if (profileRes.profile.kycStatus === "in_review") {
        setCurrentStep(reqRes.requirements.length); // Show review status
      } else {
        // Find first incomplete step
        const firstIncomplete = reqRes.requirements.findIndex(
          (req) => !req.uploaded || req.uploaded.status === "rejected"
        );
        setCurrentStep(firstIncomplete >= 0 ? firstIncomplete : 0);
      }
    } catch (error) {
      console.error("Error fetching KYC data:", error);
      alert("Failed to load KYC data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e, requirementCode) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, JPG, and PNG files are allowed");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setUploadedFiles((prev) => ({
      ...prev,
      [requirementCode]: { file, status: "ready" },
    }));
  };

  const handleUpload = async (requirementCode) => {
    const fileData = uploadedFiles[requirementCode];
    if (!fileData || !fileData.file) return;

    try {
      setUploading(true);
      await uploadKYCDocument(fileData.file, requirementCode);

      // Refresh data
      await fetchData();

      alert("Document uploaded successfully!");
    } catch (error) {
      console.error("Error uploading document:", error);
      alert(error.response?.data?.error || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setUploading(true);
      await updateBusinessProfile(formData);
      await fetchData();
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitForReview = async () => {
    try {
      setUploading(true);
      await submitKYCForReview();
      await fetchData();
      alert("KYC submitted for review successfully!");
    } catch (error) {
      console.error("Error submitting KYC:", error);
      alert(error.response?.data?.error || "Failed to submit KYC");
    } finally {
      setUploading(false);
    }
  };

  const canProceedToNext = () => {
    if (currentStep >= requirements.length) return false;
    
    const currentReq = requirements[currentStep];
    const uploaded = uploadedFiles[currentReq.code];
    
    return uploaded && (uploaded.status === "approved" || uploaded.status === "pending");
  };

  const allDocsUploaded = () => {
    return requirements.every((req) => {
      const uploaded = uploadedFiles[req.code];
      return uploaded && (uploaded.status === "approved" || uploaded.status === "pending");
    });
  };

  const renderProgressBar = () => {
    const progress = profile?.kycProgress || 0;
    
    return (
      <div className="kyc-progress-container">
        <div className="kyc-progress-header">
          <span className="kyc-progress-label">KYC Verification Progress</span>
          <span className="kyc-progress-value">{progress}%</span>
        </div>
        <div className="kyc-progress-bar">
          <div
            className="kyc-progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const renderStepIndicator = () => {
    return (
      <div className="kyc-steps">
        {requirements.map((req, index) => (
          <div
            key={req.code}
            className={`kyc-step ${index === currentStep ? "active" : ""} ${
              uploadedFiles[req.code] ? "completed" : ""
            }`}
            onClick={() => setCurrentStep(index)}
          >
            <div className="kyc-step-number">
              {uploadedFiles[req.code] ? "✓" : index + 1}
            </div>
            <div className="kyc-step-label">{req.name}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderDocumentUpload = (requirement) => {
    const uploaded = uploadedFiles[requirement.code];
    const isUploaded = uploaded && uploaded._id;

    return (
      <div className="kyc-document-upload">
        <h2>{requirement.name}</h2>
        {requirement.description && (
          <p className="kyc-description">{requirement.description}</p>
        )}

        {isUploaded ? (
          <div className={`kyc-upload-status status-${uploaded.status}`}>
            <div className="status-icon">
              {uploaded.status === "pending" && "⏳"}
              {uploaded.status === "approved" && "✓"}
              {uploaded.status === "rejected" && "✗"}
            </div>
            <div className="status-details">
              <p className="status-title">
                {uploaded.status === "pending" && "Pending Review"}
                {uploaded.status === "approved" && "Approved"}
                {uploaded.status === "rejected" && "Rejected"}
              </p>
              <p className="status-filename">{uploaded.fileName}</p>
              {uploaded.reviewNotes && (
                <p className="status-notes">Note: {uploaded.reviewNotes}</p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="kyc-file-input-wrapper">
              <input
                type="file"
                id={`file-${requirement.code}`}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileSelect(e, requirement.code)}
                className="kyc-file-input"
              />
              <label htmlFor={`file-${requirement.code}`} className="kyc-file-label">
                {uploaded?.file
                  ? uploaded.file.name
                  : `Upload ${requirement.name}`}
              </label>
            </div>

            {uploaded?.file && (
              <button
                onClick={() => handleUpload(requirement.code)}
                disabled={uploading}
                className="kyc-upload-btn"
              >
                {uploading ? "Uploading..." : "Upload Document"}
              </button>
            )}
          </>
        )}

        {isUploaded && uploaded.status === "rejected" && (
          <div className="kyc-reupload">
            <p>Please upload a new document</p>
            <div className="kyc-file-input-wrapper">
              <input
                type="file"
                id={`refile-${requirement.code}`}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileSelect(e, requirement.code)}
                className="kyc-file-input"
              />
              <label htmlFor={`refile-${requirement.code}`} className="kyc-file-label">
                Choose New File
              </label>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCompletionScreen = () => {
    if (profile?.kycStatus === "verified") {
      return (
        <div className="kyc-completion verified">
          <div className="completion-icon">✓</div>
          <h2>KYC Verified!</h2>
          <p>Your KYC verification is complete. You can now access all features.</p>
        </div>
      );
    }

    if (profile?.kycStatus === "in_review") {
      return (
        <div className="kyc-completion in-review">
          <div className="completion-icon">⏳</div>
          <h2>Under Review</h2>
          <p>Your KYC documents are being reviewed. We'll notify you once the review is complete.</p>
        </div>
      );
    }

    return (
      <div className="kyc-completion ready">
        <div className="completion-icon">📄</div>
        <h2>Ready to Submit</h2>
        <p>All required documents have been uploaded. Submit your KYC for verification.</p>
        <button
          onClick={handleSubmitForReview}
          disabled={uploading || !allDocsUploaded()}
          className="kyc-submit-btn"
        >
          {uploading ? "Submitting..." : "Submit for Review"}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <AppLayout allowedRoles={[ROLES.BUSINESS_OWNER]}>
        <div className="kyc-container">
          <div className="kyc-loading">Loading KYC information...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout allowedRoles={[ROLES.BUSINESS_OWNER]}>
      <div className="kyc-container">
        <div className="kyc-header">
          <h1>KYC Verification</h1>
          <p>Complete your KYC to access all features</p>
        </div>

        {renderProgressBar()}
        {renderStepIndicator()}

        <div className="kyc-content">
          {currentStep < requirements.length ? (
            <>
              {renderDocumentUpload(requirements[currentStep])}
              
              <div className="kyc-navigation">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="kyc-nav-btn prev"
                  >
                    ← Previous
                  </button>
                )}
                {currentStep < requirements.length - 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canProceedToNext()}
                    className="kyc-nav-btn next"
                  >
                    Next →
                  </button>
                )}
              </div>
            </>
          ) : (
            renderCompletionScreen()
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default KYCVerification;