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

const LineChartComponent = ({ data, colors }) => {
  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fill: "#162247", fontSize: 12 }} />
          <YAxis tick={{ fill: "#162247", fontSize: 12 }} />
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
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: 12, color: "#162247" }}
          />
          <Line
            type="monotone"
            dataKey="logins"
            name="User Logins"
            stroke={colors[0] || "#ff6c1f"}
            strokeWidth={3}
            dot={{ fill: colors[0] || "#ff6c1f", r: 5 }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="tickets"
            name="Tickets Created"
            stroke={colors[1] || "#162247"}
            strokeWidth={3}
            dot={{ fill: colors[1] || "#162247", r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;
