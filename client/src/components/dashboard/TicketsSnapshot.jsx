/**
 * TicketsSnapshot.jsx
 * --------------------
 * Displays a summary of ticket statuses using Ant Design cards.
 * Each card shows an icon, the count of tickets, and the ticket type.
 *
 * Props:
 * @param {Array} tickets - List of ticket summary objects with fields:
 *   { type: string, count: number }
 *
 * Example:
 * [
 *   { type: "Open", count: 12 },
 *   { type: "Resolved", count: 34 }
 * ]
 */

import { Card } from "antd";
import {
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  SyncOutlined,
  CustomerServiceOutlined,
  BugOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";

const TicketsSnapshot = ({ tickets = [] }) => {
  // 🔹 Mapping ticket types to icons with color codes
  const iconMap = {
    Open: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
    "In Progress": <SyncOutlined spin style={{ color: "#1890ff" }} />,
    Resolved: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
    Escalated: <StopOutlined style={{ color: "#faad14" }} />,
    "Pending Customer": (
      <CustomerServiceOutlined style={{ color: "#722ed1" }} />
    ),
    "System Error": <BugOutlined style={{ color: "#ff6c1f" }} />,
    Verification: <FileSearchOutlined style={{ color: "#13c2c2" }} />,
    Delayed: <ClockCircleOutlined style={{ color: "#d89614" }} />,
  };

  return (
    <div className="tickets-snapshot-grid">
      {tickets.map((ticket, index) => (
        <Card
          key={index}
          className="ticket-card"
          styles={{ body: { padding: "14px 10px" } }}
        >
          {/* Icon for each ticket type */}
          <div className="ticket-snapshot-icon">
            {iconMap[ticket.type] || (
              <FileSearchOutlined style={{ color: "#8c8c8c" }} />
            )}
          </div>

          {/* Ticket count */}
          <div className="ticket-count">{ticket.count}</div>

          {/* Ticket type name */}
          <div className="ticket-type">{ticket.type}</div>
        </Card>
      ))}
    </div>
  );
};

export default TicketsSnapshot;
