
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
  Link2,
  Check,
  X
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input"; 
import { Separator } from "@/components/ui/separator"; 
import DataSourcesTab from "@/components/flow/DataSourcesTab";
import FlowDesignerTab from "@/components/flow/FlowDesignerTab";
import SidebarLayout from "@/components/layout/SidebarLayout";
import AddDataSourceDialog from "@/components/flow/AddDataSourceDialog";
import SchemaGraphView from "@/components/flow/SchemaGraphView";
import { useToast } from "@/hooks/use-toast";
import DataVisualization from "@/components/files/DataVisualization";
import FileUploadArea from "@/components/files/FileUploadArea";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[] | null>(null);
  const [pipelineCreated, setPipelineCreated] = useState(false);
  const [pipelineNodes, setPipelineNodes] = useState<FlowNode[]>([]);
  const [pipelineEdges, setPipelineEdges] = useState<FlowEdge[]>([]);
  const [sourceConnection, setSourceConnection] = useState({ type: "Oracle Database", tables: 4 });
  const [targetConnection, setTargetConnection] = useState({ type: "PostgreSQL", tables: 3 });
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
      tables: 4
    });
    toast({
      title: "Source Added",
      description: `Source "${data.name}" has been added successfully.`
    });
  };

  const handleTargetSubmit = (data: any) => {
    console.log("Target data:", data);
    setTargetDialogOpen(false);
    setTargetConnection({
      type: data.connectionType || "PostgreSQL",
      tables: 3
    });
    toast({
      title: "Target Added",
      description: `Target "${data.name}" has been added successfully.`
    });
  };

  const handleFileUpload = (files: FileList) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      
      // Add to processed files with a random progress for files that aren't "customers.csv"
      const isCustomersCsv = file.name === "customers.csv";
      const newFile = { 
        name: file.name, 
        status: isCustomersCsv ? "processed" : "processing", 
        progress: isCustomersCsv ? 100 : Math.floor(Math.random() * 30) + 65 // Random progress between 65-95% for non-customers.csv
      };
      
      setProcessedFiles(prev => [...prev, newFile]);

      // Process file and extract data
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // Process based on file type
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          let data: any[] = [];
          
          if (fileExtension === 'csv') {
            const content = e.target?.result as string;
            const parsedData = Papa.parse(content, { header: true });
            data = parsedData.data as any[];
          } else if (fileExtension === 'json') {
            data = JSON.parse(e.target?.result as string);
          } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const wb = XLSX.read(arrayBuffer, { type: 'array' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            data = XLSX.utils.sheet_to_json(ws);
          }
          
          setFileData(data);
          
          // Simulate file processing completing after a delay for non-processed files
          if (!isCustomersCsv) {
            setTimeout(() => {
              setProcessedFiles(prev => 
                prev.map(pf => 
                  pf.name === file.name ? { ...pf, status: "processed", progress: 100 } : pf
                )
              );
              
              toast({
                title: "File processing complete",
                description: `${file.name} has been processed successfully.`
              });
            }, 2500);
          }
          
        } catch (error) {
          console.error("Error processing file:", error);
          toast({
            title: "Error",
            description: "There was an error processing the file.",
            variant: "destructive"
          });
        }
      };
      
      if (file.type === "application/json") {
        reader.readAsText(file);
      } else if (file.type === "text/csv" || file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else if (file.type.includes("spreadsheet") || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        reader.readAsArrayBuffer(file);
      }
    }
  };

  const handleCreatePipeline = () => {
    // Create initial pipeline nodes based on source/target connections
    const initialNodes: FlowNode[] = [
      {
        id: 'source-1',
        type: 'input',
        position: { x: 100, y: 100 },
        data: { label: `${sourceConnection.type} Source` }
      },
      {
        id: 'transform-1',
        type: 'default',
        position: { x: 350, y: 100 },
        data: { label: 'Data Transformation' }
      },
      {
        id: 'target-1',
        type: 'output',
        position: { x: 600, y: 100 },
        data: { label: `${targetConnection.type} Target` }
      }
    ];
    
    const initialEdges: FlowEdge[] = [
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

  const handleAddNode = () => {
    // Add a new transformation node to the pipeline
    const newNodeId = `transform-${pipelineNodes.length + 1}`;
    const lastNodeIndex = pipelineNodes.length - 1;
    const lastNodeX = pipelineNodes[lastNodeIndex]?.position?.x || 350;
    const lastNodeY = pipelineNodes[lastNodeIndex]?.position?.y || 100;
    
    // Create new node
    const newNode: FlowNode = {
      id: newNodeId,
      type: 'default',
      position: { x: lastNodeX, y: lastNodeY + 100 },
      data: { label: 'New Transformation' }
    };
    
    // Create new edge connecting to the previous node
    const newEdge: FlowEdge = {
      id: `e-new-${Date.now()}`,
      source: pipelineNodes[lastNodeIndex].id,
      target: newNodeId
    };
    
    setPipelineNodes(prev => [...prev, newNode]);
    setPipelineEdges(prev => [...prev, newEdge]);
    
    toast({
      title: "Node Added",
      description: "New transformation node added to pipeline."
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

  const getWorkflowTabs = () => {
    switch(activeTab) {
      case "source":
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Source Connection</h2>
            
            <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
              <Input placeholder="Type or Select a Task to get started" className="mb-4" />
              
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm text-gray-500">Where do you want to get connected?</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
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
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Excel
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Common Tasks</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  Enter Credentials
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  Test Database connection
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  List Schemas
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  Generate Knowledge Graph
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  Select Schemas
                </li>
              </ul>
            </div>
          </div>
        );
      
      case "destination":
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Target Connection</h2>
            
            <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
              <Input placeholder="Type or Select a Task to get started" className="mb-4" />
              
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm text-gray-500">Where do you want to get connected?</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
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
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Common Tasks</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  Enter Credentials
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  Test Database connection
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  List Schemas
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  Generate Knowledge Graph
                </li>
              </ul>
            </div>
          </div>
        );
      
      case "tableMapping":
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Table Mapping</h2>
            <p className="text-gray-500 mb-6">Define relationships between source and target tables</p>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Table
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Link2 className="h-4 w-4" />
                  Create Relationship
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Export
                </Button>
                <Button onClick={handleCreatePipeline}>
                  Create Pipeline
                </Button>
              </div>
            </div>
            
            <div className="mb-6 h-96 border border-gray-200 rounded-lg overflow-hidden">
              <SchemaGraphView />
            </div>
            
            <div className="flex justify-between py-4">
              <Button variant="outline" onClick={() => setActiveTab("source")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Source
              </Button>
              <Button variant="outline" onClick={() => setActiveTab("destination")}>
                Back to Target
              </Button>
            </div>
          </div>
        );
      
      case "trainingData":
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Training Data</h2>
            <p className="text-gray-500 mb-6">Upload or configure training datasets for transformation learning</p>
            
            <FileUploadArea onFilesSelected={handleFileUpload} />
            
            {selectedFile && fileData && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Data Preview</h3>
                <DataVisualization data={fileData} />
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
                          <Check className="h-4 w-4 mr-1" /> Processed
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
        );
      
      case "createPipeline":
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Create Pipeline</h2>
            
            <div className="bg-white rounded-lg mb-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Flow Designer</h3>
                <p className="text-gray-500">Create your data transformation pipeline using the designer below.</p>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <Button size="sm" className="flex items-center gap-1" onClick={handleAddNode}>
                  <Plus className="h-4 w-4" />
                  Add Node
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Link2 className="h-4 w-4" />
                  Connect Nodes
                </Button>
              </div>
              
              <div className="h-[500px] border border-gray-200 rounded-lg overflow-hidden">
                <FlowDesignerTab 
                  projectId={project.id} 
                  initialNodes={pipelineNodes}
                  initialEdges={pipelineEdges}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setActiveTab("trainingData")}>
                Back to Training Data
              </Button>
              <Button variant="outline" onClick={() => setActiveTab("validate")}>
                Validate Pipeline
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Pipeline
              </Button>
            </div>
          </div>
        );
      
      case "validate":
        return (
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
                    <Check className="h-3 w-3 text-green-500" />
                  </div>
                  <span>Source connection is valid</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <Check className="h-3 w-3 text-green-500" />
                  </div>
                  <span>Target connection is valid</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <Check className="h-3 w-3 text-green-500" />
                  </div>
                  <span>Table mappings are consistent</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                    <X className="h-3 w-3 text-yellow-500" />
                  </div>
                  <span>Warning: Potential data type conversion issues in 2 columns</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveTab("createPipeline")}>
                Back to Pipeline
              </Button>
              <Button variant="outline" onClick={() => setActiveTab("savePipeline")}>
                Go to Save Pipeline
              </Button>
              <Button onClick={handleRunPipeline} disabled={isRunning}>
                {isRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Pipeline
                  </>
                )}
              </Button>
            </div>
          </div>
        );
      
      case "savePipeline":
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Save Pipeline</h2>
            <p className="text-gray-500 mb-6">Save and export your data transformation pipeline</p>
            
            <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline Name</label>
                  <Input defaultValue={`${project.name} Pipeline`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                  <Input defaultValue="1.0.0" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    defaultValue="ETL flow to integrate sales data from multiple sources into a centralized data warehouse."
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="schedule"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="schedule" className="ml-2 block text-sm text-gray-700">
                    Schedule this pipeline
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="export"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="export" className="ml-2 block text-sm text-gray-700">
                    Export as JSON configuration
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveTab("validate")}>
                Back to Validation
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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
        );
      
      default:
        return (
          <div className="p-6 bg-white rounded-lg">
            <p className="text-gray-500">Select a tab to get started</p>
          </div>
        );
    }
  };

  return (
    <SidebarLayout workspaceId={projectId}>
      <div className="flex flex-col h-full">
        <div className="bg-white border-b p-4">
          <div>
            <h1 className="text-xl font-bold">{project.name}</h1>
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
          
          <div className="flex-1 p-6 overflow-y-auto">
            {getWorkflowTabs()}
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
