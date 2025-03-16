
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/App";
import SidebarLayout from "@/components/layout/SidebarLayout";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";
import CorsProxy from "@/components/connections/CorsProxy";
import { useToast } from "@/hooks/use-toast";
import { useDatabaseConnections } from "@/hooks/useDatabaseConnections";
import { ArrowUpRight, BarChart4, Clock, Database, FileText, Plus, Sparkles, Trash2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Sample projects data
const sampleProjects = [
  {
    id: "1",
    name: "Sales Data Integration",
    description: "ETL pipeline for sales data from multiple sources",
    lastModified: new Date("2023-10-15"),
    status: "active",
  },
  {
    id: "2",
    name: "Customer Analytics",
    description: "Data pipeline for customer behavior analysis",
    lastModified: new Date("2023-10-10"),
    status: "draft",
  },
  {
    id: "3",
    name: "Inventory Optimization",
    description: "Real-time inventory data processing",
    lastModified: new Date("2023-10-05"),
    status: "active",
  },
];

// Sample templates data
const templates = [
  {
    id: "t1",
    name: "MySQL to BigQuery",
    description: "Transfer data from MySQL database to BigQuery",
    complexity: "Medium",
    estimatedTime: "10 minutes",
  },
  {
    id: "t2",
    name: "CSV to PostgreSQL",
    description: "Upload and transform CSV files to PostgreSQL",
    complexity: "Easy",
    estimatedTime: "5 minutes",
  },
  {
    id: "t3",
    name: "MongoDB to Data Warehouse",
    description: "ETL pipeline from MongoDB to a data warehouse",
    complexity: "Advanced",
    estimatedTime: "15 minutes",
  },
];

const Dashboard = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [projects, setProjects] = useState(sampleProjects);
  const [recentActivity, setRecentActivity] = useState<{ action: string; timestamp: Date; projectId: string; projectName: string }[]>([]);
  const { isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const { connections } = useDatabaseConnections();
  const navigate = useNavigate();

  // Generate some mock recent activity on mount
  useEffect(() => {
    const mockActivity = [
      { action: "Pipeline Executed", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), projectId: "1", projectName: "Sales Data Integration" },
      { action: "Schema Updated", timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), projectId: "3", projectName: "Inventory Optimization" },
      { action: "Project Created", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), projectId: "2", projectName: "Customer Analytics" },
      { action: "Connection Added", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), projectId: "1", projectName: "Sales Data Integration" },
    ];
    setRecentActivity(mockActivity);
  }, []);

  // Simple date formatter
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "yesterday";
    return `${diffDays} days ago`;
  };

  // Handle project creation
  const handleCreateProject = (project: { name: string; description: string }) => {
    const newProject = {
      id: `${projects.length + 1}`,
      name: project.name,
      description: project.description,
      lastModified: new Date(),
      status: "draft",
    };
    
    setProjects([newProject, ...projects]);
    
    // Add to recent activity
    setRecentActivity([
      { 
        action: "Project Created", 
        timestamp: new Date(), 
        projectId: newProject.id, 
        projectName: newProject.name 
      },
      ...recentActivity
    ]);
    
    toast({
      title: "Project Created",
      description: `Successfully created project "${project.name}"`,
    });
    
    setCreateDialogOpen(false);
    
    // Navigate to the new project
    setTimeout(() => {
      navigate(`/projects/${newProject.id}`);
    }, 500);
  };

  // Handle project deletion
  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    
    toast({
      title: "Project Deleted",
      description: "The project has been successfully deleted.",
    });
  };

  return (
    <SidebarLayout title="Dashboard">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome to Transformista</h1>
            <p className="text-muted-foreground">
              Your AI-powered data transformation platform
            </p>
          </div>
          <Button 
            onClick={() => setCreateDialogOpen(true)} 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-indigo-100 hover:border-indigo-300 transition-colors shadow-sm">
            <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50 to-white">
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                Total Projects
              </CardTitle>
              <CardDescription>Your active data pipelines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{projects.length}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {projects.filter(p => p.status === "active").length} active, {projects.filter(p => p.status === "draft").length} draft
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-blue-100 hover:border-blue-300 transition-colors shadow-sm">
            <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-white">
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-blue-600" />
                Data Connections
              </CardTitle>
              <CardDescription>Connected data sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{connections.length}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {connections.filter(c => c.type === "source").length} sources, {connections.filter(c => c.type === "target").length} targets
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-purple-100 hover:border-purple-300 transition-colors shadow-sm">
            <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-white">
              <CardTitle className="flex items-center">
                <BarChart4 className="h-5 w-5 mr-2 text-purple-600" />
                Transformations
              </CardTitle>
              <CardDescription>Successful transformations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">18</div>
              <p className="text-sm text-muted-foreground mt-1">
                2.4 GB of data processed this month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-indigo-100">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-indigo-600" />
                    Recent Activity
                  </span>
                  <Badge variant="outline" className="text-xs font-normal">
                    Last 7 days
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No recent activity to display
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start p-2 rounded-md hover:bg-slate-50">
                        <div className="min-w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                          {activity.action.includes("Pipeline") ? (
                            <Zap className="h-4 w-4" />
                          ) : activity.action.includes("Schema") ? (
                            <Database className="h-4 w-4" />
                          ) : activity.action.includes("Project") ? (
                            <FileText className="h-4 w-4" />
                          ) : (
                            <Database className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatRelativeTime(activity.timestamp)}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Project: <Link to={`/projects/${activity.projectId}`} className="text-indigo-600 hover:underline">{activity.projectName}</Link>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow-sm border-purple-100 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200" asChild>
                  <Link to="/connections" className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    Manage Database Connections
                  </Link>
                </Button>
                
                <Button className="w-full justify-start bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Project
                </Button>
                
                <Button className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200" asChild>
                  <Link to="/workspace" className="flex items-center">
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Go to Workspace
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="projects">My Projects</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="border-indigo-100 hover:border-indigo-300 transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{project.name}</CardTitle>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteProject(project.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
                      Last modified: {formatDate(project.lastModified)}
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        project.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {project.status === "active" ? "Active" : "Draft"}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <Button variant="outline" asChild>
                      <Link to={`/projects/${project.id}`}>Open Project</Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      asChild
                      className="text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50"
                    >
                      <Link to={`/projects/${project.id}`}>
                        Manage
                        <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="border-purple-100 hover:border-purple-300 transition-all hover:shadow-md">
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Complexity: </span>
                        <Badge variant="outline" className={
                          template.complexity === "Easy" ? "bg-green-50 text-green-700 border-green-200" :
                          template.complexity === "Medium" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                          "bg-red-50 text-red-700 border-red-200"
                        }>
                          {template.complexity}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Est. Time: </span>
                        <span className="text-indigo-600">{template.estimatedTime}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button 
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700" 
                      onClick={() => {
                        setCreateDialogOpen(true);
                        toast({
                          title: "Template Selected",
                          description: `Using the "${template.name}" template as a starting point.`
                        });
                      }}
                    >
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="grid grid-cols-1 gap-6">
              <CorsProxy />
              
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences and settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    You are currently signed in as a demo user.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Edit Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto ml-0 sm:ml-2 mt-2 sm:mt-0 border-red-200 text-red-700 hover:bg-red-50"
                      onClick={logout}
                    >
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <CreateProjectDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen} 
          onSubmit={handleCreateProject}
        />
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
