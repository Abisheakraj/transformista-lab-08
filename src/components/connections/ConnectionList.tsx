
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
  ChevronDown,
  Loader2
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
    isLoading,
    removeConnection 
  } = useDatabaseConnections();

  const [expandedConnectionId, setExpandedConnectionId] = useState<string | null>(null);
  const [showDatabaseSelect, setShowDatabaseSelect] = useState<string | null>(null);
  const [connectionToDelete, setConnectionToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const filteredConnections = connections.filter(conn => conn.type === type);

  // Function to toggle connection expanded state
  const toggleConnectionExpanded = (connectionId: string) => {
    setExpandedConnectionId(expandedConnectionId === connectionId ? null : connectionId);
  };

  // Function to handle delete confirmation
  const handleDeleteConfirm = () => {
    if (connectionToDelete) {
      if (onDeleteConnection) {
        onDeleteConnection(connectionToDelete);
      } else {
        removeConnection(connectionToDelete);
      }
      setConnectionToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Function to open delete confirmation
  const openDeleteConfirmation = (connectionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent other click handlers
    setConnectionToDelete(connectionId);
    setIsDeleteDialogOpen(true);
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
            {connection.status === "connected" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowDatabaseSelect(connection.id)}
                      className="flex items-center"
                    >
                      <Database className="h-3.5 w-3.5 mr-1.5" />
                      {connection.database ? `Database: ${connection.database}` : "Select Database"}
                      <ChevronDown className="h-3 w-3 ml-1.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select a database to connect to</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {showDatabaseSelect === connection.id && (
              <Popover open={true} onOpenChange={() => setShowDatabaseSelect(null)}>
                <PopoverTrigger asChild>
                  <div className="hidden">Open</div>
                </PopoverTrigger>
                <PopoverContent className="w-[220px]" align="start">
                  <div className="space-y-2">
                    <h3 className="font-medium">Select Database</h3>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-1">
                        {availableDatabases.length > 0 ? (
                          availableDatabases.map(db => (
                            <Button 
                              key={db} 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-start text-sm"
                              onClick={() => {
                                selectDatabaseForConnection(connection.id, db);
                                setShowDatabaseSelect(null);
                              }}
                            >
                              <Database className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                              {db}
                            </Button>
                          ))
                        ) : (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-start text-sm"
                              onClick={() => {
                                selectDatabaseForConnection(connection.id, "airportdb");
                                setShowDatabaseSelect(null);
                              }}
                            >
                              <Database className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                              airportdb
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-start text-sm"
                              onClick={() => {
                                selectDatabaseForConnection(connection.id, "northwind");
                                setShowDatabaseSelect(null);
                              }}
                            >
                              <Database className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                              northwind
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-start text-sm"
                              onClick={() => {
                                selectDatabaseForConnection(connection.id, "sakila");
                                setShowDatabaseSelect(null);
                              }}
                            >
                              <Database className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                              sakila
                            </Button>
                          </>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>
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
                    <ChevronDown className="h-3 w-3 ml-1.5" />
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
                        <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                      </div>
                    ) : schemas.length > 0 ? (
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {schemas.map(schema => (
                            <div key={schema.name} className="space-y-1">
                              <div className="font-medium text-sm flex items-center">
                                <Database className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                                {schema.name}
                              </div>
                              <div className="pl-5 space-y-1">
                                {schema.tables.slice(0, 10).map(table => (
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
                                {schema.tables.length > 10 && (
                                  <div className="text-xs text-center text-muted-foreground py-1">
                                    + {schema.tables.length - 10} more tables
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="py-4 text-center text-muted-foreground">
                        No schemas found - click "Test" to refresh
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
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
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
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => openDeleteConfirmation(connection.id, e)}
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
          </CardFooter>
        </Card>
      ))}

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Connection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this connection? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConnectionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConnectionList;
