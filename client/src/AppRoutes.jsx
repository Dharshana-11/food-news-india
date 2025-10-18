import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminLogin from "./pages/auth/AdminLogin";
import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";
import { Spin } from "antd";
import { ROUTES } from "./routes";

const AppRoutes = () => {
  // --- Get current user and loading state from AuthContext ---
  const { currentUser, loading } = useAuth();

  // --- Show a loading screen while auth state is being determined ---
 if (loading) return <div className="text-center py-20"><Spin size="large" /></div>;

  return (
    <Routes>
      {/* ---------------- Public Routes ---------------- */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />

      {/* ---------------- Protected Routes ---------------- */}
      <Route
        path={ROUTES.SUPER_ADMIN_DASHBOARD}
        element={
          <ProtectedRoute user={currentUser} requiredRole="super-admin">
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
