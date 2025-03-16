
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowRightCircle, 
  RefreshCw, 
  Plus, 
  FileDown, 
  Database, 
  Table, 
  FileSpreadsheet, 
  Code
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SchemaGraphView from "./SchemaGraphView";

interface TableMappingComponentProps {
  projectId?: string;
  sourceConnection?: any;
  sourceTable?: string;
  sourceSchema?: string;
  onCreatePipeline?: (mapping: any) => void;
}

const TableMappingComponent = ({ 
  projectId, 
  sourceConnection, 
  sourceTable, 
  sourceSchema, 
  onCreatePipeline 
}: TableMappingComponentProps) => {
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mappingName, setMappingName] = useState("");
  const [selectedSourceDb, setSelectedSourceDb] = useState(sourceConnection?.id || "");
  const [selectedSourceTable, setSelectedSourceTable] = useState(sourceTable || "");
  const [selectedTargetDb, setSelectedTargetDb] = useState("");
  const [selectedTargetTable, setSelectedTargetTable] = useState("");
  const [exportFormat, setExportFormat] = useState("json");
  const [tableMappings, setTableMappings] = useState<any[]>([]);
  const [schemaNodes, setSchemaNodes] = useState<any[]>([]);
  const [schemaEdges, setSchemaEdges] = useState<any[]>([]);

  // Initialize with passed props if available
  useState(() => {
    if (sourceConnection && sourceTable && sourceSchema) {
      const newMapping = {
        id: `mapping-${Date.now()}`,
        name: `${sourceSchema}.${sourceTable} Mapping`,
        sourceDb: sourceConnection.name,
        sourceTable: sourceTable,
        targetDb: "Target Database",
        targetTable: `transformed_${sourceTable}`,
        status: "active",
        createdAt: new Date().toISOString()
      };

      setTableMappings([newMapping]);
    }
  });

  // Mock data sources
  const sourceDatabases = [
    { id: "src1", name: "Sales MySQL Database", tables: ["customers", "orders", "products"] },
    { id: "src2", name: "Marketing PostgreSQL", tables: ["campaigns", "leads", "metrics"] }
  ];

  const targetDatabases = [
    { id: "tgt1", name: "Analytics Data Warehouse", tables: ["dim_customers", "dim_products", "fact_sales"] }
  ];

  const handleAddTable = useCallback(() => {
    setIsAddTableOpen(true);
  }, []);

  const handleExport = useCallback(() => {
    setIsExportOpen(true);
  }, []);

  const handleAddTableSubmit = useCallback(() => {
    if (!selectedSourceDb || !selectedSourceTable || !selectedTargetDb || !selectedTargetTable) {
      toast({
        title: "Missing Information",
        description: "Please select source and target tables to create a mapping.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const sourceDb = sourceDatabases.find(db => db.id === selectedSourceDb);
      const targetDb = targetDatabases.find(db => db.id === selectedTargetDb);

      if (!sourceDb || !targetDb) {
        toast({
          title: "Error",
          description: "Selected databases not found.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const newMapping = {
        id: `mapping-${Date.now()}`,
        name: mappingName || `Mapping ${tableMappings.length + 1}`,
        sourceDb: sourceDb.name,
        sourceTable: selectedSourceTable,
        targetDb: targetDb.name,
        targetTable: selectedTargetTable,
        status: "active",
        createdAt: new Date().toISOString()
      };

      setTableMappings([...tableMappings, newMapping]);
      
      // Update schema visualization
      const newSourceNode = {
        id: `node-src-${newMapping.id}`,
        type: 'default',
        data: { label: `${newMapping.sourceDb}\n${newMapping.sourceTable}` },
        position: { x: 100, y: 100 + tableMappings.length * 100 }
      };
      
      const newTargetNode = {
        id: `node-tgt-${newMapping.id}`,
        type: 'default',
        data: { label: `${newMapping.targetDb}\n${newMapping.targetTable}` },
        position: { x: 400, y: 100 + tableMappings.length * 100 }
      };
      
      const newEdge = {
        id: `edge-${newMapping.id}`,
        source: `node-src-${newMapping.id}`,
        target: `node-tgt-${newMapping.id}`,
        animated: true,
        label: 'transforms to'
      };
      
      setSchemaNodes([...schemaNodes, newSourceNode, newTargetNode]);
      setSchemaEdges([...schemaEdges, newEdge]);

      setIsAddTableOpen(false);
      setMappingName("");
      setSelectedSourceDb("");
      setSelectedSourceTable("");
      setSelectedTargetDb("");
      setSelectedTargetTable("");
      setIsLoading(false);

      toast({
        title: "Table Mapping Added",
        description: "The table mapping has been added to your project."
      });
    }, 800);
  }, [
    selectedSourceDb, 
    selectedSourceTable, 
    selectedTargetDb, 
    selectedTargetTable, 
    mappingName, 
    tableMappings, 
    schemaNodes, 
    schemaEdges
  ]);

  const handleExportSubmit = useCallback(() => {
    setIsLoading(true);

    setTimeout(() => {
      // Create a downloadable file with the mapping data
      const exportData = {
        projectId,
        mappings: tableMappings,
        exportedAt: new Date().toISOString()
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `table-mappings-${projectId}.${exportFormat}`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      setIsExportOpen(false);
      setIsLoading(false);

      toast({
        title: "Export Successful",
        description: `Table mappings exported as ${exportFormat.toUpperCase()} file.`
      });
    }, 1000);
  }, [exportFormat, projectId, tableMappings]);

  const handleCreatePipeline = useCallback(() => {
    if (tableMappings.length === 0) {
      toast({
        title: "No Mappings Available",
        description: "Please create at least one table mapping before creating a pipeline.",
        variant: "destructive"
      });
      return;
    }

    if (onCreatePipeline) {
      onCreatePipeline(tableMappings);
    }

    toast({
      title: "Pipeline Creation Started",
      description: "Redirecting to pipeline creation with your table mappings."
    });
  }, [tableMappings, onCreatePipeline]);

  const handleTableMappingChange = useCallback((nodes: any[], edges: any[]) => {
    // This function would be called when the schema graph changes
    console.log("Schema updated:", { nodes, edges });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3 space-y-4">
          <Card>
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
              <CardTitle className="flex items-center text-lg">
                <Table className="h-5 w-5 mr-2 text-indigo-600" />
                Table Mappings
              </CardTitle>
              <CardDescription>
                Define how your source tables map to target tables
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex justify-between mb-4">
                <Button variant="outline" size="sm" onClick={handleAddTable}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Table
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport} disabled={tableMappings.length === 0}>
                  <FileDown className="h-4 w-4 mr-1.5" />
                  Export
                </Button>
              </div>

              {tableMappings.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-md">
                  <Table className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 mb-2">No table mappings yet</p>
                  <Button size="sm" onClick={handleAddTable}>Add Your First Mapping</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tableMappings.map((mapping) => (
                    <div key={mapping.id} className="border rounded-md p-3 hover:border-indigo-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{mapping.name}</h4>
                        <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
                          {mapping.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 grid grid-cols-5 gap-2 items-center">
                        <div className="col-span-2">
                          <div className="flex items-center space-x-1">
                            <Database className="h-3 w-3 text-gray-400" />
                            <span>{mapping.sourceDb}</span>
                          </div>
                          <div className="pl-4 text-gray-500">{mapping.sourceTable}</div>
                        </div>
                        <div className="flex justify-center">
                          <ArrowRightCircle className="h-4 w-4 text-indigo-400" />
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center space-x-1">
                            <Database className="h-3 w-3 text-gray-400" />
                            <span>{mapping.targetDb}</span>
                          </div>
                          <div className="pl-4 text-gray-500">{mapping.targetTable}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Button className="w-full" onClick={handleCreatePipeline} disabled={tableMappings.length === 0}>
            <Code className="h-4 w-4 mr-2" />
            Create Pipeline with These Mappings
          </Button>
        </div>

        <div className="lg:w-2/3">
          <Card className="h-full">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
              <CardTitle className="flex items-center text-lg">
                <FileSpreadsheet className="h-5 w-5 mr-2 text-indigo-600" />
                Schema Visualization
              </CardTitle>
              <CardDescription>
                Visual representation of your database schema and table relationships
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[500px]">
              <SchemaGraphView onTableMappingChange={handleTableMappingChange} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Table Dialog */}
      <Dialog open={isAddTableOpen} onOpenChange={setIsAddTableOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Table Mapping</DialogTitle>
            <DialogDescription>
              Create a mapping between source and target tables.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="mapping-name">Mapping Name</Label>
              <Input
                id="mapping-name"
                placeholder="e.g., Customer Data Transformation"
                value={mappingName}
                onChange={(e) => setMappingName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Source</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={selectedSourceDb} onValueChange={setSelectedSourceDb}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Database" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceDatabases.map((db) => (
                      <SelectItem key={db.id} value={db.id}>
                        {db.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={selectedSourceTable} 
                  onValueChange={setSelectedSourceTable}
                  disabled={!selectedSourceDb}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Table" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedSourceDb && 
                      sourceDatabases
                        .find(db => db.id === selectedSourceDb)
                        ?.tables.map((table) => (
                          <SelectItem key={table} value={table}>
                            {table}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Target</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={selectedTargetDb} onValueChange={setSelectedTargetDb}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Database" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetDatabases.map((db) => (
                      <SelectItem key={db.id} value={db.id}>
                        {db.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={selectedTargetTable} 
                  onValueChange={setSelectedTargetTable}
                  disabled={!selectedTargetDb}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Table" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTargetDb && 
                      targetDatabases
                        .find(db => db.id === selectedTargetDb)
                        ?.tables.map((table) => (
                          <SelectItem key={table} value={table}>
                            {table}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTableOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTableSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Mapping"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Table Mappings</DialogTitle>
            <DialogDescription>
              Export your table mappings in various formats.
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
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                "Export"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableMappingComponent;
