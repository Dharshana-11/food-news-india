import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import AdminLogin from "./pages/auth/AdminLogin";
import Login from "./pages/auth/Login";
import SuperAdminUsers from "./pages/superadmin/SuperAdminUsers";
import { useAuth } from "./context/AuthContext";
import { Spin } from "antd";
import { ROUTES } from "./routes";
import ROLES from "./constants/roles";

const AppRoutes = () => {
  // --- Get current user and loading state from AuthContext ---
  const { currentUser, loading } = useAuth();

  // --- Show a loading screen while auth state is being determined ---
  if (loading)
    return (
      <div className="text-center py-20">
        <Spin size="large" />
      </div>
    );

  return (
    <Routes>
      {/* ---------------- Public Routes ---------------- */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />

      {/* ---------------- Protected Routes ---------------- */}
      <Route
        path={ROUTES.SUPER_ADMIN_DASHBOARD}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminDashboard />
            <SuperAdminUsers />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
