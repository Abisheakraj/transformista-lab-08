
// This file contains functions for interacting with database services

export interface DatabaseCredentials {
  host?: string;
  port?: string;
  database?: string;
  username?: string;
  password?: string;
  connectionType?: string;
  db_type?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface SchemaInfo {
  name: string;
  tables: {
    name: string;
    columns: string[];
  }[];
}

// Use a configurable API URL that defaults to localhost but can be changed
// for different environments
const API_URL = "http://localhost:3001/api";
const API_TIMEOUT = 10000; // 10 seconds timeout

// Helper function to detect if response is HTML instead of JSON
const isHtmlResponse = (text: string): boolean => {
  return text.trim().startsWith('<!DOCTYPE html') || 
         text.trim().startsWith('<html') || 
         (text.includes('<body') && text.includes('</body>'));
};

// Helper function to create a timeout promise
const timeoutPromise = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms`));
    }, ms);
  });
};

/**
 * Test a database connection with the provided credentials
 */
export const testDatabaseConnection = async (credentials: DatabaseCredentials): Promise<ApiResponse> => {
  console.log("Testing connection with credentials:", JSON.stringify(credentials, null, 2));
  
  try {
    // Create a fetch request with timeout
    const fetchPromise = fetch(`${API_URL}/test-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
      // Include credentials for CORS requests
      credentials: 'include',
    });
    
    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise(API_TIMEOUT)]);
    
    if (!response.ok) {
      console.error(`HTTP error: ${response.status} ${response.statusText}`);
      return {
        success: false,
        message: `Server error: ${response.status} ${response.statusText}. Please check your database credentials and ensure the server is running.`
      };
    }
    
    // Get response as text first to check for HTML
    const responseText = await response.text();
    
    // Check if we got HTML instead of JSON
    if (isHtmlResponse(responseText)) {
      console.error("Received HTML instead of JSON:", responseText.substring(0, 200));
      return {
        success: false,
        message: "Server returned HTML instead of JSON. Please check your API server configuration."
      };
    }
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      return data;
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      return {
        success: false,
        message: `Invalid response format: ${responseText.substring(0, 100)}...`
      };
    }
  } catch (error) {
    console.error("Connection test error:", error);
    
    // If it's a timeout error, provide a specific message
    if (error instanceof Error && error.message.includes('timed out')) {
      return {
        success: false,
        message: "Connection timed out. Please check if your database server is running and accessible."
      };
    }
    
    // For other errors
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred while connecting to the database."
    };
  }
};

/**
 * Select a database for a connection
 */
export const selectDatabase = async (connectionId: string, databaseName: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/select-database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ connectionId, databaseName }),
      credentials: 'include',
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Server error: ${response.status} ${response.statusText}. Failed to select database.`
      };
    }

    const responseText = await response.text();
    
    if (isHtmlResponse(responseText)) {
      console.error("Received HTML instead of JSON when selecting database");
      return {
        success: false,
        message: "Server returned HTML instead of JSON. Please check your API server configuration."
      };
    }
    
    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error("Error parsing selectDatabase response:", e);
      return {
        success: false,
        message: "Invalid response format when selecting database."
      };
    }
  } catch (error) {
    console.error("Database selection error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to select database."
    };
  }
};

/**
 * Fetch database schemas for a connection
 */
export const fetchDatabaseSchemas = async (connectionId: string): Promise<ApiResponse> => {
  try {
    const response = await Promise.race([
      fetch(`${API_URL}/schemas/${connectionId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      }),
      timeoutPromise(API_TIMEOUT)
    ]);
    
    if (!response.ok) {
      return {
        success: false,
        message: `Server error: ${response.status} ${response.statusText}. Failed to fetch schemas.`
      };
    }
    
    const responseText = await response.text();
    
    if (isHtmlResponse(responseText)) {
      console.error("Received HTML instead of JSON when fetching schemas");
      return {
        success: false,
        message: "Server returned HTML instead of JSON. Please check your API server configuration."
      };
    }
    
    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error("Error parsing fetchDatabaseSchemas response:", e);
      return {
        success: false,
        message: "Failed to parse schema data response."
      };
    }
  } catch (error) {
    console.error("Fetch schemas error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch database schemas."
    };
  }
};

/**
 * Fetch sample data from a table
 */
export const fetchTableSampleData = async (
  credentials: DatabaseCredentials,
  schema: string,
  table: string,
  limit: number = 50
): Promise<{ columns: string[], rows: any[][] }> => {
  try {
    const response = await Promise.race([
      fetch(`${API_URL}/table-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ credentials, schema, table, limit }),
        credentials: 'include',
      }),
      timeoutPromise(API_TIMEOUT)
    ]);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    
    const responseText = await response.text();
    
    if (isHtmlResponse(responseText)) {
      console.error("Received HTML instead of JSON when fetching table data");
      throw new Error("Server returned HTML instead of JSON. Please check your API configuration.");
    }
    
    try {
      const data = JSON.parse(responseText);
      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error(data.message || "Failed to fetch table data");
      }
    } catch (e) {
      console.error("Error parsing fetchTableSampleData response:", e);
      throw new Error("Failed to parse table data response");
    }
  } catch (error) {
    console.error("Fetch table data error:", error);
    // Return empty data structure on error
    return {
      columns: [],
      rows: []
    };
  }
};

/**
 * Process data transformation
 */
export const processDataTransformation = async (
  instruction: string,
  tableName: string,
  schemaName: string
): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/transform`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ instruction, tableName, schemaName }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      return {
        success: false,
        message: `Server error: ${response.status} ${response.statusText}. Failed to process transformation.`
      };
    }
    
    const responseText = await response.text();
    
    if (isHtmlResponse(responseText)) {
      console.error("Received HTML instead of JSON when processing transformation");
      return {
        success: false,
        message: "Server returned HTML instead of JSON. Please check your API configuration."
      };
    }
    
    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error("Error parsing processDataTransformation response:", e);
      return {
        success: false,
        message: "Failed to parse transformation response"
      };
    }
  } catch (error) {
    console.error("Processing transformation error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred during transformation."
    };
  }
};
