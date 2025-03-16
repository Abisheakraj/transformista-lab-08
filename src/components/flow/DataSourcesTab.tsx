
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Database, Plus, Trash2, RefreshCcw, ExternalLink, Files, Table, Eye, ArrowRight } from "lucide-react";
import AddDataSourceDialog from "./AddDataSourceDialog";
import { Separator } from "@/components/ui/separator";
import { Link as RouterLink } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUploadArea from "../files/FileUploadArea";
import DataVisualization from "../files/DataVisualization";
import { UploadedFile } from "../files/FileUploadArea";
import { useDatabaseConnections } from "@/hooks/useDatabaseConnections";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import TableMappingComponent from "./TableMappingComponent";
import SchemaGraphView from "./SchemaGraphView";

interface DataSourcesTabProps {
  projectId: string;
}

const DataSourcesTab = ({ projectId }: DataSourcesTabProps) => {
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [isAddTargetOpen, setIsAddTargetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("sources");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [isTablePreviewOpen, setIsTablePreviewOpen] = useState(false);
  const [tableMappingActive, setTableMappingActive] = useState(false);
  const [schemaViewActive, setSchemaViewActive] = useState(false);
  const [pipelineCreated, setPipelineCreated] = useState(false);
  const [pipelineValidated, setPipelineValidated] = useState(false);
  
  const { 
    connections, 
    schemas, 
    tableData, 
    fetchSchemas, 
    selectTable, 
    isLoading: databaseLoading, 
    selectedConnection,
    selectedTable,
    selectedSchema,
    testConnection,
    addConnection,
  } = useDatabaseConnections();

  const { toast } = useToast();

  // Filter sources and targets
  const sources = connections.filter(conn => conn.type === "source");
  const targets = connections.filter(conn => conn.type === "target");

  // Handle test connection
  const handleTestConnection = async (sourceId: string) => {
    setIsLoading(true);
    await testConnection(sourceId);
    setIsLoading(false);
  };

  // Handle database selection
  const handleDatabaseSelect = async (connectionId: string) => {
    setIsLoading(true);
    await fetchSchemas(connectionId);
    setIsLoading(false);
  };

  // Handle table selection
  const handleTableSelect = async (schema: string, table: string) => {
    setIsLoading(true);
    await selectTable(schema, table);
    setIsTablePreviewOpen(true);
    setIsLoading(false);
  };

  // Handle file select
  const handleFilesSelected = (files: FileList) => {
    // This will be handled by the FileUploadArea component internally
    console.log("Files selected:", files);
  };
  
  // Handle file upload
  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0]);
    }
  };

  // Handle connection submission
  const handleSubmitSource = (dataSource: any) => {
    const connectionId = addConnection({
      ...dataSource,
      name: dataSource.name || `${dataSource.connectionType} Connection`,
      host: dataSource.host,
      port: dataSource.port,
      username: dataSource.username,
      password: dataSource.password,
      connectionType: dataSource.connectionType,
    });
    
    if (dataSource.type === "source") {
      setIsAddSourceOpen(false);
    } else {
      setIsAddTargetOpen(false);
    }
    
    toast({
      title: "Connection added",
      description: `The ${dataSource.name} connection has been added to your project.`
    });
    
    // Test the connection
    setTimeout(() => {
      handleTestConnection(connectionId);
    }, 500);
  };

  // Handle pipeline creation
  const handleCreatePipeline = () => {
    setPipelineCreated(true);
    toast({
      title: "Pipeline Created",
      description: "Your data transformation pipeline has been created successfully."
    });
  };

  // Handle pipeline validation
  const handleValidatePipeline = () => {
    setPipelineValidated(true);
    toast({
      title: "Pipeline Validated",
      description: "Your pipeline has been validated successfully and is ready to run."
    });
  };

  // Handle pipeline save
  const handleSavePipeline = () => {
    toast({
      title: "Pipeline Saved",
      description: "Your pipeline has been saved successfully."
    });
  };

  const canContinueToNextStep = selectedConnection && 
    (tableMappingActive || (selectedSchema && selectedTable) || uploadedFiles.length > 0);

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-6 bg-indigo-50 p-1">
          <TabsTrigger 
            value="sources" 
            className="flex-1 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
          >
            Database Connections
          </TabsTrigger>
          <TabsTrigger 
            value="files" 
            className="flex-1 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
          >
            File Upload & Visualization
          </TabsTrigger>
          <TabsTrigger 
            value="pipeline" 
            className="flex-1 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
            disabled={!selectedConnection}
          >
            Data Pipeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-6 animate-in fade-in-50 mt-0">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" asChild>
              <RouterLink to="/connections" className="flex items-center">
                <Database className="h-4 w-4 mr-1.5" />
                Manage All Connections
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </RouterLink>
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Source Databases</h2>
                <Button onClick={() => setIsAddSourceOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              </div>
              
              {sources.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center">
                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Source Databases</h3>
                    <p className="text-muted-foreground mb-4">
                      Add a source database to start importing data for your ETL flow.
                    </p>
                    <Button onClick={() => setIsAddSourceOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Source
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sources.map(source => (
                    <Card key={source.id} className="border border-gray-200 hover:border-indigo-200 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{source.name}</CardTitle>
                            <CardDescription>
                              {source.connectionType} • {source.host}{source.port ? `:${source.port}` : ""}
                              {source.database && <span className="text-indigo-600">/{source.database}</span>}
                            </CardDescription>
                          </div>
                          <Badge 
                            variant={source.status === "connected" || source.status === "selected" ? "outline" : "destructive"}
                            className={source.status === "connected" || source.status === "selected" ? "border-green-300 text-green-700 bg-green-50" : ""}
                          >
                            {source.status === "selected" ? "Database Selected" : 
                             source.status === "connected" ? "Connected" : 
                             source.status === "failed" ? "Failed" : "Pending"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3 pt-0">
                        <div className="text-xs text-muted-foreground">
                          Last tested: {source.lastTested ? new Date(source.lastTested).toLocaleString() : "Never"}
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-3 flex justify-end gap-2">
                        {source.status === "selected" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDatabaseSelect(source.id)}
                          >
                            <Table className="h-3.5 w-3.5 mr-1" />
                            Browse Tables
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestConnection(source.id)}
                          disabled={isLoading}
                        >
                          {isLoading ? (
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
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Remove
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            <div className="md:w-1/2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Target Databases</h2>
                <Button onClick={() => setIsAddTargetOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Target
                </Button>
              </div>
              
              {targets.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center">
                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Target Databases</h3>
                    <p className="text-muted-foreground mb-4">
                      Add a target database to define where your processed data will be stored.
                    </p>
                    <Button onClick={() => setIsAddTargetOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Target
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {targets.map(target => (
                    <Card key={target.id} className="border border-gray-200 hover:border-purple-200 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{target.name}</CardTitle>
                            <CardDescription>
                              {target.connectionType} • {target.host}{target.port ? `:${target.port}` : ""}
                              {target.database && <span className="text-purple-600">/{target.database}</span>}
                            </CardDescription>
                          </div>
                          <Badge 
                            variant={target.status === "connected" || target.status === "selected" ? "outline" : "destructive"}
                            className={target.status === "connected" || target.status === "selected" ? "border-green-300 text-green-700 bg-green-50" : ""}
                          >
                            {target.status === "selected" ? "Database Selected" : 
                             target.status === "connected" ? "Connected" : 
                             target.status === "failed" ? "Failed" : "Pending"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3 pt-0">
                        <div className="text-xs text-muted-foreground">
                          Output destination for transformed data
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-3 flex justify-end gap-2">
                        {target.status === "selected" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDatabaseSelect(target.id)}
                          >
                            <Table className="h-3.5 w-3.5 mr-1" />
                            Browse Tables
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestConnection(target.id)}
                          disabled={isLoading}
                        >
                          {isLoading ? (
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
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Remove
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Database Schema Browser */}
          {selectedConnection && (
            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Database className="h-5 w-5 mr-2 text-indigo-600" />
                  Database Schema Browser
                </CardTitle>
                <CardDescription>
                  Browse tables from {selectedConnection.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {databaseLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                    <span className="ml-2">Loading schemas...</span>
                  </div>
                ) : schemas.length === 0 ? (
                  <div className="text-center py-10 border border-dashed rounded-md">
                    <Table className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 mb-2">No schemas found</p>
                    <p className="text-gray-400 text-sm">Select a connection with a database to view tables</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {schemas.map((schema) => (
                      <div key={schema.name} className="border rounded-md p-4">
                        <h3 className="text-md font-medium mb-2 flex items-center">
                          <Database className="h-4 w-4 mr-2 text-indigo-600" />
                          {schema.name}
                        </h3>
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
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="ml-2">{table.columns.length} cols</Badge>
                                <Button size="icon" variant="ghost" className="h-6 w-6">
                                  <Eye className="h-3.5 w-3.5 text-blue-600" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              {selectedTable && selectedSchema && (
                <CardFooter className="border-t pt-4 flex justify-end">
                  <Button
                    onClick={() => setTableMappingActive(true)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Continue with Selected Table
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="files" className="space-y-8 animate-in fade-in-50 mt-0">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <Files className="h-5 w-5 mr-2 text-indigo-600" />
                Upload Data Files
              </h2>
              <p className="text-gray-500 mb-4">
                Upload CSV, Excel, or JSON files to visualize and transform your data
              </p>
              
              <FileUploadArea 
                onFilesSelected={handleFilesSelected}
                onFilesUploaded={handleFilesUploaded}
                allowedFileTypes={['.csv', '.xlsx', '.xls', '.json']}
                maxFileSize={20}
                multiple={true}
              />
            </div>
          </div>
          
          {uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Data Visualization</h2>
                
                <div className="flex gap-2">
                  <Select 
                    value={selectedFile?.id || ''}
                    onValueChange={(value) => {
                      const selected = uploadedFiles.find(file => file.id === value);
                      if (selected) setSelectedFile(selected);
                    }}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Select a file" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Uploaded Files</SelectLabel>
                        {uploadedFiles.map(file => (
                          <SelectItem key={file.id} value={file.id}>
                            {file.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedFile && (
                <DataVisualization 
                  data={selectedFile.data}
                  columns={selectedFile.columns}
                  rows={selectedFile.rows}
                />
              )}

              <div className="flex justify-end mt-4">
                <Button 
                  onClick={() => setActiveTab("pipeline")}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Continue to Pipeline
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6 animate-in fade-in-50 mt-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Data Pipeline Configuration</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setSchemaViewActive(!schemaViewActive)}
              >
                {schemaViewActive ? "Hide" : "Show"} Schema Graph
              </Button>
              <Button
                disabled={!tableMappingActive}
                onClick={handleCreatePipeline}
                className={`${pipelineCreated ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
              >
                {pipelineCreated ? "Pipeline Created" : "Create Pipeline"}
              </Button>
            </div>
          </div>

          {/* Schema Graph View */}
          {schemaViewActive && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Schema Visualization</CardTitle>
                <CardDescription>Visual representation of your data schema</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <SchemaGraphView />
              </CardContent>
            </Card>
          )}

          {/* Table Mapping Component */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Table className="h-5 w-5 mr-2 text-indigo-600" />
                Table Mapping
              </CardTitle>
              <CardDescription>
                Define the mapping between source and target tables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableMappingComponent 
                sourceConnection={selectedConnection}
                sourceTable={selectedTable || ""}
                sourceSchema={selectedSchema || ""}
              />
            </CardContent>
          </Card>

          {/* Pipeline Actions */}
          <div className="flex justify-end gap-4">
            <Button 
              variant="outline"
              disabled={!pipelineCreated}
              onClick={handleValidatePipeline}
              className={pipelineValidated ? "text-green-600 border-green-200" : ""}
            >
              {pipelineValidated ? "Validation Passed" : "Validate Pipeline"}
            </Button>
            <Button
              disabled={!pipelineValidated}
              onClick={handleSavePipeline}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Save Pipeline
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Table Preview Dialog */}
      <Dialog open={isTablePreviewOpen} onOpenChange={setIsTablePreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Table className="h-5 w-5 mr-2 text-indigo-600" />
              Table Preview: {selectedSchema}.{selectedTable}
            </DialogTitle>
            <DialogDescription>
              Preview of the first 50 rows from the selected table
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {databaseLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                <span className="ml-2">Loading data...</span>
              </div>
            ) : !tableData?.columns?.length ? (
              <div className="text-center py-10 border border-dashed rounded-md">
                <Table className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 mb-2">No data available for this table</p>
              </div>
            ) : (
              <div className="overflow-auto max-h-[400px]">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-white">
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
            )}
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsTablePreviewOpen(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setIsTablePreviewOpen(false);
                setTableMappingActive(true);
                setActiveTab("pipeline");
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Use This Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AddDataSourceDialog
        open={isAddSourceOpen}
        onOpenChange={setIsAddSourceOpen}
        onSubmit={handleSubmitSource}
        type="source"
      />
      
      <AddDataSourceDialog
        open={isAddTargetOpen}
        onOpenChange={setIsAddTargetOpen}
        onSubmit={handleSubmitSource}
        type="target"
      />
    </div>
  );
};

export default DataSourcesTab;
