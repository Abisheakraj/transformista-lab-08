
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Save, Upload, Database, ChevronLeft, FileUp, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input"; 
import { Separator } from "@/components/ui/separator"; 
import { Progress } from "@/components/ui/progress";
import FlowDesignerTab from "@/components/flow/FlowDesignerTab";
import SidebarLayout from "@/components/layout/SidebarLayout";
import AddDataSourceDialog from "@/components/flow/AddDataSourceDialog";
import SchemaGraphView from "@/components/flow/SchemaGraphView";
import { testDatabaseConnection, fetchDatabaseSchemas, processUploadedFile, FileUpload } from "@/lib/database-client";
import { Node, Edge } from "@xyflow/react";

interface Project {
  id: string;
  name: string;
  description: string;
}

interface PipelineData {
  sourceData?: any;
  targetData?: any;
  fileData?: FileUpload | null;
  schemaNodes?: Node[];
  schemaEdges?: Edge[];
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState("workflow");
  const [activeWorkflowStep, setActiveWorkflowStep] = useState("source");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
  const [targetDialogOpen, setTargetDialogOpen] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pipelineData, setPipelineData] = useState<PipelineData>({
    fileData: null,
    schemaNodes: [],
    schemaEdges: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        
        setProject({
          id: projectId || "1",
          name: "Sales Data Integration",
          description: "ETL flow to integrate sales data from multiple sources"
        });
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Project saved",
        description: "Your project has been saved successfully."
      });
    }, 1000);
  };

  const handleSourceSubmit = (data: any) => {
    console.log("Source data:", data);
    setSourceDialogOpen(false);
    
    // Update pipelineData with the source connection
    setPipelineData(prev => ({
      ...prev,
      sourceData: data
    }));
    
    toast({
      title: "Source Added",
      description: `Source "${data.name}" has been added successfully.`
    });
    
    // After adding source, automatically move to next step
    setActiveWorkflowStep("destination");
  };

  const handleTargetSubmit = (data: any) => {
    console.log("Target data:", data);
    setTargetDialogOpen(false);
    
    // Update pipelineData with the target connection
    setPipelineData(prev => ({
      ...prev,
      targetData: data
    }));
    
    toast({
      title: "Target Added",
      description: `Target "${data.name}" has been added successfully.`
    });
    
    // After adding target, automatically move to next step
    setActiveWorkflowStep("mapping");
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFileName(file.name);
      setIsUploadingFile(true);
      
      // Simulate file upload with progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setUploadProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          
          // Process the uploaded file
          processUploadedFile(file).then((fileData) => {
            setPipelineData(prev => ({
              ...prev,
              fileData
            }));
            
            setIsUploadingFile(false);
            toast({
              title: "File Uploaded",
              description: `${file.name} has been successfully uploaded and processed.`
            });
            
            // Move to mapping step automatically after upload
            setActiveWorkflowStep("mapping");
          }).catch(err => {
            console.error("Error processing file:", err);
            setIsUploadingFile(false);
            toast({
              title: "Upload Error",
              description: "There was an error processing your file.",
              variant: "destructive"
            });
          });
        }
      }, 100);
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const cancelFileUpload = () => {
    setIsUploadingFile(false);
    setUploadProgress(0);
    setUploadFileName("");
  };

  const handleSchemaChange = (nodes: Node[], edges: Edge[]) => {
    setPipelineData(prev => ({
      ...prev,
      schemaNodes: nodes,
      schemaEdges: edges
    }));
  };

  const handleNextStep = () => {
    switch (activeWorkflowStep) {
      case "source":
        setActiveWorkflowStep("destination");
        break;
      case "destination":
        setActiveWorkflowStep("mapping");
        break;
      case "mapping":
        setActiveWorkflowStep("pipeline");
        break;
      case "pipeline":
        setActiveWorkflowStep("validate");
        break;
      case "validate":
        setActiveWorkflowStep("deploy");
        break;
    }
  };

  const handlePreviousStep = () => {
    switch (activeWorkflowStep) {
      case "destination":
        setActiveWorkflowStep("source");
        break;
      case "mapping":
        setActiveWorkflowStep("destination");
        break;
      case "pipeline":
        setActiveWorkflowStep("mapping");
        break;
      case "validate":
        setActiveWorkflowStep("pipeline");
        break;
      case "deploy":
        setActiveWorkflowStep("validate");
        break;
    }
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!project) {
    return (
      <SidebarLayout>
        <div className="container mx-auto px-4 py-10">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={handleBackToDashboard}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const workflowSteps = [
    { id: "source", name: "Source" },
    { id: "destination", name: "Destination" },
    { id: "mapping", name: "Table Mapping" },
    { id: "pipeline", name: "Pipeline" },
    { id: "validate", name: "Validate" },
    { id: "deploy", name: "Deploy" },
  ];

  const renderWorkflowContent = () => {
    switch (activeWorkflowStep) {
      case "source":
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Source Connection</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-md font-medium mb-4">Connect to Database</h3>
                <p className="text-sm text-gray-500 mb-4">Select a database type to connect to your source data.</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <Button variant="outline" onClick={() => setSourceDialogOpen(true)} className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />PostgreSQL
                  </Button>
                  <Button variant="outline" onClick={() => setSourceDialogOpen(true)} className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />MySQL
                  </Button>
                  <Button variant="outline" onClick={() => setSourceDialogOpen(true)} className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />Oracle
                  </Button>
                  <Button variant="outline" onClick={() => setSourceDialogOpen(true)} className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />MS SQL
                  </Button>
                </div>
                
                <Button onClick={() => setSourceDialogOpen(true)} className="w-full">
                  Connect to Database
                </Button>
              </div>
              
              <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-md font-medium mb-4">Upload File</h3>
                <p className="text-sm text-gray-500 mb-4">Upload CSV, Excel, or JSON files as your data source.</p>
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".csv,.xlsx,.json"
                  className="hidden"
                />
                
                {isUploadingFile ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{uploadFileName}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={cancelFileUpload}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                    <div className="text-xs text-right text-gray-500">{uploadProgress}%</div>
                  </div>
                ) : (
                  <Button onClick={handleFileUploadClick} variant="outline" className="w-full">
                    <FileUp className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                )}
                
                {pipelineData.fileData && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded text-sm">
                    <div className="flex items-center text-green-700 font-medium mb-1">
                      <Check className="h-4 w-4 mr-1" />
                      File uploaded successfully
                    </div>
                    <p className="text-gray-600">
                      Detected {pipelineData.fileData.columns?.length} columns and sample data
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button onClick={handleNextStep}>
                Next Step
              </Button>
            </div>
          </div>
        );
      
      case "destination":
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Target Connection</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-md font-medium mb-4">Connect to Target Database</h3>
                <p className="text-sm text-gray-500 mb-4">Select a database type for your destination.</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <Button variant="outline" onClick={() => setTargetDialogOpen(true)} className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />PostgreSQL
                  </Button>
                  <Button variant="outline" onClick={() => setTargetDialogOpen(true)} className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />Snowflake
                  </Button>
                  <Button variant="outline" onClick={() => setTargetDialogOpen(true)} className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />BigQuery
                  </Button>
                  <Button variant="outline" onClick={() => setTargetDialogOpen(true)} className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />Redshift
                  </Button>
                </div>
                
                <Button onClick={() => setTargetDialogOpen(true)} className="w-full">
                  Connect to Target
                </Button>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-md font-medium mb-4">Configuration Tips</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Ensure you have appropriate write permissions on the target database</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Consider using a dedicated service account for production deployments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Target schema can be created automatically if it doesn't exist</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Data will be transformed according to your pipeline configuration</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handlePreviousStep}>
                Previous Step
              </Button>
              <Button onClick={handleNextStep}>
                Next Step
              </Button>
            </div>
          </div>
        );
      
      case "mapping":
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Table Mapping</h2>
            <p className="text-gray-500 mb-6">Define relationships between source and target tables. Connect nodes by dragging from one handle to another.</p>
            
            <div className="mb-6">
              <SchemaGraphView 
                editable={true} 
                pipelineData={pipelineData}
                onSchemaChange={handleSchemaChange}
                height="500px"
              />
            </div>
            
            {/* Data Preview Section */}
            {pipelineData.fileData && (
              <div className="mb-6 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Source Data Preview</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {pipelineData.fileData.columns?.map((column, idx) => (
                          <th 
                            key={idx}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pipelineData.fileData.sampleData?.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {Object.values(row).map((cell, cellIdx) => (
                            <td 
                              key={cellIdx}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                              {String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handlePreviousStep}>
                Previous Step
              </Button>
              <Button onClick={handleNextStep}>
                Next Step
              </Button>
            </div>
          </div>
        );
      
      case "pipeline":
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Create Pipeline</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <div className="h-[400px] border border-gray-200 rounded-lg">
                  <FlowDesignerTab projectId={project.id} />
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="border border-gray-200 rounded-lg h-full p-4">
                  <h3 className="text-md font-medium mb-4">Pipeline Overview</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Source</h4>
                      <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm">
                        {pipelineData.sourceData ? (
                          <div>
                            <p className="font-medium">{pipelineData.sourceData.name}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              {pipelineData.sourceData.connectionType} • {pipelineData.sourceData.host}
                            </p>
                          </div>
                        ) : pipelineData.fileData ? (
                          <div>
                            <p className="font-medium">{pipelineData.fileData.fileName}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              {pipelineData.fileData.fileType.toUpperCase()} • {(pipelineData.fileData.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-500">No source configured</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Tables/Mapping</h4>
                      <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm">
                        {pipelineData.schemaNodes && pipelineData.schemaNodes.length > 0 ? (
                          <div>
                            <p>{pipelineData.schemaNodes.filter(node => !['db-source', 'db-target'].includes(node.id)).length} tables configured</p>
                            <p className="text-gray-500 text-xs mt-1">
                              {pipelineData.schemaEdges?.length || 0} relationships defined
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-500">No tables mapped</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Target</h4>
                      <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm">
                        {pipelineData.targetData ? (
                          <div>
                            <p className="font-medium">{pipelineData.targetData.name}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              {pipelineData.targetData.connectionType} • {pipelineData.targetData.host}
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-500">No target configured</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Integrated Schema Mapping Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Table Relationships</h3>
              <SchemaGraphView 
                pipelineData={pipelineData}
                height="300px"
                showSourceTarget={false}
              />
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handlePreviousStep}>
                Previous Step
              </Button>
              <Button onClick={handleNextStep}>
                Next Step
              </Button>
            </div>
          </div>
        );
      
      case "validate":
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Validate Pipeline</h2>
            <p className="text-gray-500 mb-6">Run validation checks on your data transformation pipeline</p>
            
            <div className="mb-6 border border-gray-200 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium">Schema validation</span>
                  </div>
                  <span className="text-sm text-green-500">Passed</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium">Connection test</span>
                  </div>
                  <span className="text-sm text-green-500">Passed</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium">Transformation logic</span>
                  </div>
                  <span className="text-sm text-green-500">Passed</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium">Pipeline configuration</span>
                  </div>
                  <span className="text-sm text-green-500">Passed</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-medium">All validation checks passed successfully!</span>
                </div>
                <p className="text-sm mt-2">Your pipeline is ready to be deployed.</p>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handlePreviousStep}>
                Previous Step
              </Button>
              <Button onClick={handleNextStep}>
                Next Step
              </Button>
            </div>
          </div>
        );
      
      case "deploy":
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Deploy Pipeline</h2>
            <p className="text-gray-500 mb-6">Save and deploy your data transformation pipeline</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-md font-medium mb-4">Deployment Options</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="deploy-scheduled" 
                      name="deploy-option" 
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                      defaultChecked 
                    />
                    <label htmlFor="deploy-scheduled" className="ml-2 block text-sm font-medium">
                      Schedule pipeline runs
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="deploy-triggered" 
                      name="deploy-option" 
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary" 
                    />
                    <label htmlFor="deploy-triggered" className="ml-2 block text-sm font-medium">
                      Run on trigger events
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="deploy-manual" 
                      name="deploy-option" 
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary" 
                    />
                    <label htmlFor="deploy-manual" className="ml-2 block text-sm font-medium">
                      Manual runs only
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-md font-medium mb-4">Schedule Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Frequency</label>
                    <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary">
                      <option>Daily</option>
                      <option>Hourly</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                      <option>Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Time</label>
                    <input 
                      type="time" 
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" 
                      defaultValue="03:00"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-md font-medium mb-4">Pipeline Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Source</p>
                  <p className="text-gray-500">
                    {pipelineData.sourceData 
                      ? `${pipelineData.sourceData.connectionType} (${pipelineData.sourceData.database})` 
                      : pipelineData.fileData 
                        ? `${pipelineData.fileData.fileName} (${pipelineData.fileData.fileType})` 
                        : "Not configured"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Destination</p>
                  <p className="text-gray-500">
                    {pipelineData.targetData 
                      ? `${pipelineData.targetData.connectionType} (${pipelineData.targetData.database})` 
                      : "Not configured"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Tables</p>
                  <p className="text-gray-500">
                    {pipelineData.schemaNodes 
                      ? `${pipelineData.schemaNodes.filter(node => !['db-source', 'db-target'].includes(node.id)).length} tables, ${pipelineData.schemaEdges?.length || 0} relationships` 
                      : "No tables configured"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Transformations</p>
                  <p className="text-gray-500">4 transformation steps</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handlePreviousStep}>
                Previous Step
              </Button>
              <Button
                onClick={() => {
                  toast({
                    title: "Pipeline Deployed",
                    description: "Your data pipeline has been successfully deployed and scheduled."
                  });
                }}
              >
                Deploy Pipeline
              </Button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-6 bg-white rounded-lg">
            <p className="text-gray-500">Select a step to get started</p>
          </div>
        );
    }
  };

  return (
    <SidebarLayout workspaceId={projectId}>
      <div className="flex flex-col h-full">
        <div className="bg-white border-b p-4 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToDashboard} 
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-xl font-bold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </div>
        </div>
        
        <div className="bg-white border-b p-4">
          <Tabs defaultValue="workflow" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex-1 p-6 bg-gray-50">
          <TabsContent value="workflow" className="mt-0">
            {/* Workflow steps progress indicator */}
            <div className="mb-6">
              <div className="relative flex items-center justify-between">
                {workflowSteps.map((step, index) => (
                  <div 
                    key={step.id} 
                    className="flex flex-col items-center relative z-10"
                    onClick={() => setActiveWorkflowStep(step.id)}
                  >
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer
                        ${activeWorkflowStep === step.id 
                          ? 'bg-primary text-white' 
                          : workflowSteps.findIndex(s => s.id === activeWorkflowStep) > index
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                    >
                      {workflowSteps.findIndex(s => s.id === activeWorkflowStep) > index ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span 
                      className={`text-xs mt-2 font-medium
                        ${activeWorkflowStep === step.id 
                          ? 'text-primary' 
                          : workflowSteps.findIndex(s => s.id === activeWorkflowStep) > index
                            ? 'text-green-500'
                            : 'text-gray-500'
                        }`}
                    >
                      {step.name}
                    </span>
                  </div>
                ))}
                
                {/* Progress line */}
                <div className="absolute h-0.5 bg-gray-200 left-0 right-0 top-5 -z-0"></div>
                <div 
                  className="absolute h-0.5 bg-green-500 left-0 top-5 -z-0 transition-all duration-300"
                  style={{ 
                    width: `${(workflowSteps.findIndex(s => s.id === activeWorkflowStep) / (workflowSteps.length - 1)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
            
            {renderWorkflowContent()}
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Project Settings</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Name</label>
                  <Input 
                    value={project.name} 
                    onChange={(e) => setProject({...project, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Description</label>
                  <Input 
                    value={project.description} 
                    onChange={(e) => setProject({...project, description: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-md font-medium">Advanced Settings</h3>
                  <div className="p-4 border border-gray-200 rounded-md space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Error handling</p>
                        <p className="text-sm text-gray-500">How to handle transformation errors</p>
                      </div>
                      <select className="rounded-md border-gray-300 text-sm">
                        <option>Stop on error</option>
                        <option>Skip and continue</option>
                        <option>Retry (3 times)</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Logging level</p>
                        <p className="text-sm text-gray-500">Control verbosity of pipeline logs</p>
                      </div>
                      <select className="rounded-md border-gray-300 text-sm">
                        <option>Info</option>
                        <option>Debug</option>
                        <option>Warning</option>
                        <option>Error</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notifications</p>
                        <p className="text-sm text-gray-500">Receive alerts on pipeline events</p>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="notifications" 
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          defaultChecked 
                        />
                        <label htmlFor="notifications" className="ml-2 text-sm">Enable</label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleSave}>
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="logs" className="mt-0">
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Pipeline Logs</h2>
              <div className="mb-4 flex justify-between items-center">
                <div className="flex gap-2">
                  <select className="rounded-md border-gray-300 text-sm">
                    <option>All levels</option>
                    <option>Info</option>
                    <option>Warning</option>
                    <option>Error</option>
                  </select>
                  <select className="rounded-md border-gray-300 text-sm">
                    <option>Last 24 hours</option>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Custom range</option>
                  </select>
                </div>
                <Button variant="outline" size="sm">
                  Refresh
                </Button>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 font-mono text-sm h-[400px] overflow-y-auto text-gray-700">
                <div className="space-y-2">
                  <p><span className="text-blue-500">[2023-05-12 03:15:01]</span> <span className="text-green-600">[INFO]</span> Pipeline execution started</p>
                  <p><span className="text-blue-500">[2023-05-12 03:15:02]</span> <span className="text-green-600">[INFO]</span> Connected to source database 'sales'</p>
                  <p><span className="text-blue-500">[2023-05-12 03:15:03]</span> <span className="text-green-600">[INFO]</span> Extracting data from table 'customers'</p>
                  <p><span className="text-blue-500">[2023-05-12 03:15:05]</span> <span className="text-green-600">[INFO]</span> 1,283 rows extracted from 'customers'</p>
                  <p><span className="text-blue-500">[2023-05-12 03:15:06]</span> <span className="text-green-600">[INFO]</span> Extracting data from table 'orders'</p>
                  <p><span className="text-blue-500">[2023-05-12 03:15:09]</span> <span className="text-green-600">[INFO]</span> 5,476 rows extracted from 'orders'</p>
                  <p><span className="text-blue-500">[2023-05-12 03:15:10]</span> <span className="text-green-600">[INFO]</span> Applying transformation 'join_customer_orders'</p>
                  <p><span className="text-blue-500">[2023-05-12 03:15:12]</span> <span className="text-yellow-600">[WARN]</span> 12 rows with NULL customer_id skipped</p>
                  <p><span className="text-blue-500">[2023-05-12 03:15:15]</span> <span className="text-green-600">[INFO]</span> Applying transformation 'calculate_order_metrics'</p>
                  <p><span className="text-blue-500">[2023-05-12 03:15:18]</span> <span className="text-green-600">[INFO]</span> Connected to target database 'analytics'</p>
                  <p><span className="text-blue-500">[2023-05-12 03:15:20]</span> <span className="text-green-600">[INFO]</span> Loading data to target table 'customer_orders'</p>
                  <p><span className="text-blue-500">[2023-05-12 03:15:25]</span> <span className="text-green-600">[INFO]</span> 5,464 rows loaded to 'customer_orders'</p>
                  <p><span className="text-blue-500">[2023-05-12 03:15:26]</span> <span className="text-green-600">[INFO]</span> Loading data to target table 'order_metrics'</p>
                  <p><span className="text-blue-500">[2023-05-12 03:15:30]</span> <span className="text-green-600">[INFO]</span> 1,283 rows loaded to 'order_metrics'</p>
                  <p><span className="text-blue-500">[2023-05-12 03:15:31]</span> <span className="text-green-600">[INFO]</span> Pipeline execution completed successfully</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </div>
      
      <AddDataSourceDialog
        open={sourceDialogOpen}
        onOpenChange={setSourceDialogOpen}
        onSubmit={handleSourceSubmit}
        type="source"
      />
      
      <AddDataSourceDialog
        open={targetDialogOpen}
        onOpenChange={setTargetDialogOpen}
        onSubmit={handleTargetSubmit}
        type="target"
      />
    </SidebarLayout>
  );
};

export default ProjectDetail;
