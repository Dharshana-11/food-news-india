/**
 * Custom tooltip component for chart libraries such as Recharts.
 * Renders a styled tooltip box when the user hovers over a chart item.
 *
 * @param {Object} props - Tooltip properties passed from the chart.
 * @param {boolean} props.active - Indicates whether the tooltip should be visible.
 * @param {Array} props.payload - Data array containing tooltip values from the chart.
 * @param {string|number} props.label - Label corresponding to the hovered data point.
 * @returns {JSX.Element|null} - Returns a styled tooltip element when active, otherwise null.
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "#162247",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <p style={{ margin: 0, fontWeight: 500 }}>{label}</p>
        <p style={{ margin: 0 }}>{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
