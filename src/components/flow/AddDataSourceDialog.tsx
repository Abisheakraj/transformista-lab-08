
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { ExternalLink, Loader2, Database, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { testDatabaseConnection, ApiResponse } from "@/lib/database-client";

interface AddDataSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: any) => void;
  type: "source" | "target";
}

const AddDataSourceDialog = ({ open, onOpenChange, onSubmit, type }: AddDataSourceDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string; } | null>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    connectionType: "mysql",
    host: "localhost",
    port: "3306",
    database: "",
    username: "root",
    password: "",
    type: type
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTestConnection = async () => {
    if (!formData.host || !formData.username) {
      toast({
        title: "Missing Information",
        description: "Please provide at least host and username to test the connection.",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    setConnectionResult(null);
    
    try {
      console.log("Testing connection with data:", formData);
      const result = await testDatabaseConnection({
        host: formData.host,
        port: formData.port,
        database: formData.database,
        username: formData.username,
        password: formData.password,
        connectionType: formData.connectionType.toLowerCase(),
        db_type: formData.connectionType.toLowerCase()
      });
      
      console.log("Connection test result:", result);
      
      setConnectionResult({
        success: result.success,
        message: result.message
      });
      
      if (result.success) {
        toast({
          title: "Connection Successful",
          description: result.message
        });
      } else {
        toast({
          title: "Connection Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Connection test error:", error);
      setConnectionResult({
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred"
      });
      
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.connectionType || !formData.host || !formData.username) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields to add this connection.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Testing connection before adding...");
      const testResult = await testDatabaseConnection({
        host: formData.host,
        port: formData.port,
        database: formData.database,
        username: formData.username,
        password: formData.password,
        connectionType: formData.connectionType.toLowerCase(),
        db_type: formData.connectionType.toLowerCase()
      });
      
      if (!testResult.success) {
        toast({
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

      // Proceed with adding the connection
      onSubmit(formData);
      
      // Reset form after successful submission
      setFormData({
        name: "",
        connectionType: "mysql",
        host: "localhost",
        port: "3306",
        database: "",
        username: "root",
        password: "",
        type: type
      });
      
      setConnectionResult(null);
      
      // Show success message
      toast({
        title: `${type === "source" ? "Source" : "Target"} Connection Added`,
        description: "The connection has been added successfully."
      });
      
    } catch (error) {
      console.error("Error adding datasource:", error);
      toast({
        title: "Error Adding Data Source",
        description: "There was a problem adding your data source. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const connectionTypes = type === "source" 
    ? ["mysql", "postgresql", "oracle", "mssql"] 
    : ["mysql", "postgresql", "bigquery", "snowflake", "redshift"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{type === "source" ? "Add Source" : "Add Target"} Connection</DialogTitle>
          <DialogDescription>
            Configure your database connection settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Connection Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Production Database"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="connectionType">Database Type <span className="text-red-500">*</span></Label>
            <Select 
              value={formData.connectionType} 
              onValueChange={(value) => handleSelectChange("connectionType", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a database type" />
              </SelectTrigger>
              <SelectContent>
                {connectionTypes.map((dbType) => (
                  <SelectItem key={dbType} value={dbType.toLowerCase()}>
                    <div className="flex items-center">
                      <Database className="w-4 h-4 mr-2 text-muted-foreground" />
                      {dbType.toUpperCase()}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="host">Host <span className="text-red-500">*</span></Label>
            <Input
              id="host"
              name="host"
              placeholder="localhost"
              value={formData.host}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="port">Port <span className="text-red-500">*</span></Label>
            <Input
              id="port"
              name="port"
              placeholder="3306"
              value={formData.port}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="database">Database Name</Label>
            <Input
              id="database"
              name="database"
              placeholder="(Optional - can select after connection)"
              value={formData.database}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
            <Input
              id="username"
              name="username"
              placeholder="root"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {connectionResult && (
            <Alert 
              className={`${
                connectionResult.success 
                  ? "border-green-200 bg-green-50 text-green-800" 
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              <div className="flex">
                {connectionResult.success 
                  ? <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" /> 
                  : <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                }
                <AlertDescription>
                  {connectionResult.message}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleTestConnection} disabled={isTesting || !formData.host || !formData.username}>
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Connection"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDataSourceDialog;
