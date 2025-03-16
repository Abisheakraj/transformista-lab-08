
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Database, 
  RefreshCcw, 
  Trash2, 
  Check, 
  AlertCircle, 
  HardDrive, 
  Table,
  Server,
  FileText,
  ChevronDown
} from "lucide-react";
import { useDatabaseConnections } from "@/hooks/useDatabaseConnections";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
    schemas,
    selectDatabaseForConnection,
    testConnection,
    fetchSchemas,
    selectTable,
    isLoading 
  } = useDatabaseConnections();

  const [expandedConnectionId, setExpandedConnectionId] = useState<string | null>(null);

  const filteredConnections = connections.filter(conn => conn.type === type);

  // Function to toggle connection expanded state
  const toggleConnectionExpanded = (connectionId: string) => {
    setExpandedConnectionId(expandedConnectionId === connectionId ? null : connectionId);
  };

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

  // Get the appropriate icon based on database type
  const getDbIcon = (connectionType: string) => {
    switch(connectionType.toLowerCase()) {
      case 'mysql':
        return <Database className="h-4 w-4 text-blue-600 mr-2" />;
      case 'postgresql':
        return <Database className="h-4 w-4 text-indigo-600 mr-2" />;
      case 'oracle':
        return <Server className="h-4 w-4 text-red-600 mr-2" />;
      case 'mssql':
        return <Database className="h-4 w-4 text-blue-500 mr-2" />;
      case 'bigquery':
        return <FileText className="h-4 w-4 text-green-600 mr-2" />;
      case 'snowflake':
        return <Server className="h-4 w-4 text-cyan-600 mr-2" />;
      default:
        return type === "source" 
          ? <Database className="h-4 w-4 text-indigo-600 mr-2" /> 
          : <HardDrive className="h-4 w-4 text-purple-600 mr-2" />;
    }
  };

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
                  {getDbIcon(connection.connectionType)}
                  {connection.name}
                </CardTitle>
                <CardDescription>
                  {connection.connectionType.toUpperCase()} • {connection.host}{connection.port ? `:${connection.port}` : ""}
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
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
                        {availableDatabases.length > 0 ? (
                          availableDatabases.map(db => (
                            <SelectItem key={db} value={db}>{db}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="airportdb">airportdb</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select a database to connect to</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {connection.status === "selected" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      fetchSchemas(connection.id);
                      onSelectConnection(connection.id);
                    }}
                    className={selectedConnectionId === connection.id ? "bg-indigo-50" : ""}
                  >
                    <Table className="h-3.5 w-3.5 mr-1.5" />
                    Browse Tables
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-2">
                    <h3 className="font-medium">Select Schema & Table</h3>
                    <p className="text-xs text-muted-foreground">
                      Choose a schema and table to view or transform
                    </p>
                    {isLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                      </div>
                    ) : schemas.length > 0 ? (
                      <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {schemas.map(schema => (
                          <div key={schema.name} className="space-y-1">
                            <div className="font-medium text-sm flex items-center">
                              <Database className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                              {schema.name}
                            </div>
                            <div className="pl-5 space-y-1">
                              {schema.tables.slice(0, 8).map(table => (
                                <Button 
                                  key={table.name} 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full justify-start text-xs"
                                  onClick={() => {
                                    selectTable(schema.name, table.name);
                                  }}
                                >
                                  <Table className="h-3 w-3 mr-1.5 text-gray-500" />
                                  {table.name}
                                </Button>
                              ))}
                              {schema.tables.length > 8 && (
                                <div className="text-xs text-center text-muted-foreground py-1">
                                  + {schema.tables.length - 8} more tables
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-muted-foreground">
                        No schemas found
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>Test the database connection</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {onDeleteConnection && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteConnection(connection.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Delete
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete this connection</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ConnectionList;
