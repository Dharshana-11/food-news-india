import { Menu } from "antd";
import { MenuOutlined, DashboardOutlined, UserOutlined, FileSearchOutlined, AppstoreOutlined, CustomerServiceOutlined, FileTextOutlined, HistoryOutlined, ControlOutlined, LogoutOutlined } from "@ant-design/icons";
import ROLES from "../constants/roles";

const SideBar = ({ role }) => {
  let items = [];

  if (role === ROLES.SUPER_ADMIN) {
    items = [
      { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
      { key: "user-management", icon: <UserOutlined />, label: "User Management" },
      { key: "compliance", icon: <FileSearchOutlined />, label: "Compliance & Documents" },
      { key: "services", icon: <AppstoreOutlined />, label: "Service Management" },
      { key: "support", icon: <CustomerServiceOutlined />, label: "Support Tickets" },
      { key: "feature-toggles", icon: <ControlOutlined />, label: "Platform Settings" },
      { key: "content", icon: <FileTextOutlined />, label: "Content Management" },
      { key: "audit", icon: <HistoryOutlined />, label: "System Logs" },
      { key: "profile", icon: <UserOutlined />, label: "My Profile" },
      { key: "logout", icon: <LogoutOutlined />, label: "Log Out" },
    ];
  }

  return (
    <div className="sidebar">
      <div className="sidebar-title">
        <MenuOutlined className="menu-title-icon" />
        <span className="menu-title-text">Menu</span>
      </div>
      <div className="sidebar-divider" />
      <Menu mode="inline" defaultSelectedKeys={["dashboard"]} items={items} />
    </div>
  );
};

export default SideBar;
