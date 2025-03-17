
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
  const API_URL = "https://9574-2405-201-e01c-b2bd-d926-14ba-a311-6173.ngrok-free.app/api";
  
  console.log("Checking API server accessibility...");
  
  try {
    // Simple OPTIONS request to check CORS preflight
    const response = await fetch(`${API_URL}/health-check`, {
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
