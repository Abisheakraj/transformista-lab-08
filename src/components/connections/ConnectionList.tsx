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
import DatabaseSelectDialog from "./DatabaseSelectDialog";
import DatabaseTablesView from "./DatabaseTablesView";

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
  const [isDatabaseSelectOpen, setIsDatabaseSelectOpen] = useState(false);
  const [selectedDatabaseForTables, setSelectedDatabaseForTables] = useState<string | null>(null);

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

  // Function to open database select dialog
  const openDatabaseSelectDialog = (connectionId: string) => {
    setShowDatabaseSelect(connectionId);
    setIsDatabaseSelectOpen(true);
  };

  // Function to handle database selection
  const handleDatabaseSelect = async (database: string) => {
    if (!showDatabaseSelect) return;
    
    const connection = connections.find(conn => conn.id === showDatabaseSelect);
    if (!connection) return;
    
    // Update the connection with the selected database
    await selectDatabaseForConnection(showDatabaseSelect, database);
    
    // Set the selected database for showing tables
    setSelectedDatabaseForTables(database);
    
    // Select the connection
    onSelectConnection(showDatabaseSelect);
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
            
            {selectedConnectionId === connection.id && 
             selectedDatabaseForTables && 
             connection.database === selectedDatabaseForTables && (
              <div className="mt-4">
                <DatabaseTablesView 
                  connection={connection} 
                  selectedDatabase={selectedDatabaseForTables} 
                />
              </div>
            )}
          </CardContent>
          
          <CardFooter className="border-t pt-3 flex flex-wrap gap-2">
            {connection.status === "connected" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openDatabaseSelectDialog(connection.id)}
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
            
            {connection.status === "selected" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onSelectConnection(connection.id);
                  setSelectedDatabaseForTables(connection.database || null);
                }}
                className={selectedConnectionId === connection.id ? "bg-indigo-50" : ""}
              >
                <Table className="h-3.5 w-3.5 mr-1.5" />
                Browse Tables
              </Button>
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

      {showDatabaseSelect && (
        <DatabaseSelectDialog
          open={isDatabaseSelectOpen}
          onOpenChange={setIsDatabaseSelectOpen}
          credentials={{
            db_type: connections.find(c => c.id === showDatabaseSelect)?.connectionType || "mysql",
            host: connections.find(c => c.id === showDatabaseSelect)?.host || "localhost",
            port: connections.find(c => c.id === showDatabaseSelect)?.port || "3306",
            username: connections.find(c => c.id === showDatabaseSelect)?.username || "",
            password: connections.find(c => c.id === showDatabaseSelect)?.password || "",
          }}
          onDatabaseSelect={handleDatabaseSelect}
        />
      )}

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
