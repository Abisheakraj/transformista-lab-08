
import { useState, useEffect } from "react";
import { 
  DatabaseCredentials, 
  SchemaInfo, 
  testDatabaseConnection, 
  fetchDatabaseSchemas, 
  fetchTableSampleData,
  selectDatabase,
  processDataTransformation
} from "@/lib/database-client";
import { useToast } from "@/hooks/use-toast";

interface SupabaseStatus {
  connected: boolean;
  project?: string;
}

export interface DatabaseConnection {
  id: string;
  name: string;
  type: "source" | "target";
  connectionType: string;
  host: string;
  port?: string;
  database?: string;
  username?: string;
  password?: string;
  status: "connected" | "pending" | "failed" | "selected";
  lastTested?: string;
}

export function useDatabaseConnections() {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [schemas, setSchemas] = useState<SchemaInfo[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<DatabaseConnection | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
  const [tableData, setTableData] = useState<{columns: string[], rows: any[][]} | null>(null);
  const [availableDatabases, setAvailableDatabases] = useState<string[]>([]);
  const [processingResult, setProcessingResult] = useState<{success: boolean, message: string} | null>(null);
  const { toast } = useToast();

  // Get Supabase status - mock implementation
  const getSupabaseStatus = (): SupabaseStatus => {
    return { connected: false };
  };

  // Load connections from localStorage on mount
  useEffect(() => {
    const savedConnections = localStorage.getItem('databaseConnections');
    if (savedConnections) {
      try {
        setConnections(JSON.parse(savedConnections));
      } catch (error) {
        console.error('Error loading saved connections:', error);
      }
    }
  }, []);

  // Save connections to localStorage when they change
  useEffect(() => {
    if (connections.length > 0) {
      localStorage.setItem('databaseConnections', JSON.stringify(connections));
    }
  }, [connections]);

  const addConnection = (connection: Omit<DatabaseConnection, 'id' | 'status'>) => {
    const newConnection: DatabaseConnection = {
      ...connection,
      id: `conn-${Date.now()}`,
      status: "pending"
    };
    
    setConnections(prev => [...prev, newConnection]);
    
    return newConnection.id;
  };

  const updateConnection = (id: string, updates: Partial<DatabaseConnection>) => {
    setConnections(prev => 
      prev.map(conn => conn.id === id ? { ...conn, ...updates } : conn)
    );
  };

  const removeConnection = (id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
    
    // If the removed connection was the selected one, clear selection
    if (selectedConnection?.id === id) {
      setSelectedConnection(null);
      setSelectedTable(null);
      setSelectedSchema(null);
      setTableData(null);
      setSchemas([]);
    }
    
    toast({
      title: "Connection removed",
      description: "The database connection has been successfully removed."
    });
  };

  const testConnection = async (connectionId: string) => {
    const connection = connections.find(conn => conn.id === connectionId);
    if (!connection) return false;
    
    setIsLoading(true);
    updateConnection(connectionId, { status: "pending" });
    
    try {
      const credentials: DatabaseCredentials = {
        host: connection.host,
        port: connection.port,
        username: connection.username,
        password: connection.password,
        connectionType: connection.connectionType,
        db_type: connection.connectionType.toLowerCase()
      };
      
      console.log("Testing connection with credentials:", JSON.stringify(credentials, null, 2));
      const result = await testDatabaseConnection(credentials);
      console.log("Connection test result:", result);
      
      updateConnection(connectionId, { 
        status: result.success ? "connected" : "failed",
        lastTested: new Date().toISOString()
      });
      
      if (result.success) {
        toast({
          title: "Connection successful",
          description: result.message || "Successfully connected to database server"
        });
        
        // Set available databases based on connection type
        if (connection.connectionType.toLowerCase() === 'mysql') {
          setAvailableDatabases(["airportdb", "mysql", "information_schema", "sys", "performance_schema"]);
        } else if (connection.connectionType.toLowerCase() === 'postgresql') {
          setAvailableDatabases(["postgres", "template1", "template0"]);
        } else {
          setAvailableDatabases(["main", "system", "information_schema"]);
        }
      } else {
        toast({
          title: "Connection failed",
          description: result.message || "Failed to connect to database server",
          variant: "destructive"
        });
      }
      
      return result.success;
    } catch (error) {
      console.error("Connection test error:", error);
      toast({
        title: "Connection error",
        description: "An unexpected error occurred while testing the connection.",
        variant: "destructive"
      });
      
      updateConnection(connectionId, { 
        status: "failed",
        lastTested: new Date().toISOString()
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const selectDatabaseForConnection = async (connectionId: string, databaseName: string) => {
    const connection = connections.find(conn => conn.id === connectionId);
    if (!connection) return false;
    
    setIsLoading(true);
    
    try {
      const credentials: DatabaseCredentials = {
        host: connection.host,
        port: connection.port,
        username: connection.username,
        password: connection.password,
        connectionType: connection.connectionType,
        database: databaseName,
        db_type: connection.connectionType.toLowerCase()
      };
      
      console.log("Selecting database with credentials:", JSON.stringify(credentials, null, 2));
      const result = await selectDatabase(connectionId, databaseName);
      console.log("Database selection result:", result);
      
      if (result.success) {
        updateConnection(connectionId, { 
          status: "selected",
          database: databaseName
        });
        
        toast({
          title: "Database selected",
          description: `Successfully selected database ${databaseName}`
        });
        
        // After selecting a database, automatically fetch its schemas
        await fetchSchemas(connectionId);
        
        return true;
      } else {
        toast({
          title: "Database selection failed",
          description: result.message || "Failed to select database",
          variant: "destructive"
        });
        
        return false;
      }
    } catch (error) {
      console.error("Database selection error:", error);
      toast({
        title: "Database selection error",
        description: "An unexpected error occurred while selecting the database.",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchemas = async (connectionId: string) => {
    const connection = connections.find(conn => conn.id === connectionId);
    if (!connection || !connection.database) {
      toast({
        title: "Database not selected",
        description: "Please select a database first",
        variant: "destructive"
      });
      return [];
    }
    
    setIsLoading(true);
    setTableData(null); // Reset table data when fetching new schemas
    setSelectedTable(null); // Reset selected table
    
    try {
      console.log("Fetching schemas for connection:", connectionId);
      const result = await fetchDatabaseSchemas(connectionId);
      console.log("Fetched schemas result:", result);
      
      if (result.success && result.data) {
        // Ensure schemas is an array, even if API returns something unexpected
        const validSchemas = Array.isArray(result.data) ? result.data : [];
        setSchemas(validSchemas);
        setSelectedConnection(connection);
        
        if (validSchemas.length === 0) {
          toast({
            title: "No schemas found",
            description: "No database schemas were found for the selected database.",
          });
        } else {
          toast({
            title: "Schemas loaded",
            description: `Found ${validSchemas.length} schemas with ${validSchemas.reduce((sum, schema) => sum + schema.tables.length, 0)} tables.`
          });
        }
        
        return validSchemas;
      } else {
        toast({
          title: "Error fetching schemas",
          description: result.message || "Failed to fetch database schemas",
          variant: "destructive"
        });
        return [];
      }
    } catch (error) {
      console.error('Error fetching schemas:', error);
      toast({
        title: "Error fetching database schemas",
        description: "Could not retrieve database schema information.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const selectTable = async (schema: string, table: string) => {
    if (!selectedConnection) return null;
    
    setSelectedSchema(schema);
    setSelectedTable(table);
    setIsLoading(true);
    setTableData(null); // Reset before loading new data
    
    try {
      console.log(`Selecting table ${schema}.${table}`);
      const data = await fetchSampleData(selectedConnection.id, schema, table, 50);
      
      // Ensure data has the correct structure
      if (data && typeof data === 'object') {
        // If API returns raw data, format it properly
        let formattedData = data;
        
        if (!data.columns || !data.rows) {
          console.log("Formatting table data to expected structure");
          const columns = data.columns || [];
          const rows = data.rows || [];
          formattedData = { columns, rows };
        }
        
        console.log("Setting table data:", formattedData);
        setTableData(formattedData);
        
        // Show a toast notification that the table has been selected
        toast({
          title: "Table Selected",
          description: `Selected table ${schema}.${table} with ${formattedData.columns.length} columns`
        });
        
        return formattedData;
      } else {
        console.error("Invalid table data format:", data);
        setTableData({ columns: [], rows: [] });
        return { columns: [], rows: [] };
      }
    } catch (error) {
      console.error('Error selecting table:', error);
      toast({
        title: "Error selecting table",
        description: "Could not load table data.",
        variant: "destructive"
      });
      setTableData({ columns: [], rows: [] });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSampleData = async (
    connectionId: string, 
    schema: string, 
    table: string, 
    limit: number = 10
  ) => {
    const connection = connections.find(conn => conn.id === connectionId);
    if (!connection) return null;
    
    try {
      const credentials: DatabaseCredentials = {
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
        password: connection.password,
        connectionType: connection.connectionType,
        db_type: connection.connectionType.toLowerCase()
      };
      
      console.log("Fetching sample data with params:", { schema, table, limit });
      const data = await fetchTableSampleData(credentials, schema, table, limit);
      console.log("Sample data result:", data);
      
      // Ensure the data has the proper structure
      if (data && typeof data === 'object') {
        const columns = Array.isArray(data.columns) ? data.columns : [];
        const rows = Array.isArray(data.rows) ? data.rows : [];
        return { columns, rows };
      }
      
      return { columns: [], rows: [] };
    } catch (error) {
      console.error('Error fetching sample data:', error);
      toast({
        title: "Error fetching sample data",
        description: "Could not retrieve sample data from the table.",
        variant: "destructive"
      });
      return { columns: [], rows: [] };
    }
  };

  const processTransformation = async (
    instruction: string,
    tableName: string,
    schemaName: string
  ) => {
    setIsLoading(true);
    setProcessingResult(null);
    
    try {
      console.log("Processing transformation:", { instruction, tableName, schemaName });
      const result = await processDataTransformation(instruction, tableName, schemaName);
      console.log("Transformation result:", result);
      
      // Ensure the result has the proper structure
      if (result && typeof result === 'object') {
        const successValue = result.success === true;
        const messageValue = typeof result.message === 'string' ? result.message : 
                            (successValue ? 'Transformation completed successfully' : 'Transformation failed');
        
        const formattedResult = {
          success: successValue,
          message: messageValue
        };
        
        setProcessingResult(formattedResult);
        
        if (formattedResult.success) {
          toast({
            title: "Processing complete",
            description: formattedResult.message
          });
          
          // Refresh table data after processing
          if (selectedConnection && selectedSchema && selectedTable) {
            await selectTable(selectedSchema, selectedTable);
          }
        } else {
          toast({
            title: "Processing failed",
            description: formattedResult.message,
            variant: "destructive"
          });
        }
        
        return formattedResult;
      } else {
        const defaultResult = {
          success: false,
          message: 'Invalid response from server'
        };
        setProcessingResult(defaultResult);
        
        toast({
          title: "Processing error",
          description: defaultResult.message,
          variant: "destructive"
        });
        
        return defaultResult;
      }
    } catch (error) {
      console.error('Error processing transformation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      const errorResult = {
        success: false,
        message: `Error: ${errorMessage}`
      };
      
      setProcessingResult(errorResult);
      
      toast({
        title: "Processing error",
        description: `An error occurred during processing: ${errorMessage}`,
        variant: "destructive"
      });
      
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    connections,
    isLoading,
    schemas,
    selectedConnection,
    selectedTable,
    selectedSchema,
    tableData,
    availableDatabases,
    processingResult,
    getSupabaseStatus,
    addConnection,
    updateConnection,
    removeConnection,
    testConnection,
    selectDatabaseForConnection,
    fetchSchemas,
    fetchSampleData,
    selectTable,
    processTransformation
  };
}
