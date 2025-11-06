/**
 * SuperAdminLayout Component
 * --------------------------
 * Main layout wrapper for the Super Admin dashboard.
 * Handles sidebar toggling (responsive), header display, and content rendering.
 *
 * Features:
 * - Responsive sidebar with overlay on mobile.
 * - Scroll locking when sidebar is open (prevents background scroll).
 * - Keyboard accessibility (Escape key closes sidebar).
 *
 * @component
 * @param {Object} props - React component props.
 * @param {React.ReactNode} props.children - The main content rendered inside the layout.
 *
 * @example
 * <SuperAdminLayout>
 *   <Dashboard />
 * </SuperAdminLayout>
 */

import React, { useState, useEffect } from "react";
import SideBar from "../components/SideBar";
import ROLES from "../constants/roles";
import Header from "../components/Header";
import { Layout } from "antd";

const { Content } = Layout;

const SuperAdminLayout = ({ children }) => {
  // Sidebar visibility state (used for mobile responsiveness)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /** Toggles sidebar visibility */
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  /** Closes sidebar explicitly */
  const closeSidebar = () => setIsSidebarOpen(false);

  /**
   * Locks body scroll when sidebar is open on mobile.
   * Ensures background doesn't scroll when overlay is active.
   */
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  return (
    <div
      className={`super-admin-layout ${isSidebarOpen ? "sidebar-open" : ""}`}
    >
      {/* Header with hamburger menu (visible on smaller screens) */}
      <Header onMenuClick={toggleSidebar} />

      <div className="super-admin-layout-body">
        {/* Sidebar - dynamic role-based rendering */}
        <SideBar
          role={ROLES.SUPER_ADMIN}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />

        {/* Dark overlay appears behind sidebar on mobile */}
        <div
          role="button"
          tabIndex={isSidebarOpen ? 0 : -1}
          aria-hidden={!isSidebarOpen}
          onClick={closeSidebar}
          className={`sidebar-overlay ${isSidebarOpen ? "visible" : ""}`}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeSidebar();
          }}
        />

        {/* Main content area */}
        <Content className="main-content" onClick={closeSidebar}>
          {children}
        </Content>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
