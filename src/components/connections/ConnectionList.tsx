
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, RefreshCcw, Trash2, Check, AlertCircle, HardDrive, Table } from "lucide-react";
import { useDatabaseConnections } from "@/hooks/useDatabaseConnections";

interface ConnectionListProps {
  type: "source" | "target";
  onSelectConnection: (connectionId: string) => void;
  selectedConnectionId: string | null;
  onDeleteConnection?: (connectionId: string) => void;
}

const ConnectionList = ({ 
  type, 
  onSelectConnection, 
  selectedConnectionId,
  onDeleteConnection
}: ConnectionListProps) => {
  const { 
    connections,
    availableDatabases,
    selectDatabaseForConnection,
    testConnection, 
    isLoading 
  } = useDatabaseConnections();

  const filteredConnections = connections.filter(conn => conn.type === type);

  if (filteredConnections.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            {type === "source" 
              ? <Database className="h-12 w-12 text-muted-foreground" /> 
              : <HardDrive className="h-12 w-12 text-muted-foreground" />
            }
          </div>
          <h3 className="text-lg font-medium mb-2">No {type === "source" ? "Source" : "Target"} Connections</h3>
          <p className="text-muted-foreground">
            Add a {type === "source" ? "source" : "target"} database to start working with your data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">{type === "source" ? "Source" : "Target"} Connections</h2>
      {filteredConnections.map((connection) => (
        <Card 
          key={connection.id} 
          className={`border-${selectedConnectionId === connection.id ? 'indigo-200' : 'gray-200'} hover:border-indigo-200 transition-colors`}
        >
          <CardHeader className={`pb-2 ${selectedConnectionId === connection.id ? 'bg-indigo-50' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg flex items-center">
                  {type === "source" 
                    ? <Database className="h-4 w-4 text-indigo-600 mr-2" /> 
                    : <HardDrive className="h-4 w-4 text-purple-600 mr-2" />
                  }
                  {connection.name}
                </CardTitle>
                <CardDescription>
                  {connection.connectionType} • {connection.host}{connection.port ? `:${connection.port}` : ""}
                  {connection.database && <span className="text-indigo-600">/{connection.database}</span>}
                </CardDescription>
              </div>
              <Badge 
                variant={connection.status === "connected" || connection.status === "selected" ? "outline" : "destructive"}
                className={connection.status === "connected" || connection.status === "selected" 
                  ? "border-green-300 text-green-700 bg-green-50" 
                  : ""}
              >
                {connection.status === "selected" ? "Connected" : 
                  connection.status === "connected" ? "Verified" : 
                  connection.status === "failed" ? "Failed" : "Pending"}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pb-3 pt-0">
            <div className="text-xs text-muted-foreground">
              Last tested: {connection.lastTested ? new Date(connection.lastTested).toLocaleString() : "Never"}
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-3 flex flex-wrap gap-2">
            {connection.status === "connected" && !connection.database && (
              <Select 
                onValueChange={(value) => {
                  if (value) {
                    selectDatabaseForConnection(connection.id, value);
                  }
                }}
              >
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="Select Database" />
                </SelectTrigger>
                <SelectContent>
                  {availableDatabases.map(db => (
                    <SelectItem key={db} value={db}>{db}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {connection.status === "selected" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onSelectConnection(connection.id)}
                className={selectedConnectionId === connection.id ? "bg-indigo-50" : ""}
              >
                <Table className="h-3.5 w-3.5 mr-1.5" />
                Browse Tables
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => testConnection(connection.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin mr-1.5"></div>
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
                  Test
                </>
              )}
            </Button>
            
            {onDeleteConnection && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteConnection(connection.id)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ConnectionList;
