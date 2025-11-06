import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const BarChartComponent = ({ data, colors }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f2" />
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
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #162247",
            color: "#162247",
            borderRadius: 8,
          }}
        />
        <Bar dataKey="value" fill="#ff6c1f" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;
