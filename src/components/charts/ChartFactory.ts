// ChartFactory.ts
import { EChartsOption } from "echarts";

/**
 * Interface for chart configuration factory patterns
 */
interface ChartFactoryParams {
  data: any[];
  xField?: string;
  yField?: string;
  seriesField?: string;
  title?: string;
  subtitle?: string;
  colorPalette?: string[];
  showLegend?: boolean;
  showToolbox?: boolean;
  showDataZoom?: boolean;
  aggregationType?: "sum" | "average" | "max" | "min";
  sortData?: boolean;
  limit?: number;
  labels?: {
    formatter?: (params: any) => string;
    show?: boolean;
  };
  // Add more parameters as needed
}

/**
 * Factory class for generating different chart configurations
 */
class ChartFactory {
  /**
   * Default color palette
   */
  private static defaultColors = [
    "#5470c6",
    "#91cc75",
    "#fac858",
    "#ee6666",
    "#73c0de",
    "#3ba272",
    "#fc8452",
    "#9a60b4",
  ];

  /**
   * Generate a basic common configuration
   */
  private static getBaseConfig(params: ChartFactoryParams): EChartsOption {
    const {
      title,
      subtitle,
      showLegend = true,
      showToolbox = true,
      showDataZoom = false,
      colorPalette = this.defaultColors,
    } = params;

    return {
      color: colorPalette,
      title: title
        ? {
            text: title,
            subtext: subtitle,
            left: "center",
          }
        : undefined,
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      legend: showLegend
        ? {
            orient: "horizontal",
            left: "center",
            bottom: "0",
          }
        : undefined,
      toolbox: showToolbox
        ? {
            show: true,
            feature: {
              dataZoom: { show: true },
              saveAsImage: { show: true },
              dataView: { show: true },
              restore: { show: true },
            },
          }
        : undefined,
      dataZoom: showDataZoom
        ? [
            {
              type: "slider",
              show: true,
              start: 0,
              end: 100,
            },
            {
              type: "inside",
              start: 0,
              end: 100,
            },
          ]
        : undefined,
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%",
        containLabel: true,
      },
    };
  }

  /**
   * Process data for visualization
   */
  // Fix for the processData method in ChartFactory.ts
  // Fix for the processData method in ChartFactory.ts
  private static processData(params: ChartFactoryParams) {
    let {
      data,
      xField,
      yField,
      seriesField,
      aggregationType = "sum",
      sortData = false,
      limit,
    } = params;

    // Handle data aggregation if needed
    if (xField && yField && seriesField) {
      // Group data by xField and seriesField
      const groupedData: { [key: string]: { [key: string]: number } } = {};

      data.forEach((item) => {
        // Add null checks to prevent toString() on undefined values
        const xValue =
          item[xField] != null ? item[xField].toString() : "undefined";
        const seriesValue =
          item[seriesField] != null
            ? item[seriesField].toString()
            : "undefined";

        // Make sure yValue is a number, default to 0 if not valid
        const yValue = parseFloat(item[yField]) || 0;

        if (!groupedData[xValue]) {
          groupedData[xValue] = {};
        }

        if (!groupedData[xValue][seriesValue]) {
          groupedData[xValue][seriesValue] = 0;
        }

        // Apply aggregation
        switch (aggregationType) {
          case "sum":
            groupedData[xValue][seriesValue] += yValue;
            break;
          case "average":
            // Keep track of count and sum for average
            if (!groupedData[xValue][`${seriesValue}_count`]) {
              groupedData[xValue][`${seriesValue}_count`] = 0;
            }
            groupedData[xValue][`${seriesValue}_sum`] =
              (groupedData[xValue][`${seriesValue}_sum`] || 0) + yValue;
            groupedData[xValue][`${seriesValue}_count`]++;
            groupedData[xValue][seriesValue] =
              groupedData[xValue][`${seriesValue}_sum`] /
              groupedData[xValue][`${seriesValue}_count`];
            break;
          case "max":
            groupedData[xValue][seriesValue] = Math.max(
              groupedData[xValue][seriesValue],
              yValue
            );
            break;
          case "min":
            if (groupedData[xValue][seriesValue] === 0) {
              groupedData[xValue][seriesValue] = yValue;
            } else {
              groupedData[xValue][seriesValue] = Math.min(
                groupedData[xValue][seriesValue],
                yValue
              );
            }
            break;
        }
      });

      // Extract unique x-axis categories and series
      const categories = Object.keys(groupedData);
      const seriesNames = new Set<string>();

      Object.values(groupedData).forEach((seriesObj) => {
        Object.keys(seriesObj).forEach((key) => {
          if (!key.includes("_count") && !key.includes("_sum")) {
            seriesNames.add(key);
          }
        });
      });

      // Sort categories if needed
      if (sortData) {
        categories.sort();
      }

      // Limit data points if specified
      const limitedCategories = limit ? categories.slice(0, limit) : categories;

      return {
        categories: limitedCategories,
        seriesNames: Array.from(seriesNames),
        groupedData,
      };
    }

    // Handle simple data without aggregation
    if (xField && yField) {
      // Filter out any items with missing xField or yField values
      data = data.filter(
        (item) => item[xField] != null && item[yField] != null
      );

      // Sort data if needed
      if (sortData) {
        data = [...data].sort((a, b) => {
          const aVal = String(a[xField]);
          const bVal = String(b[xField]);
          return aVal.localeCompare(bVal);
        });
      }

      // Limit data if needed
      if (limit) {
        data = data.slice(0, limit);
      }

      const categories = data.map((item) => String(item[xField]));
      const values = data.map((item) => parseFloat(item[yField]) || 0);

      return { categories, values, data };
    }

    return { data };
  }

  /**
   * Generate a bar chart configuration
   */
  static createBarChartConfig(params: ChartFactoryParams): EChartsOption {
    const baseConfig = this.getBaseConfig(params);
    const { xField, yField, seriesField, labels } = params;
    const processed = this.processData(params);

    // Simple bar chart with no series
    if (xField && yField && !seriesField) {
      const { categories, values } = processed;

      return {
        ...baseConfig,
        xAxis: {
          type: "category",
          data: categories,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: yField,
            type: "bar",
            data: values,
            label: labels,
            emphasis: {
              focus: "series",
            },
          },
        ],
      };
    }

    // Bar chart with series (grouped bars)
    if (xField && yField && seriesField) {
      const { categories, seriesNames, groupedData } = processed;

      const series = seriesNames.map((name) => ({
        name,
        type: "bar",
        emphasis: {
          focus: "series",
        },
        label: labels,
        data: categories.map((category) => groupedData[category][name] || 0),
      }));

      return {
        ...baseConfig,
        xAxis: {
          type: "category",
          data: categories,
        },
        yAxis: {
          type: "value",
        },
        series,
      };
    }

    // Default empty chart
    return {
      ...baseConfig,
      xAxis: {
        type: "category",
        data: [],
      },
      yAxis: {
        type: "value",
      },
      series: [],
    };
  }

  /**
   * Generate a line chart configuration
   */
  static createLineChartConfig(params: ChartFactoryParams): EChartsOption {
    const baseConfig = this.getBaseConfig(params);
    const { xField, yField, seriesField, labels } = params;
    const processed = this.processData(params);

    // Simple line chart
    if (xField && yField && !seriesField) {
      const { categories, values } = processed;

      return {
        ...baseConfig,
        xAxis: {
          type: "category",
          data: categories,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: yField,
            type: "line",
            data: values,
            label: labels,
            emphasis: {
              focus: "series",
            },
            smooth: true,
          },
        ],
      };
    }

    // Multi-line chart with series
    if (xField && yField && seriesField) {
      const { categories, seriesNames, groupedData } = processed;

      const series = seriesNames.map((name) => ({
        name,
        type: "line",
        emphasis: {
          focus: "series",
        },
        label: labels,
        smooth: true,
        data: categories.map((category) => groupedData[category][name] || 0),
      }));

      return {
        ...baseConfig,
        xAxis: {
          type: "category",
          data: categories,
        },
        yAxis: {
          type: "value",
        },
        series,
      };
    }

    return {
      ...baseConfig,
      xAxis: {
        type: "category",
        data: [],
      },
      yAxis: {
        type: "value",
      },
      series: [],
    };
  }

  /**
   * Generate a pie chart configuration
   */
  static createPieChartConfig(params: ChartFactoryParams): EChartsOption {
    const baseConfig = this.getBaseConfig(params);
    const { data, xField, yField, title, labels } = params;

    if (!xField || !yField) {
      return {
        ...baseConfig,
        series: [],
      };
    }

    // Process data for pie chart
    let processedData = data.map((item) => ({
      name: item[xField],
      value: item[yField],
    }));

    // Sort by value if needed
    if (params.sortData) {
      processedData = processedData.sort((a, b) => b.value - a.value);
    }

    // Limit data points if specified
    if (params.limit) {
      processedData = processedData.slice(0, params.limit);
    }

    return {
      ...baseConfig,
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} ({d}%)",
      },
      series: [
        {
          name: title || yField,
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: labels || {
            show: true,
            formatter: "{b}: {c} ({d}%)",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
            },
          },
          data: processedData,
        },
      ],
    };
  }

  /**
   * Generate a scatter chart configuration
   */
  static createScatterChartConfig(params: ChartFactoryParams): EChartsOption {
    const baseConfig = this.getBaseConfig(params);
    const { data, xField, yField, seriesField, labels, title } = params;

    if (!xField || !yField) {
      return {
        ...baseConfig,
        series: [],
      };
    }

    // Simple scatter chart without series
    if (!seriesField) {
      const processedData = data.map((item) => [item[xField], item[yField]]);

      return {
        ...baseConfig,
        xAxis: {
          type: "value",
          name: xField,
        },
        yAxis: {
          type: "value",
          name: yField,
        },
        series: [
          {
            name: title || `${xField} vs ${yField}`,
            type: "scatter",
            emphasis: {
              focus: "series",
            },
            label: labels,
            data: processedData,
          },
        ],
      };
    }

    // Scatter chart with series (multiple scatter plots)
    const seriesMap = new Map();

    data.forEach((item) => {
      const seriesName = item[seriesField];
      if (!seriesMap.has(seriesName)) {
        seriesMap.set(seriesName, []);
      }
      seriesMap.get(seriesName).push([item[xField], item[yField]]);
    });

    const series = Array.from(seriesMap.entries()).map(([name, values]) => ({
      name,
      type: "scatter",
      emphasis: {
        focus: "series",
      },
      label: labels,
      data: values,
    }));

    return {
      ...baseConfig,
      xAxis: {
        type: "value",
        name: xField,
      },
      yAxis: {
        type: "value",
        name: yField,
      },
      series,
    };
  }

  /**
   * Generate a heatmap chart configuration
   */
  static createHeatmapChartConfig(params: ChartFactoryParams): EChartsOption {
    const baseConfig = this.getBaseConfig(params);
    const { data, xField, yField, seriesField } = params;

    if (!xField || !yField || !seriesField) {
      return {
        ...baseConfig,
        series: [],
      };
    }

    // Extract unique x and y categories
    const xCategories = Array.from(new Set(data.map((item) => item[xField])));
    const yCategories = Array.from(new Set(data.map((item) => item[yField])));

    // Create heatmap data
    const heatmapData = data.map((item) => [
      xCategories.indexOf(item[xField]),
      yCategories.indexOf(item[yField]),
      item[seriesField],
    ]);

    return {
      ...baseConfig,
      tooltip: {
        position: "top",
        formatter: (params: any) => {
          const xValue = xCategories[params.data[0]];
          const yValue = yCategories[params.data[1]];
          const value = params.data[2];
          return `${xValue} - ${yValue}: ${value}`;
        },
      },
      grid: {
        height: "60%",
        top: "10%",
      },
      xAxis: {
        type: "category",
        data: xCategories,
        splitArea: {
          show: true,
        },
      },
      yAxis: {
        type: "category",
        data: yCategories,
        splitArea: {
          show: true,
        },
      },
      visualMap: {
        min: Math.min(...data.map((item) => item[seriesField])),
        max: Math.max(...data.map((item) => item[seriesField])),
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "0%",
      },
      series: [
        {
          name: seriesField,
          type: "heatmap",
          data: heatmapData,
          label: {
            show: true,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
  }

  /**
   * Generate a radar chart configuration
   */
  static createRadarChartConfig(params: ChartFactoryParams): EChartsOption {
    const baseConfig = this.getBaseConfig(params);
    const { data, xField, yField, seriesField } = params;

    if (!xField || !yField) {
      return {
        ...baseConfig,
        series: [],
      };
    }

    // Extract categories for the radar dimensions
    const indicators = Array.from(
      new Set(data.map((item) => item[xField]))
    ).map((category) => ({
      name: category,
      max:
        Math.max(
          ...data
            .filter((item) => item[xField] === category)
            .map((item) => item[yField])
        ) * 1.2,
    }));

    // For a simple radar chart without series
    if (!seriesField) {
      const radarData = indicators.map((indicator) => {
        const matchingItem = data.find(
          (item) => item[xField] === indicator.name
        );
        return matchingItem ? matchingItem[yField] : 0;
      });

      return {
        ...baseConfig,
        radar: {
          indicator: indicators,
        },
        series: [
          {
            name: yField,
            type: "radar",
            data: [
              {
                value: radarData,
                name: yField,
              },
            ],
          },
        ],
      };
    }

    // For radar with multiple series
    const seriesNames = Array.from(
      new Set(data.map((item) => item[seriesField]))
    );

    const series = seriesNames.map((name) => {
      const seriesData = indicators.map((indicator) => {
        const matchingItem = data.find(
          (item) =>
            item[xField] === indicator.name && item[seriesField] === name
        );
        return matchingItem ? matchingItem[yField] : 0;
      });

      return {
        value: seriesData,
        name: name,
      };
    });

    return {
      ...baseConfig,
      radar: {
        indicator: indicators,
      },
      series: [
        {
          name: yField,
          type: "radar",
          data: series,
        },
      ],
    };
  }

  /**
   * Generate a funnel chart configuration
   */
  static createFunnelChartConfig(params: ChartFactoryParams): EChartsOption {
    const baseConfig = this.getBaseConfig(params);
    const { data, xField, yField, sortData = true } = params;

    if (!xField || !yField) {
      return {
        ...baseConfig,
        series: [],
      };
    }

    // Process data for funnel chart
    let processedData = data.map((item) => ({
      name: item[xField],
      value: item[yField],
    }));

    // Sort by value if needed (typically funnel charts are sorted)
    if (sortData) {
      processedData = processedData.sort((a, b) => b.value - a.value);
    }

    return {
      ...baseConfig,
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c}",
      },
      series: [
        {
          name: yField,
          type: "funnel",
          left: "10%",
          top: 60,
          bottom: 60,
          width: "80%",
          min: 0,
          max: Math.max(...processedData.map((item) => item.value)) * 1.2,
          minSize: "0%",
          maxSize: "100%",
          sort: "descending",
          gap: 2,
          label: {
            show: true,
            position: "inside",
          },
          emphasis: {
            label: {
              fontSize: 14,
              fontWeight: "bold",
            },
          },
          data: processedData,
        },
      ],
    };
  }

  /**
   * Generate a treemap chart configuration
   */
  static createTreemapChartConfig(params: ChartFactoryParams): EChartsOption {
    const baseConfig = this.getBaseConfig(params);
    const { data, xField, yField, seriesField } = params;

    if (!xField || !yField) {
      return {
        ...baseConfig,
        series: [],
      };
    }

    // Simple treemap without categories
    if (!seriesField) {
      const treemapData = data.map((item) => ({
        name: item[xField],
        value: item[yField],
      }));

      return {
        ...baseConfig,
        series: [
          {
            type: "treemap",
            data: treemapData,
          },
        ],
      };
    }

    // Treemap with hierarchical data
    const groupedData: { [key: string]: { name: string; value: number } } = {};

    data.forEach((item) => {
      const category = item[seriesField];
      const value = item[yField];

      if (!groupedData[category]) {
        groupedData[category] = {
          name: category,
          value: 0,
          children: [],
        } as any;
      }

      (groupedData[category].children as any[]).push({
        name: item[xField],
        value: value,
      });

      groupedData[category].value += value;
    });

    return {
      ...baseConfig,
      series: [
        {
          type: "treemap",
          data: Object.values(groupedData),
        },
      ],
    };
  }

  /**
   * Generate a sankey diagram configuration
   */
  static createSankeyChartConfig(params: ChartFactoryParams): EChartsOption {
    const baseConfig = this.getBaseConfig(params);
    const { data, xField, yField, seriesField } = params;

    if (!xField || !yField || !seriesField) {
      return {
        ...baseConfig,
        series: [],
      };
    }

    // Process data for Sankey diagram
    const nodes: { name: string }[] = [];
    const links: { source: string; target: string; value: number }[] = [];

    // Collect unique node names
    const uniqueNodes = new Set<string>();
    data.forEach((item) => {
      uniqueNodes.add(item[xField]);
      uniqueNodes.add(item[yField]);
    });

    // Create nodes array
    uniqueNodes.forEach((name) => {
      nodes.push({ name });
    });

    // Create links array
    data.forEach((item) => {
      links.push({
        source: item[xField],
        target: item[yField],
        value: item[seriesField],
      });
    });

    return {
      ...baseConfig,
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c}",
      },
      series: [
        {
          type: "sankey",
          data: nodes,
          links: links,
          emphasis: {
            focus: "adjacency",
          },
          lineStyle: {
            color: "gradient",
            curveness: 0.5,
          },
        },
      ],
    };
  }

  /**
   * Generate a sunburst chart configuration
   */
  static createSunburstChartConfig(params: ChartFactoryParams): EChartsOption {
    const baseConfig = this.getBaseConfig(params);
    const { data, xField, yField, seriesField } = params;

    if (!xField || !yField) {
      return {
        ...baseConfig,
        series: [],
      };
    }

    // Process data for sunburst chart
    // This example assumes a basic hierarchy with two levels

    if (seriesField) {
      // Create hierarchical data
      const categories: { [key: string]: any } = {};

      data.forEach((item) => {
        const category = item[seriesField];
        const subcategory = item[xField];
        const value = item[yField];

        if (!categories[category]) {
          categories[category] = {
            name: category,
            children: [],
          };
        }

        // Check if subcategory already exists
        let subCat = categories[category].children.find(
          (child: any) => child.name === subcategory
        );

        if (!subCat) {
          subCat = {
            name: subcategory,
            value: value,
          };
          categories[category].children.push(subCat);
        } else {
          subCat.value += value;
        }
      });

      const sunburstData = Object.values(categories);

      return {
        ...baseConfig,
        series: [
          {
            type: "sunburst",
            data: sunburstData,
            radius: ["15%", "80%"],
            label: {
              rotate: "radial",
            },
          },
        ],
      };
    }

    // Simple one-level sunburst
    const sunburstData = data.map((item) => ({
      name: item[xField],
      value: item[yField],
    }));

    return {
      ...baseConfig,
      series: [
        {
          type: "sunburst",
          data: sunburstData,
          radius: ["15%", "80%"],
          label: {
            rotate: "radial",
          },
        },
      ],
    };
  }

  /**
   * Create a gauge chart configuration
   */
  static createGaugeChartConfig(params: ChartFactoryParams): EChartsOption {
    const baseConfig = this.getBaseConfig(params);
    const { data, xField, yField } = params;

    if (!xField || !yField || data.length === 0) {
      return {
        ...baseConfig,
        series: [],
      };
    }

    // Use the first item for a simple gauge
    const item = data[0];
    const name = item[xField];
    const value = item[yField];

    return {
      ...baseConfig,
      tooltip: {
        formatter: "{a} <br/>{b} : {c}%",
      },
      series: [
        {
          name: "Gauge",
          type: "gauge",
          detail: { formatter: "{value}" },
          data: [{ value, name }],
          axisLine: {
            lineStyle: {
              width: 30,
              color: [
                [0.3, "#67e0e3"],
                [0.7, "#37a2da"],
                [1, "#fd666d"],
              ],
            },
          },
        },
      ],
    };
  }

  /**
   * Create a 3D scatter chart configuration
   */
  static create3DScatterChartConfig(params: ChartFactoryParams): EChartsOption {
    const baseConfig = this.getBaseConfig(params);
    const { data, xField, yField, seriesField } = params;
    const zField = params.zField || (params as any).zField; // Add zField to the interface

    if (!xField || !yField || !zField) {
      return {
        ...baseConfig,
        series: [],
      };
    }

    // Process data for 3D scatter
    if (!seriesField) {
      // Single series 3D scatter
      const scatterData = data.map((item) => [
        item[xField],
        item[yField],
        item[zField],
      ]);

      return {
        ...baseConfig,
        grid3D: {},
        xAxis3D: {
          name: xField,
        },
        yAxis3D: {
          name: yField,
        },
        zAxis3D: {
          name: zField,
        },
        series: [
          {
            type: "scatter3D",
            data: scatterData,
          },
        ],
      };
    }

    // Multiple series 3D scatter
    const seriesMap = new Map();

    data.forEach((item) => {
      const seriesName = item[seriesField];
      if (!seriesMap.has(seriesName)) {
        seriesMap.set(seriesName, []);
      }
      seriesMap
        .get(seriesName)
        .push([item[xField], item[yField], item[zField]]);
    });

    const series = Array.from(seriesMap.entries()).map(([name, values]) => ({
      name,
      type: "scatter3D",
      data: values,
    }));

    return {
      ...baseConfig,
      grid3D: {},
      xAxis3D: {
        name: xField,
      },
      yAxis3D: {
        name: yField,
      },
      zAxis3D: {
        name: zField,
      },
      series,
    };
  }
}

export default ChartFactory;
