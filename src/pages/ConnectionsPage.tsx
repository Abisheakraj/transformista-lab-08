
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Database, HardDrive, Table } from "lucide-react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useDatabaseConnections } from "@/hooks/useDatabaseConnections";

// Newly created components
import ExportConnectionsDialog from "@/components/connections/ExportConnectionsDialog";
import TablePreviewDialog from "@/components/connections/TablePreviewDialog";
import DeleteConnectionDialog from "@/components/connections/DeleteConnectionDialog";
import DatabaseSchemaBrowser from "@/components/connections/DatabaseSchemaBrowser";
import DatabaseInfoSection from "@/components/connections/DatabaseInfoSection";
import ConnectionPanel from "@/components/connections/ConnectionPanel";

const ConnectionsPage = () => {
  const [activeTab, setActiveTab] = useState<string>("sources");
  const { toast } = useToast();
  const navigate = useNavigate();
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

  // Initiate delete connection
  const initiateDeleteConnection = (connectionId: string) => {
    setConnectionToDelete(connectionId);
    setDeleteConfirmOpen(true);
  };

  // Handle delete connection
  const handleDeleteConnection = () => {
    if (!connectionToDelete) return;
    
    console.log("Deleting connection with id:", connectionToDelete);
    
    removeConnection(connectionToDelete);
    
    // Reset selected connection if it was deleted
    if (selectedConnectionId === connectionToDelete) {
      setSelectedConnectionId(null);
      setSelectedSchema(null);
      setSelectedTable(null);
    }
    
    toast({
      title: "Connection Deleted",
      description: "The database connection has been successfully removed."
    });
    
    // Reset state
    setConnectionToDelete(null);
    setDeleteConfirmOpen(false);
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
            <ExportConnectionsDialog 
              connections={connections} 
              schemas={schemas} 
              activeTab={activeTab} 
            />
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
              <ConnectionPanel
                type="source"
                selectedConnectionId={selectedConnectionId}
                onSelectConnection={handleDatabaseSelect}
                onDeleteConnection={initiateDeleteConnection}
              />
              
              <div className="md:w-2/3">
                <DatabaseSchemaBrowser
                  selectedConnectionId={selectedConnectionId}
                  selectedSchema={selectedSchema}
                  selectedTable={selectedTable}
                  schemas={schemas}
                  connections={connections}
                  isLoading={isLoading}
                  onTableSelect={handleTableSelect}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="targets">
            <div className="flex flex-col md:flex-row gap-6">
              <ConnectionPanel
                type="target"
                selectedConnectionId={selectedConnectionId}
                onSelectConnection={handleDatabaseSelect}
                onDeleteConnection={initiateDeleteConnection}
              />
              
              <div className="md:w-2/3">
                <DatabaseSchemaBrowser
                  selectedConnectionId={selectedConnectionId}
                  selectedSchema={selectedSchema}
                  selectedTable={selectedTable}
                  schemas={schemas}
                  connections={connections}
                  isLoading={isLoading}
                  onTableSelect={handleTableSelect}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DatabaseInfoSection />
      </div>

      {/* Table Preview Dialog */}
      <TablePreviewDialog 
        isOpen={isTablePreviewOpen}
        onOpenChange={setIsTablePreviewOpen}
        selectedSchema={selectedSchema}
        selectedTable={selectedTable}
        tableData={tableData}
        isLoading={isConnectionLoading}
      />
      
      {/* Delete Connection Confirmation */}
      <DeleteConnectionDialog
        isOpen={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConnection}
      />
    </SidebarLayout>
  );
};

export default ConnectionsPage;
