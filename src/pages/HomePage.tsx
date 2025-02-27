import React, { ReactElement, useEffect, useState } from "react";
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

import { useSocketContext, SocketContextProvider } from "utility-package/providers";
import { Spreadsheet } from "../../../utility-package/dist";
import wait from "../utils/wait";

const handleSave = async (jsonData: any[][]) => {
  await wait(2000);
  console.log("Sending JSON data:", jsonData);
};

const componentMap: {
  [key: string]: (index: number, data: any, types?: any) => ReactElement;
} = {
  cards: (index, data) => (
    <React.Fragment key={index}>
      {data.map((stat: any, i: number) => (
        <StatCard key={i} title={stat.title} value={stat.value} pillText={stat.pillText} trend={stat.trend} period={stat.period} cols={4} />
      ))}
    </React.Fragment>
  ),
  pie: (index, data) => <PieChartComponent key={index} title="Device Usage" data={data} cols={4} />,
  bar: (index, data) => <BarChartComponent key={index} title="Monthly Sales" data={data} cols={8} />,
  radar: (index, data) => <RadarChartComponent key={index} title="Usage Radar" data={data} cols={4} />,
  line: (index, data) => <LineChartComponent key={index} title="Bar Activity" data={data} cols={8} />,
  table: (index, data) => <Table key={index} data={data} title="Dynamic Table" cols={12} />,
  // spreadsheet: (index, data, types) => (
  //   <React.Fragment key={index}>
  //     <Spreadsheet onSave={handleSave} tableColumns={types} tableData={data} />
  //   </React.Fragment>
  // ),
};

const HomePage = () => {
  return (
    <SocketContextProvider serverUrl="http://localhost:4000">
      <HomePageContent />
    </SocketContextProvider>
  );
};

const HomePageContent = () => {
  const socket = useSocketContext();

  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [components, setComponents] = useState<any[]>([]);
  const [mode, setMode] = useState<"append" | "replace">("append");

  const handlePromptSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/dashboard/generate-components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const { mode: responseMode, components: newComponents } = await response.json();

      const updatedComponents = newComponents.map((component: any) => ({
        type: component.type,
        data: component.data,
        types: component.types ?? null,
      }));

      console.log(updatedComponents);

      setMode(responseMode);
      setComponents((prev) => (responseMode === "replace" ? updatedComponents : [...prev, ...updatedComponents]));
      setPrompt("");
    } catch (error) {
      console.error("Error generating components:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    console.log("Socket connected : ", socket)

    const setUpdatedData = (newComponents: any) => {
      setComponents((prevComponents) => {
        console.log("Previous components:", prevComponents);
        console.log("New components:", newComponents);

        const existingComponentTypes = prevComponents.map(c => c.type);

        const filteredComponents = newComponents.filter((c: any) => existingComponentTypes.includes(c.type));

        return filteredComponents;
      });
    };

    socket.on("updateDashboardData", setUpdatedData);

    return () => {
      socket.off("updateDashboardData", setUpdatedData);
    };
  }, [socket]);

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
          {components.map(({ type, data, types }, index) => (
            componentMap[type] ? componentMap[type](index, data, types) : null
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
