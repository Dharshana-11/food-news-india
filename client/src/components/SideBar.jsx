/**
 * SideBar.jsx
 * ------------------------------------------------------------
 * Original Sidebar with integrated KYC restriction logic.
 * No UI, icons, or structure changed.
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
  MessageOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ROLES from "../constants/roles";
import { ROUTES } from "../routes";
import { useEffect, useState } from "react";
import { getKYCProfile } from "../services/kyc";

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

  const checkKYCStatus = async () => {
    try {
      setCheckingKYC(true);
      const { profile } = await getKYCProfile();
      setKycVerified(profile.kycStatus === "verified");
    } catch (err) {
      console.error("KYC Error:", err);
      setKycVerified(false);
    } finally {
      setCheckingKYC(false);
    }
  };

  const isKYCPage = (path) => path?.includes("kyc");

  const handleMenuClick = async ({ key }) => {
    // Always allow KYC navigation
    if (isKYCPage(key)) {
      navigate(key);
      if (onClose) onClose();
      return;
    }

    // Block others if unverified
    if (!kycVerified && rolesRequiringKYC.includes(role)) {
      alert("Please complete KYC to access this feature.");
      return;
    }

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

    if (window.innerWidth <= 768 && onClose) onClose();
  };

  // ---------------- MENU ITEMS (ORIGINAL) ----------------
  let items = [];

  if (role === ROLES.SUPER_ADMIN) {
    items = [
      { key: ROUTES.SUPER_ADMIN_DASHBOARD, icon: <DashboardOutlined />, label: "Dashboard" },
      { key: ROUTES.SUPER_ADMIN_USERS, icon: <UserOutlined />, label: "User Management" },
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
      { key: ROUTES.SUPER_ADMIN_SUPPORT, icon: <CustomerServiceOutlined />, label: "Support Tickets" },
      { key: ROUTES.SUPER_ADMIN_SETTINGS, icon: <ControlOutlined />, label: "Platform Settings" },
      { key: ROUTES.SUPER_ADMIN_CONTENT, icon: <FileTextOutlined />, label: "Content Management" },
      { key: ROUTES.SUPER_ADMIN_AUDIT, icon: <HistoryOutlined />, label: "System Logs" },
      { key: ROUTES.SUPER_ADMIN_PROFILE, icon: <UserOutlined />, label: "My Profile" },
      { key: "logout", icon: <LogoutOutlined />, label: "Log Out" },
    ];
  }

  if (role === ROLES.BUSINESS_OWNER) {
    items = [
      { key: ROUTES.BUSINESS_OWNER_DASHBOARD, icon: <DashboardOutlined />, label: "Dashboard" },

      // Insert KYC item cleanly (added; no styling change)
      // Only include KYC menu option if NOT verified
      !kycVerified && {
        key: ROUTES.BUSINESS_OWNER_KYC,
        icon: <FileSearchOutlined />,
        label: "KYC Verification ⚠️",
      },

      { key: ROUTES.BUSINESS_OWNER_MY_SERVICES, icon: <AppstoreOutlined />, label: "My Services" },
      { key: ROUTES.BUSINESS_OWNER_MY_AGENTS, icon: <UserOutlined />, label: "My Agents" },
      { key: ROUTES.BUSINESS_OWNER_DOCUMENT_VAULT, icon: <FileTextOutlined />, label: "Document Vault" },
      { key: ROUTES.BUSINESS_OWNER_COMPLIANCE_CALENDAR, icon: <HistoryOutlined />, label: "Compliance Calendar" },
      { key: ROUTES.BUSINESS_OWNER_TRAINING, icon: <CustomerServiceOutlined />, label: "Training" },
      { key: ROUTES.BUSINESS_OWNER_CHECKLIST, icon: <FileSearchOutlined />, label: "Compliance Checklist" },
      { key: ROUTES.BUSINESS_OWNER_MESSAGES, icon: <MessageOutlined />, label: "Messages / Chat" },
      { key: ROUTES.BUSINESS_OWNER_MY_NOTIFICATIONS, icon: <BellOutlined />, label: "Notifications" },
      { key: ROUTES.BUSINESS_OWNER_HELP_SUPPORT, icon: <CustomerServiceOutlined />, label: "Help & Support" },
      { key: "logout", icon: <LogoutOutlined />, label: "Log Out" },
    ];
  }

  // ---------------- ACTIVE HIGHLIGHT ----------------
  const selectedKey =
    items.find(
      (item) =>
        location.pathname.startsWith(item.key) ||
        item.paths?.some((p) => location.pathname.startsWith(p))
    )?.key || ROUTES.SUPER_ADMIN_DASHBOARD;

  // ---------------- RESIZE BEHAVIOR ----------------
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && onClose) onClose();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onClose]);

  // ---------------- LOADING UI (NO STYLE CHANGE) ----------------
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
              <img src={userProfilePicture} alt="Profile" className="sidebar-profile-pic" />
            ) : (
              <UserOutlined className="sidebar-profile-icon" />
            )}
            <div className="sidebar-profile-info">
              <h4>{userName}</h4>
              <p>{userRole.replace("_", " ")}</p>
            </div>
          </div>
        </div>

        {/* MENU */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={items
            .filter(Boolean)   // <-- removes false, null, undefined items
            .map((item) => ({
              ...item,
              disabled:
                !isKYCPage(item.key) &&
                rolesRequiringKYC.includes(role) &&
                !kycVerified &&
                item.key !== ROUTES.BUSINESS_OWNER_KYC,
            }))
          }
          onClick={handleMenuClick}
        />
      </div>
    </>
  );
};

export default SideBar;
