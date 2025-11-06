import { Card, Divider } from "antd";
import { useState } from "react";
import DonutChart from "../DonutChart";
import LineChartComponent from "../LineChartComponent";
import BarChartComponent from "../BarChartComponent";

const ChartCard = ({ title, data, color, chartType }) => {
  const COLORS = [color, "#162247", "#4e5d8f", "#e6e9f2"];
  const [centerText, setCenterText] = useState({ label: "Total", value: 0 });

  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (centerText.value === 0) setCenterText({ label: "Total", value: total });

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return <BarChartComponent data={data} colors={COLORS} />;

      case "line":
        return <LineChartComponent data={data} colors={COLORS} />;

      case "donut":
        return <DonutChart data={data} colors={COLORS} />;

      default:
        return null;
    }
  };

  return (
    <Card title={title} className="chart-card">
      {renderChart()}
    </Card>
  );
};

export default ChartCard;
