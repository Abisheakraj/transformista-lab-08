
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/App";
import { Link } from "react-router-dom";
import { 
  Database, 
  FolderOpen, 
  TableProperties, 
  Settings, 
  LogOut, 
  ChevronRight,
  LayoutDashboard
} from "lucide-react";

const Dashboard = () => {
  const { logout } = useAuth();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to your Data Transformation Platform
          </p>
        </div>
        <Button onClick={logout} variant="outline">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderOpen className="h-5 w-5 mr-2 text-blue-600" />
              Workspaces
            </CardTitle>
            <CardDescription>Manage your data projects</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Create and manage workspaces to organize your data transformation projects. 
              Each workspace can contain multiple pipelines and connections.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/workspace">
                <span>Go to Workspaces</span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-emerald-600" />
              Connections
            </CardTitle>
            <CardDescription>Manage database connections</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Set up and manage connections to your source and target databases.
              Configure credentials, test connections, and organize your data sources.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/connections">
                <span>Manage Connections</span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TableProperties className="h-5 w-5 mr-2 text-purple-600" />
              Pipelines
            </CardTitle>
            <CardDescription>Create data transformation flows</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Design and execute data transformation pipelines using an intuitive visual interface.
              Transform, cleanse, and migrate your data between systems.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/projects/1">
                <span>View Pipelines</span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground py-4">
              <p>Your recent activities will appear here.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
