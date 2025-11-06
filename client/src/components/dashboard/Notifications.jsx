/**
 * Notifications.jsx
 * -----------------
 * Renders a styled list of notifications using Ant Design's List and Tag components.
 * Each notification displays an icon, message, timestamp, and optional status tag.
 *
 * Props:
 * @param {Array<Object>} notifications - Array of notification objects.
 * Each notification object may contain:
 *   @property {string} type - Type of notification ('info', 'success', 'warning', 'alert', 'pending', 'update').
 *   @property {string} message - Main text content of the notification.
 *   @property {string} time - Timestamp or relative time string.
 *   @property {string} [tag] - Optional tag label (e.g., "New", "Resolved").
 *   @property {string} [tagColor] - Ant Design color string for the tag.
 *
 * Example usage:
 * <Notifications notifications={[{ type: 'success', message: 'Task completed', time: '2h ago' }]} />
 */

import { List, Tag } from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";

const Notifications = ({ notifications = [] }) => {
  /**
   * Maps notification types to their respective Ant Design icons with color styling.
   * A fallback default icon is included for unknown types.
   */
  const iconMap = {
    info: <InfoCircleOutlined style={{ color: "#1677ff" }} />,
    success: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
    warning: <WarningOutlined style={{ color: "#faad14" }} />,
    alert: <BellOutlined style={{ color: "#ff4d4f" }} />,
    pending: <ClockCircleOutlined style={{ color: "#d89614" }} />,
    update: <SyncOutlined style={{ color: "#722ed1" }} spin />,
    default: <InfoCircleOutlined style={{ color: "#8c8c8c" }} />,
  };

  return (
    <div className="notifications-container">
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        // Message shown when no notifications are available
        locale={{ emptyText: "No new notifications" }}
        renderItem={(item) => (
          <List.Item className="notification-item">
            <List.Item.Meta
              // Display icon based on type, or fallback to default
              avatar={
                <div className="notification-icon">
                  {iconMap[item.type] || iconMap.default}
                </div>
              }
              // Main message text
              title={
                <span className="notification-message">{item.message}</span>
              }
              // Footer: timestamp and optional tag
              description={
                <div className="notification-footer">
                  <div className="notification-time">{item.time}</div>
                  {item.tag && (
                    <Tag color={item.tagColor} className="notification-tag">
                      {item.tag}
                    </Tag>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default Notifications;
