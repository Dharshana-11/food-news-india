import { Routes, Route, Navigate } from "react-router-dom";
import { Spin, notification } from "antd";
import { useEffect } from "react";
import { onMessage } from "firebase/messaging";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import { useAuth } from "./context/AuthContext";
import { ROUTES } from "./routes";
import ROLES from "./constants/roles";

import { requestForToken } from "./firebase/requestForToken";
import saveTokenAPI from "./api/saveTokenAPI";
import { messaging } from "./firebase/firebase";

// Pages
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import UserManagement from "./pages/superadmin/UserManagement";
import TicketBoard from "./pages/superadmin/TicketBoard";
import TicketDetailsBoard from "./pages/superadmin/TicketDetailsBoard";

import ComplianceAndDocumentManagement from "./pages/ComplianceAndDocumentManagement/ComplianceAndDocumentManagement";
import ComplianceItems from "./pages/ComplianceAndDocumentManagement/ComplianceItems";
import BusinessTypes from "./pages/BusinessTypes/BusinessTypes";
import ComplianceMappings from "./pages/ComplianceMappings/ComplianceMappings";
import KYCDocuments from "./pages/KYCDocuments/KYCDocuments";
import Documents from "./pages/Documents/Documents";

import NotificationOverview from "./pages/notifications/NotificationOverview";
import ModuleSettings from "./pages/notifications/ModuleSettings";
import RoleSettings from "./pages/notifications/RoleSettings";
import TemplateSettings from "./pages/notifications/TemplateSettings";
import NotificationLogs from "./pages/notifications/NotificationLogs";

import ProfileSelf from "./pages/profile/ProfileSelf";
import BusinessOwnerDashboard from "./pages/businessowner/BusinessOwnerDashboard";
import KYCVerification from "./pages/KYCVerification/KYCVerification";
import DocumentVault from "./pages/BusinessOwner/DocumentVault/DocumentVault";

/**
 * Renders all application routes with public and role-protected access.
 * Displays a loading spinner while authentication state is being determined.
 *
 * @component
 * @returns {JSX.Element} The complete route structure of the application.
 */

import AdminLogin from "./pages/auth/AdminLogin";
import Login from "./pages/auth/Login";

// ------------------------------------------
// ROUTE CONFIG (Cleaner, Minimal, Scalable)
// ------------------------------------------

const SUPER_ADMIN_ROUTES = [
  { path: ROUTES.SUPER_ADMIN_DASHBOARD, element: <SuperAdminDashboard /> },

  // USERS
  {
    path: ROUTES.SUPER_ADMIN_USERS,
    element: <Navigate to={ROUTES.USER_LIST} />,
  },
  { path: ROUTES.USER_LIST, layout: true, element: <UserManagement /> },

  // TICKETS
  {
    path: ROUTES.SUPER_ADMIN_TICKETS,
    element: <Navigate to={ROUTES.TICKET_BOARD} />,
  },
  { path: ROUTES.TICKET_BOARD, layout: true, element: <TicketBoard /> },
  { path: "/tickets/:id", layout: true, element: <TicketDetailsBoard /> },

  // COMPLIANCE
  {
    path: ROUTES.SUPER_ADMIN_COMPLIANCE,
    element: <ComplianceAndDocumentManagement />,
  },
  { path: ROUTES.SUPER_ADMIN_COMPLIANCE_ITEMS, element: <ComplianceItems /> },
  { path: ROUTES.SUPER_ADMIN_BUSINESS_TYPES, element: <BusinessTypes /> },
  {
    path: ROUTES.SUPER_ADMIN_COMPLIANCE_MAPPINGS,
    element: <ComplianceMappings />,
  },
  { path: ROUTES.SUPER_ADMIN_KYC_DOCUMENTS, element: <KYCDocuments /> },
  { path: ROUTES.SUPER_ADMIN_DOCUMENTS, element: <Documents /> },

  // NOTIFICATIONS
  {
    path: ROUTES.SUPER_ADMIN_NOTIFICATIONS,
    element: <Navigate to={ROUTES.NOTIF_OVERVIEW} />,
  },
  {
    path: ROUTES.NOTIF_OVERVIEW,
    layout: true,
    element: <NotificationOverview />,
  },
  {
    path: ROUTES.NOTIF_MODULE_SETTINGS,
    layout: true,
    element: <ModuleSettings />,
  },
  { path: ROUTES.NOTIF_ROLE_SETTINGS, layout: true, element: <RoleSettings /> },
  {
    path: ROUTES.NOTIF_TEMPLATE_SETTINGS,
    layout: true,
    element: <TemplateSettings />,
  },
  { path: ROUTES.NOTIF_LOGS, layout: true, element: <NotificationLogs /> },

  // PROFILE
  { path: ROUTES.SUPER_ADMIN_PROFILE, layout: true, element: <ProfileSelf /> },
  { path: "/super-admin/profile/:uid", layout: true, element: <ProfileSelf /> },

  // OTHER RAW PAGES
  {
    path: ROUTES.SUPER_ADMIN_SETTINGS,
    element: <div>Platform Settings Page</div>,
  },
  {
    path: ROUTES.SUPER_ADMIN_CONTENT,
    element: <div>Content Management Page</div>,
  },
  { path: ROUTES.SUPER_ADMIN_AUDIT, element: <div>System Logs Page</div> },
];

// ------------------------------------------
// COMPONENT
// ------------------------------------------

const AppRoutes = () => {
  const { currentUser, loading } = useAuth();

  // Register FCM Token
  useEffect(() => {
    (async () => {
      if (!currentUser) return;
      const token = await requestForToken();
      if (token)
        saveTokenAPI({
          uid: currentUser.uid,
          token,
          role: currentUser.role,
        });
    })();
  }, [currentUser]);

  // Foreground Notifications
  useEffect(() => {
    if (!messaging) return;
    const unsubscribe = onMessage(messaging, (payload) => {
      const channels = payload.data?.channels?.split(",") ?? [];

      if (channels.includes("web")) {
        notification.info({
          message: payload.notification?.title || "New Notification",
          description: payload.notification?.body || "",
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
    return unsubscribe;
  }, []);

  if (loading)
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />

      {/* SUPER ADMIN ROUTES (AUTO-MAPPED) */}
      {SUPER_ADMIN_ROUTES.map(({ path, element, layout }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute requiredRole={ROLES.SUPER_ADMIN}>
              {layout ? (
                <AppLayout role={ROLES.SUPER_ADMIN}>{element}</AppLayout>
              ) : (
                element
              )}
            </ProtectedRoute>
          }
        />
      ))}

      {/* BUSINESS OWNER */}
      <Route path={ROUTES.BUSINESS_OWNER_KYC} element={<KYCVerification />} />

      <Route
        path={ROUTES.BUSINESS_OWNER_DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={[ROLES.BUSINESS_OWNER]}>
            <BusinessOwnerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.BUSINESS_OWNER_DOCUMENT_VAULT}
        element={
          <ProtectedRoute allowedRoles={[ROLES.BUSINESS_OWNER]}>
            <DocumentVault />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
