import { Card } from "antd";

const StatCard = ({ title, value, icon }) => {
  return (
    <div>
      <Card variant={false} className="stat-card-container">
        <div className="stat-card">
          <div className="stat-card-left">{icon}</div>
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
