import React, { useEffect, useState } from "react";
import { Bot } from "lucide-react";
import Topbar from "../components/Topbar";
import PromptInput from "../components/PromptInput";
import { StatCard } from "utility-package/graphs";
import { useSocketContext, SocketContextProvider } from "utility-package/providers";
import DynamicChartWrapper from "../components/Dashboard/DynamicChartWrapper";
import InitialDynamicChart from "../components/Dashboard/InitialDynamicChart";
import ReportDashboardExample from "../components/charts/ReportDashboardExample";
import { useQuery, useMutation } from "@tanstack/react-query";

export type chartType =
  | "cards"
  | "bar"
  | "pie"
  | "radar"
  | "donut"
  | "nightingale"
  | "line"
  | "area"
  | "scatter"
  | "treemap";

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
};

const fetchInitialData = async () => {
  const response = await fetch("http://localhost:4000/api/dashboard/initial-load");
  if (!response.ok) throw new Error("Failed to fetch initial data");
  return response.json();
};

const submitPrompt = async (prompt: string) => {
  const response = await fetch("http://localhost:4000/api/dashboard/generate-components", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) throw new Error("Error generating components");
  return response.json();
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
  const [prompt, setPrompt] = useState("");
  const [components, setComponents] = useState<Array<ComponentType>>([]);
  const [mode, setMode] = useState<"append" | "replace">("append");

  const {
    data: initialData,
    isLoading,
    error
  } = useQuery({
    queryKey: ["initialData"],
    queryFn: fetchInitialData,
  });

  const initialLoadData = initialData?.components.map((component: any) => ({
    title: component.title,
    type: component.defaultType,
    cols: component.cols,
    recommededTypes: component.recommededTypes,
    allTypes: component.allTypes,
    data: component.data,
  })) ?? [];

  const {
    mutate,
    isPending
  } = useMutation({
    mutationFn: submitPrompt,
    onSuccess: ({ mode: responseMode, components: newComponents }) => {
      const updatedComponents = newComponents.map((component: any) => ({
        title: component.title,
        type: component.defaultType,
        cols: component.cols,
        recommededTypes: component.recommededTypes,
        allTypes: component.allTypes,
        data: component.data,
      }));

      setMode(responseMode);
      setComponents((prev) =>
        mode === "replace" ? updatedComponents : [...prev, ...updatedComponents]
      );
      setPrompt("");
    },
    onError: (error) => {
      console.error("Error generating components:", error);
    },
  });

  const handlePromptSubmit = () => mutate(prompt);

  useEffect(() => {
    if (!socket) return;

    const setUpdatedData = (newComponents: any) => {
      setComponents((prevComponents) => {
        const existingComponentTypes = prevComponents.map((c) => c.title);

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
          loading={isPending}
        />

        {isLoading && <p>Loading dashboard data...</p>}
        {error && <p className="text-red-500">Error fetching data: {error.message}</p>}

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

          <ReportDashboardExample />
          {/* {initialLoadData && <InitialDynamicChart initialLoadData={initialLoadData} />} */}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
