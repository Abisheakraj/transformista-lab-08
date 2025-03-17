
// Utility function to check API server availability and CORS configuration

/**
 * Checks if the API server is accessible and if CORS is properly configured
 * @returns Promise with the check result
 */
export const checkApiServer = async (): Promise<{
  accessible: boolean;
  corsIssue: boolean;
  message: string;
}> => {
  // API endpoint to check
  const API_URL = "https://9574-2405-201-e01c-b2bd-d926-14ba-a311-6173.ngrok-free.app";
  
  console.log("Checking API server accessibility...");
  
  try {
    // Simple OPTIONS request to check CORS preflight
    const response = await fetch(`${API_URL}/database/connect`, {
      method: 'OPTIONS',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': window.location.origin
      },
    });
    
    console.log("API server check response:", response);
    
    if (response.ok) {
      return {
        accessible: true,
        corsIssue: false,
        message: "API server is accessible and CORS is properly configured."
      };
    } else {
      // Server responded, but with an error
      return {
        accessible: true,
        corsIssue: response.status === 403, // 403 often indicates CORS issue
        message: `API server responded with status: ${response.status} ${response.statusText}`
      };
    }
  } catch (error) {
    console.error("API server check error:", error);
    
    // Detect if it's a CORS error
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const isCorsError = errorMessage.toLowerCase().includes('cors') || 
                         errorMessage.toLowerCase().includes('cross-origin') ||
                         errorMessage.toLowerCase().includes('access-control-allow-origin');
    
    return {
      accessible: false,
      corsIssue: isCorsError,
      message: isCorsError 
        ? "CORS issue detected: The API server is blocking cross-origin requests."
        : `Cannot access API server: ${errorMessage}`
    };
  }
};

/**
 * Function to test if the CORS proxy is working properly
 * @param proxyUrl The CORS proxy URL to test
 * @returns Promise with the test result
 */
export const testCorsProxy = async (proxyUrl: string): Promise<{
  success: boolean;
  message: string;
}> => {
  if (!proxyUrl.startsWith('http')) {
    return {
      success: false,
      message: "Invalid proxy URL. Must start with http:// or https://"
    };
  }
  
  console.log("Testing CORS proxy:", proxyUrl);
  
  try {
    // Test the proxy with a simple request to httpbin
    const response = await fetch(`${proxyUrl}https://httpbin.org/get`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': window.location.origin
      }
    });
    
    if (response.ok) {
      // Try to parse the response to ensure it's valid
      const data = await response.json();
      
      if (data && typeof data === 'object') {
        return {
          success: true,
          message: "CORS proxy is working correctly."
        };
      } else {
        return {
          success: false,
          message: "CORS proxy returned an invalid response."
        };
      }
    } else {
      return {
        success: false,
        message: `CORS proxy test failed with status: ${response.status} ${response.statusText}`
      };
    }
  } catch (error) {
    console.error("CORS proxy test error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error testing CORS proxy"
    };
  }
};

/**
 * Get API base URL with CORS proxy if enabled
 */
export const getApiBaseUrl = (): string => {
  const useProxy = localStorage.getItem('useCorsProxy') === 'true';
  const proxyUrl = localStorage.getItem('corsProxyUrl') || '';
  const apiBaseUrl = 'https://9574-2405-201-e01c-b2bd-d926-14ba-a311-6173.ngrok-free.app';
  
  if (useProxy && proxyUrl) {
    return `${proxyUrl}${apiBaseUrl}`;
  }
  
  return apiBaseUrl;
};

/**
 * Function to fetch databases from the server
 * @param credentials Database connection credentials
 * @returns Promise with the list of databases
 */
export async function fetchDatabases(credentials: {
  db_type: string;
  host: string;
  port: string;
  username: string;
  password: string;
}) {
  try {
    const apiUrl = 'https://9574-2405-201-e01c-b2bd-d926-14ba-a311-6173.ngrok-free.app/database/connect';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch databases');
    }

    const data = await response.json();
    
    if (data.status === 'success' && Array.isArray(data.databases)) {
      return data.databases;
    } else {
      throw new Error(data.message || 'Invalid response format');
    }
  } catch (error) {
    console.error('Error fetching databases:', error);
    if (error instanceof Error) {
      throw new Error(`Unable to connect to database: ${error.message}`);
    } else {
      throw new Error('Unable to connect to database: Unknown error');
    }
  }
}

/**
 * Function to select a database
 * @param connectionId The ID of the connection
 * @param databaseName The name of the database to select
 * @returns Promise with the selection result
 */
export async function selectDatabase(connectionId: string, databaseName: string) {
  // This is a mock implementation since we don't have a real endpoint for this yet
  console.log(`Selecting database ${databaseName} for connection ${connectionId}`);
  return { success: true, message: `Database ${databaseName} selected` };
}

/**
 * Function to fetch tables from the selected database
 * @param credentials Database connection credentials with selected database
 * @returns Promise with the list of tables
 */
export async function fetchDatabaseTables(credentials: {
  db_type: string;
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}) {
  try {
    const apiUrl = 'https://9574-2405-201-e01c-b2bd-d926-14ba-a311-6173.ngrok-free.app/database/select-database';
    
    console.log("Fetching tables with credentials:", JSON.stringify(credentials, null, 2));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch tables');
    }

    const data = await response.json();
    
    console.log("Tables response:", data);
    
    if (data.status === 'success' && Array.isArray(data.tables)) {
      return data.tables;
    } else {
      throw new Error(data.message || 'Invalid response format');
    }
  } catch (error) {
    console.error('Error fetching tables:', error);
    if (error instanceof Error) {
      throw new Error(`Unable to fetch tables: ${error.message}`);
    } else {
      throw new Error('Unable to fetch tables: Unknown error');
    }
  }
}

/**
 * Function to preview table data
 * @param tableName The name of the table to preview
 * @returns Promise with the table data
 */
export async function fetchTablePreview(tableName: string) {
  try {
    const apiUrl = 'https://9574-2405-201-e01c-b2bd-d926-14ba-a311-6173.ngrok-free.app/database/preview-table';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ table_name: tableName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch table preview');
    }

    const data = await response.json();
    
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error fetching table preview:', error);
    if (error instanceof Error) {
      throw new Error(`Unable to fetch table preview: ${error.message}`);
    } else {
      throw new Error('Unable to fetch table preview: Unknown error');
    }
  }
}
