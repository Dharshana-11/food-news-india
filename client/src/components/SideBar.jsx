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
  const { logout, currentUser } = useAuth(); // assuming you store user info in context

  const userProfilePicture = null; // placeholder
  const userName = currentUser?.name || "User";
  const userRole = currentUser?.role || "Role";

  let items = [];

  if (role === ROLES.SUPER_ADMIN) {
    items = [
      { key: ROUTES.SUPER_ADMIN_DASHBOARD, icon: <DashboardOutlined />, label: "Dashboard" },
      { key: ROUTES.SUPER_ADMIN_USERS, icon: <UserOutlined />, label: "User Management" },
      { key: ROUTES.SUPER_ADMIN_COMPLIANCE, icon: <FileSearchOutlined />, label: "Compliance & Documents" },
      { key: ROUTES.SUPER_ADMIN_SERVICES, icon: <AppstoreOutlined />, label: "Service Management" },
      { key: ROUTES.SUPER_ADMIN_SUPPORT, icon: <CustomerServiceOutlined />, label: "Support Tickets" },
      { key: ROUTES.SUPER_ADMIN_SETTINGS, icon: <ControlOutlined />, label: "Platform Settings" },
      { key: ROUTES.SUPER_ADMIN_CONTENT, icon: <FileTextOutlined />, label: "Content Management" },
      { key: ROUTES.SUPER_ADMIN_AUDIT, icon: <HistoryOutlined />, label: "System Logs" },
      { key: ROUTES.SUPER_ADMIN_PROFILE, icon: <UserOutlined />, label: "My Profile" },
      { key: "logout", icon: <LogoutOutlined />, label: "Log Out" },
    ];
  }

  const roleProfileNotifications = {
      [ROLES.SUPER_ADMIN]: ROUTES.SUPER_ADMIN_PROFILE,
    };

  const handleProfileClick = () => {
    const profileRoute = roleProfileNotifications[userRole];
    if (profileRoute) {
      navigate(profileRoute);
    }
  };

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
    if (window.innerWidth <= 768 && onClose) onClose();
  };

  const selectedKey =
    items.find((item) => location.pathname.startsWith(item.key))?.key ||
    ROUTES.SUPER_ADMIN_DASHBOARD;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && onClose) onClose();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onClose]);

  return (
    <>
     {isOpen && <div className="sidebar-blur-overlay" onClick={onClose}></div>}
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* ===== Desktop Title ===== */}
      <div className="sidebar-title-desktop">
        <MenuOutlined className="menu-title-icon" />
        <span className="menu-title-text">Menu</span>
      </div>

      {/* ===== Mobile Header ===== */}
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
        {/* <div className="sidebar-menu-heading">Menu</div> */}
      </div>
      

      {/* ===== Menu Items ===== */}
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
