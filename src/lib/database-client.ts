
// Database client utility functions

// Interface for database connection credentials
export interface DatabaseCredentials {
  host: string;
  port: string | number;
  database: string;
  username: string;
  password: string;
  connectionType: string;
}

// Interface for schema information
export interface DatabaseSchema {
  schemaName: string;
  tables: DatabaseTable[];
}

// Interface for database table
export interface DatabaseTable {
  name: string;
  columns: DatabaseColumn[];
  primaryKey?: DatabaseColumn;
  foreignKeys?: DatabaseForeignKey[];
}

// Interface for database column
export interface DatabaseColumn {
  name: string;
  dataType: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNullable: boolean;
  references?: {
    table: string;
    column: string;
  };
}

// Interface for foreign key relationships
export interface DatabaseForeignKey {
  name: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
}

// Interface for database connection status
export interface ConnectionStatus {
  success: boolean; 
  message: string;
  details?: any;
}

// Function to test database connection
export const testDatabaseConnection = async (credentials: DatabaseCredentials): Promise<ConnectionStatus> => {
  // In a real application, this would make an API call to test the connection
  // For demo purposes, we're simulating a response
  
  console.log("Testing connection to:", credentials);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For demo, return success most of the time but occasionally fail
  const isSuccessful = Math.random() > 0.15;
  
  if (isSuccessful) {
    return {
      success: true,
      message: `Successfully connected to ${credentials.database} on ${credentials.host}`,
      details: {
        serverVersion: getRandomDatabaseVersion(credentials.connectionType),
        connectionId: Math.floor(Math.random() * 10000),
        protocol: credentials.connectionType === 'mysql' ? 'TCP/IP' : 'Socket',
        tls: 'Enabled',
      }
    };
  } else {
    const errorMessages = [
      `Failed to connect to database: Authentication failed for user '${credentials.username}'`,
      `Connection refused. Check that the host and port are correct and that the database server is running.`,
      `Timeout error: The connection attempt failed because the server did not respond within the time limit.`,
      `Access denied for user '${credentials.username}' to database '${credentials.database}'`
    ];
    
    return {
      success: false,
      message: errorMessages[Math.floor(Math.random() * errorMessages.length)]
    };
  }
};

// Function to get schemas from a database
export const fetchDatabaseSchemas = async (credentials: DatabaseCredentials): Promise<DatabaseSchema[]> => {
  console.log("Fetching schemas from:", credentials);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Enhanced schema simulation with more realistic table structures
  return [
    {
      schemaName: "public",
      tables: [
        {
          name: "customers",
          columns: [
            {
              name: "id",
              dataType: "integer",
              isPrimaryKey: true,
              isForeignKey: false,
              isNullable: false
            },
            {
              name: "name",
              dataType: "varchar(255)",
              isPrimaryKey: false,
              isForeignKey: false,
              isNullable: false
            },
            {
              name: "email",
              dataType: "varchar(255)",
              isPrimaryKey: false,
              isForeignKey: false,
              isNullable: true
            },
            {
              name: "created_at",
              dataType: "timestamp",
              isPrimaryKey: false,
              isForeignKey: false,
              isNullable: true
            }
          ],
          primaryKey: {
            name: "id",
            dataType: "integer",
            isPrimaryKey: true,
            isForeignKey: false,
            isNullable: false
          }
        },
        {
          name: "orders",
          columns: [
            {
              name: "id",
              dataType: "integer",
              isPrimaryKey: true,
              isForeignKey: false,
              isNullable: false
            },
            {
              name: "customer_id",
              dataType: "integer",
              isPrimaryKey: false,
              isForeignKey: true,
              isNullable: false,
              references: {
                table: "customers",
                column: "id"
              }
            },
            {
              name: "amount",
              dataType: "decimal(10,2)",
              isPrimaryKey: false,
              isForeignKey: false,
              isNullable: false
            },
            {
              name: "order_date",
              dataType: "date",
              isPrimaryKey: false,
              isForeignKey: false,
              isNullable: false
            }
          ],
          primaryKey: {
            name: "id",
            dataType: "integer",
            isPrimaryKey: true,
            isForeignKey: false,
            isNullable: false
          },
          foreignKeys: [
            {
              name: "fk_customer_id",
              sourceColumn: "customer_id",
              targetTable: "customers",
              targetColumn: "id"
            }
          ]
        },
        {
          name: "products",
          columns: [
            {
              name: "id",
              dataType: "integer",
              isPrimaryKey: true,
              isForeignKey: false,
              isNullable: false
            },
            {
              name: "name",
              dataType: "varchar(255)",
              isPrimaryKey: false,
              isForeignKey: false,
              isNullable: false
            },
            {
              name: "price",
              dataType: "decimal(10,2)",
              isPrimaryKey: false,
              isForeignKey: false,
              isNullable: false
            },
            {
              name: "category",
              dataType: "varchar(100)",
              isPrimaryKey: false,
              isForeignKey: false,
              isNullable: true
            }
          ],
          primaryKey: {
            name: "id",
            dataType: "integer",
            isPrimaryKey: true,
            isForeignKey: false,
            isNullable: false
          }
        },
        {
          name: "order_items",
          columns: [
            {
              name: "id",
              dataType: "integer",
              isPrimaryKey: true,
              isForeignKey: false,
              isNullable: false
            },
            {
              name: "order_id",
              dataType: "integer",
              isPrimaryKey: false,
              isForeignKey: true,
              isNullable: false,
              references: {
                table: "orders",
                column: "id"
              }
            },
            {
              name: "product_id",
              dataType: "integer",
              isPrimaryKey: false,
              isForeignKey: true,
              isNullable: false,
              references: {
                table: "products",
                column: "id"
              }
            },
            {
              name: "quantity",
              dataType: "integer",
              isPrimaryKey: false,
              isForeignKey: false,
              isNullable: false
            },
            {
              name: "unit_price",
              dataType: "decimal(10,2)",
              isPrimaryKey: false,
              isForeignKey: false,
              isNullable: false
            }
          ],
          primaryKey: {
            name: "id",
            dataType: "integer",
            isPrimaryKey: true,
            isForeignKey: false,
            isNullable: false
          },
          foreignKeys: [
            {
              name: "fk_order_id",
              sourceColumn: "order_id",
              targetTable: "orders",
              targetColumn: "id"
            },
            {
              name: "fk_product_id",
              sourceColumn: "product_id",
              targetTable: "products",
              targetColumn: "id"
            }
          ]
        }
      ]
    },
    {
      schemaName: "analytics",
      tables: [
        {
          name: "customer_metrics",
          columns: [
            {
              name: "id",
              dataType: "integer",
              isPrimaryKey: true,
              isForeignKey: false,
              isNullable: false
            },
            {
              name: "customer_id",
              dataType: "integer",
              isPrimaryKey: false,
              isForeignKey: true,
              isNullable: false,
              references: {
                table: "customers",
                column: "id"
              }
            },
            {
              name: "lifetime_value",
              dataType: "decimal(12,2)",
              isPrimaryKey: false,
              isForeignKey: false,
              isNullable: true
            },
            {
              name: "last_purchase_date",
              dataType: "date",
              isPrimaryKey: false,
              isForeignKey: false,
              isNullable: true
            }
          ],
          primaryKey: {
            name: "id",
            dataType: "integer",
            isPrimaryKey: true,
            isForeignKey: false,
            isNullable: false
          },
          foreignKeys: [
            {
              name: "fk_analytics_customer_id",
              sourceColumn: "customer_id",
              targetTable: "public.customers",
              targetColumn: "id"
            }
          ]
        },
        {
          name: "sales_summary",
          columns: [
            {
              name: "id",
              dataType: "integer",
              isPrimaryKey: true,
              isForeignKey: false,
              isNullable: false
            },
            {
              name: "year",
              dataType: "integer",
              isPrimaryKey: false,
              isForeignKey: false,
              isNullable: false
            },
            {
              name: "month",
              dataType: "integer",
              isPrimaryKey: false,
              isForeignKey: false,
              isNullable: false
            },
            {
              name: "total_sales",
              dataType: "decimal(14,2)",
              isPrimaryKey: false,
              isForeignKey: false,
              isNullable: false
            },
            {
              name: "total_orders",
              dataType: "integer",
              isPrimaryKey: false,
              isForeignKey: false,
              isNullable: false
            }
          ],
          primaryKey: {
            name: "id",
            dataType: "integer",
            isPrimaryKey: true,
            isForeignKey: false,
            isNullable: false
          }
        }
      ]
    }
  ];
};

// Function to execute SQL queries
export const executeQuery = async (credentials: DatabaseCredentials, query: string): Promise<any[]> => {
  console.log("Executing query:", query);
  console.log("On database:", credentials);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Enhanced query result simulation based on the query
  if (query.toLowerCase().includes("select") && query.toLowerCase().includes("customers")) {
    return [
      { id: 1, name: "John Doe", email: "john@example.com", created_at: "2023-01-15T10:30:00Z" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", created_at: "2023-02-20T14:45:00Z" },
      { id: 3, name: "Bob Johnson", email: "bob@example.com", created_at: "2023-03-10T09:15:00Z" },
      { id: 4, name: "Alice Brown", email: "alice@example.com", created_at: "2023-04-05T11:20:00Z" },
      { id: 5, name: "Charlie Wilson", email: "charlie@example.com", created_at: "2023-05-12T16:30:00Z" }
    ];
  } else if (query.toLowerCase().includes("select") && query.toLowerCase().includes("orders")) {
    return [
      { id: 101, customer_id: 1, amount: 99.99, order_date: "2023-04-05" },
      { id: 102, customer_id: 1, amount: 45.50, order_date: "2023-05-12" },
      { id: 103, customer_id: 2, amount: 125.75, order_date: "2023-04-18" },
      { id: 104, customer_id: 3, amount: 55.25, order_date: "2023-05-22" },
      { id: 105, customer_id: 4, amount: 210.50, order_date: "2023-06-10" }
    ];
  } else if (query.toLowerCase().includes("select") && query.toLowerCase().includes("products")) {
    return [
      { id: 1, name: "Laptop", price: 1299.99, category: "Electronics" },
      { id: 2, name: "Smartphone", price: 799.99, category: "Electronics" },
      { id: 3, name: "Headphones", price: 149.99, category: "Audio" },
      { id: 4, name: "Coffee Maker", price: 89.99, category: "Kitchen" },
      { id: 5, name: "Running Shoes", price: 129.99, category: "Footwear" }
    ];
  }
  
  // Default empty result
  return [];
};

// Mock function to generate random database versions for the connection test
const getRandomDatabaseVersion = (dbType: string): string => {
  const versions: Record<string, string[]> = {
    mysql: ["5.7.38", "8.0.28", "8.0.33", "8.1.0"],
    postgresql: ["12.14", "13.10", "14.7", "15.3", "16.0"],
    oracle: ["19c", "21c", "23c"],
    mssql: ["SQL Server 2019", "SQL Server 2022"],
    mongodb: ["5.0.18", "6.0.8", "7.0.0"],
    sybase: ["16.0", "16.1"],
    snowflake: ["6.33.1", "7.0.0"],
    saphana: ["2.0 SPS 06", "2.0 SPS 07"]
  };
  
  const normalizedType = dbType.toLowerCase();
  let dbVersions = versions.mysql; // default
  
  if (normalizedType.includes("postgres")) {
    dbVersions = versions.postgresql;
  } else if (normalizedType.includes("oracle")) {
    dbVersions = versions.oracle;
  } else if (normalizedType.includes("sql server") || normalizedType.includes("mssql")) {
    dbVersions = versions.mssql;
  } else if (normalizedType.includes("mongo")) {
    dbVersions = versions.mongodb;
  } else if (normalizedType.includes("sybase")) {
    dbVersions = versions.sybase;
  } else if (normalizedType.includes("snowflake")) {
    dbVersions = versions.snowflake;
  } else if (normalizedType.includes("sap") || normalizedType.includes("hana")) {
    dbVersions = versions.saphana;
  }
  
  return dbVersions[Math.floor(Math.random() * dbVersions.length)];
};

// Function to get sample data from a table
export const fetchSampleData = async (
  credentials: DatabaseCredentials,
  schema: string,
  table: string,
  limit: number = 5
): Promise<any[]> => {
  // In a real app, this would construct and execute a query like:
  // SELECT * FROM {schema}.{table} LIMIT {limit}
  console.log(`Fetching sample data from ${schema}.${table} (limit ${limit})`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Enhanced sample data based on table name
  if (table === "customers") {
    return [
      { id: 1, name: "John Doe", email: "john@example.com", created_at: "2023-01-15T10:30:00Z" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", created_at: "2023-02-20T14:45:00Z" },
      { id: 3, name: "Bob Johnson", email: "bob@example.com", created_at: "2023-03-10T09:15:00Z" }
    ].slice(0, limit);
  }
  
  if (table === "orders") {
    return [
      { id: 101, customer_id: 1, amount: 99.99, order_date: "2023-04-05" },
      { id: 102, customer_id: 1, amount: 45.50, order_date: "2023-05-12" },
      { id: 103, customer_id: 2, amount: 125.75, order_date: "2023-04-18" }
    ].slice(0, limit);
  }
  
  if (table === "products") {
    return [
      { id: 1, name: "Laptop", price: 1299.99, category: "Electronics" },
      { id: 2, name: "Smartphone", price: 799.99, category: "Electronics" },
      { id: 3, name: "Headphones", price: 149.99, category: "Audio" }
    ].slice(0, limit);
  }
  
  // Default sample data for any other table
  return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
    id: i + 1,
    sample_column_1: `Value ${i + 1}`,
    sample_column_2: Math.random() * 1000,
    sample_date: new Date().toISOString().split('T')[0]
  }));
};

// Function to create a table mapping
export const createTableMapping = async (
  sourceCredentials: DatabaseCredentials,
  targetCredentials: DatabaseCredentials,
  mappings: {
    sourceSchema: string;
    sourceTable: string;
    targetSchema: string;
    targetTable: string;
    columnMappings: {
      sourceColumn: string;
      targetColumn: string;
      transformation?: string;
    }[];
  }[]
): Promise<{ success: boolean; message: string }> => {
  console.log("Creating table mappings:", mappings);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // For demo, always return success
  return {
    success: true,
    message: `Successfully created ${mappings.length} table mapping(s)`
  };
};

// Check if user is connected to Supabase
export const getSupabaseStatus = (): { connected: boolean; project?: string } => {
  // In a real implementation, this would check if the user is connected to Supabase
  // For demo purposes, we'll return connected: true
  return {
    connected: true,
    project: "quantum-etl"
  };
};

// Function to get all available tables from a database connection
export const getAllDatabaseTables = async (credentials: DatabaseCredentials): Promise<{
  schemaName: string;
  tables: string[];
}[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Return mock schemas and tables
  return [
    {
      schemaName: "public",
      tables: ["customers", "orders", "products", "order_items", "users", "inventory", "categories"]
    },
    {
      schemaName: "analytics",
      tables: ["customer_metrics", "sales_summary", "product_performance", "user_activity"]
    },
    {
      schemaName: "reports",
      tables: ["monthly_sales", "quarterly_results", "annual_summary"]
    }
  ];
};

// Function to create a data pipeline
export const createDataPipeline = async (
  pipelineConfig: {
    name: string;
    description: string;
    source: {
      type: string;
      credentials: DatabaseCredentials;
    };
    target: {
      type: string;
      credentials: DatabaseCredentials;
    };
    transformations: {
      type: string;
      config: any;
    }[];
    schedule?: {
      frequency: "once" | "hourly" | "daily" | "weekly" | "monthly";
      startTime?: string;
      daysOfWeek?: number[];
    };
  }
): Promise<{ success: boolean; pipelineId?: string; message: string }> => {
  console.log("Creating data pipeline:", pipelineConfig);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  // For demo, always return success
  return {
    success: true,
    pipelineId: `pipe_${Math.random().toString(36).substring(2, 15)}`,
    message: `Successfully created pipeline "${pipelineConfig.name}"`
  };
};

// Function to get data preview after transformation
export const getTransformationPreview = async (
  sourceData: any[],
  transformations: {
    type: string;
    config: any;
  }[]
): Promise<any[]> => {
  console.log("Getting transformation preview for:", sourceData.length, "records with", transformations.length, "transformations");
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1800));
  
  // Apply mock transformations (in a real app, this would actually transform the data)
  let transformed = [...sourceData];
  
  // For demo purposes, just modify the data slightly
  if (transformed.length > 0) {
    transformed = transformed.map(item => {
      const newItem = { ...item };
      
      // Add transformation columns
      newItem.transformed = true;
      newItem.processed_at = new Date().toISOString();
      
      // If there's a price or amount field, apply a calculation
      if (newItem.price !== undefined) {
        newItem.price_with_tax = parseFloat((newItem.price * 1.1).toFixed(2));
      }
      
      if (newItem.amount !== undefined) {
        newItem.amount_with_discount = parseFloat((newItem.amount * 0.9).toFixed(2));
      }
      
      return newItem;
    });
  }
  
  return transformed;
};
