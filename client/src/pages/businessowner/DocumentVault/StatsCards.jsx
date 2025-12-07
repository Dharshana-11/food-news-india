// pages/BusinessOwner/DocumentVault/StatsCards.jsx
import { Card } from "antd";
import {
  FileOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const StatsCards = ({ stats }) => {
  const statsData = [
    {
      key: "total",
      label: "Total Documents",
      value: stats.total,
      icon: <FileOutlined />,
      color: "#667eea",
    },
    {
      key: "approved",
      label: "Approved",
      value: stats.approved,
      icon: <CheckCircleOutlined />,
      color: "#10b981",
    },
    {
      key: "pending",
      label: "Pending Review",
      value: stats.pending,
      icon: <ClockCircleOutlined />,
      color: "#f59e0b",
    },
    {
      key: "expiringSoon",
      label: "Expiring Soon",
      value: stats.expiringSoon,
      icon: <ExclamationCircleOutlined />,
      color: "#ef4444",
    },
  ];

  return (
    <div className="stats-section">
      <div className="stats-grid">
        {statsData.map((stat) => (
          <Card key={stat.key} className="stat-card" hoverable>
            <div className="stat-content">
              <div
                className="stat-icon"
                style={{
                  backgroundColor: `${stat.color}20`,
                  color: stat.color,
                }}
              >
                {stat.icon}
              </div>
              <div className="stat-info">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;
