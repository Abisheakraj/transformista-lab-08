
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Database, Plus, Trash2, RefreshCcw, ExternalLink, Files } from "lucide-react";
import AddDataSourceDialog from "./AddDataSourceDialog";
import { Separator } from "@/components/ui/separator";
import { Link as RouterLink } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUploadArea from "../files/FileUploadArea";
import DataVisualization from "../files/DataVisualization";
import { UploadedFile } from "../files/FileUploadArea";

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
  const [activeTab, setActiveTab] = useState("sources");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);

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

  const handleFilesSelected = (files: FileList) => {
    // This will be handled by the FileUploadArea component internally
    console.log("Files selected:", files);
  };
  
  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0]);
    }
  };

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-6 bg-indigo-50 p-1">
          <TabsTrigger 
            value="sources" 
            className="flex-1 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
          >
            Database Connections
          </TabsTrigger>
          <TabsTrigger 
            value="files" 
            className="flex-1 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
          >
            File Upload & Visualization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-6 animate-in fade-in-50 mt-0">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" asChild>
              <RouterLink to="/connections" className="flex items-center">
                <Database className="h-4 w-4 mr-1.5" />
                Manage All Connections
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </RouterLink>
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Source Databases</h2>
                <Button onClick={() => setIsAddSourceOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
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
                    <Card key={source.id} className="border border-gray-200 hover:border-indigo-200 transition-colors">
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
                            className={source.status === "connected" ? "border-green-300 text-green-700 bg-green-50" : ""}
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
                <Button onClick={() => setIsAddTargetOpen(true)} className="bg-purple-600 hover:bg-purple-700">
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
                    <Card key={target.id} className="border border-gray-200 hover:border-purple-200 transition-colors">
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
                            className={target.status === "connected" ? "border-green-300 text-green-700 bg-green-50" : ""}
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
        </TabsContent>
        
        <TabsContent value="files" className="space-y-8 animate-in fade-in-50 mt-0">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <Files className="h-5 w-5 mr-2 text-indigo-600" />
                Upload Data Files
              </h2>
              <p className="text-gray-500 mb-4">
                Upload CSV, Excel, or JSON files to visualize and transform your data
              </p>
              
              <FileUploadArea 
                onFilesSelected={handleFilesSelected}
                onFilesUploaded={handleFilesUploaded}
                allowedFileTypes={['.csv', '.xlsx', '.xls', '.json']}
                maxFileSize={20}
                multiple={true}
              />
            </div>
          </div>
          
          {uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Data Visualization</h2>
                
                <div className="flex gap-2">
                  <select 
                    className="border border-gray-300 rounded-md text-sm p-1.5"
                    value={selectedFile?.id || ''}
                    onChange={(e) => {
                      const selected = uploadedFiles.find(file => file.id === e.target.value);
                      if (selected) setSelectedFile(selected);
                    }}
                  >
                    {uploadedFiles.map(file => (
                      <option key={file.id} value={file.id}>
                        {file.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {selectedFile && (
                <DataVisualization 
                  data={selectedFile.data}
                  columns={selectedFile.columns}
                  rows={selectedFile.rows}
                />
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
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
