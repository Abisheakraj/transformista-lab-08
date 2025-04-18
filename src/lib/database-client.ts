
// Remove unused imports
export type DatabaseCredentials = {
  host?: string;
  port?: string;
  database?: string;
  username?: string;
  password?: string;
  connectionType: string;
  db_type: string;
};

export type SchemaInfo = {
  name: string;
  tables: {
    name: string;
    columns: {
      name: string;
      type: string;
    }[];
  }[];
};

const apiUrl = "https://9574-2405-201-e01c-b2bd-d926-14ba-a311-6173.ngrok-free.app";

// Function to test database connection
export const testDatabaseConnection = async (credentials: DatabaseCredentials): Promise<{ success: boolean; message?: string; data?: any }> => {
  try {
    const response = await fetch(`${apiUrl}/database/test-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        db_type: credentials.db_type || credentials.connectionType,
        host: credentials.host,
        port: credentials.port,
        username: credentials.username,
        password: credentials.password,
        database: credentials.database
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to connect: ${errorText}`);
    }

    const data = await response.json();
    return { success: data.status === "success", message: data.message, data: data.data };
  } catch (error: any) {
    console.error("Connection test failed:", error);
    return { success: false, message: error.message || "Connection test failed" };
  }
};

// Function to fetch database schemas
export const fetchDatabaseSchemas = async (connectionId: string): Promise<{ success: boolean; message?: string; data?: SchemaInfo[] }> => {
  try {
    const response = await fetch(`${apiUrl}/database/get-schema`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ connection_id: connectionId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch schema: ${errorText}`);
    }

    const data = await response.json();
    if (data.status === "success" && Array.isArray(data.schema)) {
      return { success: true, data: data.schema };
    } else {
      return { success: false, message: data.message || "Failed to fetch database schema", data: [] };
    }
  } catch (error: any) {
    console.error("Schema fetch failed:", error);
    return { success: false, message: error.message || "Failed to fetch database schema", data: [] };
  }
};

// Function to fetch sample data from a table
export const fetchTableSampleData = async (credentials: DatabaseCredentials, schema: string, table: string, limit: number): Promise<{ columns: string[]; rows: any[][] } | null> => {
  try {
    const response = await fetch(`${apiUrl}/database/get-table-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        db_type: credentials.db_type || credentials.connectionType,
        host: credentials.host,
        port: credentials.port,
        username: credentials.username,
        password: credentials.password,
        database: credentials.database,
        schema: schema,
        table: table,
        limit: limit
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch table data: ${errorText}`);
    }

    const data = await response.json();
    if (data.status === "success" && data.data) {
      return data.data;
    } else {
      console.warn("Failed to fetch table data:", data.message);
      return null;
    }
  } catch (error: any) {
    console.error("Table data fetch failed:", error);
    return null;
  }
};

// Function to process data transformation
export const processDataTransformation = async (instruction: string, tableName: string, schemaName: string): Promise<{ success: boolean; message: string } | null> => {
    try {
        const response = await fetch(`${apiUrl}/database/transform-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                instruction: instruction,
                table_name: tableName,
                schema_name: schemaName
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Transformation failed: ${errorText}`);
        }

        const data = await response.json();
        if (data.status === "success") {
            return { success: true, message: data.message };
        } else {
            return { success: false, message: data.message || "Transformation failed" };
        }
    } catch (error: any) {
        console.error("Transformation error:", error);
        return { success: false, message: error.message || "Transformation failed" };
    }
};

export const selectDatabaseAndGetTables = async (credentials: DatabaseCredentials): Promise<string[]> => {
  console.log("SENDING API CALL: Selecting database and fetching tables:", {
    database: credentials.database,
    connectionType: credentials.connectionType 
  });
  
  try {
    console.log("Making API call to:", `${apiUrl}/database/select-database`);
    console.log("With request body:", JSON.stringify({
      db_type: credentials.db_type || credentials.connectionType,
      host: credentials.host,
      port: credentials.port,
      username: credentials.username,
      password: credentials.password,
      database: credentials.database
    }, null, 2));
    
    const response = await fetch(`${apiUrl}/database/select-database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        db_type: credentials.db_type || credentials.connectionType,
        host: credentials.host,
        port: credentials.port,
        username: credentials.username,
        password: credentials.password,
        database: credentials.database
      }),
    });

    console.log("Select database response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Database selection failed:", errorText);
      throw new Error(`Failed to select database: ${errorText}`);
    }

    const data = await response.json();
    console.log("Select database full response:", data);
    
    if (data.tables && Array.isArray(data.tables)) {
      console.log("Found tables in response:", data.tables);
      return data.tables;
    } else if (data.status === "success" && data.tables === undefined) {
      console.warn("Success status but no tables array in response, making follow-up call to fetch tables");
      
      // If the API doesn't return tables directly, make a follow-up call to get tables
      const tableListResponse = await fetch(`${apiUrl}/database/get-tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          db_type: credentials.db_type || credentials.connectionType,
          host: credentials.host,
          port: credentials.port,
          username: credentials.username,
          password: credentials.password,
          database: credentials.database
        }),
      });
      
      if (!tableListResponse.ok) {
        throw new Error("Failed to fetch tables after database selection");
      }
      
      const tableData = await tableListResponse.json();
      console.log("Follow-up tables response:", tableData);
      
      if (tableData.tables && Array.isArray(tableData.tables)) {
        return tableData.tables;
      }
      
      return [];
    } else {
      throw new Error("Invalid response format from server");
    }
  } catch (error) {
    console.error("Error selecting database:", error);
    throw error;
  }
};

export const fetchTablePreview = async (tableName: string): Promise<{ columns: string[], rows: any[][] }> => {
  console.log("SENDING API CALL: Fetching table preview for:", tableName);
  
  try {
    console.log("API URL for preview:", `${apiUrl}/database/preview-table`);
    console.log("Request body:", JSON.stringify({ table_name: tableName }, null, 2));
    
    const response = await fetch(`${apiUrl}/database/preview-table`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        table_name: tableName
      }),
    });

    console.log("Table preview response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Table preview fetch failed:", errorText);
      throw new Error(`Failed to fetch table preview: ${errorText}`);
    }

    const data = await response.json();
    console.log("Table preview full response:", data);
    
    if (data.columns && data.rows && Array.isArray(data.columns) && Array.isArray(data.rows)) {
      return {
        columns: data.columns,
        rows: data.rows
      };
    } else {
      console.error("Invalid data format received:", data);
      throw new Error("Invalid preview data format from server");
    }
  } catch (error) {
    console.error("Error fetching table preview:", error);
    throw error;
  }
};
