import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/App";
import SidebarLayout from "@/components/layout/SidebarLayout";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";
import CorsProxy from "@/components/connections/CorsProxy";
import { useToast } from "@/hooks/use-toast";

// Sample projects data
const projects = [
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
  const { isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  // Simple date formatter
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Handle project creation
  const handleCreateProject = (project: { name: string; description: string }) => {
    // Here you would typically make an API call to save the project
    toast({
      title: "Project Created",
      description: `Successfully created project "${project.name}"`,
    });
    
    setCreateDialogOpen(false);
    // Optionally, you could refresh the projects list here or redirect to the new project
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
          <Button onClick={() => setCreateDialogOpen(true)}>Create New Project</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Projects</CardTitle>
              <CardDescription>Your active data pipelines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{projects.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Data Processed</CardTitle>
              <CardDescription>Total data processed this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2.4 GB</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Transformations</CardTitle>
              <CardDescription>Successful transformations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">18</div>
            </CardContent>
          </Card>
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
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
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
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild>
                      <Link to={`/projects/${project.id}`}>Open</Link>
                    </Button>
                    <Button variant="ghost">Manage</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Complexity: </span>
                        {template.complexity}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Est. Time: </span>
                        {template.estimatedTime}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => setCreateDialogOpen(true)}>
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
