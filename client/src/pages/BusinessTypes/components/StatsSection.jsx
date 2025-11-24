import { Card } from "antd";
import { ShopOutlined } from "@ant-design/icons";

const StatsSection = ({ data }) => {
  const total = data.length;
  const active = data.filter((i) => i.status === "active").length;
  const inactive = data.filter((i) => i.status === "inactive").length;

  return (
    <div className="business-type-stats-cards">
      {/* TOTAL */}
      <Card className="business-type-stat-card stat-card-total">
        <div className="business-type-stat-content">
          <div className="business-type-stat-icon-wrapper">
            <div className="business-type-stat-icon">
              <ShopOutlined />
            </div>
          </div>

          <div className="business-type-stat-info">
            <p className="business-type-stat-label">Total Types</p>
            <h3 className="business-type-stat-value">{total}</h3>
          </div>
        </div>
      </Card>

      {/* ACTIVE */}
      <Card className="business-type-stat-card stat-card-active">
        <div className="business-type-stat-content">
          <div className="business-type-stat-icon-wrapper">
            <div className="business-type-stat-icon">
              <ShopOutlined />
            </div>
          </div>

          <div className="business-type-stat-info">
            <p className="business-type-stat-label">Active</p>
            <h3 className="business-type-stat-value">{active}</h3>
          </div>
        </div>
      </Card>

      {/* INACTIVE */}
      <Card className="business-type-stat-card stat-card-inactive">
        <div className="business-type-stat-content">
          <div className="business-type-stat-icon-wrapper">
            <div className="business-type-stat-icon">
              <ShopOutlined />
            </div>
          </div>

          <div className="business-type-stat-info">
            <p className="business-type-stat-label">Inactive</p>
            <h3 className="business-type-stat-value">{inactive}</h3>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatsSection;
