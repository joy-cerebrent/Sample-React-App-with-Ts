// DataValidator.ts
/**
 * Validates and cleans data before passing it to the chart components
 */
export class DataValidator {
    /**
     * Validates and cleans the data array
     * @param data The data array to validate
     * @param requiredFields Fields that must be present in each object
     * @returns Validated and cleaned data array
     */
    static validateData(data: any[], requiredFields: string[] = []): any[] {
      if (!Array.isArray(data)) {
        console.warn('Data is not an array. Returning empty array.');
        return [];
      }
      
      if (data.length === 0) {
        return [];
      }
      
      // Filter out invalid data objects
      const validData = data.filter(item => {
        // Check if item is an object
        if (!item || typeof item !== 'object') {
          return false;
        }
        
        // Check if required fields are present
        return requiredFields.every(field => field in item);
      });
      
      if (validData.length < data.length) {
        console.warn(`Removed ${data.length - validData.length} invalid data entries.`);
      }
      
      return validData;
    }
    
    /**
     * Ensures numeric values are properly formatted
     * @param data Data array
     * @param numericFields Fields that should be numeric
     * @returns Data with numeric fields converted to numbers
     */
    static ensureNumericValues(data: any[], numericFields: string[]): any[] {
      return data.map(item => {
        const newItem = { ...item };
        
        numericFields.forEach(field => {
          if (field in newItem) {
            // Convert to number, defaulting to 0 if NaN
            const numValue = parseFloat(newItem[field]);
            newItem[field] = isNaN(numValue) ? 0 : numValue;
          }
        });
        
        return newItem;
      });
    }
    
    /**
     * Fills in missing values with defaults
     * @param data Data array
     * @param defaultValues Object with field -> default value mappings
     * @returns Data with missing values filled in
     */
    static fillMissingValues(data: any[], defaultValues: Record<string, any>): any[] {
      return data.map(item => {
        const newItem = { ...item };
        
        Object.entries(defaultValues).forEach(([field, defaultValue]) => {
          if (!(field in newItem) || newItem[field] === null || newItem[field] === undefined) {
            newItem[field] = defaultValue;
          }
        });
        
        return newItem;
      });
    }
    
    /**
     * Comprehensive data preparation for charts
     * @param data Raw data array
     * @param options Validation options
     * @returns Cleaned and prepared data
     */
    static prepareChartData(data: any[], options: {
      requiredFields?: string[];
      numericFields?: string[];
      defaultValues?: Record<string, any>;
    } = {}): any[] {
      const { 
        requiredFields = [], 
        numericFields = [], 
        defaultValues = {} 
      } = options;
      
      // First validate the data structure
      let validData = this.validateData(data, requiredFields);
      
      // Fill in missing values
      validData = this.fillMissingValues(validData, defaultValues);
      
      // Ensure numeric values
      validData = this.ensureNumericValues(validData, numericFields);
      
      return validData;
    }
  }