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

/**
 * Renders all routes in the application.
 * Displays a loading spinner until authentication state is resolved.
 *
 * @component
 * @returns {JSX.Element} The complete set of application routes.
 */
const AppRoutes = () => {
  const { currentUser, loading } = useAuth();

  // --- Display a loading spinner while authentication state is being determined ---
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>

    );
  }

  return (
    <Routes>
      {/* ---------------- Public Routes ---------------- */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />

      {/* ---------------- Super Admin Protected Routes ---------------- */}
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
    </Routes>
  );
};

export default AppRoutes;