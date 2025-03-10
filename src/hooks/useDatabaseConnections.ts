
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  testDatabaseConnection, 
  fetchDatabaseSchemas, 
  fetchSampleData,
  getSupabaseStatus,
  DatabaseCredentials,
  DatabaseSchema,
  ConnectionStatus
} from '@/lib/database-client';

export interface Connection {
  id: string;
  name: string;
  type: 'source' | 'target';
  connectionType: string;
  host: string;
  port?: string;
  database: string;
  username?: string;
  password?: string;
  status: 'connected' | 'error' | 'pending';
  lastTested?: string;
}

export interface Table {
  name: string;
  schema: string;
  columns: Column[];
}

export interface Column {
  name: string;
  dataType: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

export default function useDatabaseConnections() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [schemas, setSchemas] = useState<DatabaseSchema[]>([]);
  const [supbaseStatus, setSupabaseStatus] = useState<{connected: boolean; project?: string}>({ connected: false });
  
  // Check if connected to Supabase
  useEffect(() => {
    const checkSupabaseStatus = async () => {
      try {
        const status = getSupabaseStatus();
        setSupabaseStatus(status);
        
        if (status.connected) {
          toast({
            title: "Supabase Connected",
            description: `Connected to Supabase project: ${status.project}`,
          });
        }
      } catch (error) {
        console.error("Error checking Supabase status:", error);
      }
    };
    
    checkSupabaseStatus();
  }, []);
  
  const addConnection = useCallback((connection: Omit<Connection, 'id' | 'status' | 'lastTested'>) => {
    const newConnection: Connection = {
      ...connection,
      id: `conn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'pending',
      lastTested: undefined
    };
    
    setConnections(prev => [...prev, newConnection]);
    
    toast({
      title: "Connection Added",
      description: `${connection.name} has been added. Test the connection to verify it works.`,
    });
    
    return newConnection.id;
  }, []);
  
  const removeConnection = useCallback((connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    
    toast({
      title: "Connection Removed",
      description: "The database connection has been removed.",
    });
  }, []);
  
  const testConnection = useCallback(async (connectionId: string): Promise<ConnectionStatus> => {
    setIsLoading(true);
    
    try {
      const connection = connections.find(conn => conn.id === connectionId);
      
      if (!connection) {
        throw new Error("Connection not found");
      }
      
      const credentials: DatabaseCredentials = {
        host: connection.host,
        port: connection.port || "",
        database: connection.database,
        username: connection.username || "",
        password: connection.password || "",
        connectionType: connection.connectionType
      };
      
      const result = await testDatabaseConnection(credentials);
      
      // Update connection status
      setConnections(prev => prev.map(conn => {
        if (conn.id === connectionId) {
          return {
            ...conn,
            status: result.success ? 'connected' : 'error',
            lastTested: new Date().toISOString()
          };
        }
        return conn;
      }));
      
      if (result.success) {
        toast({
          title: "Connection Successful",
          description: result.message
        });
        
        // If connection is successful, fetch the schemas
        try {
          const schemas = await fetchDatabaseSchemas(credentials);
          setSchemas(schemas);
        } catch (error) {
          console.error("Error fetching schemas:", error);
        }
      } else {
        toast({
          title: "Connection Failed",
          description: result.message,
          variant: "destructive"
        });
      }
      
      return result;
    } catch (error) {
      console.error("Error testing connection:", error);
      
      toast({
        title: "Connection Error",
        description: "An unexpected error occurred while testing the connection.",
        variant: "destructive"
      });
      
      return {
        success: false,
        message: "An unexpected error occurred."
      };
    } finally {
      setIsLoading(false);
    }
  }, [connections]);
  
  const getSampleData = useCallback(async (connectionId: string, schema: string, table: string, limit = 5) => {
    setIsLoading(true);
    
    try {
      const connection = connections.find(conn => conn.id === connectionId);
      
      if (!connection) {
        throw new Error("Connection not found");
      }
      
      const credentials: DatabaseCredentials = {
        host: connection.host,
        port: connection.port || "",
        database: connection.database,
        username: connection.username || "",
        password: connection.password || "",
        connectionType: connection.connectionType
      };
      
      const sampleData = await fetchSampleData(credentials, schema, table, limit);
      return sampleData;
    } catch (error) {
      console.error("Error fetching sample data:", error);
      
      toast({
        title: "Data Fetch Error",
        description: "An error occurred while fetching sample data.",
        variant: "destructive"
      });
      
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [connections]);
  
  const getConnectionById = useCallback((connectionId: string) => {
    return connections.find(conn => conn.id === connectionId);
  }, [connections]);
  
  const getConnectionsByType = useCallback((type: 'source' | 'target') => {
    return connections.filter(conn => conn.type === type);
  }, [connections]);
  
  return {
    connections,
    schemas,
    isLoading,
    supbaseStatus,
    addConnection,
    removeConnection,
    testConnection,
    getSampleData,
    getConnectionById,
    getConnectionsByType
  };
}
