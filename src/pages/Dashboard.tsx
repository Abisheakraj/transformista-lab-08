
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const Dashboard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([
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
  ]);
  const navigate = useNavigate();

  const handleCreateProject = (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: project.name,
      description: project.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setProjects([...projects, newProject]);
    setIsDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">DataGenieAI</div>
          <Button variant="ghost" onClick={() => navigate("/")}>Home</Button>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Projects</h1>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <p className="text-muted-foreground mb-4">You don't have any projects yet.</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover-scale">
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
                  <Button onClick={() => navigate(`/project/${project.id}`)} variant="outline">
                    Open Project
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <CreateProjectDialog 
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleCreateProject}
        />
      </div>
    </div>
  );
};

export default Dashboard;
