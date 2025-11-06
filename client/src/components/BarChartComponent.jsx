/**
 * BarChartComponent.jsx
 * -------------------------
 * Reusable bar chart component built with Recharts.
 * Displays categorical data with a clean visual style.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Array<{ name: string, value: number }>} props.data - Dataset for the chart.
 * @param {string[]} [props.colors] - Optional color palette for chart bars.
 * @returns {JSX.Element} A responsive bar chart visualization.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const BarChartComponent = ({ data = [], colors = ["#ff6c1f", "#162247"] }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        {/* Grid lines for better readability */}
        <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f2" />

        {/* X-axis with labels and tick styling */}
        <XAxis
          dataKey="name"
          stroke="#162247"
          tick={{ fill: "#162247", fontSize: 12 }}
          label={{
            value: "Categories",
            position: "insideBottom",
            offset: -5,
            fill: "#162247",
            fontSize: 12,
          }}
        />

        {/* Y-axis showing value counts */}
        <YAxis
          stroke="#162247"
          tick={{ fill: "#162247", fontSize: 12 }}
          label={{
            value: "Count",
            angle: -90,
            position: "insideLeft",
            fill: "#162247",
            fontSize: 12,
          }}
        />

        {/* Tooltip for interactive data display */}
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #162247",
            color: "#162247",
            borderRadius: 8,
          }}
        />

        {/* Single-bar chart visualization */}
        <Bar
          dataKey="value"
          fill={colors[0]} // Use the primary color from palette
          radius={[6, 6, 0, 0]} // Rounded top corners
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;
