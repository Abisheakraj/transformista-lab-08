
import { useState } from "react";
import { Link } from "react-router-dom";
import { Boxes, ChevronRight, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import FlowDesignerTab from "@/components/flow/FlowDesignerTab";
import DataSourcesTab from "@/components/flow/DataSourcesTab";

// Tabs interface
enum Tab {
  Projects = 'projects',
  Designer = 'designer',
  DataSources = 'dataSources',
  Settings = 'settings'
}

export function Pipeline() {
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.Projects);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Sample projects data
  const projects = [
    {
      id: "1",
      name: "Sales Data Integration",
      description: "ETL flow to integrate sales data from multiple sources",
      createdAt: "2023-06-15T10:00:00Z",
      updatedAt: "2023-06-20T14:30:00Z",
    },
    {
      id: "2",
      name: "Customer Analytics Pipeline",
      description: "Transform and analyze customer data for insights",
      createdAt: "2023-07-05T09:15:00Z",
      updatedAt: "2023-07-18T11:45:00Z",
    },
    {
      id: "3",
      name: "Inventory Sync",
      description: "Synchronize inventory data between warehouse and e-commerce",
      createdAt: "2023-08-12T13:20:00Z",
      updatedAt: "2023-08-25T16:10:00Z",
    },
  ];

  const filteredProjects = searchQuery
    ? projects.filter(project => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const selectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentTab(Tab.Designer);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with nav */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="p-1 bg-primary/10 rounded">
                <Boxes className="h-6 w-6 text-primary" />
              </div>
              <span className="font-semibold text-xl">Quantum</span>
            </Link>
            
            {selectedProjectId && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {projects.find(p => p.id === selectedProjectId)?.name || "Project"}
                </span>
              </>
            )}
          </div>
          
          <nav className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/pipeline" className="text-sm font-medium text-primary hover:text-primary/90 transition-colors">
              Pipeline
            </Link>
            <Link to="/discover" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Discover
            </Link>
            <Link to="/settings" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Settings
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {selectedProjectId ? (
          <>
            {/* Tabs when project is selected */}
            <div className="border-b mb-6">
              <div className="flex space-x-6">
                <button
                  onClick={() => setCurrentTab(Tab.Designer)}
                  className={`pb-3 px-1 text-sm font-medium ${
                    currentTab === Tab.Designer
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Flow Designer
                </button>
                <button
                  onClick={() => setCurrentTab(Tab.DataSources)}
                  className={`pb-3 px-1 text-sm font-medium ${
                    currentTab === Tab.DataSources
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Data Sources
                </button>
                <button
                  onClick={() => setCurrentTab(Tab.Settings)}
                  className={`pb-3 px-1 text-sm font-medium ${
                    currentTab === Tab.Settings
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    setSelectedProjectId(null);
                    setCurrentTab(Tab.Projects);
                  }}
                  className="pb-3 px-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Back to Projects
                </button>
              </div>
            </div>
            
            {/* Tab content */}
            {currentTab === Tab.Designer && (
              <FlowDesignerTab projectId={selectedProjectId} />
            )}
            
            {currentTab === Tab.DataSources && (
              <DataSourcesTab projectId={selectedProjectId} />
            )}
            
            {currentTab === Tab.Settings && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-semibold mb-6">Project Settings</h2>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>General Settings</CardTitle>
                      <CardDescription>Manage your project details and configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Project Name</label>
                        <Input 
                          value={projects.find(p => p.id === selectedProjectId)?.name || ""} 
                          onChange={() => {}} // In a real app, this would update the project name
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Input 
                          value={projects.find(p => p.id === selectedProjectId)?.description || ""} 
                          onChange={() => {}} // In a real app, this would update the description
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>Save Changes</Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Flow Settings</CardTitle>
                      <CardDescription>Configure how your data flow behaves</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Execution Schedule</label>
                        <select className="w-full p-2 border rounded">
                          <option>Manual Execution</option>
                          <option>Every Hour</option>
                          <option>Daily</option>
                          <option>Weekly</option>
                          <option>Custom</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Error Handling</label>
                        <select className="w-full p-2 border rounded">
                          <option>Stop on Error</option>
                          <option>Continue with Logging</option>
                          <option>Retry (3 times)</option>
                        </select>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>Apply Settings</Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-destructive">Danger Zone</CardTitle>
                      <CardDescription>Irreversible actions for your project</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">Once you delete a project, there is no going back. Please be certain.</p>
                      <Button variant="destructive">Delete Project</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Projects list view */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">My Projects</h1>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 mb-6">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            {filteredProjects.length === 0 ? (
              <Card className="text-center py-16">
                <CardContent>
                  <Boxes className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No projects found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? "No projects match your search query. Try a different search term."
                      : "You haven't created any projects yet."}
                  </p>
                  {!searchQuery && (
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Project
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        <p>Created: {formatDate(project.createdAt)}</p>
                        <p>Last updated: {formatDate(project.updatedAt)}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button onClick={() => selectProject(project.id)} variant="outline">
                        Open Project
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
