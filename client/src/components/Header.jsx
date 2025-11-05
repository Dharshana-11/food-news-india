import { Badge } from "antd";
import { BellOutlined, UserOutlined, MenuOutlined } from "@ant-design/icons"; // 🔹 Added MenuOutlined
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";
import ROLES from "../constants/roles";
import BRAND from "../constants/branding";

const Header = ({ onMenuClick }) => { // 🔹 Accept onMenuClick prop for sidebar toggle
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const userProfilePicture = null; // placeholder
  const userName = currentUser?.name || "User";
  const userRole = currentUser?.role || "Role";

  const roleNotificationRoutes = {
    [ROLES.SUPER_ADMIN]: ROUTES.SUPER_ADMIN_NOTIFICATIONS,
  };

  const roleProfileNotifications = {
    [ROLES.SUPER_ADMIN]: ROUTES.SUPER_ADMIN_PROFILE,
  };

  const handleNotificationClick = () => {
    const notificationRoute = roleNotificationRoutes[userRole];
    if (notificationRoute) {
      navigate(notificationRoute);
    }
  };

  const handleProfileClick = () => {
    const profileRoute = roleProfileNotifications[userRole];
    if (profileRoute) {
      navigate(profileRoute);
    }
  };

  return (
    <header className="header">
      {/* 🔹 Left section (hamburger + title + logo) */}
      <div className="header-left">
        <MenuOutlined className="hamburger-icon" onClick={onMenuClick} />
        <img
          src={BRAND.LOGO_DARK}
          alt={BRAND.NAME}
          className="header-brand-logo"
        />
        <h2 className="header-brand-title">
          <span className="highlight">{BRAND.HIGHLIGHT}</span>{" "}
          {BRAND.NAME.split(" ").slice(1).join(" ")}
        </h2>
      </div>

      {/* 🔹 Right section (notif + profile + details) */}
      <div className="header-right">
        <Badge count={2} offset={[-3, 3]} className="badge-custom">
          <BellOutlined
            className="notification-icon"
            onClick={handleNotificationClick}
          />
        </Badge>

        {userProfilePicture ? (
          <img
            src={userProfilePicture}
            alt="Profile"
            className="user-profile-picture"
            onClick={handleProfileClick}
          />
        ) : (
          <UserOutlined
            className="user-profile-icon"
            onClick={handleProfileClick}
          />
        )}

        <div className="header-user-details">
          <h4 className="header-user-name">{userName}</h4>
          <h5 className="header-user-role">
            {userRole.replace("_", " ")}
          </h5>
        </div>
      </div>
    </header>

  );
};

export default Header;
