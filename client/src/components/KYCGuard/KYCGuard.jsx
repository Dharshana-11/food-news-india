/**
 * KYCGuard Component
 * ============================================================================
 * Protects routes that require KYC verification.
 * Redirects unverified users to their role-specific KYC page.
 * Verified users can access the protected content.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component(s) to render if KYC is verified
 * @param {string} props.userRole - Current user's role
 *
 * @example
 * <KYCGuard userRole={currentUser.role}>
 *   <ProtectedComponent />
 * </KYCGuard>
 */

import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getKYCProfile } from "../../services/kyc.js";
import { ROUTES } from "../../routes.js";
import ROLES from "../../constants/roles.js";
import { useAuth } from "../../context/AuthContext";

const KYCGuard = ({ children }) => {
  const { currentUser } = useAuth();
  const userRole = currentUser?.role;

  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState(null);
  const location = useLocation();

  // Roles that require KYC verification
  const rolesRequiringKYC = [
    ROLES.BUSINESS_OWNER,
    ROLES.AGENT,
    ROLES.SERVICE_PROVIDER,
  ];

  // Routes accessible even without KYC
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
      // Skip check for exempt routes or non-KYC roles
      if (
        !rolesRequiringKYC.includes(userRole) ||
        kycExemptRoutes.includes(location.pathname)
      ) {
        setKycStatus("verified");
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
      </div>
    );
  }

  // Redirect to KYC page if not verified
  if (kycStatus !== "verified" && rolesRequiringKYC.includes(userRole)) {
    const kycRoute = getKYCRouteForRole(userRole);
    if (location.pathname !== kycRoute) {
      return <Navigate to={kycRoute} replace />;
    }
  }

  return children;
};

/**
 * Returns the KYC verification route based on role
 * @param {string} role - User role
 * @returns {string} Route path
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

// Inline styles for loading spinner
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
    width: 50,
    height: 50,
    border: "5px solid #e0e0e0",
    borderTop: "5px solid #ff6b35",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: 12,
  },
};

// NOTE: Add the following CSS to your global stylesheet or module for spinner animation:
/*
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
*/

export default KYCGuard;
