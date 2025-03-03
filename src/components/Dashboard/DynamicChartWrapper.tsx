import { useState } from "react";
import DynamicChart from "./DynamicChart";
import { color, EChartsOption } from "echarts";
import { Dropdown } from "utility-package/form";
import { chartDataType, chartType } from "../../pages/HomePage";

const generateColorRange = ({
  startColor,
  endColor,
  steps,
}: {
  startColor: [number, number, number];
  endColor: [number, number, number];
  steps: number;
}): string[] => {
  const colors: string[] = [];

  for (var i = 0; i < steps; i++) {
    const t = i / (steps - 1);

    const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * t);
    const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * t);
    const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * t);

    colors.push(`rgb(${r},${g},${b})`);
  }

  return colors;
}

const DynamicChartWrapper = ({
  title = "Sales",
  type,
  data,
  cols,
  recommededTypes,
  allTypes,
}: {
  title: string;
  type: chartType;
  data: Array<chartDataType>;
  cols: number;
  recommededTypes: string[];
  allTypes: string[];
}) => {
  const COLORS = generateColorRange({startColor: [225, 183, 255], endColor: [102, 88, 196], steps: data.length});

  const [chartType, setChartType] = useState<chartType>(type);

  const chartConfig: EChartsOption = {
    tooltip: {
      trigger: ["bar", "line", "area", "scatter"].includes(chartType) ? "axis" : "item"
    },
    ...(chartType !== "treemap" && {
      legend: {
        bottom: 0,
        textStyle: {
          color: "#4B5563"
        }
      }
    }),
    ...(chartType !== "pie" &&
      chartType !== "donut" &&
      chartType !== "nightingale" &&
      chartType !== "radar" &&
      chartType !== "treemap" && {
      xAxis: {
        type: "category",
        data: data.map((d, i) => d.name),
        axisLabel: { color: "#374151" }
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#374151" }
      },
    }),
    series: chartType === "treemap"
      ? [
        {
          name: title,
          type: "treemap",
          roam: false,
          leafDepth: 1,
          data: data.map((d, i) => ({
            name: d.name,
            value: d.value,
            itemStyle: {
              color: COLORS[i % COLORS.length],
            },
          })),
          label: {
            show: true,
            color: "#fff",
            formatter: "{b}: {c}",
          },
        },
      ] : [
        {
          name: title,
          type: chartType === "donut" || chartType === "nightingale" ? "pie"
            : chartType === "area" || chartType === "line" ? "line"
              : chartType as "pie" | "bar" | "line" | "scatter",
          areaStyle: chartType === "area" ? {} : undefined,
          radius: chartType === "donut" ? ["40%", "70%"] : chartType === "nightingale" ? "60%" : chartType === "pie" ? "50%" : undefined,
          roseType: chartType === "nightingale" ? "radius" : undefined,
          data,
          label: { color: "#374151" },
          itemStyle: { color: (params: any) => COLORS[params.dataIndex % COLORS.length] },
        },
      ],
  };

  if (chartType === "radar") {
    chartConfig.radar = {
      indicator: data.map((d) => ({
        name: d.name,
        min: Math.min(...data.map((d) => d.value)) * 0.5,
        max: Math.max(...data.map((d) => d.value)) * 1.2,
      })),
    };
    chartConfig.series = [
      {
        name: title,
        type: "radar",
        data: [{ value: data.map((d) => d.value), name: title }],
        itemStyle: { color: COLORS[1] },
      },
    ];
  }

  return (
    <div className="rounded border border-stone-300 shadow-sm bg-white h-full w-full mx-auto p-4" style={{ gridColumn: `span ${cols}` }}>
      <div className="flex flex-col gap-2 border-b border-stone-200 pb-3">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <Dropdown
          label="Chart Type"
          enableSearch={true}
          options={[
            { label: "Recommended Graphs", options: recommededTypes },
            { label: "All Graphs", options: allTypes },
          ]}
          value={chartType}
          onChange={(value) => setChartType(value as typeof chartType)}
        />
      </div>

      <div className="flex-grow h-96 w-full">
        <DynamicChart
          chartConfig={chartConfig}
          data={data}
          type={chartType}
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
};

export default DynamicChartWrapper;
