
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Save, Upload, Database, ChevronLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input"; 
import { Separator } from "@/components/ui/separator"; 
import DataSourcesTab from "@/components/flow/DataSourcesTab";
import FlowDesignerTab from "@/components/flow/FlowDesignerTab";
import SidebarLayout from "@/components/layout/SidebarLayout";
import AddDataSourceDialog from "@/components/flow/AddDataSourceDialog";
import SchemaGraphView from "@/components/flow/SchemaGraphView";

interface Project {
  id: string;
  name: string;
  description: string;
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
  const navigate = useNavigate();

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
    toast({
      title: "Source Added",
      description: `Source "${data.name}" has been added successfully.`
    });
  };

  const handleTargetSubmit = (data: any) => {
    console.log("Target data:", data);
    setTargetDialogOpen(false);
    toast({
      title: "Target Added",
      description: `Target "${data.name}" has been added successfully.`
    });
  };

  const handleCreatePipeline = () => {
    setActiveTab("createPipeline");
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
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSourceDialogOpen(true)} className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Oracle
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Enter Credentials
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Test Database connection
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  List Schemas
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Generate Knowledge Graph
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
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
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setTargetDialogOpen(true)} className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Oracle
                </Button>
                <Button variant="outline" onClick={() => setTargetDialogOpen(true)} className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Postgres
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Enter Credentials
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Test Database connection
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  List Schemas
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
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
            
            <div className="mb-6 h-96">
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
            
            <div className="mb-6 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
              <Upload className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">Drag and drop files here, or click to select files</p>
              <input type="file" id="file-upload" className="hidden" multiple />
              <label htmlFor="file-upload">
                <Button variant="outline" className="mx-auto">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </label>
              <p className="text-xs text-gray-400 mt-2">Supported formats: .csv, .xlsx, .json</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">File Processing</h3>
              <p className="text-sm text-gray-500 mb-4">Upload your training data files and the system will automatically process them to learn data transformation patterns.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>customers.csv</span>
                  <span className="text-green-500">Processed</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>sales_2023.xlsx</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "createPipeline":
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Create Pipeline</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="md:col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-3">Connection Info</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Source:</span>
                    <span className="font-medium">Oracle Database</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Target:</span>
                    <span className="font-medium">PostgreSQL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tables:</span>
                    <span className="font-medium">4 mapped</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <h3 className="font-medium mb-3">Table Mapping</h3>
                <div className="mb-3">
                  <SchemaGraphView />
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab("tableMapping")}>
                  Edit Mappings
                </Button>
              </div>
              
              <div className="md:col-span-3">
                <FlowDesignerTab projectId={project.id} />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setActiveTab("tableMapping")}>
                Back to Mapping
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <span>Source connection is valid</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <span>Target connection is valid</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <span>Table mappings are consistent</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                    </svg>
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
              <Button>
                <Play className="mr-2 h-4 w-4" />
                Run Pipeline
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
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Pipeline
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
                  className={`flex items-center gap-2 ${activeTab === 'source' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'} rounded-md px-3 py-2 cursor-pointer`}
                  onClick={() => setActiveTab('source')}
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</div>
                  <div className="w-full text-sm font-medium">Source</div>
                </div>
                <div 
                  className={`flex items-center gap-2 ${activeTab === 'destination' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'} rounded-md px-3 py-2 cursor-pointer`}
                  onClick={() => setActiveTab('destination')}
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</div>
                  <div className="w-full text-sm font-medium">Destination</div>
                </div>
                <div 
                  className={`flex items-center gap-2 ${activeTab === 'tableMapping' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'} rounded-md px-3 py-2 cursor-pointer`}
                  onClick={() => setActiveTab('tableMapping')}
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">3</div>
                  <div className="w-full text-sm font-medium">Table Mapping</div>
                </div>
                <div 
                  className={`flex items-center gap-2 ${activeTab === 'trainingData' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'} rounded-md px-3 py-2 cursor-pointer`}
                  onClick={() => setActiveTab('trainingData')}
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">4</div>
                  <div className="w-full text-sm font-medium">Training Data</div>
                </div>
                <div 
                  className={`flex items-center gap-2 ${activeTab === 'createPipeline' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'} rounded-md px-3 py-2 cursor-pointer`}
                  onClick={() => setActiveTab('createPipeline')}
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">5</div>
                  <div className="w-full text-sm font-medium">Create Pipeline</div>
                </div>
                <div 
                  className={`flex items-center gap-2 ${activeTab === 'validate' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'} rounded-md px-3 py-2 cursor-pointer`}
                  onClick={() => setActiveTab('validate')}
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">6</div>
                  <div className="w-full text-sm font-medium">Validate</div>
                </div>
                <div 
                  className={`flex items-center gap-2 ${activeTab === 'savePipeline' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'} rounded-md px-3 py-2 cursor-pointer`}
                  onClick={() => setActiveTab('savePipeline')}
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">7</div>
                  <div className="w-full text-sm font-medium">Save Pipeline</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-6">
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
