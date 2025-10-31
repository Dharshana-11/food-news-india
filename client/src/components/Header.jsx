import logo from "../assets/placeholder_logo_dark_theme.png";
import { Badge } from "antd";
import { BellOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { currentUser } = useAuth();

  const userProfilePicture = null; // placeholder, update later
  const userName = currentUser?.name || "User";
  const userRole = currentUser?.role || "Role";

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="Logo" className="header-brand-logo" />
        <h2 className="header-brand-title">
          <span className="highlight">Food</span> News India
        </h2>
      </div>

      <div className="header-right">
        <Badge count={2} offset={[0, 2]}>
          <BellOutlined className="notification-icon" />
        </Badge>

        {userProfilePicture ? (
          <img
            src={userProfilePicture}
            alt="Profile"
            className="user-profile-picture"
          />
        ) : (
          <UserOutlined className="user-profile-icon" />
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
