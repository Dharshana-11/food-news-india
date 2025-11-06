/**
 * LineChartComponent.jsx
 * ---------------------------------------
 * Responsive line chart visualization using Recharts.
 * Displays comparative metrics such as user activity or ticket trends.
 * Includes auto-scaling for mobile view with horizontal scroll support.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Array<{ name: string, logins?: number, tickets?: number }>} props.data - Chart dataset.
 * @param {string[]} [props.colors] - Optional color palette for the line series.
 * @returns {JSX.Element} Responsive line chart visualization.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useState, useEffect } from "react";

const LineChartComponent = ({ data = [], colors = ["#ff6c1f", "#162247"] }) => {
  const [isMobile, setIsMobile] = useState(false);
  const pointWidth = 80; // Approximate width per data point for small screens

  // Detect mobile screen size and re-evaluate on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); // Run once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dynamically calculate chart width for mobile scroll support
  const innerWidth = isMobile
    ? Math.max(data.length * pointWidth, 320)
    : "100%";

  return (
    <div
      className="linechart-wrapper"
      style={{ overflowX: isMobile ? "auto" : "visible" }}
    >
      <div
        className="linechart-inner"
        style={{
          width: innerWidth,
          height: 320,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
          >
            {/* Grid background */}
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

            {/* Axes configuration */}
            <XAxis dataKey="name" tick={{ fill: "#162247", fontSize: 12 }} />
            <YAxis tick={{ fill: "#162247", fontSize: 12 }} />

            {/* Tooltip configuration */}
            <Tooltip
              contentStyle={{
                backgroundColor: "#162247",
                borderRadius: 8,
                padding: "6px 10px",
              }}
              labelStyle={{
                color: "#ff6c1f",
                fontWeight: 500,
                marginBottom: 2,
              }}
            />

            {/* Legend positioned at top-right */}
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: "#162247" }}
            />

            {/* First data series - Logins */}
            <Line
              type="monotone"
              dataKey="logins"
              name="User Logins"
              stroke={colors[0]}
              strokeWidth={3}
              dot={{ fill: colors[0], r: 5 }}
              activeDot={{ r: 7 }}
            />

            {/* Second data series - Tickets */}
            <Line
              type="monotone"
              dataKey="tickets"
              name="Tickets Created"
              stroke={colors[1]}
              strokeWidth={3}
              dot={{ fill: colors[1], r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChartComponent;
