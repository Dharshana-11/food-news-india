import { Card } from "antd";
import { ShopOutlined } from "@ant-design/icons";

/**
 * StatsSection Component
 *
 * Displays summary cards for business types:
 * - Total
 * - Active
 * - Inactive
 *
 * @param {Object} props
 * @param {Array} props.data - Array of business type objects
 */
const StatsSection = ({ data = [] }) => {
  const total = data.length;
  const active = data.filter((i) => i.status === "active").length;
  const inactive = data.filter((i) => i.status === "inactive").length;

  const renderCard = (label, value, className) => (
    <Card className={`business-type-stat-card ${className}`}>
      <div className="business-type-stat-content">
        <div className="business-type-stat-icon-wrapper">
          <div className="business-type-stat-icon">
            <ShopOutlined />
          </div>
        </div>
        <div className="business-type-stat-info">
          <p className="business-type-stat-label">{label}</p>
          <h3 className="business-type-stat-value">{value}</h3>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="business-type-stats-cards">
      {renderCard("Total Types", total, "stat-card-total")}
      {renderCard("Active", active, "stat-card-active")}
      {renderCard("Inactive", inactive, "stat-card-inactive")}
    </div>
  );
};

export default StatsSection;
