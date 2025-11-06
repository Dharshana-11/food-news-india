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

const TicketsSnapshot = ({ tickets }) => {
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
          <div className="ticket-icon">{iconMap[ticket.type]}</div>
          <div className="ticket-count">{ticket.count}</div>
          <div className="ticket-type">{ticket.type}</div>
        </Card>
      ))}
    </div>
  );
};

export default TicketsSnapshot;
