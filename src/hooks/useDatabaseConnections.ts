
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
      
      const result = await testDatabaseConnection(credentials);
      
      updateConnection(connectionId, { 
        status: result.success ? "connected" : "failed",
        lastTested: new Date().toISOString()
      });
      
      if (result.success) {
        toast({
          title: "Connection successful",
          description: result.message
        });
        
        // Mock list of databases for now
        // In a real implementation, this would come from the API
        setAvailableDatabases(["airportdb", "mysql", "information_schema", "sys", "performance_schema"]);
      } else {
        toast({
          title: "Connection failed",
          description: result.message,
          variant: "destructive"
        });
      }
      
      return result.success;
    } catch (error) {
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
      
      const result = await selectDatabase(credentials);
      
      if (result.success) {
        updateConnection(connectionId, { 
          status: "selected",
          database: databaseName
        });
        
        toast({
          title: "Database selected",
          description: `Successfully selected database ${databaseName}`
        });
        
        return true;
      } else {
        toast({
          title: "Database selection failed",
          description: result.message,
          variant: "destructive"
        });
        
        return false;
      }
    } catch (error) {
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
      return;
    }
    
    setIsLoading(true);
    setTableData(null); // Reset table data when fetching new schemas
    setSelectedTable(null); // Reset selected table
    
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
      
      const fetchedSchemas = await fetchDatabaseSchemas(credentials);
      setSchemas(fetchedSchemas);
      setSelectedConnection(connection);
      
      return fetchedSchemas;
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
    if (!selectedConnection) return;
    
    setSelectedSchema(schema);
    setSelectedTable(table);
    setIsLoading(true);
    setTableData(null); // Reset before loading new data
    
    try {
      const data = await fetchSampleData(selectedConnection.id, schema, table, 50);
      setTableData(data);
      return data;
    } catch (error) {
      console.error('Error selecting table:', error);
      toast({
        title: "Error selecting table",
        description: "Could not load table data.",
        variant: "destructive"
      });
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
      
      return await fetchTableSampleData(credentials, schema, table, limit);
    } catch (error) {
      console.error('Error fetching sample data:', error);
      toast({
        title: "Error fetching sample data",
        description: "Could not retrieve sample data from the table.",
        variant: "destructive"
      });
      return null;
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
      const result = await processDataTransformation(instruction, tableName, schemaName);
      
      setProcessingResult(result);
      
      if (result.success) {
        toast({
          title: "Processing complete",
          description: result.message
        });
        
        // Refresh table data after processing
        if (selectedConnection && selectedSchema && selectedTable) {
          await selectTable(selectedSchema, selectedTable);
        }
      } else {
        toast({
          title: "Processing failed",
          description: result.message,
          variant: "destructive"
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error processing transformation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setProcessingResult({
        success: false,
        message: `Error: ${errorMessage}`
      });
      
      toast({
        title: "Processing error",
        description: `An error occurred during processing: ${errorMessage}`,
        variant: "destructive"
      });
      
      return {
        success: false,
        message: errorMessage
      };
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
