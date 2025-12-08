/**
 * @file AppRoutes.jsx
 * @description Centralized route configuration for the React application.
 * Handles public and protected routes, including role-based access
 * using the ProtectedRoute component and AuthContext.
 * @module AppRoutes
 * @requires react
 * @requires react-router-dom
 * @requires antd
 * @requires ./components/ProtectedRoute
 * @requires ./context/AuthContext
 * @see {@link module:context/AuthContext} for authentication logic
 * @see {@link module:components/ProtectedRoute} for route protection
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { Spin, notification } from "antd";
import { useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import ProfileSelf from "./pages/profile/ProfileSelf";
import AdminLogin from "./pages/auth/AdminLogin";
import Login from "./pages/auth/Login";
import UserManagement from "./pages/superadmin/UserManagement";
import TicketDetailsBoard from "./pages/superadmin/TicketDetailsBoard";
import TicketBoard from "./pages/superadmin/TicketBoard";
import { useAuth } from "./context/AuthContext";
import { ROUTES } from "./routes";
import ROLES from "./constants/roles";
import { requestForToken } from "./firebase/requestForToken";
import saveTokenAPI from "./api/saveTokenAPI";
import NotificationOverview from "./pages/notifications/NotificationOverview";
import ModuleSettings from "./pages/notifications/ModuleSettings";
import RoleSettings from "./pages/notifications/RoleSettings";
import TemplateSettings from "./pages/notifications/TemplateSettings";
import NotificationLogs from "./pages/notifications/NotificationLogs";
import { onMessage } from "firebase/messaging";
import { messaging } from "./firebase/firebase";

// SUPER ADMIN DOCUMENT & COMPLIANCE PAGES
import ComplianceAndDocumentManagement from "./pages/ComplianceAndDocumentManagement/ComplianceAndDocumentManagement";
import ComplianceItems from "./pages/ComplianceAndDocumentManagement/ComplianceItems";
import BusinessTypes from "./pages/BusinessTypes/BusinessTypes";
import ComplianceMappings from "./pages/ComplianceMappings/ComplianceMappings";
import KYCDocuments from "./pages/KYCDocuments/KYCDocuments";
import Documents from "./pages/Documents/Documents";

// BUSINESS OWNER
import BusinessOwnerDashboard from "./pages/businessowner/BusinessOwnerDashboard";
import KYCVerification from "./pages/KYCVerification/KYCVerification";

const AppRoutes = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  useEffect(() => {
    async function registerToken() {
      if (currentUser) {
        const token = await requestForToken();
        if (token) {
          await saveTokenAPI({
            uid: currentUser.uid,
            token,
            role: currentUser.role,
          });
        }
      }
    }
    registerToken();
  }, [currentUser]);

  // 🔔 Foreground Notification Handler
  useEffect(() => {
    if (!messaging) return;
    const unsubscribe = onMessage(messaging, (payload) => {
      const channels = payload.data?.channels?.split(",") || [];

      if (channels.includes("web")) {
        notification.info({
          message: payload?.notification?.title || "New Notification",
          description: payload?.notification?.body || "",
          placement: "topRight",
        });
      }

      if (channels.includes("push") && Notification.permission === "granted") {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: "/logo192.png",
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />

      {/* ================= SUPER ADMIN ROUTES ================= */}

      <Route
        path={ROUTES.SUPER_ADMIN_DASHBOARD}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminLayout>
              <SuperAdminDashboard />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      {/* 👤 USERS */}
      <Route
        path={ROUTES.SUPER_ADMIN_USERS}
        element={<Navigate to={ROUTES.USER_LIST} replace />}
      />

      <Route
        path={ROUTES.USER_LIST}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminLayout>
              <UserManagement />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      {/* 🎫 TICKETS */}
      <Route
        path={ROUTES.SUPER_ADMIN_TICKETS}
        element={<Navigate to={ROUTES.TICKET_BOARD} replace />}
      />

      <Route
        path={ROUTES.TICKET_BOARD}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            {/* KEEP BOTH CHANGES */}
            <SuperAdminLayout>
              <TicketBoard />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      {/* 🎫 TICKET DETAILS MODAL PAGE */}
      <Route
        path="/tickets/:id"
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminLayout>
              <TicketDetailsBoard />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      {/* 📚 DOCUMENT & COMPLIANCE SYSTEM (KEEP DEV CHANGE + WRAP) */}
      <Route
        path={ROUTES.SUPER_ADMIN_COMPLIANCE}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminLayout>
              <ComplianceAndDocumentManagement />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SUPER_ADMIN_COMPLIANCE_ITEMS}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminLayout>
              <ComplianceItems />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SUPER_ADMIN_BUSINESS_TYPES}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminLayout>
              <BusinessTypes />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SUPER_ADMIN_COMPLIANCE_MAPPINGS}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminLayout>
              <ComplianceMappings />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SUPER_ADMIN_KYC_DOCUMENTS}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminLayout>
              <KYCDocuments />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SUPER_ADMIN_DOCUMENTS}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminLayout>
              <Documents />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      {/* ================= NOTIFICATION MODULE ================= */}

      <Route
        path={ROUTES.SUPER_ADMIN_NOTIFICATIONS}
        element={<Navigate to={ROUTES.NOTIF_OVERVIEW} replace />}
      />

      <Route
        path={ROUTES.NOTIF_OVERVIEW}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminLayout>
              <NotificationOverview />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.NOTIF_MODULE_SETTINGS}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminLayout>
              <ModuleSettings />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.NOTIF_ROLE_SETTINGS}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminLayout>
              <RoleSettings />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.NOTIF_TEMPLATE_SETTINGS}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminLayout>
              <TemplateSettings />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.NOTIF_LOGS}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminLayout>
              <NotificationLogs />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      {/* ================= OTHER MODULE PAGES ================= */}

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

      {/* ================= PROFILE ================= */}

      <Route
        path={ROUTES.SUPER_ADMIN_PROFILE}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminLayout>
              <ProfileSelf />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/super-admin/profile/:uid"
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminLayout>
              <ProfileSelf currentUser={currentUser} />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      {/* ================= BUSINESS OWNER ================= */}

      <Route path={ROUTES.BUSINESS_OWNER_KYC} element={<KYCVerification />} />

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