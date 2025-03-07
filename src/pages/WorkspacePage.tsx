
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { Plus, Folder } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

const WorkspacePage = () => {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState("");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { 
      id: "1", 
      name: "Sales Database Migration", 
      description: "Migration project for sales data from Oracle to PostgreSQL",
      createdAt: "2023-11-15"
    },
    { 
      id: "2", 
      name: "Customer Analytics", 
      description: "Data transformation for customer behavior analytics",
      createdAt: "2023-12-03"
    },
    { 
      id: "3", 
      name: "Inventory Management", 
      description: "Synchronizing inventory data across multiple systems",
      createdAt: "2024-01-22"
    },
    { 
      id: "4", 
      name: "Marketing Campaign", 
      description: "Data preparation for marketing analytics",
      createdAt: "2024-02-10"
    },
  ]);

  const handleCreateWorkspace = () => {
    if (!newWorkspaceName) return;

    const newWorkspace: Workspace = {
      id: (workspaces.length + 1).toString(),
      name: newWorkspaceName,
      description: newWorkspaceDesc || "No description",
      createdAt: new Date().toISOString().split("T")[0]
    };

    setWorkspaces([...workspaces, newWorkspace]);
    setNewWorkspaceName("");
    setNewWorkspaceDesc("");
    setIsCreateDialogOpen(false);
  };

  const openWorkspace = (id: string) => {
    navigate(`/projects/${id}`);
  };

  return (
    <SidebarLayout title="Workspace">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">Your Workspaces</h2>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus size={16} className="mr-2" />
            Create Workspace
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workspaces.map((workspace) => (
            <Card 
              key={workspace.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openWorkspace(workspace.id)}
            >
              <div className="p-6">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Folder size={20} className="text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{workspace.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{workspace.description}</p>
                <div className="text-xs text-gray-400">
                  Created on {workspace.createdAt}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Workspace</DialogTitle>
              <DialogDescription>
                Create a new workspace to start your data transformation project
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Workspace Name</Label>
                <Input
                  id="name"
                  placeholder="Enter workspace name"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Enter short description"
                  value={newWorkspaceDesc}
                  onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWorkspace} disabled={!newWorkspaceName}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarLayout>
  );
};

export default WorkspacePage;
