/**
 * ServiceSummary Component
 * ------------------------
 * Displays a list of service status summaries using Ant Design Progress bars.
 * Each item shows an icon, title, percentage, and descriptive label.
 *
 * @component
 * @param {Object} props - React component props.
 * @param {Array<Object>} props.summary - Array of service summary objects.
 * @param {string} props.summary[].title - The label/title for the summary item.
 * @param {number} props.summary[].value - The number of completed/active services.
 * @param {number} [props.summary[].total] - Optional total count (used to calculate percentage).
 * @param {string} props.summary[].color - The color used for progress and icon background.
 * @param {React.ReactNode} props.summary[].icon - Icon element representing the service state.
 *
 * @example
 * const data = [
 *   { title: "Active", value: 80, total: 100, color: "#52c41a", icon: <CheckOutlined /> },
 *   { title: "Pending", value: 20, total: 100, color: "#faad14", icon: <ClockCircleOutlined /> },
 * ];
 * <ServiceSummary summary={data} />
 */

import { Progress, Tooltip } from "antd";

const ServiceSummary = ({ summary }) => {
  return (
    <div className="service-summary">
      {summary.map((item, index) => {
        // Compute percentage if a total is given; otherwise use raw value.
        const percentage = item.total
          ? Math.round((item.value / item.total) * 100)
          : item.value;

        return (
          <div key={index} className="service-summary-item">
            {/* Header section with icon and title */}
            <div className="service-summary-header">
              <div
                className="service-summary-icon"
                style={{ backgroundColor: item.color }}
              >
                {item.icon}
              </div>
              <div className="service-summary-title">{item.title}</div>
            </div>

            {/* Body section with progress bar and label */}
            <div className="service-summary-body">
              {/* Tooltip displays percentage on hover */}
              <Tooltip title={`${percentage}%`}>
                <Progress
                  percent={percentage}
                  strokeColor={item.color}
                  showInfo={false}
                  size={{ height: 10 }}
                />
              </Tooltip>

              <div className="service-summary-label">
                {item.value} out of {item.total} services are{" "}
                {item.title.toLowerCase()}.
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ServiceSummary;
