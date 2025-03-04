// ChartDashboard.tsx with dynamic data loading
import React, { useState, useEffect } from "react";
import DynamicChart from "./DynamicChart";
import ChartFactory from "./ChartFactory";
import { DataValidator } from "./DataValidator";
import { Dropdown } from "utility-package/form";

function camelCaseToTitleCase(camelCaseString: string): string {
  if (!camelCaseString) {
    return '';
  }

  // Step 1: Add a space before each capital letter and lowercase the entire string
  const spacedString = camelCaseString
    .replace(/([A-Z])/g, ' $1')
    .trim();

  // Step 2: Split the string into words
  const words = spacedString.split(' ');

  // Step 3: Capitalize the first letter of each word and join them back
  return words
    .map(word => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

// Define a Report interface with dataset
interface Report {
  id: string;
  name: string;
  description: string;
  defaultChartType: string;
  recommendedCharts: string[];
  // New property for report-specific data
  dataset?: any[];
  // Function to fetch data if not provided directly
  dataProvider?: () => Promise<any[]>;
  defaultConfig: {
    xField: string;
    yField: string;
    seriesField?: string;
    title: string;
    subtitle?: string;
    showDataZoom?: boolean;
    sortData?: boolean;
    aggregationType?: "sum" | "average" | "max" | "min";
  };
  requiredFields?: string[];
  numericFields?: string[];
}

interface ChartDashboardProps {
  // Optional default data for all reports
  data?: any[];
  // Predefined reports
  reports: Report[];
  // Optional data fetching function for all reports
  dataProvider?: (reportId: string) => Promise<any[]>;
}

const ChartDashboard: React.FC<ChartDashboardProps> = ({
  data: defaultData = [],
  reports = [],
  dataProvider,
}) => {
  // State declarations
  const [selectedReportId, setSelectedReportId] = useState<string>("");
  const [chartType, setChartType] = useState<string>("bar");
  const [xField, setXField] = useState<string>("");
  const [yField, setYField] = useState<string>("");
  const [seriesField, setSeriesField] = useState<string>("");
  const [chartConfig, setChartConfig] = useState<any>(null);
  const [fields, setFields] = useState<string[]>([]);
  const [reportDescription, setReportDescription] = useState<string>("");
  const [recommendedCharts, setRecommendedCharts] = useState<string[]>([]);
  const [currentData, setCurrentData] = useState<any[]>(defaultData);
  const [validatedData, setValidatedData] = useState<any[]>([]);
  const [validationWarning, setValidationWarning] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Initialize with first report if available
  useEffect(() => {
    if (reports.length > 0 && selectedReportId === "") {
      handleReportChange(reports[0].id);
    }
  }, [reports]);

  // Load data when report changes
  const loadReportData = async (reportId: string) => {
    setIsLoading(true);
    setError("");
    try {
      const selectedReport = reports.find((report) => report.id === reportId);

      if (!selectedReport) {
        throw new Error(`Report with ID "${reportId}" not found.`);
      }

      let reportData: any[] = [];

      // Priority for data loading:
      // 1. Report-specific dataset (if provided)
      // 2. Report-specific dataProvider function (if provided)
      // 3. Global dataProvider function (if provided)
      // 4. Default data

      if (selectedReport.dataset && selectedReport.dataset.length > 0) {
        // Use the dataset provided with the report
        reportData = selectedReport.dataset;
      } else if (selectedReport.dataProvider) {
        // Use the report's data provider function
        reportData = await selectedReport.dataProvider();
      } else if (dataProvider) {
        // Use the global data provider function
        reportData = await dataProvider(reportId);
      } else {
        // Fallback to default data
        reportData = defaultData;
      }

      setCurrentData(reportData);
    } catch (err) {
      console.error("Error loading report data:", err);
      setError(
        `Failed to load data for report: ${err instanceof Error ? err.message : "Unknown error"
        }`
      );
      setCurrentData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Validate data when currentData changes
  useEffect(() => {
    if (currentData.length === 0 && !isLoading) {
      setValidatedData([]);
      setValidationWarning("No data available for this report.");
      return;
    }

    // Get the currently selected report
    const selectedReport = reports.find(
      (report) => report.id === selectedReportId
    );

    if (!selectedReport) return;

    // Prepare validation options
    const validationOptions = {
      requiredFields: selectedReport.requiredFields || [],
      numericFields: selectedReport.numericFields || [],
      defaultValues: {},
    };

    // Add default values for required fields if needed
    if (selectedReport.requiredFields) {
      selectedReport.requiredFields.forEach((field) => {
        if (field === selectedReport.defaultConfig.yField) {
          validationOptions.defaultValues[field] = 0;
        } else {
          validationOptions.defaultValues[field] = `Unknown ${field}`;
        }
      });
    }

    // Validate and clean the data
    const cleaned = DataValidator.prepareChartData(
      currentData,
      validationOptions
    );

    if (cleaned.length < currentData.length) {
      setValidationWarning(
        `Warning: ${currentData.length - cleaned.length
        } data entries were filtered out due to missing required fields.`
      );
    } else {
      setValidationWarning("");
    }

    setValidatedData(cleaned);

    // Extract field names from the first valid data object
    if (cleaned.length > 0) {
      setFields(Object.keys(cleaned[0]));
    }
  }, [currentData, selectedReportId]);

  // Handle report selection
  const handleReportChange = (reportId: string) => {
    const selectedReport = reports.find((report) => report.id === reportId);

    if (selectedReport) {
      setSelectedReportId(reportId);
      setReportDescription(selectedReport.description);
      setRecommendedCharts(selectedReport.recommendedCharts);

      // Set chart type to the default for this report
      setChartType(selectedReport.defaultChartType);

      // Set fields based on the report's default configuration
      if (selectedReport.defaultConfig) {
        setXField(selectedReport.defaultConfig.xField || "");
        setYField(selectedReport.defaultConfig.yField || "");
        setSeriesField(selectedReport.defaultConfig.seriesField || "");
      }

      // Load data for this report
      loadReportData(reportId);
    }
  };

  // Generate chart configuration when parameters change
  useEffect(() => {
    if (!validatedData || validatedData.length === 0 || !xField || !yField)
      return;

    generateChartConfig();
  }, [validatedData, chartType, xField, yField, seriesField]);

  const generateChartConfig = () => {
    try {
      const selectedReport = reports.find(
        (report) => report.id === selectedReportId
      );

      const params = {
        data: validatedData,
        xField,
        yField,
        seriesField: seriesField || undefined,
        title: selectedReport?.defaultConfig.title || `${yField} by ${xField}`,
        subtitle: selectedReport?.defaultConfig.subtitle,
        showLegend: true,
        showToolbox: true,
        showDataZoom:
          selectedReport?.defaultConfig.showDataZoom ||
          chartType === "bar" ||
          chartType === "line",
        sortData: selectedReport?.defaultConfig.sortData,
        aggregationType: selectedReport?.defaultConfig.aggregationType,
      };

      let config;

      switch (chartType) {
        case "bar":
          config = ChartFactory.createBarChartConfig(params);
          break;
        case "line":
          config = ChartFactory.createLineChartConfig(params);
          break;
        case "pie":
          config = ChartFactory.createPieChartConfig(params);
          break;
        case "scatter":
          config = ChartFactory.createScatterChartConfig(params);
          break;
        case "heatmap":
          config = ChartFactory.createHeatmapChartConfig(params);
          break;
        case "radar":
          config = ChartFactory.createRadarChartConfig(params);
          break;
        case "funnel":
          config = ChartFactory.createFunnelChartConfig(params);
          break;
        case "treemap":
          config = ChartFactory.createTreemapChartConfig(params);
          break;
        case "sankey":
          config = ChartFactory.createSankeyChartConfig(params);
          break;
        case "sunburst":
          config = ChartFactory.createSunburstChartConfig(params);
          break;
        case "gauge":
          config = ChartFactory.createGaugeChartConfig(params);
          break;
        default:
          config = ChartFactory.createBarChartConfig(params);
      }

      setChartConfig(config);
    } catch (error) {
      console.error("Error generating chart config:", error);
      setChartConfig(null);
    }
  };

  const handleFieldChange = (fieldType: string, value: string) => {
    switch (fieldType) {
      case "x":
        setXField(value);
        break;
      case "y":
        setYField(value);
        break;
      case "series":
        setSeriesField(value);
        break;
      default:
        break;
    }
  };

  // Check if a chart type is recommended for the current report
  const isRecommendedChart = (type: string) => {
    return recommendedCharts.includes(type);
  };

  return (
    <div>
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Warning */}
      {validationWarning && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{validationWarning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Report Selection */}
      {/* <div className="bg-white p-4 rounded-lg shadow-sm"> 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium">
              Select Report
            </label>
            <select
              value={selectedReportId}
              onChange={(e) => handleReportChange(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            >
              {reports.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-sm text-gray-600 mt-2">{reportDescription}</p>
          </div>
        </div>
      </div> */}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading report data...</span>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Chart Configuration */}
          {/* <div>
            <label className="block mb-2 text-sm font-medium">Report</label>
            <select
              value={selectedReportId}
              onChange={(e) => handleReportChange(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            >
              {reports.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-600 mt-2 mb-2">{reportDescription}</p>
          </div> */}
          <Dropdown
            label="Select Report"
            options={reports.map((r) => r.name)}
            value={reports.find((r) => r.id === selectedReportId)?.name || ""}
            enableSearch={true}
            onChange={(name) => {
              const selected = reports.find((r) => r.name === name);
              if (selected) handleReportChange(selected.id);
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {/* Chart Type Selector */}
            <Dropdown
              label="Chart Type"
              options={[{
                label: "Recommended for this data",
                options: recommendedCharts,
              }, {
                label: "All Chart Types",
                options: [
                  "bar",
                  "line",
                  "pie",
                  "scatter",
                  "heatmap",
                  "radar",
                  "funnel",
                  "treemap",
                  "sankey",
                  "sunburst",
                  "gauge",
                ]
                  .filter((type) => !isRecommendedChart(type)),
              }]}
              value={chartType}
              onChange={setChartType}
              customDisplayFunction={(str) => `${camelCaseToTitleCase(str)} Chart`}
            />

            {/* X-Axis Field Selector */}
            <Dropdown
              label="X-Axis Field"
              options={fields}
              value={xField}
              onChange={setXField}
              customDisplayFunction={camelCaseToTitleCase}
            />

            {/* Y-Axis Field Selector */}
            <Dropdown
              label="Y-Axis Field"
              options={fields}
              value={yField}
              onChange={setYField}
              customDisplayFunction={camelCaseToTitleCase}
            />


            {/* Series Field Selector */}
            {seriesField && (
              <Dropdown
                label="Series Field"
                options={fields}
                value={seriesField}
                onChange={setSeriesField}
                customDisplayFunction={camelCaseToTitleCase}
              />
            )}

          </div>

          {/* Data Information */}
          {/* <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Data Information</h2>
            <div className="text-sm text-gray-700">
              <p>Total records: {validatedData.length}</p>
              <p>Available fields: {fields.join(", ")}</p>
            </div>
          </div> */}

          {/* Chart Container */}
          <div className="mt-4 p-4">
            <div className="h-96 w-full">
              {chartConfig ? (
                <DynamicChart
                  chartConfig={chartConfig}
                  data={validatedData}
                  type={chartType}
                  height="100%"
                  onChartClick={(params) =>
                    console.log("Chart clicked:", params)
                  }
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500">
                    {validatedData.length === 0
                      ? "No valid data available for visualization"
                      : "Select fields to generate chart"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChartDashboard;
