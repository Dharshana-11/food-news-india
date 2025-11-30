import { Navigate } from "react-router-dom";
import { Spin } from "antd";
import { ROUTES } from "../routes";
import { useAuth } from "../context/AuthContext";

/**
 * A route wrapper that protects authenticated pages.
 *
 * Handles:
 * - Initial auth loading state
 * - Session refresh loading state
 * - Redirecting unauthenticated users to login
 * - Optional role-based authorization
 *
 * @param {Object} props
 * @param {string} [props.requiredRole] - Optional role required to access the route
 * @param {JSX.Element} props.children - Component to render after authentication
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({ requiredRole, children }) => {
  const { currentUser, loading, isRefreshingSession } = useAuth();

  const isLoading = loading || isRefreshingSession;

  // Show loader during initial authentication or session refresh
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  // If not authenticated → redirect to login
  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Role-based protection (optional)
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
