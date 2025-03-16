
// Database client implementation
import { toast } from "@/hooks/use-toast";

export interface DatabaseCredentials {
  host?: string;
  port?: string;
  database?: string;
  username?: string;
  password?: string;
  connectionType: string;
  db_type: string;
}

export interface DatabaseTable {
  name: string;
  columns: string[];
}

export interface SchemaInfo {
  name: string;
  tables: DatabaseTable[];
}

export interface ApiResponse {
  success: boolean;
  message: string; // Changed from optional to required
  data?: any;
}

// Base API URL for database operations
const API_BASE_URL = "https://1238-2405-201-e01c-b2bd-452d-4549-3b7c-f867.ngrok-free.app/database";

// Test database connection
export async function testDatabaseConnection(credentials: DatabaseCredentials): Promise<ApiResponse> {
  console.log("Testing connection with credentials:", JSON.stringify(credentials, null, 2));
  
  try {
    const response = await fetch(`${API_BASE_URL}/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    console.log("Raw response:", response);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Connection test failed:", errorText);
      return {
        success: false,
        message: `Failed to connect: ${response.statusText} (${response.status})`,
      };
    }

    const result = await response.json();
    console.log("Connection test result:", result);
    
    // Ensure we have a consistent response format with required message
    return {
      success: result.success === true,
      message: result.message || (result.success ? "Successfully connected" : "Connection failed"),
      data: result.data || {},
    };
  } catch (error) {
    console.error("Connection test error:", error);
    return {
      success: false,
      message: `Connection error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// Select database
export async function selectDatabase(credentials: DatabaseCredentials): Promise<ApiResponse> {
  console.log("Selecting database with credentials:", JSON.stringify(credentials, null, 2));
  
  try {
    const response = await fetch(`${API_BASE_URL}/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Database selection failed:", errorText);
      return {
        success: false,
        message: `Failed to select database: ${response.statusText} (${response.status})`,
      };
    }

    const result = await response.json();
    console.log("Database selection result:", result);
    
    return {
      success: result.success === true,
      message: result.message || (result.success ? `Database ${credentials.database} selected` : "Database selection failed"),
      data: result.data || {},
    };
  } catch (error) {
    console.error("Database selection error:", error);
    return {
      success: false,
      message: `Database selection error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// Fetch database schemas
export async function fetchDatabaseSchemas(credentials: DatabaseCredentials): Promise<SchemaInfo[]> {
  console.log("Fetching schemas for database:", credentials.database);
  
  try {
    // First ensure we're connected to the database
    await selectDatabase(credentials);
    
    // Then fetch schemas
    const response = await fetch(`${API_BASE_URL}/schemas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        host: credentials.host,
        port: credentials.port,
        database: credentials.database,
        username: credentials.username,
        password: credentials.password,
        db_type: credentials.db_type,
      }),
    });

    if (!response.ok) {
      console.error("Failed to fetch schemas:", response.statusText);
      
      // If we can't fetch real schemas, return mock data for development
      return getMockSchemas(credentials.database || "");
    }

    const result = await response.json();
    console.log("Fetched schemas result:", result);
    
    if (result.success === true && Array.isArray(result.data)) {
      return result.data;
    } else if (result.success === true && result.data && typeof result.data === 'object') {
      // Transform the schema data into the expected format if needed
      const schemas: SchemaInfo[] = [];
      
      // Handle different response formats
      if (result.data.schemas && Array.isArray(result.data.schemas)) {
        return result.data.schemas;
      }
      
      // If we don't have properly formatted data, return mock data
      return getMockSchemas(credentials.database || "");
    } else {
      console.warn("Unexpected schema data format:", result);
      return getMockSchemas(credentials.database || "");
    }
  } catch (error) {
    console.error("Error fetching schemas:", error);
    
    // Return mock schemas for development/demo
    return getMockSchemas(credentials.database || "");
  }
}

// Fetch sample data from a table
export async function fetchTableSampleData(
  credentials: DatabaseCredentials,
  schema: string,
  table: string,
  limit: number = 50
): Promise<{ columns: string[]; rows: any[][] }> {
  console.log(`Fetching sample data for ${schema}.${table} (limit: ${limit})`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/sample`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        host: credentials.host,
        port: credentials.port,
        database: credentials.database,
        username: credentials.username,
        password: credentials.password,
        db_type: credentials.db_type,
        schema: schema,
        table: table,
        limit: limit,
      }),
    });

    if (!response.ok) {
      console.error("Failed to fetch sample data:", response.statusText);
      // Return mock data for development
      return getMockTableData(table);
    }

    const result = await response.json();
    console.log("Sample data result:", result);
    
    if (result.success === true && result.data) {
      // Handle different response formats
      if (Array.isArray(result.data.columns) && Array.isArray(result.data.rows)) {
        return {
          columns: result.data.columns,
          rows: result.data.rows,
        };
      } else if (Array.isArray(result.data)) {
        // If it's just an array of objects, extract columns and rows
        if (result.data.length === 0) {
          return { columns: [], rows: [] };
        }
        
        const columns = Object.keys(result.data[0]);
        const rows = result.data.map((row: any) => columns.map(col => row[col]));
        
        return { columns, rows };
      }
    }
    
    // Fallback to mock data
    return getMockTableData(table);
  } catch (error) {
    console.error("Error fetching sample data:", error);
    return getMockTableData(table);
  }
}

// Process data transformation
export async function processDataTransformation(
  instruction: string,
  tableName: string,
  schemaName: string
): Promise<{ success: boolean; message: string }> {
  console.log(`Processing transformation: "${instruction}" on ${schemaName}.${tableName}`);
  
  try {
    // Determine if the instruction is SQL or natural language
    const isSQL = instruction.trim().toUpperCase().startsWith("SELECT") || 
                  instruction.trim().toUpperCase().startsWith("UPDATE") ||
                  instruction.trim().toUpperCase().startsWith("INSERT") ||
                  instruction.trim().toUpperCase().startsWith("DELETE") ||
                  instruction.trim().toUpperCase().startsWith("ALTER");

    const endpoint = isSQL ? `${API_BASE_URL}/execute-sql` : `${API_BASE_URL}/transform`;
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instruction: instruction,
        table_name: tableName,
        schema_name: schemaName,
        sql: isSQL ? instruction : undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Transformation processing failed:", errorText);
      return {
        success: false,
        message: `Failed to process: ${response.statusText} (${response.status})`,
      };
    }

    const result = await response.json();
    console.log("Transformation result:", result);
    
    return {
      success: result.success === true,
      message: result.message || (result.success ? "Transformation completed successfully" : "Transformation failed"),
    };
  } catch (error) {
    console.error("Transformation error:", error);
    return {
      success: false,
      message: `Transformation error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// Mock schemas for development and testing
function getMockSchemas(database: string): SchemaInfo[] {
  console.log("Using mock schemas for database:", database);
  
  // Base tables that all databases have
  const commonTables = [
    { name: "users", columns: ["id", "username", "email", "created_at"] },
    { name: "products", columns: ["id", "name", "price", "category_id"] },
    { name: "orders", columns: ["id", "user_id", "total", "status", "created_at"] },
  ];
  
  // Specific tables based on the database name
  const databaseSpecificTables: Record<string, DatabaseTable[]> = {
    "airportdb": [
      { name: "airlines", columns: ["id", "name", "country", "active"] },
      { name: "airports", columns: ["id", "code", "name", "city", "country", "elevation"] },
      { name: "routes", columns: ["id", "airline_id", "src_airport", "dst_airport", "codeshare", "stops"] },
      { name: "flights", columns: ["id", "flight_number", "airline_id", "departure_airport", "arrival_airport", "departure_time", "arrival_time"] },
      { name: "planes", columns: ["id", "type", "manufacturer", "capacity"] },
    ],
    "mysql": [
      { name: "user", columns: ["Host", "User", "Password", "Select_priv", "Insert_priv", "Update_priv"] },
      { name: "db", columns: ["Host", "Db", "User", "Select_priv", "Insert_priv", "Update_priv"] },
      { name: "tables_priv", columns: ["Host", "Db", "User", "Table_name", "Grantor", "Timestamp"] },
    ],
    "information_schema": [
      { name: "tables", columns: ["table_catalog", "table_schema", "table_name", "table_type"] },
      { name: "columns", columns: ["table_catalog", "table_schema", "table_name", "column_name", "data_type"] },
      { name: "statistics", columns: ["table_catalog", "table_schema", "table_name", "non_unique", "index_name"] },
    ]
  };
  
  // Create schemas based on database type
  let schemas: SchemaInfo[] = [];
  
  if (database === "airportdb") {
    schemas = [
      { name: "public", tables: databaseSpecificTables["airportdb"] || [] },
      { name: "information_schema", tables: databaseSpecificTables["information_schema"] || [] },
    ];
  } else if (database === "mysql") {
    schemas = [
      { name: "mysql", tables: databaseSpecificTables["mysql"] || [] },
      { name: "information_schema", tables: databaseSpecificTables["information_schema"] || [] },
    ];
  } else {
    // Generic schema for any other database
    schemas = [
      { name: "public", tables: commonTables },
      { name: "information_schema", tables: databaseSpecificTables["information_schema"] || [] },
    ];
  }
  
  return schemas;
}

// Mock table data for development and testing
function getMockTableData(tableName: string): { columns: string[]; rows: any[][] } {
  console.log("Using mock data for table:", tableName);
  
  // Define mock data for specific tables
  const mockTables: Record<string, { columns: string[]; rows: any[][] }> = {
    "users": {
      columns: ["id", "username", "email", "created_at"],
      rows: [
        [1, "john_doe", "john@example.com", "2023-01-15 08:30:00"],
        [2, "jane_smith", "jane@example.com", "2023-01-16 09:45:00"],
        [3, "bob_johnson", "bob@example.com", "2023-01-17 10:15:00"],
      ]
    },
    "products": {
      columns: ["id", "name", "price", "category_id"],
      rows: [
        [1, "Laptop", 1299.99, 1],
        [2, "Smartphone", 899.99, 1],
        [3, "Headphones", 199.99, 2],
      ]
    },
    "airlines": {
      columns: ["id", "name", "country", "active"],
      rows: [
        [1, "American Airlines", "USA", "Y"],
        [2, "Lufthansa", "Germany", "Y"],
        [3, "Singapore Airlines", "Singapore", "Y"],
        [4, "Emirates", "UAE", "Y"],
        [5, "Qantas", "Australia", "Y"],
      ]
    },
    "airports": {
      columns: ["id", "code", "name", "city", "country", "elevation"],
      rows: [
        [1, "JFK", "John F. Kennedy International", "New York", "USA", 13],
        [2, "LAX", "Los Angeles International", "Los Angeles", "USA", 125],
        [3, "LHR", "Heathrow Airport", "London", "UK", 83],
        [4, "CDG", "Charles de Gaulle Airport", "Paris", "France", 119],
        [5, "SIN", "Singapore Changi Airport", "Singapore", "Singapore", 7],
      ]
    },
    "routes": {
      columns: ["id", "airline_id", "src_airport", "dst_airport", "codeshare", "stops"],
      rows: [
        [1, 1, "JFK", "LAX", "N", 0],
        [2, 1, "LAX", "JFK", "N", 0],
        [3, 2, "LHR", "CDG", "Y", 0],
        [4, 3, "SIN", "LHR", "N", 1],
        [5, 4, "DXB", "JFK", "N", 0],
      ]
    }
  };
  
  // Return the corresponding mock data or generic data
  return mockTables[tableName] || {
    columns: ["id", "name", "description", "created_at"],
    rows: [
      [1, "Sample 1", "This is a sample record", "2023-03-01 12:00:00"],
      [2, "Sample 2", "Another sample record", "2023-03-02 13:30:00"],
      [3, "Sample 3", "Yet another sample record", "2023-03-03 14:45:00"],
    ]
  };
}
