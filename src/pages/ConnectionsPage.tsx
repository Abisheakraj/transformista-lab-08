
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ConnectionForm from "@/components/connections/ConnectionForm";
import ConnectionList from "@/components/connections/ConnectionList";
import { Database, HardDrive, Plus } from "lucide-react";
import SidebarLayout from "@/components/layout/SidebarLayout";

const ConnectionsPage = () => {
  const [activeTab, setActiveTab] = useState<string>("sources");
  const { toast } = useToast();
  const navigate = useNavigate();

  return (
    <SidebarLayout title="Data Connections">
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Manage Database Connections</h1>
            <p className="text-muted-foreground">
              Connect to source and target databases to build your data transformation pipelines
            </p>
          </div>
          <Button 
            onClick={() => setActiveTab(activeTab === "sources" ? "targets" : "sources")}
            variant="outline"
          >
            Switch to {activeTab === "sources" ? "Targets" : "Sources"}
          </Button>
        </div>

        <Tabs defaultValue="sources" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Source Connections
            </TabsTrigger>
            <TabsTrigger value="targets" className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Target Connections
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sources">
            <ConnectionList type="source" />
            <div className="mt-8">
              <Card className="border-indigo-100">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2 text-indigo-600" />
                    Add Source Connection
                  </CardTitle>
                  <CardDescription>
                    Connect to a database system that you want to extract data from
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ConnectionForm 
                    type="source" 
                    onSuccess={() => {
                      toast({
                        title: "Source Connection Added",
                        description: "Your database connection has been successfully added.",
                      });
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="targets">
            <ConnectionList type="target" />
            <div className="mt-8">
              <Card className="border-indigo-100">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
                  <CardTitle className="flex items-center">
                    <HardDrive className="h-5 w-5 mr-2 text-indigo-600" />
                    Add Target Connection
                  </CardTitle>
                  <CardDescription>
                    Connect to a database system where you want to load your transformed data
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ConnectionForm 
                    type="target" 
                    onSuccess={() => {
                      toast({
                        title: "Target Connection Added",
                        description: "Your database connection has been successfully added.",
                      });
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Database Connection Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium mb-2">Supported Databases</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>MySQL / MariaDB</li>
                <li>PostgreSQL</li>
                <li>Oracle Database</li>
                <li>Microsoft SQL Server</li>
                <li>MongoDB</li>
                <li>Sybase</li>
                <li>SAP HANA</li>
                <li>Snowflake</li>
              </ul>
            </div>
            <div>
              <h3 className="text-md font-medium mb-2">Connection Security</h3>
              <p className="text-gray-600 mb-2">
                All database credentials are encrypted before being stored. We recommend using dedicated read-only accounts
                for source connections and limited-privilege accounts for target connections.
              </p>
              <p className="text-gray-600">
                You can use Supabase integration for enhanced security and to manage your database connections through a centralized service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ConnectionsPage;
