/**
 * SideBar.jsx
 * ------------------------------------------------------------
 * Sidebar component for Super Admin navigation.
 * Handles:
 * - Role-based menu items
 * - Nested route highlighting
 * - Responsive behavior (mobile vs desktop)
 * - Logout handling
 * - Profile navigation
 * ------------------------------------------------------------
 */

import { Menu } from "antd";
import {
  MenuOutlined,
  DashboardOutlined,
  UserOutlined,
  FileSearchOutlined,
  AppstoreOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  HistoryOutlined,
  ControlOutlined,
  LogoutOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ROLES from "../constants/roles";
import { ROUTES } from "../routes";
import { useEffect } from "react";

const SideBar = ({ role, isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, currentUser } = useAuth();

  // ---------------- USER INFO ----------------
  const userProfilePicture = null; // Placeholder for profile picture
  const userName = currentUser?.name || "User";
  const userRole = currentUser?.role || "Role";

  // ---------------- MENU ITEMS ----------------
  // Each item can have a `paths` array for nested routes
  let items = [];
  if (role === ROLES.SUPER_ADMIN) {
    items = [
      {
        key: ROUTES.SUPER_ADMIN_DASHBOARD,
        icon: <DashboardOutlined />,
        label: "Dashboard",
      },
      {
        key: ROUTES.SUPER_ADMIN_USERS,
        icon: <UserOutlined />,
        label: "User Management",
      },
      {
        key: ROUTES.SUPER_ADMIN_COMPLIANCE,
        icon: <FileSearchOutlined />,
        label: "Compliance & Documents",
        paths: [
          ROUTES.SUPER_ADMIN_COMPLIANCE,
          ROUTES.SUPER_ADMIN_COMPLIANCE_ITEMS,
          ROUTES.SUPER_ADMIN_BUSINESS_TYPES,
          ROUTES.SUPER_ADMIN_COMPLIANCE_MAPPINGS,
          ROUTES.SUPER_ADMIN_KYC_DOCUMENTS,
          ROUTES.SUPER_ADMIN_DOCUMENTS,
        ],
      },
      {
        key: ROUTES.SUPER_ADMIN_SUPPORT,
        icon: <CustomerServiceOutlined />,
        label: "Support Tickets",
      },
      {
        key: ROUTES.SUPER_ADMIN_SETTINGS,
        icon: <ControlOutlined />,
        label: "Platform Settings",
      },
      {
        key: ROUTES.SUPER_ADMIN_CONTENT,
        icon: <FileTextOutlined />,
        label: "Content Management",
      },
      {
        key: ROUTES.SUPER_ADMIN_AUDIT,
        icon: <HistoryOutlined />,
        label: "System Logs",
      },
      {
        key: ROUTES.SUPER_ADMIN_PROFILE,
        icon: <UserOutlined />,
        label: "My Profile",
      },
      { key: "logout", icon: <LogoutOutlined />, label: "Log Out" },
    ];
  }

  // ---------------- PROFILE CLICK ----------------
  // Navigate to profile page when clicking on profile icon
  const roleProfileNotifications = {
    [ROLES.SUPER_ADMIN]: ROUTES.SUPER_ADMIN_PROFILE,
  };

  const handleProfileClick = () => {
    const profileRoute = roleProfileNotifications[userRole];
    if (profileRoute) navigate(profileRoute);
  };

  // ---------------- MENU ITEM CLICK ----------------
  const handleMenuClick = async ({ key }) => {
    if (key === "logout") {
      // Handle logout
      try {
        await logout();
        navigate(ROUTES.LOGIN);
      } catch (error) {
        console.error("Logout failed:", error);
      }
      return;
    }

    // Navigate to the clicked route
    navigate(key);

    // Auto-close sidebar on mobile
    if (window.innerWidth <= 768 && onClose) onClose();
  };

  // ---------------- SELECTED MENU ITEM ----------------
  // Highlight the correct menu item including nested routes
  const selectedKey =
    items.find(
      (item) =>
        location.pathname.startsWith(item.key) || // match top-level route
        item.paths?.some((p) => location.pathname.startsWith(p)), // match nested routes
    )?.key || ROUTES.SUPER_ADMIN_DASHBOARD; // fallback to Dashboard

  // ---------------- AUTO CLOSE SIDEBAR ON RESIZE ----------------
  // Ensure mobile sidebar overlay closes when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && onClose) onClose();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onClose]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-blur-overlay" onClick={onClose} />}

      {/* Sidebar container */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Desktop header */}
        <div className="sidebar-title-desktop">
          <MenuOutlined className="menu-title-icon" />
          <span className="menu-title-text">Menu</span>
        </div>

        <div className="sidebar-divider"></div>

        {/* Mobile header */}
        <div className="sidebar-header-mobile">
          <CloseOutlined className="close-btn" onClick={onClose} />
          <div className="sidebar-profile">
            {userProfilePicture ? (
              <img
                src={userProfilePicture}
                alt="Profile"
                className="sidebar-profile-pic"
              />
            ) : (
              <UserOutlined
                className="sidebar-profile-icon"
                onClick={handleProfileClick}
              />
            )}
            <div className="sidebar-profile-info">
              <h4>{userName}</h4>
              <p>{userRole.replace("_", " ")}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={items}
          onClick={handleMenuClick}
        />
      </div>
    </>
  );
};

export default SideBar;
