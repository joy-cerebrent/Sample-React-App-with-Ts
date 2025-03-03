import { useState } from "react";
import DynamicChart from "./DynamicChart";
import { EChartsOption } from "echarts";
import { Dropdown } from "utility-package/form";

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

const InitialDynamicChart = ({
  initialLoadData
}: {
  initialLoadData: any;
}) => {

  if (!initialLoadData || initialLoadData.length === 0) {
    console.warn("initialLoadData is empty or undefined");
    return <div>No data available</div>;
  }

  const [component, setComponent] = useState(initialLoadData[0]);

  console.log(component)

  if (!component || component.length === 0) return;

  const COLORS = generateColorRange({
    startColor: [225, 183, 255],
    endColor: [102, 88, 196],
    steps: component.data.length
  });

  const chartConfig: EChartsOption = {
    tooltip: {
      trigger: ["bar", "line", "area", "scatter"].includes(component.chartType) ? "axis" : "item"
    },
    ...(component.chartType !== "treemap" && {
      legend: {
        bottom: 0,
        textStyle: {
          color: "#4B5563"
        }
      }
    }),
    ...(component.chartType !== "pie" &&
      component.chartType !== "donut" &&
      component.chartType !== "nightingale" &&
      component.chartType !== "radar" &&
      component.chartType !== "treemap" && {
      xAxis: {
        type: "category",
        data: component.data.map((d: any, _i: number) => d.name),
        axisLabel: { color: "#374151" }
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#374151" }
      },
    }),
    series: component.chartType === "treemap"
      ? [
        {
          name: component.title,
          type: "treemap",
          roam: false,
          leafDepth: 1,
          data: component.data.map((d: any, i: number) => ({
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
          name: component.title,
          type: component.chartType === "donut" || component.chartType === "nightingale" ? "pie"
            : component.chartType === "area" || component.chartType === "line" ? "line"
              : component.chartType as "pie" | "bar" | "line" | "scatter",
          areaStyle: component.chartType === "area" ? {} : undefined,
          radius: component.chartType === "donut" ? ["40%", "70%"] : component.chartType === "nightingale" ? "60%" : component.chartType === "pie" ? "50%" : undefined,
          roseType: component.chartType === "nightingale" ? "radius" : undefined,
          data: component.data,
          label: { color: "#374151" },
          itemStyle: { color: (params: any) => COLORS[params.dataIndex % COLORS.length] },
        },
      ],
  };

  if (component.chartType === "radar") {
    chartConfig.radar = {
      indicator: component.data.map((d: any) => ({
        name: d.name,
        min: Math.min(...component.data.map((d: any) => d.value)) * 0.5,
        max: Math.max(...component.data.map((d: any) => d.value)) * 1.2,
      })),
    };
    chartConfig.series = [
      {
        name: component.title,
        type: "radar",
        data: [{ value: component.data.map((d: any) => d.value), name: component.title }],
        itemStyle: { color: COLORS[1] },
      },
    ];
  }

  return (
    <div className="rounded border border-stone-300 shadow-sm bg-white h-full w-full mx-auto p-4 col-span-12">
      <div className="flex flex-col gap-2 border-b border-stone-200 pb-3">
        <h3 className="text-lg font-semibold text-gray-700">{component.title}</h3>
        <div className="flex gap-2">
          <Dropdown
            label="Report Type"
            enableSearch={true}
            options={initialLoadData.map((c: any) => c.title)}
            value={component.title}
            onChange={(value) => setComponent(initialLoadData.filter((c: any) => c.title === value)[0])}
          />
          <Dropdown
            label="Chart Type"
            enableSearch={true}
            options={[
              { label: "Recommended Graphs", options: component.recommededTypes },
              { label: "All Graphs", options: component.allTypes },
            ]}
            value={component.type}
            onChange={(value) => setComponent((prev: any) => ({ ...prev, type: value }))}
          />
        </div>
      </div>

      <div className="flex-grow h-96 w-full">
        <DynamicChart
          chartConfig={chartConfig}
          data={component.data}
          type={component.type}
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
};

export default InitialDynamicChart;
