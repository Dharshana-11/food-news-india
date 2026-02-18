/**
 * SideBar.jsx
 * ------------------------------------------------------------
 * Sidebar with integrated KYC restriction logic.
 * Includes role-based menu items and KYC checks for restricted access.
 * No UI, icons, or structure changed.
 * ------------------------------------------------------------
 */

import { useEffect, useState } from "react";
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
  MessageOutlined,
  BellOutlined,
  ShopOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { message } from "antd";
import { useAuth } from "../context/AuthContext";
import ROLES from "../constants/roles";
import { ROUTES } from "../routes";
import { getKYCProfile } from "../services/kyc";

/**
 * Sidebar component with role-based access and KYC verification logic.
 *
 * @param {Object} props
 * @param {string} props.role - Current user role
 * @param {boolean} props.isOpen - Sidebar open/close state
 * @param {Function} props.onClose - Callback for closing sidebar
 */
const SideBar = ({ role, isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, currentUser } = useAuth();

  // ---------------- USER INFO ----------------
  const userProfilePicture = null;
  const userName = currentUser?.name || "User";
  const userRole = currentUser?.role || "Role";

  // ---------------- KYC LOGIC ----------------
  const [kycVerified, setKycVerified] = useState(true);
  const [checkingKYC, setCheckingKYC] = useState(true);

  const ALWAYS_ENABLED_KEYS = ["logout"];

  const rolesRequiringKYC = [
    ROLES.BUSINESS_OWNER,
    ROLES.AGENT,
    ROLES.SERVICE_PROVIDER,
  ];

  useEffect(() => {
    if (rolesRequiringKYC.includes(role)) {
      checkKYCStatus();
    } else {
      setKycVerified(true);
      setCheckingKYC(false);
    }
  }, [role]);

  /**
   * Fetches KYC status for the current user.
   */
  const checkKYCStatus = async () => {
    try {
      setCheckingKYC(true);
      const { kycProfile } = await getKYCProfile();
      setKycVerified(kycProfile?.kycStatus === "verified");
    } catch (err) {
      console.error("KYC Error:", err);
      setKycVerified(false);
    } finally {
      setCheckingKYC(false);
    }
  };

  const isKYCPage = (path) => path?.includes("kyc");

  /**
   * Handles sidebar menu clicks
   *
   * @param {Object} param0
   * @param {string} param0.key - Menu key clicked
   */
  const handleMenuClick = async ({ key }) => {
    if (key === "logout") {
      try {
        await logout();
      } catch (error) {
        console.error("Logout failed:", error);
      }
      return;
    }

    if (isKYCPage(key)) {
      navigate(key);
      onClose?.();
      return;
    }

    if (!kycVerified && rolesRequiringKYC.includes(role)) {
      message.warning("Please complete KYC to access this feature.");
      return;
    }

    navigate(key);
    if (window.innerWidth <= 768) onClose?.();
  };

  // ---------------- MENU ITEMS ----------------
  let items = [];

  if (role === ROLES.SUPER_ADMIN) {
    items = [
      {
        key: ROUTES.SUPER_ADMIN_DASHBOARD,
        icon: <DashboardOutlined />,
        label: "Dashboard",
      },
      {
        key: ROUTES.USER_LIST,
        icon: <UserOutlined />,
        label: "User Management",
        paths: [ROUTES.USER_PROFILE],
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
          ROUTES.SUPER_ADMIN_SERVICES_APPROVAL,
        ],
      },
      {
        key: ROUTES.TICKET_BOARD,
        icon: <CustomerServiceOutlined />,
        label: "Support Tickets",
      },
      {
        key: ROUTES.SUPER_ADMIN_SETTINGS,
        icon: <ControlOutlined />,
        label: "Platform Settings",
      },
      {
        key: ROUTES.NOTIF_OVERVIEW,
        icon: <NotificationOutlined />,
        label: "Notification Settings",
        paths: [
          ROUTES.NOTIF_OVERVIEW,
          ROUTES.NOTIF_MODULE_SETTINGS,
          ROUTES.NOTIF_ROLE_SETTINGS,
          ROUTES.NOTIF_TEMPLATE_SETTINGS,
          ROUTES.NOTIF_GLOBAL_SETTINGS,
          ROUTES.NOTIF_LOGS,
        ],
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

  if (role === ROLES.BUSINESS_OWNER) {
    items = [
      {
        key: ROUTES.BUSINESS_OWNER_DASHBOARD,
        icon: <DashboardOutlined />,
        label: "Dashboard",
      },
      !kycVerified && {
        key: ROUTES.BUSINESS_OWNER_KYC,
        icon: <FileSearchOutlined />,
        label: "KYC Verification ⚠️",
      },
      {
        key: ROUTES.BUSINESS_OWNER_MY_SERVICES,
        icon: <AppstoreOutlined />,
        label: "My Services",
      },
      {
        key: ROUTES.BUSINESS_OWNER_MY_AGENTS,
        icon: <UserOutlined />,
        label: "My Agents",
        paths: [
          ROUTES.BUSINESS_OWNER_MY_AGENTS,
          ROUTES.BUSINESS_OWNER_AGENT_DETAILS,
          ROUTES.BUSINESS_OWNER_ADD_AGENT,
        ],
      },
      {
        key: ROUTES.BUSINESS_OWNER_DOCUMENT_VAULT,
        icon: <FileTextOutlined />,
        label: "Document Vault",
      },
      {
        key: ROUTES.BUSINESS_OWNER_COMPLIANCE_CALENDAR,
        icon: <HistoryOutlined />,
        label: "Compliance Calendar",
      },
      {
        key: ROUTES.BUSINESS_OWNER_TRAINING,
        icon: <CustomerServiceOutlined />,
        label: "Training",
      },
      {
        key: ROUTES.BUSINESS_OWNER_CHECKLIST,
        icon: <FileSearchOutlined />,
        label: "Compliance Checklist",
      },
      {
        key: ROUTES.BUSINESS_OWNER_MESSAGES,
        icon: <MessageOutlined />,
        label: "Messages / Chat",
      },
      {
        key: ROUTES.BUSINESS_OWNER_MY_NOTIFICATIONS,
        icon: <BellOutlined />,
        label: "Notifications",
      },
      {
        key: ROUTES.BUSINESS_OWNER_HELP_SUPPORT,
        icon: <CustomerServiceOutlined />,
        label: "Help & Support",
      },
      { key: "logout", icon: <LogoutOutlined />, label: "Log Out" },
    ];
  }

  if (role === ROLES.AGENT) {
    items = [
      {
        key: ROUTES.AGENT_DASHBOARD,
        icon: <DashboardOutlined />,
        label: "Dashboard",
      },

      !kycVerified && {
        key: ROUTES.AGENT_KYC,
        icon: <FileSearchOutlined />,
        label: "KYC Verification ⚠️",
      },

      {
        key: ROUTES.AGENT_MY_BUSINESSES,
        icon: <ShopOutlined />,
        label: "My Businesses",
      },

      {
        key: ROUTES.AGENT_DOCUMENT_VAULT,
        icon: <FileTextOutlined />,
        label: "Document Vault",
      },

      {
        key: ROUTES.AGENT_MY_REQUESTS,
        icon: <HistoryOutlined />,
        label: "My Requests",
      },

      {
        key: ROUTES.AGENT_SERVICES,
        icon: <AppstoreOutlined />,
        label: "Services",
      },

      {
        key: ROUTES.AGENT_MESSAGES,
        icon: <MessageOutlined />,
        label: "Messages / Chat",
      },

      {
        key: ROUTES.AGENT_NOTIFICATIONS,
        icon: <BellOutlined />,
        label: "Notifications",
      },

      {
        key: ROUTES.AGENT_PROFILE,
        icon: <UserOutlined />,
        label: "My Profile",
      },

      {
        key: ROUTES.AGENT_PAYMENTS,
        icon: <FileTextOutlined />,
        label: "Payments & Wallet",
      },

      {
        key: ROUTES.AGENT_HELP_SUPPORT,
        icon: <CustomerServiceOutlined />,
        label: "Help & Support",
      },

      { key: "logout", icon: <LogoutOutlined />, label: "Log Out" },
    ];
  }

  if (role === ROLES.SERVICE_PROVIDER) {
    items = [
      {
        key: ROUTES.SERVICE_PROVIDER_DASHBOARD,
        icon: <DashboardOutlined />,
        label: "Dashboard",
      },

      !kycVerified && {
        key: ROUTES.SERVICE_PROVIDER_KYC,
        icon: <FileSearchOutlined />,
        label: "KYC Verification ⚠️",
      },

      {
        key: ROUTES.SERVICE_PROVIDER_MY_SERVICES,
        icon: <AppstoreOutlined />,
        label: "My Services",
      },
      {
        key: ROUTES.SERVICE_PROVIDER_BOOKING_REQUESTS,
        icon: <InboxOutlined />,
        label: "Requests",
      },
      {
        key: ROUTES.SERVICE_PROVIDER_MY_BOOKINGS,
        icon: <ShoppingCartOutlined />,
        label: "My Bookings",
      },
      {
        key: ROUTES.SERVICE_PROVIDER_MESSAGES,
        icon: <MessageOutlined />,
        label: "Messages / Chat",
      },

      {
        key: ROUTES.SERVICE_PROVIDER_NOTIFICATIONS,
        icon: <BellOutlined />,
        label: "Notifications",
      },

      {
        key: ROUTES.SERVICE_PROVIDER_PROFILE,
        icon: <UserOutlined />,
        label: "My Profile",
      },

      {
        key: ROUTES.SERVICE_PROVIDER_PAYMENTS,
        icon: <FileTextOutlined />,
        label: "Payments & Wallet",
      },

      {
        key: ROUTES.SERVICE_PROVIDER_HELP_SUPPORT,
        icon: <CustomerServiceOutlined />,
        label: "Help & Support",
      },

      { key: "logout", icon: <LogoutOutlined />, label: "Log Out" },
    ];
  }

  // ---------------- ACTIVE MENU HIGHLIGHT ----------------
  const selectedKey = location.pathname.startsWith("/tickets/")
    ? ROUTES.SUPER_ADMIN_TICKETS
    : location.pathname.startsWith("/super-admin/profile/")
      ? ROUTES.SUPER_ADMIN_USERS
      : items.find(
          (item) =>
            location.pathname.startsWith(item?.key) ||
            item?.paths?.some((p) => location.pathname.startsWith(p)),
        )?.key || ROUTES.SUPER_ADMIN_DASHBOARD;

  // ---------------- RESIZE BEHAVIOR ----------------
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) onClose?.();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onClose]);

  // ---------------- LOADING / KYC CHECK ----------------
  if (checkingKYC) {
    return (
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div style={{ padding: "2rem", color: "#888", textAlign: "center" }}>
          Checking KYC...
        </div>
      </div>
    );
  }

  return (
    <>
      {isOpen && <div className="sidebar-blur-overlay" onClick={onClose} />}

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Desktop Title */}
        <div className="sidebar-title-desktop">
          <MenuOutlined className="menu-title-icon" />
          <span className="menu-title-text">Menu</span>
        </div>

        <div className="sidebar-divider" />

        {/* Mobile Header */}
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
              <UserOutlined className="sidebar-profile-icon" />
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
          items={items.filter(Boolean).map((item) => ({
            ...item,
            disabled:
              !ALWAYS_ENABLED_KEYS.includes(item.key) &&
              !isKYCPage(item.key) &&
              rolesRequiringKYC.includes(role) &&
              !kycVerified,
          }))}
          onClick={handleMenuClick}
        />
      </div>
    </>
  );
};

export default SideBar;
