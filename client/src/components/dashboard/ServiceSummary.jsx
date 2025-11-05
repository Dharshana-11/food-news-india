import { Progress, Tooltip } from "antd";

const ServiceSummary = ({ summary }) => {
  return (
    <div className="service-summary">
      {summary.map((item, index) => {
        // calculate percentage internally if total is provided
        const percentage = item.total
          ? Math.round((item.value / item.total) * 100)
          : item.value;

        return (
          <div key={index} className="service-summary-item">
            <div className="service-summary-header">
              <div
                className="service-summary-icon"
                style={{ backgroundColor: item.color }}
              >
                {item.icon}
              </div>
              <div className="service-summary-title">{item.title}</div>
            </div>

            <div className="service-summary-body">
              <Tooltip title={`${percentage}%`}>
                <Progress
                  percent={percentage}
                  strokeColor={item.color}
                  showInfo={false}
                  size={{ height: 10 }}
                />
              </Tooltip>

              <div className="service-summary-label">
                {item.value} out of {item.total} services are {item.title.toLowerCase()}.
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ServiceSummary;
