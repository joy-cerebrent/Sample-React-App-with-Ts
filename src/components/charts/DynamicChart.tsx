// DynamicChart.tsx
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';

// Define types for the component props
interface DynamicChartProps {
  /**
   * Chart configuration object that follows ECharts option format
   * See: https://echarts.apache.org/en/option.html
   */
  chartConfig: EChartsOption;
  
  /**
   * Raw data to be visualized
   */
  data: any[];
  
  /**
   * Chart type: 'bar', 'line', 'pie', 'scatter', etc.
   */
  type: string;
  
  /**
   * Width of the chart container
   */
  width?: string | number;
  
  /**
   * Height of the chart container
   */
  height?: string | number;
  
  /**
   * Extra class names for styling
   */
  className?: string;
  
  /**
   * Callback when chart is clicked
   */
  onChartClick?: (params: any) => void;
  
  /**
   * Theme to use for the chart
   */
  theme?: string;
}

/**
 * A dynamic chart component that can render various types of charts
 * based on provided configuration and data.
 */
const DynamicChart: React.FC<DynamicChartProps> = ({
  chartConfig,
  data,
  type,
  width = '100%',
  height = '400px',
  className = '',
  onChartClick,
  theme,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  // Initialize and update chart when dependencies change
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Initialize chart if it doesn't exist yet
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, theme);
    }
    
    // Process data based on chart type
    const processedConfig = processChartConfig(chartConfig, data, type);
    
    // Set chart options
    chartInstance.current.setOption(processedConfig, true);
    
    // Add click event handler if provided
    if (onChartClick) {
      chartInstance.current.off('click');
      chartInstance.current.on('click', onChartClick);
    }
    
    // Handle resizing
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.off('click');
      
      // Only dispose the chart when the component unmounts
      // This prevents unnecessary re-rendering
    };
  }, [chartConfig, data, type, theme, onChartClick]);
  
  // Completely dispose the chart when unmounting
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);
  
  /**
   * Process chart configuration based on data and chart type
   */
  const processChartConfig = (
    config: EChartsOption,
    data: any[],
    type: string
  ): EChartsOption => {
    // Create a deep copy of the config to avoid mutations
    const processedConfig = JSON.parse(JSON.stringify(config));
    
    // Set chart type if it's not already specified in the series
    if (processedConfig.series) {
      processedConfig.series = processedConfig.series.map((series: any) => ({
        ...series,
        type: series.type || type,
      }));
    } else {
      // If no series is defined, create one with the data and type
      processedConfig.series = [
        {
          type,
          data,
        },
      ];
    }
    
    return processedConfig;
  };
  
  return (
    <div
      ref={chartRef}
      className={`dynamic-chart ${className}`}
      style={{
        width,
        height,
      }}
    />
  );
};

export default DynamicChart;