
// Database client for handling database connections and queries

export interface DatabaseCredentials {
  host: string;
  port?: string;
  database?: string;
  username?: string;
  password?: string;
  connectionType: string;
  db_type?: string;
}

export interface SchemaInfo {
  name: string;
  tables: TableInfo[];
}

export interface TableInfo {
  name: string;
  schema: string;
  columns: ColumnInfo[];
  primaryKey?: string[];
  foreignKeys?: ForeignKeyInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

export interface ForeignKeyInfo {
  columns: string[];
  referencedTable: string;
  referencedColumns: string[];
}

export interface ConnectionStatus {
  success: boolean;
  message: string;
}

export interface DatabaseSampleData {
  columns: string[];
  rows: any[][];
}

// API base URL
const API_BASE_URL = "https://1280-2405-201-e01c-b2bd-2520-45f9-1b7c-f867.ngrok-free.app";

/**
 * Test a database connection
 */
export const testDatabaseConnection = async (credentials: DatabaseCredentials): Promise<ConnectionStatus> => {
  console.log("Testing connection:", credentials);
  
  try {
    const response = await fetch(`${API_BASE_URL}/database/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        db_type: credentials.connectionType.toLowerCase(),
        host: credentials.host,
        port: credentials.port,
        username: credentials.username,
        password: credentials.password
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: `Successfully connected to ${credentials.host}:${credentials.port}`
      };
    } else {
      return {
        success: false,
        message: data.error || `Failed to connect to database. Please check your credentials.`
      };
    }
  } catch (error) {
    console.error("Connection error:", error);
    return {
      success: false,
      message: `Connection error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Select a database after connection
 */
export const selectDatabase = async (credentials: DatabaseCredentials): Promise<ConnectionStatus> => {
  console.log("Selecting database:", credentials.database);
  
  try {
    const response = await fetch(`${API_BASE_URL}/database/select-database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        db_type: credentials.connectionType.toLowerCase(),
        host: credentials.host,
        port: credentials.port,
        username: credentials.username,
        password: credentials.password,
        database: credentials.database
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: `Successfully selected database ${credentials.database}`
      };
    } else {
      return {
        success: false,
        message: data.error || `Failed to select database. Please check if the database exists.`
      };
    }
  } catch (error) {
    console.error("Database selection error:", error);
    return {
      success: false,
      message: `Database selection error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Fetch database schemas
 */
export const fetchDatabaseSchemas = async (credentials: DatabaseCredentials): Promise<SchemaInfo[]> => {
  console.log("Fetching schemas for:", credentials);
  
  try {
    // First select the database
    const selectionResult = await selectDatabase(credentials);
    
    if (!selectionResult.success) {
      throw new Error(selectionResult.message);
    }
    
    // For this API, we need to use a different approach
    // We'll get all tables and organize them by schema
    const tables = await fetchTables(credentials);
    
    if (!tables || tables.length === 0) {
      return [];
    }
    
    // Group tables by schema
    const schemaMap = new Map<string, TableInfo[]>();
    
    for (const table of tables) {
      const schemaName = table.schema || credentials.database || 'default';
      
      if (!schemaMap.has(schemaName)) {
        schemaMap.set(schemaName, []);
      }
      
      schemaMap.get(schemaName)!.push(table);
    }
    
    // Convert map to array of SchemaInfo
    const schemas: SchemaInfo[] = [];
    
    schemaMap.forEach((tables, name) => {
      schemas.push({
        name,
        tables
      });
    });
    
    return schemas;
  } catch (error) {
    console.error('Error fetching schemas:', error);
    throw error;
  }
};

/**
 * Fetch tables from the database
 */
const fetchTables = async (credentials: DatabaseCredentials): Promise<TableInfo[]> => {
  try {
    // For now we'll use mock data, but in a real implementation
    // this would make an API call to get tables
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock tables based on the airportdb from the example
    return [
      {
        name: 'airline',
        schema: credentials.database || 'airportdb',
        columns: [
          { name: 'airline_id', type: 'INT', nullable: false, isPrimaryKey: true, isForeignKey: false },
          { name: 'name', type: 'VARCHAR', nullable: false, isPrimaryKey: false, isForeignKey: false },
          { name: 'alias', type: 'VARCHAR', nullable: true, isPrimaryKey: false, isForeignKey: false },
          { name: 'iata', type: 'VARCHAR', nullable: true, isPrimaryKey: false, isForeignKey: false },
          { name: 'icao', type: 'VARCHAR', nullable: true, isPrimaryKey: false, isForeignKey: false },
          { name: 'callsign', type: 'VARCHAR', nullable: true, isPrimaryKey: false, isForeignKey: false },
          { name: 'country', type: 'VARCHAR', nullable: true, isPrimaryKey: false, isForeignKey: false },
          { name: 'active', type: 'VARCHAR', nullable: false, isPrimaryKey: false, isForeignKey: false },
          { name: 'base_airport', type: 'VARCHAR', nullable: true, isPrimaryKey: false, isForeignKey: false }
        ],
        primaryKey: ['airline_id'],
        foreignKeys: []
      },
      {
        name: 'airport',
        schema: credentials.database || 'airportdb',
        columns: [
          { name: 'airport_id', type: 'INT', nullable: false, isPrimaryKey: true, isForeignKey: false },
          { name: 'name', type: 'VARCHAR', nullable: false, isPrimaryKey: false, isForeignKey: false },
          { name: 'city', type: 'VARCHAR', nullable: true, isPrimaryKey: false, isForeignKey: false },
          { name: 'country', type: 'VARCHAR', nullable: true, isPrimaryKey: false, isForeignKey: false },
          { name: 'iata', type: 'VARCHAR', nullable: true, isPrimaryKey: false, isForeignKey: false },
          { name: 'icao', type: 'VARCHAR', nullable: true, isPrimaryKey: false, isForeignKey: false },
          { name: 'latitude', type: 'DECIMAL', nullable: true, isPrimaryKey: false, isForeignKey: false },
          { name: 'longitude', type: 'DECIMAL', nullable: true, isPrimaryKey: false, isForeignKey: false },
          { name: 'altitude', type: 'INT', nullable: true, isPrimaryKey: false, isForeignKey: false },
          { name: 'timezone', type: 'DECIMAL', nullable: true, isPrimaryKey: false, isForeignKey: false }
        ],
        primaryKey: ['airport_id'],
        foreignKeys: []
      },
      {
        name: 'flight',
        schema: credentials.database || 'airportdb',
        columns: [
          { name: 'flight_id', type: 'INT', nullable: false, isPrimaryKey: true, isForeignKey: false },
          { name: 'airline_id', type: 'INT', nullable: false, isPrimaryKey: false, isForeignKey: true },
          { name: 'source_airport', type: 'INT', nullable: false, isPrimaryKey: false, isForeignKey: true },
          { name: 'destination_airport', type: 'INT', nullable: false, isPrimaryKey: false, isForeignKey: true },
          { name: 'departure_time', type: 'DATETIME', nullable: false, isPrimaryKey: false, isForeignKey: false },
          { name: 'arrival_time', type: 'DATETIME', nullable: false, isPrimaryKey: false, isForeignKey: false },
          { name: 'flight_number', type: 'VARCHAR', nullable: false, isPrimaryKey: false, isForeignKey: false },
          { name: 'status', type: 'VARCHAR', nullable: false, isPrimaryKey: false, isForeignKey: false }
        ],
        primaryKey: ['flight_id'],
        foreignKeys: [
          {
            columns: ['airline_id'],
            referencedTable: 'airline',
            referencedColumns: ['airline_id']
          },
          {
            columns: ['source_airport'],
            referencedTable: 'airport',
            referencedColumns: ['airport_id']
          },
          {
            columns: ['destination_airport'],
            referencedTable: 'airport',
            referencedColumns: ['airport_id']
          }
        ]
      }
    ];
  } catch (error) {
    console.error('Error fetching tables:', error);
    throw error;
  }
};

/**
 * Execute an SQL query
 */
export const executeQuery = async (credentials: DatabaseCredentials, query: string): Promise<any> => {
  console.log("Executing query:", query, "on", credentials);
  
  // This would be an API call in a real implementation
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock query result for demo purposes
  const mockResult = {
    columns: ["id", "name", "value"],
    rows: [
      [1, "Item 1", 10.5],
      [2, "Item 2", 20.75],
      [3, "Item 3", 15.3],
      [4, "Item 4", 30.0]
    ]
  };
  
  return mockResult;
};

/**
 * Fetch sample data from a table
 */
export const fetchTableSampleData = async (
  credentials: DatabaseCredentials, 
  schema: string, 
  table: string, 
  limit: number = 10
): Promise<DatabaseSampleData> => {
  console.log(`Fetching sample data for ${schema}.${table}`, credentials);
  
  try {
    const response = await fetch(`${API_BASE_URL}/database/preview-table`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        table_name: table
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch table data');
    }

    const data = await response.json();
    
    if (data && Array.isArray(data)) {
      // Extract columns from the first row
      const columns = data[0] ? Object.keys(data[0]) : [];
      
      // Convert rows to arrays
      const rows = data.map(row => columns.map(col => row[col]));
      
      return { columns, rows };
    }
    
    // If the API responds with a different format, handle accordingly
    return {
      columns: data.columns || [],
      rows: data.rows || []
    };
  } catch (error) {
    console.error('Error fetching table data:', error);
    
    // Fallback to mock data based on the requested table
    if (table === "airline") {
      return {
        columns: ["airline_id", "name", "alias", "iata", "icao", "callsign", "country", "active", "base_airport"],
        rows: [
          [1, "American Airlines", "AA", "AA", "AAL", "AMERICAN", "United States", "Y", "DFW"],
          [2, "Delta Air Lines", "DL", "DL", "DAL", "DELTA", "United States", "Y", "ATL"],
          [3, "United Airlines", "UA", "UA", "UAL", "UNITED", "United States", "Y", "ORD"],
          [4, "Lufthansa", "LH", "LH", "DLH", "LUFTHANSA", "Germany", "Y", "FRA"],
          [5, "Air France", "AF", "AF", "AFR", "AIRFRANCE", "France", "Y", "CDG"]
        ]
      };
    } else if (table === "airport") {
      return {
        columns: ["airport_id", "name", "city", "country", "iata", "icao", "latitude", "longitude", "altitude", "timezone"],
        rows: [
          [1, "Dallas/Fort Worth International Airport", "Dallas", "United States", "DFW", "KDFW", 32.8968, -97.038, 607, -6.0],
          [2, "Hartsfield–Jackson Atlanta International Airport", "Atlanta", "United States", "ATL", "KATL", 33.6367, -84.4281, 1026, -5.0],
          [3, "O'Hare International Airport", "Chicago", "United States", "ORD", "KORD", 41.9786, -87.9048, 672, -6.0],
          [4, "Frankfurt Airport", "Frankfurt", "Germany", "FRA", "EDDF", 50.0333, 8.5706, 364, 1.0],
          [5, "Charles de Gaulle Airport", "Paris", "France", "CDG", "LFPG", 49.0128, 2.55, 392, 1.0]
        ]
      };
    } else {
      return {
        columns: ["id", "name", "value"],
        rows: [
          [1, "Row 1", 10.5],
          [2, "Row 2", 20.0],
          [3, "Row 3", 30.75],
          [4, "Row 4", 15.25],
          [5, "Row 5", 50.0]
        ]
      };
    }
  }
};

/**
 * Process data transformation instructions
 */
export const processDataTransformation = async (
  instruction: string,
  tableName: string,
  schema: string
): Promise<{ success: boolean; message: string; }> => {
  console.log(`Processing instruction for ${schema}.${tableName}:`, instruction);
  
  try {
    const response = await fetch(`${API_BASE_URL}/database/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instruction,
        table_name: tableName,
        schema
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: data.message || `Successfully processed instruction for ${tableName}`
      };
    } else {
      return {
        success: false,
        message: data.error || `Failed to process instruction. Please try again.`
      };
    }
  } catch (error) {
    console.error("Process error:", error);
    return {
      success: false,
      message: `Processing error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};
