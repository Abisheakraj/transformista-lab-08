
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronRight, 
  ExternalLink,
  Eye,
  HardDrive,
  Trash2
} from "lucide-react";
import { useDatabaseConnections } from "@/hooks/useDatabaseConnections";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ConnectionListProps {
  type: "source" | "target";
  onSelectConnection?: (connectionId: string) => void;
  selectedConnectionId?: string | null;
}

const ConnectionList = ({ type, onSelectConnection, selectedConnectionId }: ConnectionListProps) => {
  const { 
    connections, 
    testConnection, 
    availableDatabases, 
    selectDatabaseForConnection,
    removeConnection
  } = useDatabaseConnections();
  
  const [testingId, setTestingId] = useState<string | null>(null);
  const [selectingDbId, setSelectingDbId] = useState<string | null>(null);
  const [selectedDatabase, setSelectedDatabase] = useState<string>("");
  const [isDatabaseDialogOpen, setIsDatabaseDialogOpen] = useState(false);
  const [customDatabase, setCustomDatabase] = useState("");
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<string | null>(null);

  // Filter connections by type
  const filteredConnections = connections.filter(conn => conn.type === type);

  const handleTest = async (e: React.MouseEvent, connectionId: string) => {
    e.stopPropagation(); // Prevent selecting the connection when clicking test
    setTestingId(connectionId);
    await testConnection(connectionId);
    setTestingId(null);
  };

  // Handle connection selection
  const handleSelect = (connectionId: string) => {
    if (onSelectConnection) {
      onSelectConnection(connectionId);
    }
  };

  // Handle database selection dialog
  const handleOpenDatabaseSelection = (e: React.MouseEvent, connectionId: string) => {
    e.stopPropagation(); // Prevent selecting the connection
    setSelectingDbId(connectionId);
    setSelectedDatabase("");
    setCustomDatabase("");
    setIsCustomInput(false);
    setIsDatabaseDialogOpen(true);
  };

  // Handle database selection
  const handleDatabaseSelect = async () => {
    if (!selectingDbId) return;
    
    const dbName = isCustomInput ? customDatabase : selectedDatabase;
    
    if (!dbName) {
      return;
    }
    
    const success = await selectDatabaseForConnection(selectingDbId, dbName);
    
    if (success) {
      setIsDatabaseDialogOpen(false);
      
      // Select the connection after database is selected
      if (onSelectConnection) {
        onSelectConnection(selectingDbId);
      }
    }
  };

  // Handle delete connection
  const handleOpenDeleteDialog = (e: React.MouseEvent, connectionId: string) => {
    e.stopPropagation();
    setConnectionToDelete(connectionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConnection = () => {
    if (connectionToDelete) {
      removeConnection(connectionToDelete);
      setDeleteDialogOpen(false);
      setConnectionToDelete(null);
    }
  };

  // Get status badge styling
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "connected":
        return "border-blue-300 text-blue-700 bg-blue-50";
      case "selected":
        return "border-green-300 text-green-700 bg-green-50";
      case "failed":
        return "border-red-300 text-red-700 bg-red-50";
      default:
        return "border-yellow-300 text-yellow-700 bg-yellow-50";
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "connected":
        return "Connected";
      case "selected":
        return "Database Selected";
      case "failed":
        return "Connection Failed";
      default:
        return "Pending";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            {type === "source" ? (
              <><Database className="h-5 w-5 mr-2 text-blue-600" /> Source Connections</>
            ) : (
              <><Database className="h-5 w-5 mr-2 text-green-600" /> Target Connections</>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredConnections.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-md">
              <Database className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 mb-2">No {type} connections yet</p>
              <p className="text-gray-400 text-sm">Add a connection using the form below</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredConnections.map((connection) => (
                <div 
                  key={connection.id} 
                  className={`border rounded-md p-3 hover:border-indigo-200 transition-colors cursor-pointer ${
                    selectedConnectionId === connection.id ? 'border-indigo-500 bg-indigo-50' : ''
                  }`}
                  onClick={() => handleSelect(connection.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{connection.name}</h4>
                    <Badge 
                      variant="outline" 
                      className={getStatusBadgeStyle(connection.status)}
                    >
                      {getStatusLabel(connection.status)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Database className="h-3 w-3 text-gray-400" />
                      <span>{connection.connectionType.toUpperCase()}</span>
                    </div>
                    <div className="text-gray-500">
                      {connection.host}{connection.port ? `:${connection.port}` : ""}
                      {connection.database && (
                        <span className="ml-1 text-indigo-600">/{connection.database}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-xs text-gray-500 flex items-center">
                      {connection.lastTested ? (
                        <>
                          <Calendar className="h-3 w-3 mr-1" />
                          Last tested: {new Date(connection.lastTested).toLocaleDateString()}
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Not tested yet
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {connection.status === "connected" ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => handleOpenDatabaseSelection(e, connection.id)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <HardDrive className="h-3 w-3 mr-1" />
                          Select Database
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => handleTest(e, connection.id)}
                          disabled={testingId === connection.id}
                        >
                          {testingId === connection.id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                              Testing...
                            </>
                          ) : (
                            "Test"
                          )}
                        </Button>
                      )}
                      
                      {(connection.status === "connected" || connection.status === "selected") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(connection.id);
                          }}
                          className="flex items-center"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Browse
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleOpenDeleteDialog(e, connection.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Selection Dialog */}
      <Dialog open={isDatabaseDialogOpen} onOpenChange={setIsDatabaseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Database</DialogTitle>
            <DialogDescription>
              Choose a database from the list or enter a custom database name.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {!isCustomInput ? (
              <div className="grid gap-2">
                <Label htmlFor="database">Available Databases</Label>
                <Select value={selectedDatabase} onValueChange={(value) => {
                  if (value === "_custom") {
                    setIsCustomInput(true);
                  } else {
                    setSelectedDatabase(value);
                  }
                }}>
                  <SelectTrigger id="database">
                    <SelectValue placeholder="Select a database" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDatabases.map((db) => (
                      <SelectItem key={db} value={db}>
                        <div className="flex items-center">
                          <Database className="w-4 h-4 mr-2 text-muted-foreground" />
                          {db}
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="_custom">
                      <div className="flex items-center text-blue-600">
                        <ChevronRight className="w-4 h-4 mr-2" />
                        Enter custom database name...
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="customDatabase">Database Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="customDatabase"
                    value={customDatabase}
                    onChange={(e) => setCustomDatabase(e.target.value)}
                    placeholder="Enter database name"
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCustomInput(false)}
                    className="px-3"
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDatabaseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDatabaseSelect} disabled={isCustomInput ? !customDatabase : !selectedDatabase}>
              Select Database
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this database connection. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConnection}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConnectionList;
