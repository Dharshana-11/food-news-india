import React from "react";
import { Navigate } from "react-router-dom";

// user = object with { uid, role, email, ... }
// requiredRole = string (e.g., "super-admin")
const ProtectedRoute = ({ user, requiredRole, children }) => {
  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Role mismatch
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
