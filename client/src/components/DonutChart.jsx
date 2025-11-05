import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

const DonutChart = ({
  data,
  colors = ["#3559E0", "#162247", "#4e5d8f", "#e6e9f2"],
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const [centerText, setCenterText] = useState({
    label: "Total",
    value: total,
  });
  const [activeIndex, setActiveIndex] = useState(null);

  const handleMouseEnter = (_, index) => {
    const d = data[index];
    setActiveIndex(index);
    setCenterText({
      label: d.name,
      value: `${((d.value / total) * 100).toFixed(0)}%`,
    });
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
    setCenterText({ label: "Total", value: total });
  };

  const getTransformForSlice = (index, count, active) => {
    if (!active) return "translate(0, 0)";
    const angle = (360 / count) * index - 90;
    const rad = (angle * Math.PI) / 180;
    const offset = 8;
    const x = Math.cos(rad) * offset;
    const y = Math.sin(rad) * offset;
    return `translate(${x}px, ${y}px)`;
  };

  return (
    <div
      className="donut-container"
      style={{
        width: "100%",
        height: 320,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={95}
            paddingAngle={3}
            cornerRadius={8}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={colors[i % colors.length]}
                stroke="none"
                style={{
                  transform: getTransformForSlice(i, data.length, activeIndex === i),
                  filter:
                    activeIndex === i
                      ? "drop-shadow(0 2px 8px rgba(0,0,0,0.25))"
                      : "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                  transition: "transform 0.35s ease, filter 0.3s ease",
                  cursor: "pointer",
                }}
              />
            ))}
          </Pie>

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

      {/* Center Text */}
      <div className="donut-center-text">
        <div className="donut-center-value">
          {centerText.value}
        </div>
        <div className="donut-center-label">
          {centerText.label}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
