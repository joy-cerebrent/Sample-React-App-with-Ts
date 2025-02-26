import { ReactElement, useState } from "react";
import { Bot } from "lucide-react";

import Topbar from "../components/Topbar";
import PromptInput from "../components/PromptInput";
import {
  BarChartComponent,
  PieChartComponent,
  LineChartComponent,
  RadarChartComponent,
  StatCard,
  Table,
} from "utility-package/graphs";

// import StatCard from "../components/Dashboard/StatCard";
// import Table from "../components/Dashboard/Table";
// import BarChartComponent from "../components/Dashboard/BarChart";
// import PieChartComponent from "../components/Dashboard/PieChart";
// import LineChartComponent from "../components/Dashboard/LineChart";
// import RadarChartComponent from "../components/Dashboard/RadarChart";

import { Spreadsheet } from "../../../utility-package/dist";
import wait from "../utils/wait";

const stats: {
  title: string;
  value: string;
  pillText: string;
  trend: "up" | "down";
  period: string;
}[] = [
    {
      title: "Gross Revenue",
      value: "$120,054.24",
      pillText: "2.75%",
      trend: "up",
      period: "From Jan 1st - Jul 31st",
    },
    {
      title: "Avg Order",
      value: "$27.97",
      pillText: "1.01%",
      trend: "down",
      period: "From Jan 1st - Jul 31st",
    },
    {
      title: "Trailing Year",
      value: "$278,054.24",
      pillText: "60.75%",
      trend: "up",
      period: "Previous 365 days",
    },
  ];

const handleSave = async (jsonData: any[][]) => {
  await wait(2000);
  console.log("Sending JSON data:", jsonData);
};

const componentMap: {
  [key: string]: (index: number, data: any, types?: any) => ReactElement;
} = {
  pie: (index, data) => (
    <PieChartComponent key={index} title="Device Usage" data={data} cols={4} />
  ),
  bar: (index, data) => (
    <BarChartComponent key={index} title="Monthly Sales" data={data} cols={8} />
  ),
  radar: (index, data) => (
    <RadarChartComponent key={index} title="Usage Radar" data={data} cols={4} />
  ),
  line: (index, data) => (
    <LineChartComponent key={index} title="Bar Activity" data={data} cols={8} />
  ),
  table: (index, data) => (
    <Table key={index} data={data} title="Dynamic Table" cols={12} />
  ),
  spreadsheet: (index, data, types) => (
    <div className="grid-cols-12" key={index}>
      <Spreadsheet
        onSave={handleSave}
        tableColumns={types}
        tableData={data}
      />
    </div>
  )
};

const HomePage = () => {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [components, setComponents] = useState<any[]>([]);
  const [mode, setMode] = useState<"append" | "replace">("append");

  const handlePromptSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:4000/api/dashboard/generate-components",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        }
      );

      const { mode: responseMode, components: newComponents } = await response.json();

      const updatedComponents = newComponents.map((component: any) => ({
        type: component.type,
        data: component.data,
        types: component.types ?? null,
      }));

      console.log(updatedComponents)

      setMode(responseMode);
      setComponents((prev) =>
        responseMode === "replace"
          ? updatedComponents
          : [...prev, ...updatedComponents]
      );
      setPrompt("");
    } catch (error) {
      console.error("Error generating components:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl pb-4 shadow">
      <Topbar />
      <div className="px-4">
        <PromptInput
          icon={Bot}
          placeholder="Create a table and a radar chart for me..."
          prompt={prompt}
          setPrompt={setPrompt}
          handlePromptSubmit={handlePromptSubmit}
          loading={loading}
        />

        <div className="grid gap-3 grid-cols-12">
          {stats.map(({ title, value, pillText, trend, period }) => (
            <StatCard
              key={title}
              title={title}
              value={value}
              pillText={pillText}
              trend={trend}
              period={period}
              cols={4}
            />
          ))}

          {components.map(({ type, data, types }, index) =>
            componentMap[type] ? componentMap[type](index, data, types) : null
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
