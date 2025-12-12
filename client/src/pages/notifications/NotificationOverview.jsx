import { Card, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import "../../styles/global.css";

import {
  SettingOutlined,
  TeamOutlined,
  FileTextOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";

const NotificationOverview = () => {
  const navigate = useNavigate();

  const pages = [
    {
      title: "Module-Based Notification Settings",
      key: "module",
      icon: <SettingOutlined className="notif-icon" style={{ fontSize: 32, color: "#1677ff" }} />,
    },
    {
      title: "Role-Based Notification Settings",
      key: "roles",
      icon: <TeamOutlined className="notif-icon" style={{ fontSize: 32, color: "#fa8c16" }} />,
    },
    {
      title: "Customize Templates",
      key: "templates",
      icon: <FileTextOutlined className="notif-icon" style={{ fontSize: 32, color: "#722ed1" }} />,
    },
    {
      title: "Notification Logs",
      key: "logs",
      icon: <OrderedListOutlined className="notif-icon" style={{ fontSize: 32, color: "#2f54eb" }} />,
    },
  ];

  return (
    <div className="notification-container">
      <h2 className="notification-title">Notification Settings</h2>

      <Row gutter={[20, 20]}>
        {pages.map((item) => (
          <Col xs={24} sm={12} md={8} key={item.key}>
            <Card
              hoverable
              bordered
              className="notification-card"
              onClick={() => navigate(`/super-admin/notifications/${item.key}`)}
            >
              {item.icon}
              <h3>{item.title}</h3>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default NotificationOverview;
