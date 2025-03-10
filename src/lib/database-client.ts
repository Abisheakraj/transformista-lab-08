
// Database client for handling database connections and queries

export interface DatabaseCredentials {
  host: string;
  port?: string;
  database: string;
  username?: string;
  password?: string;
  connectionType: string;
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

// Mock API functions for demonstration

/**
 * Test a database connection
 */
export const testDatabaseConnection = async (credentials: DatabaseCredentials): Promise<ConnectionStatus> => {
  console.log("Testing connection:", credentials);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demo purposes, simulate successful connection for most cases
  const isSuccessful = Math.random() < 0.8; // 80% success rate
  
  if (isSuccessful) {
    return {
      success: true,
      message: `Successfully connected to ${credentials.database} on ${credentials.host}`
    };
  } else {
    return {
      success: false,
      message: `Failed to connect to ${credentials.database}. Please check your credentials and try again.`
    };
  }
};

/**
 * Fetch database schemas
 */
export const fetchDatabaseSchemas = async (credentials: DatabaseCredentials): Promise<SchemaInfo[]> => {
  console.log("Fetching schemas for:", credentials);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock schema data
  const mockSchemas: SchemaInfo[] = [
    {
      name: "public",
      tables: [
        {
          name: "customers",
          schema: "public",
          columns: [
            { name: "id", type: "INTEGER", nullable: false, isPrimaryKey: true, isForeignKey: false },
            { name: "name", type: "VARCHAR", nullable: false, isPrimaryKey: false, isForeignKey: false },
            { name: "email", type: "VARCHAR", nullable: true, isPrimaryKey: false, isForeignKey: false },
            { name: "created_at", type: "TIMESTAMP", nullable: true, isPrimaryKey: false, isForeignKey: false }
          ],
          primaryKey: ["id"],
          foreignKeys: []
        },
        {
          name: "orders",
          schema: "public",
          columns: [
            { name: "id", type: "INTEGER", nullable: false, isPrimaryKey: true, isForeignKey: false },
            { name: "customer_id", type: "INTEGER", nullable: false, isPrimaryKey: false, isForeignKey: true },
            { name: "total", type: "DECIMAL", nullable: false, isPrimaryKey: false, isForeignKey: false },
            { name: "status", type: "VARCHAR", nullable: false, isPrimaryKey: false, isForeignKey: false },
            { name: "created_at", type: "TIMESTAMP", nullable: true, isPrimaryKey: false, isForeignKey: false }
          ],
          primaryKey: ["id"],
          foreignKeys: [
            {
              columns: ["customer_id"],
              referencedTable: "customers",
              referencedColumns: ["id"]
            }
          ]
        }
      ]
    },
    {
      name: "sales",
      tables: [
        {
          name: "products",
          schema: "sales",
          columns: [
            { name: "id", type: "INTEGER", nullable: false, isPrimaryKey: true, isForeignKey: false },
            { name: "name", type: "VARCHAR", nullable: false, isPrimaryKey: false, isForeignKey: false },
            { name: "price", type: "DECIMAL", nullable: false, isPrimaryKey: false, isForeignKey: false },
            { name: "category", type: "VARCHAR", nullable: true, isPrimaryKey: false, isForeignKey: false }
          ],
          primaryKey: ["id"],
          foreignKeys: []
        },
        {
          name: "order_items",
          schema: "sales",
          columns: [
            { name: "id", type: "INTEGER", nullable: false, isPrimaryKey: true, isForeignKey: false },
            { name: "order_id", type: "INTEGER", nullable: false, isPrimaryKey: false, isForeignKey: true },
            { name: "product_id", type: "INTEGER", nullable: false, isPrimaryKey: false, isForeignKey: true },
            { name: "quantity", type: "INTEGER", nullable: false, isPrimaryKey: false, isForeignKey: false },
            { name: "price", type: "DECIMAL", nullable: false, isPrimaryKey: false, isForeignKey: false }
          ],
          primaryKey: ["id"],
          foreignKeys: [
            {
              columns: ["order_id"],
              referencedTable: "orders",
              referencedColumns: ["id"]
            },
            {
              columns: ["product_id"],
              referencedTable: "products",
              referencedColumns: ["id"]
            }
          ]
        }
      ]
    }
  ];
  
  return mockSchemas;
};

/**
 * Execute an SQL query
 */
export const executeQuery = async (credentials: DatabaseCredentials, query: string): Promise<any> => {
  console.log("Executing query:", query, "on", credentials);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
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
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate mock data based on the table name
  if (table === "customers") {
    return {
      columns: ["id", "name", "email", "created_at"],
      rows: [
        [1, "John Doe", "john@example.com", "2023-01-15 09:30:00"],
        [2, "Jane Smith", "jane@example.com", "2023-02-20 14:45:00"],
        [3, "Bob Johnson", "bob@example.com", "2023-03-05 11:15:00"],
        [4, "Alice Brown", "alice@example.com", "2023-04-10 16:20:00"],
        [5, "Charlie Wilson", "charlie@example.com", "2023-05-25 10:00:00"]
      ]
    };
  } else if (table === "orders") {
    return {
      columns: ["id", "customer_id", "total", "status", "created_at"],
      rows: [
        [101, 1, 150.50, "completed", "2023-02-01 10:30:00"],
        [102, 2, 75.25, "pending", "2023-03-15 09:15:00"],
        [103, 1, 220.00, "completed", "2023-04-20 14:40:00"],
        [104, 3, 45.99, "cancelled", "2023-05-05 16:10:00"],
        [105, 2, 180.75, "completed", "2023-06-10 11:55:00"]
      ]
    };
  } else if (table === "products") {
    return {
      columns: ["id", "name", "price", "category"],
      rows: [
        [201, "Laptop", 999.99, "Electronics"],
        [202, "Smartphone", 699.99, "Electronics"],
        [203, "Coffee Maker", 129.50, "Appliances"],
        [204, "Running Shoes", 89.95, "Apparel"],
        [205, "Desk Chair", 199.99, "Furniture"]
      ]
    };
  } else if (table === "order_items") {
    return {
      columns: ["id", "order_id", "product_id", "quantity", "price"],
      rows: [
        [301, 101, 201, 1, 999.99],
        [302, 101, 203, 1, 129.50],
        [303, 102, 202, 1, 699.99],
        [304, 103, 204, 2, 179.90],
        [305, 103, 205, 1, 199.99]
      ]
    };
  } else {
    // Default mock data for any other table
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
};
