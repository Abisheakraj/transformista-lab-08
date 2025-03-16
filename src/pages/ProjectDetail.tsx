
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Play, 
  Save, 
  Upload, 
  Database, 
  ChevronLeft, 
  Plus,
  FileSpreadsheet,
  Table,
  LayoutDashboard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator"; 
import DataSourcesTab from "@/components/flow/DataSourcesTab";
import FlowDesignerTab from "@/components/flow/FlowDesignerTab";
import SidebarLayout from "@/components/layout/SidebarLayout";
import AddDataSourceDialog from "@/components/flow/AddDataSourceDialog";
import SchemaGraphView from "@/components/flow/SchemaGraphView";
import TableMappingComponent from "@/components/flow/TableMappingComponent";
import FileUploadArea from "@/components/files/FileUploadArea";
import DataVisualization from "@/components/files/DataVisualization";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { UploadedFile } from "@/types/file-types";

interface Project {
  id: string;
  name: string;
  description: string;
}

interface ProcessedFile {
  name: string;
  status: "processed" | "processing";
  progress?: number;
}

interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  type?: string;
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState("source");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
  const [targetDialogOpen, setTargetDialogOpen] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [fileData, setFileData] = useState<any[] | null>(null);
  const [pipelineCreated, setPipelineCreated] = useState(false);
  const [pipelineNodes, setPipelineNodes] = useState<FlowNode[]>([]);
  const [pipelineEdges, setPipelineEdges] = useState<FlowEdge[]>([]);
  const [sourceConnection, setSourceConnection] = useState<any>({ type: "Oracle Database", tables: 4 });
  const [targetConnection, setTargetConnection] = useState<any>({ type: "PostgreSQL", tables: 3 });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [sourceTabContent, setSourceTabContent] = useState<"database" | "files">("database");
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        
        setProject({
          id: projectId || "1",
          name: "Sales Data Integration",
          description: "ETL flow to integrate sales data from multiple sources"
        });
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Project saved",
        description: "Your project has been saved successfully."
      });
    }, 1000);
  };

  const handleSourceSubmit = (data: any) => {
    console.log("Source data:", data);
    setSourceDialogOpen(false);
    setSourceConnection({
      type: data.connectionType || "Oracle Database",
      name: data.name,
      host: data.host,
      database: data.database,
      tables: 4
    });
    toast({
      title: "Source Added",
      description: `Source "${data.name}" has been added successfully.`
    });
    setActiveTab("tableMapping");
  };

  const handleTargetSubmit = (data: any) => {
    console.log("Target data:", data);
    setTargetDialogOpen(false);
    setTargetConnection({
      type: data.connectionType || "PostgreSQL",
      name: data.name,
      host: data.host,
      database: data.database,
      tables: 3
    });
    toast({
      title: "Target Added",
      description: `Target "${data.name}" has been added successfully.`
    });
    setActiveTab("tableMapping");
  };

  const handleFilesSelected = (files: FileList) => {
    // Process each uploaded file
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create a new file entry
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        data: null
      };
      
      // Add to processed files with progress indicator
      const processedFile: ProcessedFile = { 
        name: file.name, 
        status: "processing", 
        progress: 0
      };
      
      setProcessedFiles(prev => [...prev, processedFile]);
      
      reader.onload = (e) => {
        try {
          // Process based on file type
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          let parsedData: any[] = [];
          let columns: string[] = [];
          let rows: any[][] = [];
          
          if (fileExtension === 'csv') {
            const content = e.target?.result as string;
            const parsedCsv = Papa.parse(content, { header: true });
            parsedData = parsedCsv.data as any[];
            
            if (parsedCsv.meta && parsedCsv.meta.fields) {
              columns = parsedCsv.meta.fields;
            }
            
            // Convert data to rows format
            rows = parsedData.map(item => columns.map(col => item[col]));
            
          } else if (fileExtension === 'json') {
            parsedData = JSON.parse(e.target?.result as string);
            
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              columns = Object.keys(parsedData[0]);
              rows = parsedData.map(item => columns.map(col => item[col]));
            }
            
          } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const wb = XLSX.read(arrayBuffer, { type: 'array' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            parsedData = XLSX.utils.sheet_to_json(ws);
            
            if (parsedData.length > 0) {
              columns = Object.keys(parsedData[0]);
              rows = parsedData.map(item => columns.map(col => item[col]));
            }
          }
          
          // Update the file with parsed data
          const updatedFile = {
            ...newFile,
            data: parsedData,
            columns,
            rows
          };
          
          setUploadedFiles(prev => [...prev, updatedFile]);
          
          if (!selectedFile) {
            setSelectedFile(updatedFile);
            setFileData(parsedData);
          }
          
          // Simulate file processing with progress updates
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            setProcessedFiles(prev => 
              prev.map(pf => 
                pf.name === file.name ? { ...pf, progress } : pf
              )
            );
            
            if (progress >= 100) {
              clearInterval(interval);
              setProcessedFiles(prev => 
                prev.map(pf => 
                  pf.name === file.name ? { ...pf, status: "processed", progress: 100 } : pf
                )
              );
              
              toast({
                title: "File processing complete",
                description: `${file.name} has been processed successfully.`
              });
            }
          }, 300);
          
        } catch (error) {
          console.error("Error processing file:", error);
          toast({
            title: "Error",
            description: "There was an error processing the file.",
            variant: "destructive"
          });
          
          setProcessedFiles(prev => 
            prev.map(pf => 
              pf.name === file.name ? { ...pf, status: "processed", progress: 100 } : pf
            )
          );
        }
      };
      
      // Read the file based on its type
      if (file.type === "application/json") {
        reader.readAsText(file);
      } else if (file.type === "text/csv" || file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else if (file.type.includes("spreadsheet") || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const handleCreatePipeline = (nodes?: any[], edges?: any[]) => {
    // Create initial pipeline nodes based on source/target connections
    const initialNodes: FlowNode[] = nodes || [
      {
        id: 'source-1',
        type: 'source',
        position: { x: 100, y: 100 },
        data: { 
          label: sourceConnection.name || `${sourceConnection.type} Source`, 
          tables: sourceConnection.tables 
        }
      },
      {
        id: 'transform-1',
        type: 'transform',
        position: { x: 350, y: 100 },
        data: { label: 'Data Transformation', operation: 'JOIN' }
      },
      {
        id: 'target-1',
        type: 'target',
        position: { x: 600, y: 100 },
        data: { 
          label: targetConnection.name || `${targetConnection.type} Target`, 
          tables: targetConnection.tables 
        }
      }
    ];
    
    const initialEdges: FlowEdge[] = edges || [
      {
        id: 'e-source-transform',
        source: 'source-1',
        target: 'transform-1',
        animated: true
      },
      {
        id: 'e-transform-target',
        source: 'transform-1',
        target: 'target-1',
        animated: true
      }
    ];
    
    setPipelineNodes(initialNodes);
    setPipelineEdges(initialEdges);
    setPipelineCreated(true);
    setActiveTab("createPipeline");
    
    toast({
      title: "Pipeline Created",
      description: "Your pipeline has been created successfully."
    });
  };

  const handleRunPipeline = () => {
    setIsRunning(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsRunning(false);
      toast({
        title: "Pipeline Executed",
        description: "Your pipeline has been executed successfully."
      });
    }, 2000);
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!project) {
    return (
      <SidebarLayout>
        <div className="container mx-auto px-4 py-10">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="flex flex-col h-full">
        <div className="bg-white border-b p-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight mb-1">{project.name}</h1>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </div>
        </div>
        
        <div className="flex h-full">
          <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-white">
            <div className="py-4">
              <div className="space-y-1 px-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
                  Pipeline Steps
                </h3>
                <div 
                  className={`flex items-center gap-2 ${activeTab === 'source' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'} rounded-md px-3 py-2 cursor-pointer transition-colors`}
                  onClick={() => setActiveTab('source')}
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</div>
                  <div className="w-full text-sm font-medium">Source</div>
                </div>
                <div 
                  className={`flex items-center gap-2 ${activeTab === 'destination' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'} rounded-md px-3 py-2 cursor-pointer transition-colors`}
                  onClick={() => setActiveTab('destination')}
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</div>
                  <div className="w-full text-sm font-medium">Destination</div>
                </div>
                <div 
                  className={`flex items-center gap-2 ${activeTab === 'tableMapping' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'} rounded-md px-3 py-2 cursor-pointer transition-colors`}
                  onClick={() => setActiveTab('tableMapping')}
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">3</div>
                  <div className="w-full text-sm font-medium">Table Mapping</div>
                </div>
                <div 
                  className={`flex items-center gap-2 ${activeTab === 'trainingData' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'} rounded-md px-3 py-2 cursor-pointer transition-colors`}
                  onClick={() => setActiveTab('trainingData')}
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">4</div>
                  <div className="w-full text-sm font-medium">Training Data</div>
                </div>
                <div 
                  className={`flex items-center gap-2 ${activeTab === 'createPipeline' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'} rounded-md px-3 py-2 cursor-pointer transition-colors`}
                  onClick={() => setActiveTab('createPipeline')}
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">5</div>
                  <div className="w-full text-sm font-medium">Create Pipeline</div>
                </div>
                <div 
                  className={`flex items-center gap-2 ${activeTab === 'validate' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'} rounded-md px-3 py-2 cursor-pointer transition-colors`}
                  onClick={() => setActiveTab('validate')}
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">6</div>
                  <div className="w-full text-sm font-medium">Validate</div>
                </div>
                <div 
                  className={`flex items-center gap-2 ${activeTab === 'savePipeline' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'} rounded-md px-3 py-2 cursor-pointer transition-colors`}
                  onClick={() => setActiveTab('savePipeline')}
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">7</div>
                  <div className="w-full text-sm font-medium">Save Pipeline</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-auto">
            {activeTab === "source" && (
              <div className="p-6 bg-white rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Source Connection</h2>
                
                <Tabs value={sourceTabContent} onValueChange={(v) => setSourceTabContent(v as "database" | "files")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="database" className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Database
                    </TabsTrigger>
                    <TabsTrigger value="files" className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      File Upload
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="database" className="mt-0">
                    <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2 mb-4">
                        <p className="text-sm text-gray-500">Connect to a database source</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        <Button variant="outline" onClick={() => setSourceDialogOpen(true)} className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Oracle
                        </Button>
                        <Button variant="outline" onClick={() => setSourceDialogOpen(true)} className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          MySQL
                        </Button>
                        <Button variant="outline" onClick={() => setSourceDialogOpen(true)} className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          PostgreSQL
                        </Button>
                        <Button variant="outline" onClick={() => setSourceDialogOpen(true)} className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          SQL Server
                        </Button>
                        <Button variant="outline" onClick={() => setSourceDialogOpen(true)} className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Sybase
                        </Button>
                      </div>
                      
                      {sourceConnection && sourceConnection.name && (
                        <Card className="mt-6 bg-white">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between">
                              <div>
                                <CardTitle>{sourceConnection.name}</CardTitle>
                                <CardDescription>
                                  {sourceConnection.type} • {sourceConnection.host}/{sourceConnection.database}
                                </CardDescription>
                              </div>
                              <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                                Connected
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <h4 className="text-sm font-medium mb-2">Available Tables</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {['customers', 'orders', 'products', 'inventory'].map(table => (
                                <div key={table} className="bg-gray-50 p-2 rounded border text-sm flex items-center">
                                  <Table className="h-3.5 w-3.5 mr-2 text-gray-500" />
                                  {table}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => setActiveTab("destination")}
                        disabled={!sourceConnection.name}
                      >
                        Continue to Destination
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="files" className="mt-0">
                    <div className="mb-6">
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-4">
                          Upload your data files for processing
                        </p>
                        
                        <FileUploadArea 
                          onFilesSelected={handleFilesSelected}
                          allowedFileTypes={['.csv', '.xlsx', '.xls', '.json']}
                          maxFileSize={20}
                          multiple={true}
                        />
                      </div>
                      
                      {processedFiles.length > 0 && (
                        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h3 className="font-medium mb-2">Uploaded Files</h3>
                          <div className="space-y-3">
                            {processedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between text-sm bg-white p-2 rounded border">
                                <span>{file.name}</span>
                                {file.status === "processed" ? (
                                  <span className="text-green-500 flex items-center">
                                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Processed
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                      <div 
                                        className="bg-blue-500 h-2.5 rounded-full" 
                                        style={{ width: `${file.progress || 0}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-500">{file.progress}%</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {uploadedFiles.length > 0 && selectedFile && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-3">Data Preview</h3>
                          
                          <div className="mb-4">
                            <label htmlFor="file-selector" className="text-sm font-medium">
                              Select File to Preview:
                            </label>
                            <select 
                              id="file-selector"
                              className="ml-2 p-1 border border-gray-300 rounded"
                              value={selectedFile.id}
                              onChange={(e) => {
                                const selected = uploadedFiles.find(f => f.id === e.target.value);
                                if (selected) {
                                  setSelectedFile(selected);
                                  setFileData(selected.data);
                                }
                              }}
                            >
                              {uploadedFiles.map(file => (
                                <option key={file.id} value={file.id}>
                                  {file.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <DataVisualization 
                              data={selectedFile.data} 
                              columns={selectedFile.columns} 
                              rows={selectedFile.rows} 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => setActiveTab("destination")}
                        disabled={uploadedFiles.length === 0}
                      >
                        Continue to Destination
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
            
            {activeTab === "destination" && (
              <div className="p-6 bg-white rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Target Connection</h2>
                
                <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-4">
                    <p className="text-sm text-gray-500">Connect to a target database</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Button variant="outline" onClick={() => setTargetDialogOpen(true)} className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Oracle
                    </Button>
                    <Button variant="outline" onClick={() => setTargetDialogOpen(true)} className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      MySQL
                    </Button>
                    <Button variant="outline" onClick={() => setTargetDialogOpen(true)} className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Postgres
                    </Button>
                    <Button variant="outline" onClick={() => setTargetDialogOpen(true)} className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      SQL Server
                    </Button>
                    <Button variant="outline" onClick={() => setTargetDialogOpen(true)} className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      BigQuery
                    </Button>
                    <Button variant="outline" onClick={() => setTargetDialogOpen(true)} className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Snowflake
                    </Button>
                  </div>
                  
                  {targetConnection && targetConnection.name && (
                    <Card className="mt-6 bg-white">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div>
                            <CardTitle>{targetConnection.name}</CardTitle>
                            <CardDescription>
                              {targetConnection.type} • {targetConnection.host}/{targetConnection.database}
                            </CardDescription>
                          </div>
                          <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                            Connected
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h4 className="text-sm font-medium mb-2">Available Tables</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {['dim_customers', 'dim_products', 'fact_sales'].map(table => (
                            <div key={table} className="bg-gray-50 p-2 rounded border text-sm flex items-center">
                              <Table className="h-3.5 w-3.5 mr-2 text-gray-500" />
                              {table}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("source")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Source
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("tableMapping")}
                    disabled={!targetConnection.name}
                  >
                    Continue to Table Mapping
                  </Button>
                </div>
              </div>
            )}
            
            {activeTab === "tableMapping" && (
              <div className="p-6 bg-white rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Table Mapping</h2>
                <p className="text-gray-500 mb-6">Define relationships between source and target tables</p>
                
                <div className="mb-6 h-[500px] border border-gray-200 rounded-lg overflow-hidden">
                  <SchemaGraphView onCreatePipeline={handleCreatePipeline} />
                </div>
                
                <div className="flex justify-between py-4">
                  <Button variant="outline" onClick={() => setActiveTab("destination")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Destination
                  </Button>
                  <Button onClick={() => setActiveTab("trainingData")}>
                    Continue to Training Data
                  </Button>
                </div>
              </div>
            )}
            
            {activeTab === "trainingData" && (
              <div className="p-6 bg-white rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Training Data</h2>
                <p className="text-gray-500 mb-6">Upload or configure training datasets for transformation learning</p>
                
                <FileUploadArea onFilesSelected={handleFilesSelected} />
                
                {selectedFile && fileData && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Data Preview</h3>
                    <DataVisualization data={fileData} columns={selectedFile.columns} rows={selectedFile.rows} />
                  </div>
                )}
                
                {processedFiles.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
                    <h3 className="font-medium mb-2">File Processing</h3>
                    <p className="text-sm text-gray-500 mb-4">Upload your training data files and the system will automatically process them to learn data transformation patterns.</p>
                    
                    <div className="space-y-4">
                      {processedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{file.name}</span>
                          {file.status === "processed" ? (
                            <span className="text-green-500 flex items-center">
                              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Processed
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-blue-500 h-2.5 rounded-full" 
                                  style={{ width: `${file.progress || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">{file.progress}%</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setActiveTab("tableMapping")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Table Mapping
                  </Button>
                  <Button onClick={() => setActiveTab("createPipeline")}>
                    Continue to Create Pipeline
                  </Button>
                </div>
              </div>
            )}
            
            {activeTab === "createPipeline" && (
              <div className="p-6 bg-white rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Create Pipeline</h2>
                
                <div className="bg-white rounded-lg mb-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Flow Designer</h3>
                    <p className="text-gray-500">Create your data transformation pipeline using the designer below.</p>
                  </div>
                  
                  <div className="h-[500px] border border-gray-200 rounded-lg overflow-hidden">
                    <FlowDesignerTab 
                      projectId={project.id} 
                      onSave={handleSave}
                      onRun={handleRunPipeline}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between gap-2 mt-6">
                  <Button variant="outline" onClick={() => setActiveTab("trainingData")}>
                    Back to Training Data
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("validate")}>
                    Validate Pipeline
                  </Button>
                </div>
              </div>
            )}
            
            {activeTab === "validate" && (
              <div className="p-6 bg-white rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Validate Pipeline</h2>
                <p className="text-gray-500 mb-6">Run validation checks on your data transformation pipeline</p>
                
                <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Validation Results</h3>
                    <Button size="sm">
                      <Play className="mr-2 h-4 w-4" />
                      Run Validation
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <svg className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Source connection is valid</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <svg className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Target connection is valid</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <svg className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Table mappings are consistent</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                        <svg className="h-3 w-3 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <span>Warning: Potential data type conversion issues in 2 columns</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between gap-2">
                  <Button variant="outline" onClick={() => setActiveTab("createPipeline")}>
                    Back to Pipeline
                  </Button>
                  <Button onClick={() => setActiveTab("savePipeline")}>
                    Continue to Save Pipeline
                  </Button>
                </div>
              </div>
            )}
            
            {activeTab === "savePipeline" && (
              <div className="p-6 bg-white rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Save Pipeline</h2>
                <p className="text-gray-500 mb-6">Save your pipeline configuration and schedule execution</p>
                
                <div className="space-y-6">
                  <div className="grid gap-4 p-6 border border-gray-200 rounded-lg bg-gray-50">
                    <div>
                      <Label htmlFor="pipeline-name">Pipeline Name</Label>
                      <Input id="pipeline-name" className="mt-1" placeholder="Enter pipeline name" defaultValue={`${project.name} Pipeline`} />
                    </div>
                    
                    <div>
                      <Label htmlFor="pipeline-desc">Description</Label>
                      <Input id="pipeline-desc" className="mt-1" placeholder="Enter description" defaultValue="ETL flow to integrate sales data from multiple sources" />
                    </div>
                    
                    <div>
                      <Label htmlFor="schedule">Schedule</Label>
                      <Select defaultValue="manual">
                        <SelectTrigger id="schedule" className="mt-1">
                          <SelectValue placeholder="Select schedule" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual Execution</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-between gap-2">
                    <Button variant="outline" onClick={() => setActiveTab("validate")}>
                      Back to Validation
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Pipeline
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AddDataSourceDialog
        open={sourceDialogOpen}
        onOpenChange={setSourceDialogOpen}
        onSubmit={handleSourceSubmit}
        type="source"
      />
      
      <AddDataSourceDialog
        open={targetDialogOpen}
        onOpenChange={setTargetDialogOpen}
        onSubmit={handleTargetSubmit}
        type="target"
      />
    </SidebarLayout>
  );
};

export default ProjectDetail;
