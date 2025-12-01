/**
 * AppRoutes.jsx
 * ------------------------------------------------------------
 * Centralized route configuration for the React application.
 * Handles public and protected routes, including role-based access
 * using the ProtectedRoute component and AuthContext.
 * ------------------------------------------------------------
 */

import { Routes, Route } from "react-router-dom";
import { Spin } from "antd";
import ProtectedRoute from "./components/ProtectedRoute";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import SuperAdminUsers from "./pages/superadmin/SuperAdminUsers";
import AdminLogin from "./pages/auth/AdminLogin";
import Login from "./pages/auth/Login";
import { useAuth } from "./context/AuthContext";
import { ROUTES } from "./routes";
import ROLES from "./constants/roles";
import ComplianceAndDocumentManagement from "./pages/ComplianceAndDocumentManagement/ComplianceAndDocumentManagement";
import ComplianceItems from "./pages/ComplianceAndDocumentManagement/ComplianceItems";
import BusinessTypes from "./pages/BusinessTypes/BusinessTypes";
import ComplianceMappings from "./pages/ComplianceMappings/ComplianceMappings";
import KYCDocuments from "./pages/KYCDocuments/KYCDocuments";
import Documents from "./pages/Documents/Documents";
import BusinessOwnerDashboard from "./pages/businessowner/BusinessOwnerDashboard";
/**
 * Renders all application routes with public and role-protected access.
 * Displays a loading spinner while authentication state is being determined.
 *
 * @component
 * @returns {JSX.Element} The complete route structure of the application.
 */
const AppRoutes = () => {
  const { currentUser, loading } = useAuth();

  // --- Show loading indicator while authentication status initializes ---
  if (loading) {
    return (
      <div className="loading-container">
        {/* style in global CSS */}
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Routes>
      {/* =========================================================
          PUBLIC ROUTES
          ========================================================= */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />

      {/* =========================================================
          SUPER ADMIN PROTECTED ROUTES
          ---------------------------------------------------------
          Each route uses ProtectedRoute to verify:
          - A valid authenticated user (`currentUser`)
          - The user's role matches `ROLES.SUPER_ADMIN`
          If not, the component redirects appropriately.
          ========================================================= */}
      <Route
        path={ROUTES.SUPER_ADMIN_DASHBOARD}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SUPER_ADMIN_USERS}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminUsers />
          </ProtectedRoute>
        }
      />

      {/* -------- Placeholder routes for additional modules -------- */}
      <Route
        path={ROUTES.SUPER_ADMIN_COMPLIANCE}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <ComplianceAndDocumentManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SUPER_ADMIN_COMPLIANCE_ITEMS} // rename constant instead of COMPLIANCE_CATEGORIES
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <ComplianceItems />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SUPER_ADMIN_BUSINESS_TYPES}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <BusinessTypes />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SUPER_ADMIN_COMPLIANCE_MAPPINGS}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <ComplianceMappings />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SUPER_ADMIN_KYC_DOCUMENTS}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <KYCDocuments />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SUPER_ADMIN_DOCUMENTS}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <Documents />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SUPER_ADMIN_SERVICES}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <div>Service Management Page</div>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SUPER_ADMIN_SUPPORT}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <div>Support Tickets Page</div>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SUPER_ADMIN_SETTINGS}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <div>Platform Settings Page</div>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SUPER_ADMIN_CONTENT}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <div>Content Management Page</div>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SUPER_ADMIN_AUDIT}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <div>System Logs Page</div>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SUPER_ADMIN_PROFILE}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <div>My Profile Page</div>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SUPER_ADMIN_NOTIFICATIONS}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <div>Notifications</div>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SUPER_ADMIN_TICKETS}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <div>Tickets</div>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.BUSINESS_OWNER_DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={[ROLES.BUSINESS_OWNER]}>
            <BusinessOwnerDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
