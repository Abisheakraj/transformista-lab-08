
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { testDatabaseConnection } from "@/lib/database-client";
import { 
  Database, 
  RefreshCcw, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Layers,
  Loader2 
} from "lucide-react";

interface ConnectionListProps {
  type: "source" | "target";
}

interface Connection {
  id: string;
  name: string;
  type: "source" | "target";
  connectionType: string;
  host: string;
  port?: string;
  database: string;
  username?: string;
  lastTested?: string;
  status: "connected" | "failed" | "pending";
}

const ConnectionList = ({ type }: ConnectionListProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Mock data for demonstration
  const [connections, setConnections] = useState<Connection[]>([
    {
      id: "conn-src-1",
      name: "Production MySQL",
      type: "source",
      connectionType: "mysql",
      host: "production-db.example.com",
      port: "3306",
      database: "customers_db",
      username: "readonly_user",
      lastTested: "2023-09-15T14:30:00Z",
      status: "connected"
    },
    {
      id: "conn-src-2",
      name: "Marketing PostgreSQL",
      type: "source",
      connectionType: "postgresql",
      host: "marketing-db.example.com",
      port: "5432",
      database: "marketing_analytics",
      username: "analyst",
      lastTested: "2023-09-14T09:15:00Z",
      status: "connected"
    },
    {
      id: "conn-tgt-1",
      name: "Data Warehouse",
      type: "target",
      connectionType: "snowflake",
      host: "org-warehouse.snowflakecomputing.com",
      database: "ANALYTICS",
      username: "etl_user",
      lastTested: "2023-09-15T10:45:00Z",
      status: "connected"
    },
    {
      id: "conn-tgt-2",
      name: "Reporting Database",
      type: "target",
      connectionType: "postgresql",
      host: "reporting.example.com",
      port: "5432",
      database: "bi_reports",
      username: "writer_user",
      lastTested: "2023-09-13T16:20:00Z",
      status: "failed"
    }
  ]);

  // Simulating fetch of connections on component mount
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter connections by type
  const filteredConnections = connections.filter(conn => conn.type === type);

  const handleTestConnection = async (connectionId: string) => {
    const connection = connections.find(conn => conn.id === connectionId);
    if (!connection) return;
    
    setIsLoading(prev => ({ ...prev, [connectionId]: true }));
    
    try {
      const result = await testDatabaseConnection({
        host: connection.host,
        port: connection.port || "",
        database: connection.database,
        username: connection.username || "",
        password: "********", // Password would be securely retrieved or managed in a real app
        connectionType: connection.connectionType
      });
      
      setConnections(prev => prev.map(conn => {
        if (conn.id === connectionId) {
          return {
            ...conn,
            status: result.success ? "connected" : "failed",
            lastTested: new Date().toISOString()
          };
        }
        return conn;
      }));
      
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
    } catch (error) {
      toast({
        title: "Connection error",
        description: "An unexpected error occurred while testing the connection.",
        variant: "destructive"
      });
      
      setConnections(prev => prev.map(conn => {
        if (conn.id === connectionId) {
          return {
            ...conn,
            status: "failed",
            lastTested: new Date().toISOString()
          };
        }
        return conn;
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, [connectionId]: false }));
    }
  };

  const handleDeleteConnection = (connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    
    toast({
      title: "Connection removed",
      description: "The connection has been removed from your list."
    });
  };

  const handleEditConnection = (connectionId: string) => {
    // In a real application, this would open a dialog to edit the connection
    toast({
      title: "Edit Connection",
      description: "This would open a dialog to edit the connection details."
    });
  };

  const getConnectionIcon = (connectionType: string) => {
    switch (connectionType) {
      case "mysql":
      case "postgresql":
      case "oracle":
      case "mssql":
      case "sybase":
        return <Database className="h-5 w-5" />;
      case "snowflake":
      case "bigquery":
      case "redshift":
        return <Layers className="h-5 w-5" />;
      default:
        return <Database className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "Never";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Loading connections...</p>
        </div>
      </div>
    );
  }

  if (filteredConnections.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 pb-6 text-center">
          <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No {type === "source" ? "Source" : "Target"} Connections</h3>
          <p className="text-muted-foreground mb-4">
            Add a {type === "source" ? "source" : "target"} connection to start working with your data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {filteredConnections.map(connection => (
        <Card key={connection.id} className="transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-md">
                  {getConnectionIcon(connection.connectionType)}
                </div>
                <div>
                  <CardTitle className="text-lg">{connection.name}</CardTitle>
                  <CardDescription>
                    {connection.connectionType.toUpperCase()} • {connection.host}/{connection.database}
                  </CardDescription>
                </div>
              </div>
              <Badge 
                variant={connection.status === "connected" ? "outline" : "destructive"}
                className="flex items-center gap-1"
              >
                {getStatusIcon(connection.status)}
                {connection.status === "connected" ? "Connected" : "Failed"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <div className="text-xs text-muted-foreground">
              Last tested: {formatDateTime(connection.lastTested)}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-3 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestConnection(connection.id)}
              disabled={isLoading[connection.id]}
            >
              {isLoading[connection.id] ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-3.5 w-3.5 mr-1" />
                  Test
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditConnection(connection.id)}
            >
              <Edit2 className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteConnection(connection.id)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Remove
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ConnectionList;
