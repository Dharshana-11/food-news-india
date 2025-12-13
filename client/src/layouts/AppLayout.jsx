/**
 * AppLayout Component
 * ============================================================================
 * Generic layout wrapper for all authenticated user dashboards.
 * Supports: Super Admin, Business Owner, Agent, Service Provider, Admin.
 *
 * Responsibilities:
 * - Responsive sidebar (open/close for mobile)
 * - Header with hamburger menu
 * - Role-based sidebar items (passed as prop)
 * - Scroll locking when sidebar is open
 * - Escape key accessibility
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content rendered inside layout
 * @param {string} props.role - User role to load correct sidebar menu items
 *
 * @example
 * <AppLayout role={user.role}>
 *   <Dashboard />
 * </AppLayout>
 */

import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import SideBar from "../components/SideBar";
import Header from "../components/Header";

const { Content } = Layout;

const AppLayout = ({ children, role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /** Toggle sidebar (mobile) */
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  /** Close sidebar */
  const closeSidebar = () => setIsSidebarOpen(false);

  /** Lock page scroll when sidebar is open */
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  return (
    <div className={`app-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
      {/* Header with hamburger menu */}
      <Header onMenuClick={toggleSidebar} />

      <div className="app-layout-body">
        {/* Sidebar */}
        <SideBar role={role} isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Mobile overlay behind sidebar */}
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

        {/* Main page content */}
        <Content className="main-content" onClick={closeSidebar}>
          <Outlet />
        </Content>
      </div>
    </div>
  );
};

export default AppLayout;
