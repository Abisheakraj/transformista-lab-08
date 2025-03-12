
import { useState, useEffect } from "react";
import { 
  DatabaseCredentials, 
  SchemaInfo, 
  testDatabaseConnection, 
  fetchDatabaseSchemas, 
  fetchTableSampleData
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
  database: string;
  username?: string;
  password?: string;
  status: "connected" | "failed" | "pending";
  lastTested?: string;
}

export function useDatabaseConnections() {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [schemas, setSchemas] = useState<SchemaInfo[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<DatabaseConnection | null>(null);
  const { toast } = useToast();

  // Get Supabase status
  const getSupabaseStatus = (): SupabaseStatus => {
    // This is a mock implementation
    // In a real app, this would check if Supabase is connected
    return {
      connected: false,
      project: undefined
    };
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
        database: connection.database,
        username: connection.username,
        password: connection.password,
        connectionType: connection.connectionType
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

  const fetchSchemas = async (connectionId: string) => {
    const connection = connections.find(conn => conn.id === connectionId);
    if (!connection) return;
    
    setIsLoading(true);
    
    try {
      const credentials: DatabaseCredentials = {
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
        password: connection.password,
        connectionType: connection.connectionType
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
        connectionType: connection.connectionType
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

  return {
    connections,
    isLoading,
    schemas,
    selectedConnection,
    getSupabaseStatus,
    addConnection,
    updateConnection,
    removeConnection,
    testConnection,
    fetchSchemas,
    fetchSampleData
  };
}
