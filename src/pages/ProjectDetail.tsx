
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Save, Upload, Database } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input"; 
import { Separator } from "@/components/ui/separator"; 
import DataSourcesTab from "@/components/flow/DataSourcesTab";
import FlowDesignerTab from "@/components/flow/FlowDesignerTab";
import SidebarLayout from "@/components/layout/SidebarLayout";
import AddDataSourceDialog from "@/components/flow/AddDataSourceDialog";

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
    navigate("/projects/1?tab=pipeline");
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
              <Input placeholder="Type or Select an Task to get started" className="mb-4" />
              
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm text-gray-500">Where do you want to get connected?</p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSourceDialogOpen(true)}>Oracle</Button>
                <Button variant="outline" onClick={() => setSourceDialogOpen(true)}>Sybase</Button>
                <Button variant="outline">Upload Excel</Button>
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
              <Input placeholder="Type or Select an Task to get started" className="mb-4" />
              
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm text-gray-500">Where do you want to get connected?</p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setTargetDialogOpen(true)}>Oracle</Button>
                <Button variant="outline" onClick={() => setTargetDialogOpen(true)}>Postgres</Button>
                <Button variant="outline">Upload Excel</Button>
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
            <div className="text-center py-10">
              <Database className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">Configure your source and target connections first</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setActiveTab("source")}>
                  Add Source
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("destination")}>
                  Add Target
                </Button>
              </div>
            </div>
          </div>
        );
      
      case "trainingData":
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Training Data</h2>
            <p className="text-gray-500 mb-6">Upload or configure training datasets for transformation learning</p>
            <div className="text-center py-10">
              <Upload className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">No training data added yet</p>
              <Button variant="outline">
                Upload Training Data
              </Button>
            </div>
          </div>
        );
      
      case "createPipeline":
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Create Pipeline</h2>
            <FlowDesignerTab projectId={project.id} />
          </div>
        );
      
      case "validate":
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Validate Pipeline</h2>
            <p className="text-gray-500 mb-6">Run validation checks on your data transformation pipeline</p>
            <div className="text-center py-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-300 mb-4">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <p className="text-gray-500 mb-2">Create a pipeline first to validate it</p>
              <Button variant="outline" onClick={() => setActiveTab("createPipeline")}>
                Create Pipeline
              </Button>
            </div>
          </div>
        );
      
      case "savePipeline":
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Save Pipeline</h2>
            <p className="text-gray-500 mb-6">Save and export your data transformation pipeline</p>
            <div className="text-center py-10">
              <Save className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">Create and validate a pipeline first</p>
              <Button variant="outline" onClick={() => setActiveTab("createPipeline")}>
                Create Pipeline
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
        <div className="flex flex-col md:flex-row md:gap-6 bg-white border-b p-6">
          <div className="w-full md:w-64 flex-shrink-0 mb-6 md:mb-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-2 cursor-pointer">
                <div className="w-full text-sm font-medium">Source</div>
              </div>
              <div className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2 cursor-pointer">
                <div className="w-full text-sm font-medium">Destination</div>
              </div>
              <div className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2 cursor-pointer">
                <div className="w-full text-sm font-medium">Table Mapping</div>
              </div>
              <div className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2 cursor-pointer">
                <div className="w-full text-sm font-medium">Training Data</div>
              </div>
              <div className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2 cursor-pointer">
                <div className="w-full text-sm font-medium">Create Pipeline</div>
              </div>
              <div className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2 cursor-pointer">
                <div className="w-full text-sm font-medium">Validate</div>
              </div>
              <div className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2 cursor-pointer">
                <div className="w-full text-sm font-medium">Save Pipeline</div>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center border-b border-gray-200">
              <li className="mr-2">
                <a 
                  className={`inline-block p-4 rounded-t-lg ${activeTab === 'source' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'hover:border-gray-300 hover:text-gray-600'}`}
                  onClick={() => setActiveTab('source')}
                >
                  Source
                </a>
              </li>
              <li className="mr-2">
                <a 
                  className={`inline-block p-4 rounded-t-lg ${activeTab === 'destination' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'hover:border-gray-300 hover:text-gray-600'}`}
                  onClick={() => setActiveTab('destination')}
                >
                  Destination
                </a>
              </li>
              <li className="mr-2">
                <a 
                  className={`inline-block p-4 rounded-t-lg ${activeTab === 'tableMapping' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'hover:border-gray-300 hover:text-gray-600'}`}
                  onClick={() => setActiveTab('tableMapping')}
                >
                  Table Mapping
                </a>
              </li>
              <li className="mr-2">
                <a 
                  className={`inline-block p-4 rounded-t-lg ${activeTab === 'trainingData' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'hover:border-gray-300 hover:text-gray-600'}`}
                  onClick={() => setActiveTab('trainingData')}
                >
                  Training Data
                </a>
              </li>
              <li className="mr-2">
                <a 
                  className={`inline-block p-4 rounded-t-lg ${activeTab === 'createPipeline' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'hover:border-gray-300 hover:text-gray-600'}`}
                  onClick={handleCreatePipeline}
                >
                  Create Pipeline
                </a>
              </li>
              <li className="mr-2">
                <a 
                  className={`inline-block p-4 rounded-t-lg ${activeTab === 'validate' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'hover:border-gray-300 hover:text-gray-600'}`}
                  onClick={() => setActiveTab('validate')}
                >
                  Validate
                </a>
              </li>
              <li>
                <a 
                  className={`inline-block p-4 rounded-t-lg ${activeTab === 'savePipeline' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'hover:border-gray-300 hover:text-gray-600'}`}
                  onClick={() => setActiveTab('savePipeline')}
                >
                  Save Pipeline
                </a>
              </li>
            </ul>
            
            <div className="p-4">
              {getWorkflowTabs()}
            </div>
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
