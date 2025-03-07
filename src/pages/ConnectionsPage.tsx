
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import ConnectionForm from "@/components/connections/ConnectionForm";
import ConnectionList from "@/components/connections/ConnectionList";
import { Database, HardDrive } from "lucide-react";

const ConnectionsPage = () => {
  const [activeTab, setActiveTab] = useState<string>("sources");
  const { toast } = useToast();

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Connections</h1>
          <p className="text-muted-foreground mt-1">
            Connect to source and target databases to begin your data transformation journey
          </p>
        </div>
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
        
        <TabsContent value="targets">
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
      </Tabs>
    </div>
  );
};

export default ConnectionsPage;
