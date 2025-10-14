import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute component
 * ------------------------
 * Guards routes based on user authentication and role.
 *
 * @param {Object} user - Logged-in user object (contains uid, role, etc.)
 * @param {string} requiredRole - Role required to access the route (optional)
 * @param {ReactNode} children - The component(s) to render if access is allowed
 */

const ProtectedRoute = ({ user, requiredRole, children }) => {
  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

   // If a specific role is required and user doesn't match it
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

   // If authenticated (and role matches, if required), render the protected content
  return children;
};

export default ProtectedRoute;
