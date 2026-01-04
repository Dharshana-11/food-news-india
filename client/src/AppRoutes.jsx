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

// Notifications
import NotificationOverview from "./pages/notifications/NotificationOverview";
import ModuleSettings from "./pages/notifications/ModuleSettings";
import RoleSettings from "./pages/notifications/RoleSettings";
import TemplateSettings from "./pages/notifications/TemplateSettings";
import NotificationLogs from "./pages/notifications/NotificationLogs";

import ProfileSelf from "./pages/profile/ProfileSelf";
import BusinessOwnerDashboard from "./pages/businessowner/BusinessOwnerDashboard";
import KYCVerification from "./pages/KYCVerification/KYCVerification";
import KYCGuard from "./components/KYCGuard/KYCGuard";
import DocumentVault from "./pages/BusinessOwner/DocumentVault/DocumentVault";
import MyAgents from "./pages/BusinessOwner/Agents/MyAgents";
import ViewMyAgent from "./pages/BusinessOwner/Agents/ViewMyAgent";
import AddAgent from "./pages/BusinessOwner/Agents/AddAgent";

import AdminLogin from "./pages/auth/AdminLogin";
import Login from "./pages/auth/Login";

import MyServices from "./pages/BusinessOwner/ServiceProvider/MyServices";
import BookServices from "./pages/BusinessOwner/ServiceProvider/BookServices";
import ServiceProviders from "./pages/BusinessOwner/ServiceProvider/ServiceProviders";
import ProviderDetails from "./pages/BusinessOwner/ServiceProvider/ProviderDetails";
import MyBookings from "./pages/BusinessOwner/ServiceProvider/MyBookings";
import ServiceDetails from "./pages/BusinessOwner/ServiceProvider/ServiceDetails";

import AgentDashboard from "./pages/Agent/AgentDashboard";
import MyRequests from "./pages/Agent/MyRequests";

const AppRoutes = () => {
  const { currentUser, loading } = useAuth();

  // Register FCM Token
  useEffect(() => {
    (async () => {
      if (!currentUser) return;
      const token = await requestForToken();
      if (token) {
        saveTokenAPI({
          uid: currentUser.uid,
          token,
          role: currentUser.role,
        });
      }
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

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />

      {/* SUPER ADMIN (LAYOUT GROUP) */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
            <AppLayout role={ROLES.SUPER_ADMIN} />
          </ProtectedRoute>
        }
      >
        {/* DASHBOARD */}
        <Route
          path={ROUTES.SUPER_ADMIN_DASHBOARD}
          element={<SuperAdminDashboard />}
        />

        {/* USERS */}
        <Route
          path={ROUTES.SUPER_ADMIN_USERS}
          element={<Navigate to={ROUTES.USER_LIST} replace />}
        />
        <Route path={ROUTES.USER_LIST} element={<UserManagement />} />

        {/* TICKETS */}
        <Route
          path={ROUTES.SUPER_ADMIN_TICKETS}
          element={<Navigate to={ROUTES.TICKET_BOARD} replace />}
        />
        <Route path={ROUTES.TICKET_BOARD} element={<TicketBoard />} />
        <Route path="/tickets/:id" element={<TicketDetailsBoard />} />

        {/* COMPLIANCE */}
        <Route
          path={ROUTES.SUPER_ADMIN_COMPLIANCE}
          element={<ComplianceAndDocumentManagement />}
        />
        <Route
          path={ROUTES.SUPER_ADMIN_COMPLIANCE_ITEMS}
          element={<ComplianceItems />}
        />
        <Route
          path={ROUTES.SUPER_ADMIN_BUSINESS_TYPES}
          element={<BusinessTypes />}
        />
        <Route
          path={ROUTES.SUPER_ADMIN_COMPLIANCE_MAPPINGS}
          element={<ComplianceMappings />}
        />
        <Route
          path={ROUTES.SUPER_ADMIN_KYC_DOCUMENTS}
          element={<KYCDocuments />}
        />
        <Route path={ROUTES.SUPER_ADMIN_DOCUMENTS} element={<Documents />} />

        {/* NOTIFICATIONS */}
        <Route
          path={ROUTES.SUPER_ADMIN_NOTIFICATIONS}
          element={<Navigate to={ROUTES.NOTIF_OVERVIEW} replace />}
        />
        <Route
          path={ROUTES.NOTIF_OVERVIEW}
          element={<NotificationOverview />}
        />
        <Route
          path={ROUTES.NOTIF_MODULE_SETTINGS}
          element={<ModuleSettings />}
        />
        <Route path={ROUTES.NOTIF_ROLE_SETTINGS} element={<RoleSettings />} />
        <Route
          path={ROUTES.NOTIF_TEMPLATE_SETTINGS}
          element={<TemplateSettings />}
        />
        <Route path={ROUTES.NOTIF_LOGS} element={<NotificationLogs />} />

        {/* PROFILE */}
        <Route path={ROUTES.SUPER_ADMIN_PROFILE} element={<ProfileSelf />} />
        <Route path="/super-admin/profile/:uid" element={<ProfileSelf />} />

        {/* RAW / PLACEHOLDER PAGES */}
        <Route
          path={ROUTES.SUPER_ADMIN_SETTINGS}
          element={<div>Platform Settings Page</div>}
        />
        <Route
          path={ROUTES.SUPER_ADMIN_CONTENT}
          element={<div>Content Management Page</div>}
        />
        <Route
          path={ROUTES.SUPER_ADMIN_AUDIT}
          element={<div>System Logs Page</div>}
        />
      </Route>

      {/* BUSINESS OWNER (LAYOUT GROUP) */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[ROLES.BUSINESS_OWNER]}>
            <KYCGuard userRole={ROLES.BUSINESS_OWNER}>
              <AppLayout role={ROLES.BUSINESS_OWNER} />
            </KYCGuard>
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.BUSINESS_OWNER_KYC} element={<KYCVerification />} />
        <Route
          path={ROUTES.BUSINESS_OWNER_DASHBOARD}
          element={<BusinessOwnerDashboard />}
        />
        <Route
          path={ROUTES.BUSINESS_OWNER_DOCUMENT_VAULT}
          element={<DocumentVault />}
        />
        <Route path={ROUTES.BUSINESS_OWNER_MY_AGENTS} element={<MyAgents />} />
        <Route path={ROUTES.BUSINESS_OWNER_ADD_AGENT} element={<AddAgent />} />
        <Route
          path={ROUTES.BUSINESS_OWNER_AGENT_DETAILS}
          element={<ViewMyAgent />}
        />
      </Route>
      {/* BUSINESS OWNER (LAYOUT GROUP) */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[ROLES.BUSINESS_OWNER]}>
            <KYCGuard userRole={ROLES.BUSINESS_OWNER}>
              <AppLayout role={ROLES.BUSINESS_OWNER} />
            </KYCGuard>
          </ProtectedRoute>
        }
      >
        {/* EXISTING ROUTES */}
        <Route
          path={ROUTES.BUSINESS_OWNER_DASHBOARD}
          element={<BusinessOwnerDashboard />}
        />
        <Route
          path={ROUTES.BUSINESS_OWNER_DOCUMENT_VAULT}
          element={<DocumentVault />}
        />
        <Route path={ROUTES.BUSINESS_OWNER_MY_AGENTS} element={<MyAgents />} />
        <Route path={ROUTES.BUSINESS_OWNER_ADD_AGENT} element={<AddAgent />} />
        <Route
          path={ROUTES.BUSINESS_OWNER_AGENT_DETAILS}
          element={<ViewMyAgent />}
        />

        {/* NEW: SERVICES MODULE */}
        <Route path={ROUTES.BUSINESS_OWNER_SERVICES} element={<MyServices />} />
        <Route
          path={ROUTES.BUSINESS_OWNER_BOOK_SERVICES}
          element={<BookServices />}
        />
        <Route
          path={ROUTES.BUSINESS_OWNER_SERVICE_PROVIDERS}
          element={<ServiceProviders />}
        />
        <Route
          path={ROUTES.BUSINESS_OWNER_PROVIDER_DETAILS}
          element={<ProviderDetails />}
        />
        <Route
          path={ROUTES.BUSINESS_OWNER_MY_BOOKINGS}
          element={<MyBookings />}
        />
        <Route
          path={ROUTES.BUSINESS_OWNER_SERVICE_DETAILS}
          element={<ServiceDetails />}
        />
      </Route>

      {/* AGENT */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[ROLES.AGENT]}>
            <KYCGuard>
              <AppLayout role={ROLES.AGENT} />
            </KYCGuard>
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.AGENT_KYC} element={<KYCVerification />} />
        <Route path={ROUTES.AGENT_DASHBOARD} element={<AgentDashboard />} />
        <Route path={ROUTES.AGENT_MY_REQUESTS} element={<MyRequests />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
