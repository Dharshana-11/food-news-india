import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";

const DonutChart = ({
  data,
  colors = ["#3559E0", "#162247", "#4e5d8f", "#e6e9f2"],
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div
      className="donut-container"
      
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

      {/* ✅ Center Text (always visible, smooth and stable) */}
      <div
        className="donut-center-text"
        style={{
          position: "absolute",
          textAlign: "center",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          lineHeight: "1.3",
        }}
      >
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
