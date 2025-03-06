
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Database, Plus, Edit, Trash2, RefreshCcw } from "lucide-react";
import AddDataSourceDialog from "./AddDataSourceDialog";
import { Separator } from "@/components/ui/separator";

interface DataSource {
  id: string;
  name: string;
  type: "source" | "target";
  connectionType: string;
  host: string;
  database: string;
  lastSync?: string;
  status: "connected" | "error" | "pending";
}

interface DataSourcesTabProps {
  projectId: string;
}

const DataSourcesTab = ({ projectId }: DataSourcesTabProps) => {
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [isAddTargetOpen, setIsAddTargetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<DataSource[]>([
    {
      id: "src1",
      name: "Sales MySQL Database",
      type: "source",
      connectionType: "MySQL",
      host: "sales-db.example.com",
      database: "sales",
      lastSync: "2023-07-15 14:30",
      status: "connected"
    },
    {
      id: "src2",
      name: "Marketing PostgreSQL",
      type: "source",
      connectionType: "PostgreSQL",
      host: "marketing-db.example.com",
      database: "marketing_data",
      lastSync: "2023-07-14 09:15",
      status: "connected"
    }
  ]);
  
  const [targets, setTargets] = useState<DataSource[]>([
    {
      id: "tgt1",
      name: "Analytics Data Warehouse",
      type: "target",
      connectionType: "BigQuery",
      host: "analytics-bq.example.com",
      database: "analytics_dw",
      status: "connected"
    }
  ]);

  const handleTestConnection = (sourceId: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        toast({
          title: "Connection successful",
          description: "The database connection was tested successfully."
        });
      } else {
        toast({
          title: "Connection failed",
          description: "Unable to connect to the database. Please check your credentials.",
          variant: "destructive"
        });
      }
      
      setIsLoading(false);
    }, 1500);
  };

  const handleDeleteSource = (sourceId: string, sourceType: "source" | "target") => {
    if (sourceType === "source") {
      setSources(sources.filter(src => src.id !== sourceId));
    } else {
      setTargets(targets.filter(tgt => tgt.id !== sourceId));
    }
    
    toast({
      title: "Connection removed",
      description: "The data connection has been removed from your project."
    });
  };

  const handleSubmitSource = (dataSource: any) => {
    if (dataSource.type === "source") {
      setSources([...sources, {
        id: `src${sources.length + 1}`,
        ...dataSource,
        status: "connected",
        lastSync: "Never"
      }]);
      setIsAddSourceOpen(false);
    } else {
      setTargets([...targets, {
        id: `tgt${targets.length + 1}`,
        ...dataSource,
        status: "connected"
      }]);
      setIsAddTargetOpen(false);
    }
    
    toast({
      title: "Connection added",
      description: `The ${dataSource.name} connection has been added to your project.`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Source Databases</h2>
            <Button onClick={() => setIsAddSourceOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </div>
          
          {sources.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Source Databases</h3>
                <p className="text-muted-foreground mb-4">
                  Add a source database to start importing data for your ETL flow.
                </p>
                <Button onClick={() => setIsAddSourceOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sources.map(source => (
                <Card key={source.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{source.name}</CardTitle>
                        <CardDescription>
                          {source.connectionType} • {source.host}/{source.database}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={source.status === "connected" ? "outline" : "destructive"}
                      >
                        {source.status === "connected" ? "Connected" : "Error"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3 pt-0">
                    <div className="text-xs text-muted-foreground">
                      Last synchronized: {source.lastSync || "Never"}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(source.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin mr-1"></div>
                          Testing...
                        </>
                      ) : (
                        <>
                          <RefreshCcw className="h-3.5 w-3.5 mr-1" />
                          Test
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSource(source.id, "source")}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        <div className="md:w-1/2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Target Databases</h2>
            <Button onClick={() => setIsAddTargetOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Target
            </Button>
          </div>
          
          {targets.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Target Databases</h3>
                <p className="text-muted-foreground mb-4">
                  Add a target database to define where your processed data will be stored.
                </p>
                <Button onClick={() => setIsAddTargetOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Target
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {targets.map(target => (
                <Card key={target.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{target.name}</CardTitle>
                        <CardDescription>
                          {target.connectionType} • {target.host}/{target.database}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={target.status === "connected" ? "outline" : "destructive"}
                      >
                        {target.status === "connected" ? "Connected" : "Error"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3 pt-0">
                    <div className="text-xs text-muted-foreground">
                      Output destination for transformed data
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(target.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin mr-1"></div>
                          Testing...
                        </>
                      ) : (
                        <>
                          <RefreshCcw className="h-3.5 w-3.5 mr-1" />
                          Test
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSource(target.id, "target")}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Import Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual File Upload</CardTitle>
              <CardDescription>
                Upload CSV, Excel, or JSON files as data sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Supported formats: CSV, XLSX, JSON
              </p>
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Drag and drop files here or click to browse
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-3 flex justify-end">
              <Button variant="outline">Upload Files</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>API Connection</CardTitle>
              <CardDescription>
                Connect to external APIs or services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Set up connections to REST APIs, GraphQL endpoints, or other services
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between border p-3 rounded-md">
                  <div>
                    <div className="font-medium">REST API</div>
                    <div className="text-xs text-muted-foreground">Standard JSON REST endpoints</div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
                <div className="flex items-center justify-between border p-3 rounded-md">
                  <div>
                    <div className="font-medium">GraphQL API</div>
                    <div className="text-xs text-muted-foreground">GraphQL endpoints</div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-3 justify-end">
              <Button variant="outline">Add Custom API</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <AddDataSourceDialog
        open={isAddSourceOpen}
        onOpenChange={setIsAddSourceOpen}
        onSubmit={handleSubmitSource}
        type="source"
      />
      
      <AddDataSourceDialog
        open={isAddTargetOpen}
        onOpenChange={setIsAddTargetOpen}
        onSubmit={handleSubmitSource}
        type="target"
      />
    </div>
  );
};

export default DataSourcesTab;
