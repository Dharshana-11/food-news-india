/**
 * AppLayout Component
 * ============================================================================
 * Generic layout wrapper for all authenticated user dashboards.
 * Used by: Super Admin, Business Owner, Agent, Service Provider, Admin.
 *
 * Responsibilities:
 * - Responsive sidebar (open/close for mobile)
 * - Header with hamburger menu
 * - Role-based sidebar items (passed as prop)
 * - Scroll locking when sidebar is open
 * - Escape key accessibility
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content rendered inside layout
 * @param {string} props.role - User role to load correct sidebar menu items
 *
 * @example
 * <AppLayout role={user.role}>
 *   <Dashboard />
 * </AppLayout>
 */

import React, { useState, useEffect } from "react";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import { Layout } from "antd";

const { Content } = Layout;

const AppLayout = ({ children, role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /** Toggle sidebar for mobile */
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  /** Close sidebar */
  const closeSidebar = () => setIsSidebarOpen(false);

  /** Lock page scroll when sidebar is open (mobile overlay) */
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  return (
    <div className={`app-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
      {/* Header */}
      <Header onMenuClick={toggleSidebar} />

      <div className="app-layout-body">
        {/* Sidebar */}
        <SideBar role={role} isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Overlay behind sidebar (only shows on mobile) */}
        <div
          role="button"
          tabIndex={isSidebarOpen ? 0 : -1}
          aria-hidden={!isSidebarOpen}
          className={`sidebar-overlay ${isSidebarOpen ? "visible" : ""}`}
          onClick={closeSidebar}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeSidebar();
          }}
        />

        {/* Page content */}
        <Content className="main-content" onClick={closeSidebar}>
          {children}
        </Content>
      </div>
    </div>
  );
};

export default AppLayout;
