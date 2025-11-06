/**
 * DonutChart.jsx
 * ------------------------------------------------------------
 * A reusable donut chart component built with Recharts.
 *
 * Features:
 * - Responsive design using <ResponsiveContainer>.
 * - Custom hover animation with smooth scaling effect.
 * - Central text displaying the total value.
 * - Configurable color palette for flexibility.
 *
 * Ideal for use in dashboards or analytics panels.
 * ------------------------------------------------------------
 */

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

/**
 * @component DonutChart
 * @description Renders a responsive donut chart with legend and hover effects.
 *
 * @param {Object[]} data - Array of data objects for the chart.
 * @param {string} data[].name - Label for each segment.
 * @param {number} data[].value - Numeric value for each segment.
 * @param {string[]} [colors=["#3559E0", "#162247", "#4e5d8f", "#e6e9f2"]] - Array of hex color codes.
 *
 * @example
 * const data = [
 *   { name: "Completed", value: 40 },
 *   { name: "Pending", value: 25 },
 *   { name: "In Progress", value: 35 }
 * ];
 *
 * <DonutChart data={data} />
 */
const DonutChart = ({
  data,
  colors = ["#3559E0", "#162247", "#4e5d8f", "#e6e9f2"],
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="donut-container">
      {/* ============================ 
           MAIN DONUT CHART
         ============================ */}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={95}
            paddingAngle={3}
            cornerRadius={6}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            animationDuration={600}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={colors[i % colors.length]}
                stroke="none"
                style={{
                  transform: activeIndex === i ? "scale(1.05)" : "scale(1)",
                  transformOrigin: "center",
                  transition: "transform 0.3s ease",
                  cursor: "pointer",
                }}
              />
            ))}
          </Pie>

          {/* ============================ 
               TOOLTIP
             ============================ */}
          <Tooltip
            cursor={{ fill: "transparent" }}
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "10px",
              border: "1px solid rgba(200,200,200,0.3)",
              fontSize: "0.8rem",
              padding: "8px 10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
            itemStyle={{ color: "#162247", fontWeight: 500 }}
            labelStyle={{ color: "#888", fontWeight: 600 }}
          />

          {/* ============================ 
               LEGEND
             ============================ */}
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{
              marginTop: 12,
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              rowGap: "4px",
              columnGap: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* ============================ 
           CENTER TEXT (TOTAL)
         ============================ */}
      <div className="donut-center-text">
        <div
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            color: "#162247",
          }}
        >
          {total}
        </div>
        <div
          style={{
            fontSize: "0.85rem",
            color: "#6b7280",
          }}
        >
          Total
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
