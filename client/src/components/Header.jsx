/**
 * Header.jsx
 * ------------------------------------------------------------
 * Application header component for the Super Admin Dashboard.
 *
 * Features:
 * - Displays brand logo and title.
 * - Provides quick access to notifications and user profile.
 * - Includes a hamburger icon to toggle the sidebar on mobile.
 * - Role-based navigation for notifications and profiles.
 * ------------------------------------------------------------
 */

import { Badge } from "antd";
import { BellOutlined, UserOutlined, MenuOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";
import ROLES from "../constants/roles";
import BRAND from "../constants/branding";

/**
 * Header component for the top navigation bar.
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onMenuClick - Handler to toggle the sidebar (mobile view).
 * @returns {JSX.Element} Header containing branding, user details, and icons.
 */
const Header = ({ onMenuClick }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // --- User info (placeholder image until backend integration) ---
  const userProfilePicture = null;
  const userName = currentUser?.name || "User";
  const userRole = currentUser?.role || "Role";

  // --- Role-based navigation maps ---
  const roleNotificationRoutes = {
    [ROLES.SUPER_ADMIN]: ROUTES.SUPER_ADMIN_NOTIFICATIONS,
  };

  const roleProfileRoutes = {
    [ROLES.SUPER_ADMIN]: ROUTES.SUPER_ADMIN_PROFILE,
    [ROLES.AGENT]: ROUTES.AGENT_PROFILE,
    [ROLES.SERVICE_PROVIDER]: ROUTES.SERVICE_PROVIDER_PROFILE,
    [ROLES.BUSINESS_OWNER]: ROUTES.BUSINESS_OWNER_PROFILE,
  };

  /**
   * Navigates to the role-specific notifications page.
   */
  const handleNotificationClick = () => {
    const notificationRoute = roleNotificationRoutes[userRole];
    if (notificationRoute) navigate(notificationRoute);
  };

  /**
   * Navigates to the role-specific profile page.
   */
  const handleProfileClick = () => {
    const profileRoute = roleProfileRoutes[userRole];
    if (profileRoute) navigate(profileRoute);
  };

  return (
    <header className="header">
      {/* ========================= LEFT SECTION ========================= */}
      <div className="header-left">
        {/* Hamburger icon (visible on mobile) */}
        <MenuOutlined className="hamburger-icon" onClick={onMenuClick} />

        {/* Brand logo and title */}
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

      {/* ========================= RIGHT SECTION ========================= */}
      <div className="header-right">
        {/* Notifications icon with badge */}
        {userRole === ROLES.SUPER_ADMIN && (
          <Badge count={2} offset={[-3, 3]} className="badge-custom">
            <BellOutlined
              className="notification-icon"
              onClick={handleNotificationClick}
            />
          </Badge>
        )}

        {/* User profile icon or image */}
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

        {/* User name and role */}
        <div className="header-user-details">
          <h4 className="header-user-name">{userName}</h4>
          <h5 className="header-user-role">{userRole.replace("_", " ")}</h5>
        </div>
      </div>
    </header>
  );
};

export default Header;
