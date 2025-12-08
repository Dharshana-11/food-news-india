/**
 * SideBar.jsx
 * ------------------------------------------------------------
 * Reusable sidebar component with responsive behavior.
 * Renders a dynamic Ant Design menu with role-based navigation,
 * profile section, and logout handling.
 *
 * Supports:
 * - Super Admin routes (currently implemented)
 * - Auto-close on mobile screens
 * - Automatic active route highlighting
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
  NotificationOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ROLES from "../constants/roles";
import { ROUTES } from "../routes";
import { useEffect } from "react";

/**
 * Sidebar component for navigation and user actions.
 *
 * @component
 * @param {Object} props
 * @param {string} props.role - Current user's role (e.g., SUPER_ADMIN)
 * @param {boolean} props.isOpen - Sidebar open state for mobile view
 * @param {Function} props.onClose - Callback to close sidebar (mobile only)
 * @returns {JSX.Element} The sidebar menu with user profile and routes
 */
const SideBar = ({ role, isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, currentUser } = useAuth();

  // --- User info (placeholder profile picture for now) ---
  const userProfilePicture = null;
  const userName = currentUser?.name || "User";
  const userRole = currentUser?.role || "Role";

  // --- Role-based menu configuration ---
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
      },
      {
        key: ROUTES.SUPER_ADMIN_SERVICES,
        icon: <AppstoreOutlined />,
        label: "Service Management",
      },
      {
        key: ROUTES.SUPER_ADMIN_TICKETS,
        icon: <CustomerServiceOutlined />,
        label: "Support Tickets",
      },
      {
        key: ROUTES.SUPER_ADMIN_SETTINGS,
        icon: <ControlOutlined />,
        label: "Platform Settings",
      },
      {
        key: ROUTES.SUPER_ADMIN_NOTIFICATIONS,
        icon: <NotificationOutlined />,
        label: "Notification Settings",
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
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Log Out",
      },
    ];
  }

  // --- Mapping role to profile routes (future extensibility) ---
  const roleProfileNotifications = {
    [ROLES.SUPER_ADMIN]: ROUTES.SUPER_ADMIN_PROFILE,
  };

  /**
   * Handles click on the profile icon (mobile view).
   * Navigates to the corresponding profile page for the user role.
   */
  const handleProfileClick = () => {
    const profileRoute = roleProfileNotifications[userRole];
    if (profileRoute) navigate(profileRoute);
  };

  /**
   * Handles menu item clicks.
   * - Navigates to the clicked route.
   * - Handles logout asynchronously.
   * - Closes the sidebar automatically on mobile screens.
   *
   * @param {Object} param0
   * @param {string} param0.key - The key (path) of the clicked menu item.
   */
  const handleMenuClick = async ({ key }) => {
    if (key === "logout") {
      try {
        await logout();
        navigate(ROUTES.LOGIN);
      } catch (error) {
        console.error("Logout failed:", error);
      }
      return;
    }

    navigate(key);
    // Auto-close on mobile devices
    if (window.innerWidth <= 768 && onClose) onClose();
  };

  // --- Determine which menu item is currently active ---
  let selectedKey = ROUTES.SUPER_ADMIN_DASHBOARD;

  // If ticket details page -> highlight Support Tickets
  if (location.pathname.startsWith("/tickets/")) {
    selectedKey = ROUTES.SUPER_ADMIN_TICKETS;
  }
  // If another user's profile is opened -> highlight User Management
  else if (location.pathname.startsWith("/super-admin/profile/")) {
    selectedKey = ROUTES.SUPER_ADMIN_USERS;
  }
  // Otherwise, auto-select based on matching menu key
  else {
    selectedKey =
      items.find((item) => location.pathname.startsWith(item.key))?.key ||
      ROUTES.SUPER_ADMIN_DASHBOARD;
  }



  /**
   * Automatically close the sidebar when resizing above mobile width.
   * Ensures no overlay or mobile sidebar remains open on desktop.
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && onClose) onClose();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onClose]);

  return (
    <>
      {/* --- Overlay for mobile view --- */}
      {isOpen && <div className="sidebar-blur-overlay" onClick={onClose} />}

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* =============================== DESKTOP HEADER =============================== */}
        <div className="sidebar-title-desktop">
          <MenuOutlined className="menu-title-icon" />
          <span className="menu-title-text">Menu</span>
        </div>

        <div className="sidebar-divider"></div>

        {/* =============================== MOBILE HEADER =============================== */}
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

        {/* =============================== MENU ITEMS =============================== */}
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
