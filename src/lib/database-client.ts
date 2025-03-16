
import { mockSchemas, mockTableData, DatabaseCredentials as DbCredentials, SchemaInfo } from "./database-utils";

// Re-export types from database-utils
export type DatabaseCredentials = DbCredentials;
export type { SchemaInfo };

export interface ConnectionParams {
  host: string;
  port?: string; // Made optional to match DatabaseCredentials
  database?: string;
  username: string;
  password: string;
  connectionType: string;
  db_type?: string;
}

export interface DatabaseColumn {
  name: string;
  type: string;
}

export interface DatabaseTable {
  name: string;
  columns: DatabaseColumn[];
}

export interface DatabaseSchema {
  name: string;
  tables: DatabaseTable[];
}

export interface ApiResponse {
  success: boolean;
  message: string; // Changed from optional to required
  data?: any;
}

export interface TableData {
  columns: string[];
  rows: any[][];
}

// Function to test database connection
export const testDatabaseConnection = async (params: ConnectionParams): Promise<ApiResponse> => {
  console.log("Testing database connection with params:", params);
  
  try {
    // Use the CORS proxy to make the request
    const response = await fetch('/api/database/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      return {
        success: false,
        message: `HTTP error: ${response.status} ${response.statusText}`
      };
    }
    
    const result = await response.json();
    console.log("Connection test result:", result);
    
    // Ensure we have a consistent response format with required message
    return {
      success: result.success === true,
      message: result.message || (result.success ? "Successfully connected" : "Connection failed"),
      data: result.data
    };
  } catch (error) {
    console.error("Error testing connection:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

// Function to fetch schemas from a database
export const fetchDatabaseSchemas = async (connectionId: string): Promise<ApiResponse> => {
  console.log("Fetching database schemas for connection:", connectionId);
  
  try {
    // In a real implementation, this would call your backend
    // For now, return mock data
    const mockResult = {
      success: true,
      message: "Schemas retrieved successfully",
      data: mockSchemas
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("Returning mock schemas:", mockResult);
    return mockResult;
  } catch (error) {
    console.error("Error fetching schemas:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

// Function to fetch available databases
export const fetchAvailableDatabases = async (connectionId: string): Promise<ApiResponse> => {
  console.log("Fetching available databases for connection:", connectionId);
  
  try {
    // In a real implementation, this would call your backend
    // For now, return mock data
    const mockResult = {
      success: true,
      message: "Databases retrieved successfully",
      data: ["airportdb", "northwind", "sakila", "world", "employees"]
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log("Returning mock databases:", mockResult);
    return mockResult;
  } catch (error) {
    console.error("Error fetching databases:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

// Function to select a database for a connection
export const selectDatabase = async (connectionId: string, database: string): Promise<ApiResponse> => {
  console.log(`Selecting database ${database} for connection ${connectionId}`);
  
  try {
    // In a real implementation, this would call your backend
    // For now, simulate success
    const mockResult = {
      success: true,
      message: `Successfully connected to database ${database}`,
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    console.log("Database selection result:", mockResult);
    return mockResult;
  } catch (error) {
    console.error("Error selecting database:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

// Function to fetch table data
export const fetchTableData = async (
  connectionId: string, 
  schema: string, 
  table: string
): Promise<ApiResponse> => {
  console.log(`Fetching data for ${schema}.${table} from connection ${connectionId}`);
  
  try {
    // In a real implementation, this would call your backend
    // For now, return mock data
    const mockResult = {
      success: true,
      message: "Table data retrieved successfully",
      data: mockTableData
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    console.log("Returning mock table data:", mockResult);
    return mockResult;
  } catch (error) {
    console.error("Error fetching table data:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

// Alias for fetchTableData with different parameter structure
export const fetchTableSampleData = async (
  credentials: DatabaseCredentials,
  schema: string, 
  table: string, 
  limit: number = 50
): Promise<TableData> => {
  console.log(`Fetching sample data for ${schema}.${table} with limit ${limit}`);
  
  try {
    // In a real implementation, this would call your backend
    // For now, return mock data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("Returning mock sample data");
    return mockTableData;
  } catch (error) {
    console.error("Error fetching sample data:", error);
    return { columns: [], rows: [] };
  }
};

// Function to execute a custom SQL query
export const executeCustomQuery = async (
  connectionId: string,
  query: string
): Promise<ApiResponse> => {
  console.log(`Executing custom query on connection ${connectionId}:`, query);
  
  try {
    // In a real implementation, this would call your backend
    // For now, return mock data
    const mockResult = {
      success: true,
      message: "Query executed successfully",
      data: mockTableData
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Returning mock query result:", mockResult);
    return mockResult;
  } catch (error) {
    console.error("Error executing query:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

// Re-export processDataTransformation from database-utils
export { processDataTransformation } from './database-utils';
