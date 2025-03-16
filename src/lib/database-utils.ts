
// These are mock utility functions for handling database operations
// In a real application, these would make API calls to the backend

export interface DatabaseCredentials {
  host: string;
  port?: string;
  database?: string;
  username?: string;
  password: string; // Made required to match ConnectionParams
  connectionType: string;
  db_type?: string;
}

export interface SchemaInfo {
  name: string;
  tables: {
    name: string;
    columns: {
      name: string;
      type: string;
    }[];
  }[];
}

// Mock schema data
export const mockSchemas: SchemaInfo[] = [
  {
    name: "public",
    tables: [
      {
        name: "customers",
        columns: [
          { name: "id", type: "int" },
          { name: "name", type: "varchar" },
          { name: "email", type: "varchar" },
          { name: "created_at", type: "timestamp" }
        ]
      },
      {
        name: "orders",
        columns: [
          { name: "id", type: "int" },
          { name: "customer_id", type: "int" },
          { name: "total", type: "decimal" },
          { name: "status", type: "varchar" },
          { name: "created_at", type: "timestamp" }
        ]
      }
    ]
  },
  {
    name: "sales",
    tables: [
      {
        name: "transactions",
        columns: [
          { name: "id", type: "int" },
          { name: "order_id", type: "int" },
          { name: "amount", type: "decimal" },
          { name: "payment_method", type: "varchar" },
          { name: "created_at", type: "timestamp" }
        ]
      }
    ]
  }
];

// Mock table data
export const mockTableData = {
  columns: ["id", "name", "email", "created_at"],
  rows: [
    [1, "John Doe", "john@example.com", "2023-01-15 09:30:00"],
    [2, "Jane Smith", "jane@example.com", "2023-01-16 14:45:00"],
    [3, "Mike Johnson", "mike@example.com", "2023-01-17 11:20:00"],
    [4, "Sarah Williams", "sarah@example.com", "2023-01-18 16:10:00"],
    [5, "David Brown", "david@example.com", "2023-01-19 08:55:00"]
  ]
};

// Mock function to test a database connection
export const testDatabaseConnection = async (
  credentials: DatabaseCredentials
): Promise<{ success: boolean; message: string }> => {
  // This is a mock implementation - in a real app this would call an API
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        resolve({
          success: true,
          message: "Connection successful"
        });
      } else {
        resolve({
          success: false,
          message: "Could not connect to the database. Please check your credentials."
        });
      }
    }, 1500);
  });
};

// Mock function to get table information
export const getTableInfo = async (
  credentials: DatabaseCredentials,
  tableName: string
): Promise<any> => {
  // This is a mock implementation - in a real app this would call an API
  return new Promise((resolve) => {
    setTimeout(() => {
      if (tableName === "customers") {
        resolve({
          name: "customers",
          columns: [
            { name: "id", type: "int", nullable: false, isPrimaryKey: true, isForeignKey: false },
            { name: "name", type: "varchar(100)", nullable: false, isPrimaryKey: false, isForeignKey: false },
            { name: "email", type: "varchar(100)", nullable: true, isPrimaryKey: false, isForeignKey: false },
            { name: "created_at", type: "timestamp", nullable: false, isPrimaryKey: false, isForeignKey: false }
          ]
        });
      } else if (tableName === "orders") {
        resolve({
          name: "orders",
          columns: [
            { name: "id", type: "int", nullable: false, isPrimaryKey: true, isForeignKey: false },
            { name: "customer_id", type: "int", nullable: false, isPrimaryKey: false, isForeignKey: true, references: { table: "customers", column: "id" } },
            { name: "total", type: "decimal(10,2)", nullable: false, isPrimaryKey: false, isForeignKey: false },
            { name: "status", type: "varchar(20)", nullable: false, isPrimaryKey: false, isForeignKey: false }
          ]
        });
      } else {
        resolve({
          name: tableName,
          columns: [
            { name: "id", type: "int", nullable: false, isPrimaryKey: true, isForeignKey: false },
            { name: "name", type: "varchar(100)", nullable: false, isPrimaryKey: false, isForeignKey: false },
            { name: "description", type: "text", nullable: true, isPrimaryKey: false, isForeignKey: false },
            { name: "created_at", type: "timestamp", nullable: false, isPrimaryKey: false, isForeignKey: false }
          ]
        });
      }
    }, 800);
  });
};

// Function to process data transformation
export const processDataTransformation = async (
  instruction: string,
  tableName: string,
  schemaName: string
): Promise<{ success: boolean; message: string }> => {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Successfully processed transformation on ${schemaName}.${tableName} with instruction: ${instruction}`
      });
    }, 2000);
  });
};
