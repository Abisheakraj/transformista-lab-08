
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Save, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input"; // Add this import
import { Separator } from "@/components/ui/separator"; // Add this import
import DataSourcesTab from "@/components/flow/DataSourcesTab";
import FlowDesignerTab from "@/components/flow/FlowDesignerTab";

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
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
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

  const handleRunFlow = () => {
    setIsRunning(true);
    
    // Simulate API call
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate for demo
      
      if (success) {
        toast({
          title: "Flow started",
          description: "Your ETL flow has been started successfully."
        });
      } else {
        toast({
          title: "Flow failed",
          description: "There was an error starting your ETL flow.",
          variant: "destructive"
        });
      }
      
      setIsRunning(false);
    }, 2000);
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
          <div className="text-2xl font-bold text-primary">WrenAI</div>
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
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
            <Button onClick={handleRunFlow} disabled={isRunning}>
              {isRunning ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Flow
                </>
              )}
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
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">General Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Project Name</label>
                      <Input value={project.name} className="max-w-md" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Project Description</label>
                      <Input value={project.description} className="max-w-md" />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Execution Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="schedule" />
                      <label htmlFor="schedule" className="text-sm font-medium">Enable Scheduled Execution</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Frequency</label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                          <option>Hourly</option>
                          <option>Daily</option>
                          <option>Weekly</option>
                          <option>Monthly</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Time</label>
                        <Input type="time" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="email-notifications" />
                      <label htmlFor="email-notifications" className="text-sm font-medium">Email Notifications</label>
                    </div>
                    <div className="space-y-2 max-w-md">
                      <label className="text-sm font-medium">Notification Email</label>
                      <Input type="email" placeholder="email@example.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2">Notify On</label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="notify-success" />
                          <label htmlFor="notify-success" className="text-sm">Flow execution success</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="notify-failure" checked />
                          <label htmlFor="notify-failure" className="text-sm">Flow execution failure</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="notify-warnings" />
                          <label htmlFor="notify-warnings" className="text-sm">Flow execution warnings</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button variant="outline" className="mr-2">
                    Cancel
                  </Button>
                  <Button>
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetail;
