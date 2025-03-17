import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ConnectionForm from "@/components/connections/ConnectionForm";
import ConnectionList from "@/components/connections/ConnectionList";
import { Database, HardDrive, Plus, FileDown, Table, Eye, Wand2, Trash2 } from "lucide-react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useDatabaseConnections } from "@/hooks/useDatabaseConnections";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import DatabaseTransformation from "@/components/connections/DatabaseTransformation";

const ConnectionsPage = () => {
  const [activeTab, setActiveTab] = useState<string>("sources");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("json");
  const [isTablePreviewOpen, setIsTablePreviewOpen] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<string | null>(null);

  const {
    connections,
    schemas,
    tableData,
    fetchSchemas,
    selectTable,
    isLoading: isConnectionLoading,
    removeConnection
  } = useDatabaseConnections();

  // Filter connections based on active tab
  const filteredConnections = connections.filter(conn => conn.type === (activeTab === "sources" ? "source" : "target"));

  // Handle table selection
  const handleTableSelect = async (schema: string, table: string) => {
    if (!selectedConnectionId) return;
    
    console.log(`Selecting table ${schema}.${table}`);
    setSelectedSchema(schema);
    setSelectedTable(table);
    await selectTable(schema, table);
    setIsTablePreviewOpen(true);
  };

  // Handle database selection
  const handleDatabaseSelect = async (connectionId: string) => {
    setSelectedConnectionId(connectionId);
    setSelectedSchema(null);
    setSelectedTable(null);
    
    // Check if the connection has a database selected
    const connection = connections.find(conn => conn.id === connectionId);
    
    if (connection && connection.status === "selected" && connection.database) {
      setIsLoading(true);
      await fetchSchemas(connectionId);
      setIsLoading(false);
    }
  };

  // Handle delete connection
  const handleDeleteConnection = (connectionId: string) => {
    console.log("Handling delete connection with id:", connectionId);
    
    removeConnection(connectionId);
    
    // Reset selected connection if it was deleted
    if (selectedConnectionId === connectionId) {
      setSelectedConnectionId(null);
      setSelectedSchema(null);
      setSelectedTable(null);
    }
    
    toast({
      title: "Connection Deleted",
      description: "The database connection has been successfully removed."
    });
  };

  // Handle export
  const handleExport = () => {
    setIsExportOpen(true);
  };

  const handleExportSubmit = () => {
    setIsLoading(true);

    setTimeout(() => {
      // Create a downloadable file with the connection data
      const exportData = {
        connections: connections.filter(conn => conn.type === (activeTab === "sources" ? "source" : "target")),
        schemas: schemas,
        exportedAt: new Date().toISOString()
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `database-connections-${activeTab}.${exportFormat}`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      setIsExportOpen(false);
      setIsLoading(false);

      toast({
        title: "Export Successful",
        description: `Connections exported as ${exportFormat.toUpperCase()} file.`
      });
    }, 1000);
  };

  // Log state changes for debugging
  useEffect(() => {
    console.log("Selected connection/schema/table changed:", {
      connectionId: selectedConnectionId,
      schema: selectedSchema,
      table: selectedTable
    });
  }, [selectedConnectionId, selectedSchema, selectedTable]);

  // Log connections updates for debugging
  useEffect(() => {
    console.log("Connections updated:", connections);
  }, [connections]);

  return (
    <SidebarLayout title="Data Connections">
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Manage Database Connections</h1>
            <p className="text-muted-foreground">
              Connect to source and target databases to build your data transformation pipelines
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleExport}
              variant="outline"
              disabled={filteredConnections.length === 0}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export Connections
            </Button>
            <Button 
              onClick={() => setActiveTab(activeTab === "sources" ? "targets" : "sources")}
              variant="outline"
            >
              Switch to {activeTab === "sources" ? "Targets" : "Sources"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="sources" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Source Connections
            </TabsTrigger>
            <TabsTrigger value="targets" className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Target Connections
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sources">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <ConnectionList 
                  type="source" 
                  onSelectConnection={handleDatabaseSelect}
                  selectedConnectionId={selectedConnectionId}
                  onDeleteConnection={handleDeleteConnection}
                />
                <div className="mt-8">
                  <Card className="border-indigo-100">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
                      <CardTitle className="flex items-center">
                        <Database className="h-5 w-5 mr-2 text-indigo-600" />
                        Add Source Connection
                      </CardTitle>
                      <CardDescription>
                        Connect to a database system that you want to extract data from
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ConnectionForm 
                        type="source" 
                        onSuccess={() => {
                          toast({
                            title: "Source Connection Added",
                            description: "Your database connection has been successfully added.",
                          });
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="md:w-2/3">
                <Card>
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
                    <CardTitle className="flex items-center">
                      <Table className="h-5 w-5 mr-2 text-indigo-600" />
                      Database Schema Browser
                    </CardTitle>
                    <CardDescription>
                      Browse schemas and tables from your selected database connection
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {!selectedConnectionId && (
                      <div className="text-center py-10 border border-dashed rounded-md">
                        <Database className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 mb-2">Select a connection to browse its schema</p>
                      </div>
                    )}
                    
                    {selectedConnectionId && !connections.find(c => c.id === selectedConnectionId)?.database && (
                      <div className="text-center py-10 border border-dashed rounded-md">
                        <HardDrive className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 mb-2">Please select a database first</p>
                        <p className="text-gray-400 text-sm">Click "Select Database" on the connection</p>
                      </div>
                    )}
                    
                    {selectedConnectionId && isLoading && (
                      <div className="flex justify-center items-center py-10">
                        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                        <span className="ml-2">Loading schemas...</span>
                      </div>
                    )}
                    
                    {selectedConnectionId && 
                      connections.find(c => c.id === selectedConnectionId)?.database && 
                      !isLoading && 
                      schemas.length === 0 && (
                      <div className="text-center py-10 border border-dashed rounded-md">
                        <Table className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 mb-2">No schemas found in this database</p>
                      </div>
                    )}
                    
                    {selectedConnectionId && 
                      connections.find(c => c.id === selectedConnectionId)?.database && 
                      !isLoading && 
                      schemas.length > 0 && (
                      <div className="space-y-4">
                        {schemas.map((schema) => (
                          <div key={schema.name} className="border rounded-md p-4">
                            <h3 className="text-md font-medium mb-2">{schema.name}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {schema.tables.map((table) => (
                                <div 
                                  key={`${schema.name}.${table.name}`}
                                  className={`border p-2 rounded hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                                    selectedSchema === schema.name && selectedTable === table.name ? 'bg-blue-50 border-blue-200' : ''
                                  }`}
                                  onClick={() => handleTableSelect(schema.name, table.name)}
                                >
                                  <div className="flex items-center">
                                    <Table className="h-4 w-4 text-gray-500 mr-2" />
                                    <span>{table.name}</span>
                                  </div>
                                  <Badge variant="outline" className="ml-2">{table.columns.length} cols</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Transformation component */}
                    <DatabaseTransformation 
                      schema={selectedSchema}
                      table={selectedTable}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="targets">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <ConnectionList 
                  type="target" 
                  onSelectConnection={handleDatabaseSelect}
                  selectedConnectionId={selectedConnectionId}
                  onDeleteConnection={handleDeleteConnection}
                />
                <div className="mt-8">
                  <Card className="border-indigo-100">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
                      <CardTitle className="flex items-center">
                        <HardDrive className="h-5 w-5 mr-2 text-indigo-600" />
                        Add Target Connection
                      </CardTitle>
                      <CardDescription>
                        Connect to a database system where you want to load your transformed data
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ConnectionForm 
                        type="target" 
                        onSuccess={() => {
                          toast({
                            title: "Target Connection Added",
                            description: "Your database connection has been successfully added.",
                          });
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="md:w-2/3">
                <Card>
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
                    <CardTitle className="flex items-center">
                      <Table className="h-5 w-5 mr-2 text-indigo-600" />
                      Database Schema Browser
                    </CardTitle>
                    <CardDescription>
                      Browse schemas and tables from your selected database connection
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {!selectedConnectionId && (
                      <div className="text-center py-10 border border-dashed rounded-md">
                        <Database className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 mb-2">Select a connection to browse its schema</p>
                      </div>
                    )}
                    
                    {selectedConnectionId && !connections.find(c => c.id === selectedConnectionId)?.database && (
                      <div className="text-center py-10 border border-dashed rounded-md">
                        <HardDrive className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 mb-2">Please select a database first</p>
                        <p className="text-gray-400 text-sm">Click "Select Database" on the connection</p>
                      </div>
                    )}
                    
                    {selectedConnectionId && isLoading && (
                      <div className="flex justify-center items-center py-10">
                        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                        <span className="ml-2">Loading schemas...</span>
                      </div>
                    )}
                    
                    {selectedConnectionId && 
                      connections.find(c => c.id === selectedConnectionId)?.database && 
                      !isLoading && 
                      schemas.length === 0 && (
                      <div className="text-center py-10 border border-dashed rounded-md">
                        <Table className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 mb-2">No schemas found in this database</p>
                      </div>
                    )}
                    
                    {selectedConnectionId && 
                      connections.find(c => c.id === selectedConnectionId)?.database && 
                      !isLoading && 
                      schemas.length > 0 && (
                      <div className="space-y-4">
                        {schemas.map((schema) => (
                          <div key={schema.name} className="border rounded-md p-4">
                            <h3 className="text-md font-medium mb-2">{schema.name}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {schema.tables.map((table) => (
                                <div 
                                  key={`${schema.name}.${table.name}`}
                                  className={`border p-2 rounded hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                                    selectedSchema === schema.name && selectedTable === table.name ? 'bg-blue-50 border-blue-200' : ''
                                  }`}
                                  onClick={() => handleTableSelect(schema.name, table.name)}
                                >
                                  <div className="flex items-center">
                                    <Table className="h-4 w-4 text-gray-500 mr-2" />
                                    <span>{table.name}</span>
                                  </div>
                                  <Badge variant="outline" className="ml-2">{table.columns.length} cols</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Transformation component */}
                    <DatabaseTransformation 
                      schema={selectedSchema}
                      table={selectedTable}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Database Connection Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium mb-2">Supported Databases</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>MySQL / MariaDB</li>
                <li>PostgreSQL</li>
                <li>Oracle Database</li>
                <li>Microsoft SQL Server</li>
                <li>MongoDB</li>
                <li>Sybase</li>
                <li>SAP HANA</li>
                <li>Snowflake</li>
              </ul>
            </div>
            <div>
              <h3 className="text-md font-medium mb-2">Connection Security</h3>
              <p className="text-gray-600 mb-2">
                All database credentials are encrypted before being stored. We recommend using dedicated read-only accounts
                for source connections and limited-privilege accounts for target connections.
              </p>
              <p className="text-gray-600">
                You can use Supabase integration for enhanced security and to manage your database connections through a centralized service.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Database Connections</DialogTitle>
            <DialogDescription>
              Export your {activeTab === "sources" ? "source" : "target"} database connections in various formats.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="yaml">YAML</SelectItem>
                  <SelectItem value="sql">SQL Script</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Exporting...
                </>
              ) : (
                "Export"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table Preview Dialog */}
      <Dialog open={isTablePreviewOpen} onOpenChange={setIsTablePreviewOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Table Preview: {selectedSchema}.{selectedTable}</DialogTitle>
            <DialogDescription>
              Preview data from the selected table
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isConnectionLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                <span className="ml-2">Loading data...</span>
              </div>
            ) : (
              tableData && (
                <div className="overflow-auto max-h-96">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        {tableData.columns.map((column, idx) => (
                          <th key={idx} className="border px-4 py-2 text-left">{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="border px-4 py-2">{cell?.toString() || ""}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
            {!isConnectionLoading && !tableData && (
              <div className="text-center py-10 border border-dashed rounded-md">
                <p className="text-gray-500">No data available for this table</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              onClick={() => { 
                setIsTablePreviewOpen(false);
                // Don't reset the selected table/schema here
                // so the transformations can still be applied
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
};

export default ConnectionsPage;
