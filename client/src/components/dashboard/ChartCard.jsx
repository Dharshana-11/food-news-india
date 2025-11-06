/**
 * ChartCard.jsx
 * --------------------
 * Reusable chart container component that renders a chart
 * (bar, line, or donut) inside an Ant Design Card.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string} props.title - Title displayed on the card.
 * @param {Array<{ name: string, value: number }>} props.data - Chart data.
 * @param {string} props.color - Primary color used for chart visuals.
 * @param {"bar" | "line" | "donut"} props.chartType - Type of chart to render.
 * @returns {JSX.Element} A styled card containing the specified chart.
 */

import { Card } from "antd";
import { useState, useEffect } from "react";
import DonutChart from "../DonutChart";
import LineChartComponent from "../LineChartComponent";
import BarChartComponent from "../BarChartComponent";

const ChartCard = ({
  title,
  data = [],
  color = "#3559E0",
  chartType = "bar",
}) => {
  // Define color palette (first color is customizable)
  const COLORS = [color, "#162247", "#4e5d8f", "#e6e9f2"];

  // State to track center text (used mainly for donut charts)
  const [centerText, setCenterText] = useState({ label: "Total", value: 0 });

  // Calculate total value whenever data changes
  useEffect(() => {
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
    setCenterText({ label: "Total", value: total });
  }, [data]);

  /**
   * Renders the correct chart component based on `chartType`.
   * @returns {JSX.Element|null} The chart to be displayed.
   */
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
