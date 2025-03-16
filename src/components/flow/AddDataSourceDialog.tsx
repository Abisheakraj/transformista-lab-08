
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { Link } from "react-router-dom";
import { ExternalLink, Loader2, Database, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { testDatabaseConnection, ApiResponse } from "@/lib/database-client";

interface AddDataSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (dataSource: {
    name: string;
    type: "source" | "target";
    connectionType: string;
    host: string;
    port: string;
    database: string;
    username: string;
    password: string;
  }) => void;
  type: "source" | "target";
}

interface FormData {
  name: string;
  connectionType: string;
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
}

const connectionTypes = {
  source: ["MySQL", "PostgreSQL", "SQLite", "MongoDB", "Oracle", "MSSQL", "Sybase"],
  target: ["MySQL", "PostgreSQL", "BigQuery", "Snowflake", "Redshift"]
};

const AddDataSourceDialog = ({ open, onOpenChange, onSubmit, type }: AddDataSourceDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string } | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; project?: string }>({ connected: false });
  
  const { register, handleSubmit, reset, control, getValues, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      connectionType: type === 'source' ? 'MySQL' : 'PostgreSQL',
      host: 'localhost',
      port: '3306',
      database: 'airportdb',
      username: 'root',
      password: '9009'
    }
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      reset();
      setConnectionResult(null);
    } else {
      // Check Supabase status
      const mockSupabaseStatus = { connected: false, project: undefined };
      setSupabaseStatus(mockSupabaseStatus);
      
      // Pre-fill form if supabase is connected
      if (mockSupabaseStatus.connected) {
        setValue('name', `${mockSupabaseStatus.project || 'Supabase'} ${type === 'source' ? 'Source' : 'Target'}`);
      }
    }
  }, [open, reset, type, setValue]);

  const handleFormSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      
      // Test connection before submitting
      const testResult = await testDatabaseConnection({
        host: data.host,
        port: data.port,
        database: data.database,
        username: data.username,
        password: data.password,
        connectionType: data.connectionType.toLowerCase(),
        db_type: data.connectionType.toLowerCase()
      });
      
      if (!testResult.success) {
        useToast().toast({
          title: "Connection Failed",
          description: testResult.message,
          variant: "destructive"
        });
        setConnectionResult({
          success: testResult.success,
          message: testResult.message
        });
        setIsLoading(false);
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      onSubmit({
        ...data,
        type,
      });
      useToast().toast({
        title: `${type === "source" ? "Source" : "Target"} connection added`,
        description: `Successfully added ${data.name} connection.`
      });
      reset();
      setConnectionResult(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding data source:", error);
      useToast().toast({
        title: "Error adding connection",
        description: "There was a problem adding your connection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    const values = getValues();
    
    if (!values.host || !values.database) {
      useToast().toast({
        title: "Missing Information",
        description: "Please provide at least host and database name to test the connection.",
        variant: "destructive"
      });
      return;
    }
    
    setIsTestingConnection(true);
    setConnectionResult(null);
    
    try {
      console.log("Testing connection with data:", values);
      const result = await testDatabaseConnection({
        host: values.host,
        port: values.port,
        database: values.database,
        username: values.username,
        password: values.password,
        connectionType: values.connectionType.toLowerCase(),
        db_type: values.connectionType.toLowerCase()
      });
      
      console.log("Connection test result:", result);
      // Create a new object with the required properties
      setConnectionResult({
        success: result.success,
        message: result.message
      });
      
      if (result.success) {
        useToast().toast({
          title: "Connection Successful",
          description: result.message
        });
      } else {
        useToast().toast({
          title: "Connection Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Connection test error:", error);
      useToast().toast({
        title: "Connection Error",
        description: "An unexpected error occurred while testing the connection.",
        variant: "destructive"
      });
      setConnectionResult({
        success: false,
        message: "An unexpected error occurred while testing the connection."
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      reset();
      setConnectionResult(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle>Add {type === "source" ? "Source" : "Target"} Database</DialogTitle>
            <DialogDescription>
              Configure your {type === "source" ? "source" : "target"} database connection details.
            </DialogDescription>
          </DialogHeader>
          
          {supabaseStatus.connected && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-start gap-3 mb-4">
              <CheckCircle2 className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-indigo-900">Supabase Integration Active</p>
                <p className="text-xs text-indigo-700 mt-1">
                  Connected to Supabase project: {supabaseStatus.project || 'Unknown'}. 
                  Your database credentials will be securely stored.
                </p>
              </div>
            </div>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Connection Name</Label>
              <Input
                id="name"
                placeholder="e.g., Production MySQL Database"
                {...register("name", { required: "Connection name is required" })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="connectionType">Database Type</Label>
              <Controller
                name="connectionType"
                control={control}
                rules={{ required: "Database type is required" }}
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select database type" />
                    </SelectTrigger>
                    <SelectContent>
                      {connectionTypes[type].map((dbType) => (
                        <SelectItem key={dbType} value={dbType}>
                          <div className="flex items-center">
                            <Database className="w-4 h-4 mr-2 text-muted-foreground" />
                            {dbType}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.connectionType && (
                <p className="text-sm text-destructive">{errors.connectionType.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="host">Host / Endpoint</Label>
                <Input
                  id="host"
                  placeholder="e.g., localhost or db.example.com"
                  {...register("host", { required: "Host is required" })}
                />
                {errors.host && (
                  <p className="text-sm text-destructive">{errors.host.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  placeholder="e.g., 3306"
                  {...register("port")}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="database">Database Name</Label>
              <Input
                id="database"
                placeholder="e.g., my_database"
                {...register("database", { required: "Database name is required" })}
              />
              {errors.database && (
                <p className="text-sm text-destructive">{errors.database.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="e.g., db_user"
                  {...register("username")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                />
              </div>
            </div>

            {connectionResult && (
              <div className={`p-3 rounded-lg flex items-start gap-3 ${
                connectionResult.success ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
              }`}>
                {connectionResult.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    connectionResult.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {connectionResult.success ? 'Connection Successful' : 'Connection Failed'}
                  </p>
                  <p className={`text-xs mt-1 ${
                    connectionResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {connectionResult.message}
                  </p>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground mt-2">
              <p>Need to manage more connections? Go to 
                <Button variant="link" className="h-auto p-0 ml-1" asChild>
                  <Link to="/connections" className="inline-flex items-center">
                    Connections Page
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={isTestingConnection}
            >
              {isTestingConnection ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className={connectionResult?.success ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Connection"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDataSourceDialog;
