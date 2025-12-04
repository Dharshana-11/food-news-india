import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getKYCProfile } from "../../services/kyc.js";
import { ROUTES } from "../../routes.js";
import ROLES from "../../constants/roles.js";

/**
 * KYCGuard Component
 * 
 * Redirects unverified users to KYC verification page.
 * Allows verified users to proceed to protected routes.
 * 
 * Usage:
 * <KYCGuard>
 *   <ProtectedComponent />
 * </KYCGuard>
 */
const KYCGuard = ({ children, userRole }) => {
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState(null);
  const location = useLocation();

  // Roles that require KYC verification
  const rolesRequiringKYC = [
    ROLES.BUSINESS_OWNER,
    ROLES.AGENT,
    ROLES.SERVICE_PROVIDER,
  ];

  // Routes that should be accessible even without KYC
  const kycExemptRoutes = [
    ROUTES.BUSINESS_OWNER_KYC,
    ROUTES.AGENT_KYC,
    ROUTES.SERVICE_PROVIDER_KYC,
  ];

  useEffect(() => {
    checkKYCStatus();
  }, []);

  const checkKYCStatus = async () => {
    try {
      // Skip KYC check for exempt routes or non-KYC roles
      if (
        !rolesRequiringKYC.includes(userRole) ||
        kycExemptRoutes.includes(location.pathname)
      ) {
        setKycStatus("verified"); // Allow access
        setLoading(false);
        return;
      }

      const { profile } = await getKYCProfile();
      setKycStatus(profile.kycStatus);
    } catch (error) {
      console.error("Error checking KYC status:", error);
      setKycStatus("pending"); // Assume pending on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Checking verification status...</p>
      </div>
    );
  }

  // Redirect to KYC page if not verified
  if (kycStatus !== "verified" && rolesRequiringKYC.includes(userRole)) {
    const kycRoute = getKYCRouteForRole(userRole);
    
    // Don't redirect if already on KYC page
    if (location.pathname !== kycRoute) {
      return <Navigate to={kycRoute} replace />;
    }
  }

  return children;
};

/**
 * Get KYC verification route based on user role
 */
const getKYCRouteForRole = (role) => {
  switch (role) {
    case ROLES.BUSINESS_OWNER:
      return ROUTES.BUSINESS_OWNER_KYC;
    case ROLES.AGENT:
      return ROUTES.AGENT_KYC;
    case ROLES.SERVICE_PROVIDER:
      return ROUTES.SERVICE_PROVIDER_KYC;
    default:
      return ROUTES.LANDING_PAGE;
  }
};

const styles = {
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid #e0e0e0",
    borderTop: "5px solid #ff6b35",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem",
  },
};

// Add keyframe animation for spinner
// const styleSheet = document.styleSheets[0];
// styleSheet.insertRule(
//   `
//   @keyframes spin {
//     0% { transform: rotate(0deg); }
//     100% { transform: rotate(360deg); }
//   }
// `,
//   styleSheet.cssRules.length
// );

export default KYCGuard;