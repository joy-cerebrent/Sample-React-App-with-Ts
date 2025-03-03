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

import { Dropdown } from "utility-package/form";

import { useSocketContext, SocketContextProvider } from "utility-package/providers";
import { Spreadsheet } from "../../../utility-package/dist";
import DynamicChartWrapper from "../components/Dashboard/DynamicChartWrapper";
import InitialDynamicChart from "../components/Dashboard/InitialDynamicChart";

const componentMap: {
  [key: string]: (index: number, data: any, types?: any) => ReactElement;
} = {
  // spreadsheet: (index, data, types) => (
  //   <React.Fragment key={index}>
  //     <Spreadsheet onSave={handleSave} tableColumns={types} tableData={data} />
  //   </React.Fragment>
  // ),
};

export type chartType = "cards" | "bar" | "pie" | "radar" | "pie" | "donut" | "nightingale" | "line" | "area" | "radar" | "scatter" | "treemap";

export type kpiCardType = {
  title: string;
  value: string;
  pillText: string;
  trend: "up" | "down";
  period: string;
};

export type chartDataType = {
  name: string;
  value: number;
};

export type ComponentType = {
  title: string;
  type: chartType;
  cols?: number;
  recommededTypes?: Array<chartType>;
  allTypes?: Array<chartType>;
  data: Array<kpiCardType | chartDataType>;
}

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
  const [components, setComponents] = useState<Array<ComponentType>>([]);
  const [mode, setMode] = useState<"append" | "replace">("append");

  const [initialLoadData, setInitialLoadData] = useState([]);
  const [initialComponent, setInitialComponent] = useState<any | null>(null);

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
        title: component.title,
        type: component.defaultType,
        cols: component.cols,
        recommededTypes: component.recommededTypes,
        allTypes: component.allTypes,
        data: component.data,
      }));

      setMode(responseMode);
      setComponents((prev) => (responseMode === "replace"
        ? updatedComponents
        : [
          ...prev,
          ...updatedComponents
        ])
      );

      setPrompt("");
    } catch (error) {
      console.error("Error generating components:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const setUpdatedData = (newComponents: any) => {
      setComponents((prevComponents) => {
        const existingComponentTypes = prevComponents.map(c => c.title);

        const filteredComponents = newComponents
          .filter((c: any) => existingComponentTypes.includes(c.title))
          .map((c: any) => ({
            title: c.title,
            type: c.defaultType || "bar",
            cols: c.cols || 6,
            recommededTypes: c.recommededTypes ?? [],
            allTypes: c.allTypes ?? [],
            data: c.data ?? [],
          }));

        return filteredComponents;
      });
    };

    socket.on("updateDashboardData", setUpdatedData);

    return () => {
      socket.off("updateDashboardData", setUpdatedData);
    };
  }, [socket]);

  useEffect(() => {
    const initialLoad = async () => {
      const response = await fetch("http://localhost:4000/api/dashboard/initial-load", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      const { mode, components } = await response.json();

      const formattedComponents = components.map((component: any) => ({
        title: component.title,
        type: component.defaultType,
        cols: component.cols,
        recommededTypes: component.recommededTypes,
        allTypes: component.allTypes,
        data: component.data,
      }));

      setInitialLoadData(formattedComponents);
    }

    initialLoad();
  }, []);

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

        <div className="grid grid-cols-12 gap-2">
          {components
            .filter((component) => component.type === "cards")
            .map((component, index) => (
              <React.Fragment key={index}>
                {component.data.map((card: any, i: number) => (
                  <StatCard key={i} {...card} cols={4} />
                ))}
              </React.Fragment>
            ))}

          {components
            ?.filter((component) => component.type !== "cards")
            ?.map((component, index) => (
              <React.Fragment key={index}>
                <DynamicChartWrapper
                  title={component.title}
                  type={component.type as Exclude<chartType, "cards">}
                  cols={component.cols || 4}
                  recommededTypes={component.recommededTypes!}
                  allTypes={component.allTypes!}
                  data={component.data as Array<chartDataType>}
                />
              </React.Fragment>
            ))}


          {initialLoadData && (
            <InitialDynamicChart
              initialLoadData={initialLoadData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
