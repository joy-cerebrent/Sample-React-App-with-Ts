import React, { useState } from "react";
import DynamicChart from "./DynamicChart";
import { EChartsOption } from "echarts";
import Dropdown from "../Form/Dropdown";

const COLORS = ["#18181b", "#5b21b6", "#10b981", "#ef4444", "#f59e0b", "#3b82f6"];

const ChartDemo: React.FC = () => {
  const [chartType, setChartType] = useState<
    "pie" | "donut" | "nightingale" | "bar" | "line" | "area" | "radar" | "scatter"
  >("pie");

  const [chartData] = useState([
    { name: "Product A", value: 120 },
    { name: "Product B", value: 200 },
    { name: "Product C", value: 150 },
    { name: "Product D", value: 80 },
  ]);

  // Chart Configuration
  const chartConfig: EChartsOption = {
    tooltip: { trigger: "item" },
    legend: {
      bottom: 0,
      textStyle: { color: "#4B5563" },
    },
    ...(chartType !== "pie" &&
      chartType !== "donut" &&
      chartType !== "nightingale" &&
      chartType !== "radar" && {
      xAxis: {
        type: "category",
        data: chartData.map((d) => d.name),
        axisLabel: { color: "#374151" },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#374151" },
      },
    }),
    series: [
      {
        name: "Sales",
        type:
          chartType === "donut" || chartType === "nightingale"
            ? "pie"
            : chartType === "area"
              ? "line"
              : chartType as "pie",
        areaStyle: chartType === "area" ? {} : undefined,
        radius:
          chartType === "donut"
            ? ["40%", "70%"] // Donut Chart
            : chartType === "nightingale"
              ? "60%" // Nightingale Chart
              : chartType === "pie"
                ? "50%"
                : undefined,
        roseType: chartType === "nightingale" ? "radius" : undefined,
        data:
          chartType === "pie" || chartType === "donut" || chartType === "nightingale"
            ? chartData
            : chartData.map((d) => ({ name: d.name, value: d.value })),
        label: { color: "#374151" },
        itemStyle: {
          color: (params: any) => COLORS[params.dataIndex % COLORS.length],
        },
      },
    ],
  };

  if (chartType === "radar") {
    chartConfig.radar = {
      indicator: chartData.map((d) => ({ name: d.name, max: 250 })),
    };
    chartConfig.series = [
      {
        name: "Sales",
        type: "radar",
        data: [
          {
            value: chartData.map((d) => d.value),
            name: "Sales",
          },
        ],
        itemStyle: {
          color: COLORS[1],
        },
      },
    ];
  }

  return (
    <div className="overflow-hidden rounded border border-stone-300 shadow-sm bg-white max-w-xl h-full mx-auto p-4">
      <div className="flex flex-col gap-2 border-b border-stone-200 pb-3">
        <h3 className="text-lg font-semibold text-gray-700">Sales Distribution</h3>
        <Dropdown
          label="Chart Type"
          enableSearch={true}
          options={[
            {
              label: "Recommended Graphs",
              options: ["pie", "donut", "bar"],
            },
            {
              label: "Advanced Graphs",
              options: ["nightingale", "radar", "scatter"],
            },
            {
              label: "Other Graphs",
              options: ["line", "area"],
            },
          ]}
          value={chartType}
          onChange={(value) =>
            setChartType(value as "pie" | "donut" | "nightingale" | "bar" | "line" | "area" | "radar" | "scatter")
          }
        />
      </div>

      <div className="h-96">
        <DynamicChart
          chartConfig={chartConfig}
          data={chartData}
          type={chartType}
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
};

export default ChartDemo;
