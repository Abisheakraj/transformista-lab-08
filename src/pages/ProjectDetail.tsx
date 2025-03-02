
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Save, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataSourcesTab from "@/components/flow/DataSourcesTab";
import FlowDesignerTab from "@/components/flow/FlowDesignerTab";
import { toast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string;
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState("datasources");
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningFlow, setIsRunningFlow] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleRunFlow = async () => {
    setIsRunningFlow(true);
    try {
      // Simulate API call to run the flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success toast
      toast({
        title: "Flow execution started",
        description: `Flow "${project?.name}" is now running. You'll be notified when it completes.`,
      });
      
      // Simulate flow completion after a delay
      setTimeout(() => {
        toast({
          title: "Flow completed successfully",
          description: "All tasks in the flow have been executed without errors.",
          variant: "default",
        });
      }, 5000);
    } catch (error) {
      // Show error toast
      toast({
        title: "Error running flow",
        description: "There was an issue starting the flow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRunningFlow(false);
    }
  };

  const handleSaveFlow = async () => {
    setIsSaving(true);
    try {
      // Simulate API call to save the flow
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success toast
      toast({
        title: "Flow saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      // Show error toast
      toast({
        title: "Error saving flow",
        description: "There was an issue saving your changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
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
    );
  }

  return (
    <div>
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">DataGenieAI</div>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>Dashboard</Button>
        </div>
      </header>
    
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">{project.name}</h1>
            </div>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveFlow} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button onClick={handleRunFlow} disabled={isRunningFlow}>
              <Play className="h-4 w-4 mr-2" />
              {isRunningFlow ? "Running..." : "Run Flow"}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="datasources">Data Sources</TabsTrigger>
            <TabsTrigger value="flow">Flow Designer</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="datasources">
            <DataSourcesTab projectId={project.id} />
          </TabsContent>
          
          <TabsContent value="flow">
            <FlowDesignerTab projectId={project.id} />
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Project Settings</h2>
              <p className="text-muted-foreground mb-4">Configure your project settings and preferences.</p>
              <p className="text-sm text-muted-foreground">Project Settings coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetail;
