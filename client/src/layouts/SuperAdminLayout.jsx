import React, { useState, useEffect } from "react";
import SideBar from "../components/SideBar";
import ROLES from "../constants/roles";
import Header from "../components/Header";
import { Layout } from "antd";

const { Content } = Layout;

const SuperAdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Lock body scroll while mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  return (
    <div
      className={`super-admin-layout ${isSidebarOpen ? "sidebar-open" : ""}`}
    >
      <Header onMenuClick={toggleSidebar} />

      <div className="super-admin-layout-body">
        <SideBar
          role={ROLES.SUPER_ADMIN}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />

        {/* Overlay only used on mobile when sidebar is open */}
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

        <Content className="main-content" onClick={closeSidebar}>
          {children}
        </Content>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
