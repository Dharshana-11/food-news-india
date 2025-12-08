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

/**
 * Main routing component that defines all application routes
 * @function AppRoutes
 * @returns {JSX.Element} The application's route configuration
 * @description
 * - Handles authentication state and loading states
 * - Registers FCM tokens for push notifications
 * - Defines public and protected routes
 * - Implements role-based access control
 * @example
 * // In App.jsx
 * <Router>
 *   <AppRoutes />
 * </Router>
 */
const AppRoutes = () => {
  const { currentUser, loading } = useAuth();

  /**
   * Display loading indicator while authentication state is being determined
   * @type {JSX.Element}
   */
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  /**
   * Register Firebase Cloud Messaging token for push notifications
   * when user is authenticated
   * @function registerToken
   * @async
   * @private
   */
  useEffect(() => {
    async function registerToken() {
      if (currentUser) {
        const token = await requestForToken();
        if (token) {
          await saveTokenAPI({
            uid: currentUser.uid,
            token: token,
            role: currentUser.role,
          });
        }
      }
    }
    registerToken();
  }, [currentUser]);

  // 🔔 FOREGROUND NOTIFICATION HANDLER
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
      {/* =========================================================
          PUBLIC ROUTES
      ========================================================= */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />

      {/* =========================================================
          SUPER ADMIN PROTECTED ROUTES
      ========================================================= */}

      {/* DASHBOARD */}
      <Route
        path={ROUTES.SUPER_ADMIN_DASHBOARD}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* 🔁 USER MANAGEMENT REDIRECT */}
      <Route
        path={ROUTES.SUPER_ADMIN_USERS}
        element={<Navigate to={ROUTES.USER_LIST} replace />}
      />

      {/* 👤 USERS PAGE */}
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

      {/* 🔁 TICKET MANAGEMENT REDIRECT */}
      <Route
        path={ROUTES.SUPER_ADMIN_TICKETS}
        element={<Navigate to={ROUTES.TICKET_BOARD} replace />}
      />

      {/* 🎫 TICKET BOARD */}
      <Route
        path={ROUTES.TICKET_BOARD}
        element={
          <ProtectedRoute user={currentUser} requiredRole={ROLES.SUPER_ADMIN}>
            <SuperAdminLayout>
              <TicketBoard />
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />

      {/* 🎫 TICKET DETAILS WITH ID */}
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

      {/* =========================================================
          NOTIFICATION MODULE
      ========================================================= */}

      {/* 🔁 NOTIFICATIONS REDIRECT */}
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

      {/* =========================================================
         OTHER SUPER ADMIN MODULES
      ========================================================= */}
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

      {/* 👤 PROFILE */}
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
    </Routes>
  );
};

export default AppRoutes;