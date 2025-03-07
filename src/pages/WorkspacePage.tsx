
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlusCircle, 
  FolderOpen, 
  Calendar, 
  Users2, 
  ArrowRight, 
  Database, 
  TableProperties 
} from "lucide-react";
import { Link } from "react-router-dom";

interface Workspace {
  id: string;
  name: string;
  description: string;
  pipelines: number;
  sources: number;
  targets: number;
  createdAt: string;
  updatedAt: string;
}

const WorkspacePage = () => {
  // Mock workspaces data
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: "ws-1",
      name: "Customer Data Integration",
      description: "Centralizing customer data from multiple sources",
      pipelines: 3,
      sources: 2,
      targets: 1,
      createdAt: "2023-08-15T10:30:00Z",
      updatedAt: "2023-09-12T14:45:00Z"
    },
    {
      id: "ws-2",
      name: "Marketing Analytics",
      description: "Transforming marketing data for BI dashboards",
      pipelines: 2,
      sources: 1,
      targets: 1,
      createdAt: "2023-09-05T08:20:00Z",
      updatedAt: "2023-09-14T11:30:00Z"
    }
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground mt-1">
            Manage your data transformation projects
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Workspace
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((workspace) => (
          <Card key={workspace.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle>{workspace.name}</CardTitle>
              <CardDescription>{workspace.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                  <TableProperties className="h-4 w-4 mb-1 text-blue-600" />
                  <span className="font-semibold">{workspace.pipelines}</span>
                  <span className="text-xs text-muted-foreground">Pipelines</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                  <Database className="h-4 w-4 mb-1 text-emerald-600" />
                  <span className="font-semibold">{workspace.sources}</span>
                  <span className="text-xs text-muted-foreground">Sources</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                  <Database className="h-4 w-4 mb-1 text-purple-600" />
                  <span className="font-semibold">{workspace.targets}</span>
                  <span className="text-xs text-muted-foreground">Targets</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  <span>Created: {formatDate(workspace.createdAt)}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  <span>Updated: {formatDate(workspace.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/projects/${workspace.id}`}>
                  <span>Open Workspace</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {/* Add Workspace Card */}
        <Card className="border-dashed hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <PlusCircle className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Create New Workspace</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start a new data transformation project
            </p>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Workspace
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkspacePage;
