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
 * @param {string} [props.bgColor]  - Color for the icon background
 * @param {string} [props.textColor] - Color for the text
 * @param {string} [props.iconBg] - Optional tint background
 *
 * @example
 * <StatCard
 *   title="Active Tickets"
 *   value={42}
 *   icon={<ExclamationCircleOutlined />}
 *   bgColor="#ff6c1f"
 * />
 */

import { Card } from "antd";

const StatCard = ({
  title,
  value,
  icon,
  bgColor = "var(--color-primary-orange)", // default
  textColor = "#162247", // default
  iconBg = "rgba(255, 108, 31, 0.12)", // default
  onClick,
}) => {
  return (
    <div>
      {/* Ant Design Card container with custom styling */}
      <Card
        variant={false}
        className="stat-card-container"
        onClick={onClick}
        hoverable={!!onClick}
        style={{
          "--stat-bg": bgColor,
          "--stat-text": textColor,
          "--stat-icon-bg": iconBg,
        }}
      >
        <div className="stat-card">
          {/* Left section — displays the icon */}
          <div
            className="stat-card-left"
            style={{
              background: "var(--stat-bg)",
            }}
          >
            {icon}
          </div>

          {/* Right section — displays title and value */}
          <div className="stat-card-right">
            <div
              className="stat-card-title"
              style={{ color: "var(--stat-text)" }}
            >
              {title}
            </div>
            <div
              className="stat-card-value"
              style={{ color: "var(--stat-text)" }}
            >
              {value}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatCard;
