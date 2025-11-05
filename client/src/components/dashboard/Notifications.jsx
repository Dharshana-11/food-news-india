import { List, Tag } from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined
} from "@ant-design/icons";

const Notifications = ({ notifications }) => {
  const iconMap = {
    info: <InfoCircleOutlined style={{ color: "#1677ff" }} />,
    success: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
    warning: <WarningOutlined style={{ color: "#faad14" }} />,
    alert: <BellOutlined style={{ color: "#ff4d4f" }} />,
    pending: <ClockCircleOutlined style={{ color: "#d89614" }} />,
    update: <SyncOutlined style={{ color: "#722ed1" }} spin />,
  };

  return (
    <div className="notifications-container">
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item className="notification-item">
            <List.Item.Meta
              avatar={<div className="notification-icon">{iconMap[item.type]}</div>}
              title={
                <div className="notification-title">
                  {item.message}
                  {item.tag && (
                    <Tag color={item.tagColor} className="notification-tag">
                      {item.tag}
                    </Tag>
                  )}
                </div>
              }
              description={
                <div className="notification-time">{item.time}</div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default Notifications;
