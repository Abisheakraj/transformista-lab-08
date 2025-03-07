
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ConnectionForm from "@/components/connections/ConnectionForm";
import ConnectionList from "@/components/connections/ConnectionList";
import { Database, HardDrive, ChevronLeft } from "lucide-react";
import SidebarLayout from "@/components/layout/SidebarLayout";

const ConnectionsPage = () => {
  const [activeTab, setActiveTab] = useState<string>("sources");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <SidebarLayout>
      <div className="container mx-auto py-4">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack} 
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Data Connections</h1>
            <p className="text-muted-foreground mt-1">
              Connect to source and target databases to begin your data transformation journey
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 flex-shrink-0">
            <Tabs defaultValue="sources" value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
              <TabsList className="flex flex-col h-auto w-full mb-8">
                <TabsTrigger value="sources" className="flex items-center gap-2 justify-start w-full mb-2">
                  <Database className="h-4 w-4" />
                  Source Connections
                </TabsTrigger>
                <TabsTrigger value="targets" className="flex items-center gap-2 justify-start w-full">
                  <HardDrive className="h-4 w-4" />
                  Target Connections
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex-1">
            <TabsContent value="sources" className="mt-0">
              <ConnectionList type="source" />
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Add Source Connection</CardTitle>
                    <CardDescription>
                      Connect to a database system that you want to extract data from
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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
            
            <TabsContent value="targets" className="mt-0">
              <ConnectionList type="target" />
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Add Target Connection</CardTitle>
                    <CardDescription>
                      Connect to a database system where you want to load your transformed data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ConnectionsPage;
