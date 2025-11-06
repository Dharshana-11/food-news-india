/**
 * StatCard Component
 * ------------------
 * A lightweight, reusable statistic display card for dashboards.
 * Shows a metric value with an associated title and icon.
 *
 * @component
 * @param {Object} props - React component props.
 * @param {string} props.title - Label describing the statistic (e.g., "Active Users").
 * @param {string|number} props.value - The numeric or textual value to display.
 * @param {JSX.Element} props.icon - The icon element representing the statistic.
 *
 * @example
 * <StatCard
 *   title="Active Tickets"
 *   value={42}
 *   icon={<ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />}
 * />
 */

import { Card } from "antd";

const StatCard = ({ title, value, icon }) => {
  return (
    <div>
      {/* Ant Design Card container with custom styling */}
      <Card variant={false} className="stat-card-container">
        <div className="stat-card">
          {/* Left section — displays the icon */}
          <div className="stat-card-left">{icon}</div>

          {/* Right section — displays title and value */}
          <div className="stat-card-right">
            <div className="stat-card-title">{title}</div>
            <div className="stat-card-value">{value}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatCard;
