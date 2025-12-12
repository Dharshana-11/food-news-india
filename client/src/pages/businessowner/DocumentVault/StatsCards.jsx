// pages/BusinessOwner/DocumentVault/StatsCards.jsx

import { Card } from "antd";
import {
  FileOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

/**
 * Display document statistics as stat cards
 *
 * @param {Object} props
 * @param {Object} props.stats - Stats object containing count values
 * @param {number} props.stats.total
 * @param {number} props.stats.approved
 * @param {number} props.stats.pending
 * @param {number} props.stats.expiringSoon
 */
const StatsCards = ({ stats = {} }) => {
  // Fallback values to avoid undefined UI issues
  const safeStats = {
    total: stats.total ?? 0,
    approved: stats.approved ?? 0,
    pending: stats.pending ?? 0,
    expiringSoon: stats.expiringSoon ?? 0,
  };

  const statsData = [
    {
      key: "total",
      label: "Total Documents",
      value: safeStats.total,
      icon: <FileOutlined />,
      color: "#667eea",
    },
    {
      key: "approved",
      label: "Approved",
      value: safeStats.approved,
      icon: <CheckCircleOutlined />,
      color: "#10b981",
    },
    {
      key: "pending",
      label: "Pending Review",
      value: safeStats.pending,
      icon: <ClockCircleOutlined />,
      color: "#f59e0b",
    },
    {
      key: "expiringSoon",
      label: "Expiring Soon",
      value: safeStats.expiringSoon,
      icon: <ExclamationCircleOutlined />,
      color: "#ef4444",
    },
  ];

  return (
    <div className="vault-stats-section">
      <div className="vault-stats-grid">
        {statsData.map((stat) => (
          <Card key={stat.key} className="vault-stat-card" hoverable>
            <div className="vault-stat-content">
              <div
                className="vault-stat-icon"
                style={{
                  backgroundColor: `${stat.color}20`,
                  color: stat.color,
                }}
              >
                {stat.icon}
              </div>

              <div className="vault-stat-info">
                <div className="vault-stat-value">{stat.value}</div>
                <div className="vault-stat-label">{stat.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;
