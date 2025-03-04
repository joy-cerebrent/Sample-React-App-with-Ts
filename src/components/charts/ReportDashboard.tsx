// App.tsx or another component file
import React, { useEffect, useState } from "react";
import ChartDashboard from "./ChartDashboard";
import { api_base_url } from "../../constants/globals";

const ReportDashboard = () => {
  const [reports, setReports] = useState<any[]>([]);
  const GetReports = async () => {
    try {
      const response = await fetch(
        api_base_url + "/Reports/DashboardComponents",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const { result: reportsResult } = await response.json();

      const updatedComponents = reportsResult.map((rpt: any) => ({
        ...rpt,
        id: rpt.reportName,
        name: rpt.reportTitle,
        description: rpt.reportDescription,
        defaultChartType: rpt.defaultChart ?? "bar",
        recommendedCharts: rpt.recommendedCharts,
        dataset: rpt.data,
        requiredFields: rpt.requiredFields,
        numericFields: rpt.numericFields,
        defaultConfig: rpt.defaultChartConfig,
      }));
      setReports(updatedComponents);
    } catch (error) {
      console.error("Error generating components:", error);
    } finally {
    }
  };

  useEffect(() => {
    GetReports();
  }, []);
  // Example of async data provider
  const fetchReportData = async (reportId: string) => {
    // In a real app, this would likely be an API call
    console.log(`Fetching data for report: ${reportId}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return appropriate data based on report ID
    switch (reportId) {
      case "custom-report":
        // Demo of getting data from an API in a real app
        // const response = await fetch(`/api/reports/${reportId}`);
        // return await response.json();
        return [
          { Category: "A", Value: Math.random() * 100 },
          { Category: "B", Value: Math.random() * 100 },
          { Category: "C", Value: Math.random() * 100 },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="container mx-auto">
      <div className="overflow-hidden">
        <ChartDashboard
          reports={reports}
          dataProvider={fetchReportData} // Fallback data provider
        />
      </div>
    </div>
  );
};

export default ReportDashboard;
