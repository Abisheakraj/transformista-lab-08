
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, 
  RefreshCcw, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Layers 
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

  // Filter connections by type
  const filteredConnections = connections.filter(conn => conn.type === type);

  const handleTestConnection = (connectionId: string) => {
    setIsLoading(prev => ({ ...prev, [connectionId]: true }));
    
    // Simulate testing the connection
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      setConnections(prev => prev.map(conn => {
        if (conn.id === connectionId) {
          return {
            ...conn,
            status: success ? "connected" : "failed",
            lastTested: new Date().toISOString()
          };
        }
        return conn;
      }));
      
      if (success) {
        toast({
          title: "Connection successful",
          description: "The database connection was tested successfully."
        });
      } else {
        toast({
          title: "Connection failed",
          description: "Unable to connect to the database. Please check your credentials.",
          variant: "destructive"
        });
      }
      
      setIsLoading(prev => ({ ...prev, [connectionId]: false }));
    }, 1500);
  };

  const handleDeleteConnection = (connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    
    toast({
      title: "Connection removed",
      description: "The connection has been removed from your list."
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
        <Card key={connection.id}>
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
                  <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin mr-1"></div>
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
