// DynamicKPI.tsx
import React from 'react';

// Interface for KPI definition
export interface KPI {
  id: string;
  name: string;
  description?: string;
  type: 'number' | 'percentage' | 'currency' | 'ratio' | 'text';
  // Function to calculate the KPI value from the data
  calculator: (data: any[]) => any;
  // Optional function to calculate the previous value (for trends)
  previousCalculator?: (data: any[]) => any;
  // Optional formatting options
  format?: {
    prefix?: string;
    suffix?: string;
    decimals?: number;
    abbreviate?: boolean;
    currencySymbol?: string;
  };
  // Optional threshold for color coding
  thresholds?: {
    good?: number;
    warning?: number;
    danger?: number;
    // Whether higher values are better (true) or lower values are better (false)
    higherIsBetter?: boolean;
  };
  // Optional icon or name of icon to display
  icon?: string;
  // Optional filter to apply before calculating KPI
  filter?: (data: any[]) => any[];
  // Optional target value to compare against
  target?: number;
}

// Props for the KPI card component
interface KPICardProps {
  kpi: KPI;
  data: any[];
  className?: string;
}

// Function to format KPI values
const formatKPIValue = (value: any, kpi: KPI): string => {
  if (value === undefined || value === null) {
    return 'N/A';
  }

  const format = kpi.format || {};
  let formattedValue = value;

  // Handle different types
  switch (kpi.type) {
    case 'number':
      if (format.abbreviate) {
        // Abbreviate large numbers (K, M, B)
        if (value >= 1000000000) {
          formattedValue = (value / 1000000000).toFixed(format.decimals || 1) + 'B';
        } else if (value >= 1000000) {
          formattedValue = (value / 1000000).toFixed(format.decimals || 1) + 'M';
        } else if (value >= 1000) {
          formattedValue = (value / 1000).toFixed(format.decimals || 1) + 'K';
        } else {
          formattedValue = value.toFixed(format.decimals || 0);
        }
      } else {
        formattedValue = value.toFixed(format.decimals || 0);
      }
      break;
    case 'percentage':
      formattedValue = value.toFixed(format.decimals || 1) + '%';
      break;
    case 'currency':
      formattedValue = (format.currencySymbol || '$') + value.toFixed(format.decimals || 2);
      break;
    case 'ratio':
      formattedValue = value.toFixed(format.decimals || 2);
      break;
    case 'text':
      // No additional formatting for text
      break;
  }

  // Add prefix and suffix
  return `${format.prefix || ''}${formattedValue}${format.suffix || ''}`;
};

// Function to determine the color based on thresholds
const getKPIColor = (value: any, kpi: KPI): string => {
  if (value === undefined || value === null || !kpi.thresholds) {
    return 'text-gray-600'; // Default color
  }

  const { good, warning, danger, higherIsBetter = true } = kpi.thresholds;

  if (higherIsBetter) {
    // Higher values are better
    if (good !== undefined && value >= good) {
      return 'text-green-600';
    } else if (warning !== undefined && value >= warning) {
      return 'text-yellow-500';
    } else if (danger !== undefined && value < danger) {
      return 'text-red-600';
    }
  } else {
    // Lower values are better
    if (good !== undefined && value <= good) {
      return 'text-green-600';
    } else if (warning !== undefined && value <= warning) {
      return 'text-yellow-500';
    } else if (danger !== undefined && value > danger) {
      return 'text-red-600';
    }
  }

  return 'text-gray-600'; // Default color
};

// Function to calculate the change percentage
const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};

// Individual KPI Card Component
const KPICard: React.FC<KPICardProps> = ({ kpi, data, className = '' }) => {
  // Apply filter if specified
  const filteredData = kpi.filter ? kpi.filter(data) : data;
  
  // Calculate the KPI value
  const value = kpi.calculator(filteredData);
  
  // Calculate previous value if a calculator is provided
  const previousValue = kpi.previousCalculator ? kpi.previousCalculator(filteredData) : undefined;
  
  // Calculate change percentage if previous value exists
  const changePercentage = previousValue !== undefined && typeof value === 'number' && typeof previousValue === 'number'
    ? calculateChange(value, previousValue)
    : undefined;
  
  // Determine color based on thresholds
  const valueColor = getKPIColor(value, kpi);
  
  // Determine trend color
  const trendColor = changePercentage !== undefined
    ? (changePercentage > 0 
        ? (kpi.thresholds?.higherIsBetter ? 'text-green-500' : 'text-red-500')
        : (kpi.thresholds?.higherIsBetter ? 'text-red-500' : 'text-green-500'))
    : '';

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex items-center mb-2">
        {kpi.icon && (
          <span className="mr-2 text-gray-500">
            {/* Use an icon library or render an SVG based on kpi.icon */}
            {/* Example: <IconName /> */}
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
            </svg>
          </span>
        )}
        <h3 className="text-sm font-medium text-gray-700">{kpi.name}</h3>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className={`text-2xl font-bold ${valueColor}`}>
            {formatKPIValue(value, kpi)}
          </div>
          
          {kpi.target !== undefined && (
            <div className="text-xs text-gray-500 mt-1">
              Target: {formatKPIValue(kpi.target, kpi)}
            </div>
          )}
        </div>
        
        {changePercentage !== undefined && (
          <div className={`flex items-center ${trendColor}`}>
            {changePercentage > 0 ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : changePercentage < 0 ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
              </svg>
            )}
            <span className="text-sm ml-1">
              {Math.abs(changePercentage).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      
      {kpi.description && (
        <p className="text-xs text-gray-500 mt-2">{kpi.description}</p>
      )}
    </div>
  );
};

// Interface for the DynamicKPI component props
interface DynamicKPIProps {
  kpis: KPI[];
  data: any[];
  columns?: number;
  className?: string;
}

// Main Dynamic KPI Component
const DynamicKPI: React.FC<DynamicKPIProps> = ({ 
  kpis, 
  data, 
  columns = 4,
  className = '' 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
        No data available for KPIs
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${Math.min(columns, 4)} gap-4 ${className}`}>
      {kpis.map(kpi => (
        <KPICard 
          key={kpi.id} 
          kpi={kpi} 
          data={data} 
        />
      ))}
    </div>
  );
};

export default DynamicKPI;