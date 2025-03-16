
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Database } from "lucide-react";
import { testDatabaseConnection } from "@/lib/database-client";
import { useDatabaseConnections } from "@/hooks/useDatabaseConnections";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

interface ConnectionFormProps {
  type: "source" | "target";
  onSuccess: () => void;
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

const ConnectionForm = ({ type, onSuccess }: ConnectionFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();
  const { addConnection } = useDatabaseConnections();
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    connectionType: "mysql",  // Default to MySQL as per the API
    host: "localhost", // Default value from your curl commands
    port: "3306",      // Default value from your curl commands
    database: "airportdb", // Default value from your curl commands
    username: "root",  // Default value from your curl commands
    password: "9009"   // Default value from your curl commands
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTestConnection = async () => {
    if (!formData.host) {
      toast({
        title: "Missing Information",
        description: "Please provide at least host to test the connection.",
        variant: "destructive"
      });
      return;
    }

    setIsTestingConnection(true);
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
      setConnectionResult(result);
      
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
      toast({
        title: "Connection Error",
        description: "An unexpected error occurred while testing the connection.",
        variant: "destructive"
      });
      
      setConnectionResult({
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.connectionType || !formData.host) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields to add this connection.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Test the connection before adding
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
        setConnectionResult(testResult);
        setIsLoading(false);
        return;
      }

      console.log("Adding connection to store");
      // Add connection to the store
      addConnection({
        name: formData.name,
        connectionType: formData.connectionType,
        host: formData.host,
        port: formData.port,
        database: formData.database,
        username: formData.username,
        password: formData.password,
        type
      });
      
      // Success
      onSuccess();
      
      // Reset connection result
      setConnectionResult(null);
      
      toast({
        title: `${type === "source" ? "Source" : "Target"} connection added`,
        description: `Successfully added ${formData.name} connection.`
      });
    } catch (error) {
      console.error("Error adding connection:", error);
      toast({
        title: "Error adding connection",
        description: "There was a problem adding your connection. Please try again.",
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Connection Name <span className="text-red-500">*</span></Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g., Production MySQL Database"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="connectionType">Database Type <span className="text-red-500">*</span></Label>
          <Select 
            value={formData.connectionType} 
            onValueChange={(value) => handleSelectChange("connectionType", value)}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="host">Host / Endpoint <span className="text-red-500">*</span></Label>
          <Input
            id="host"
            name="host"
            placeholder="e.g., localhost or db.example.com"
            value={formData.host}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="port">Port</Label>
          <Input
            id="port"
            name="port"
            placeholder="e.g., 3306"
            value={formData.port}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="database">Database Name</Label>
          <Input
            id="database"
            name="database"
            placeholder="e.g., airportdb"
            value={formData.database}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            placeholder="e.g., root"
            value={formData.username}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>
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
              ? <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> 
              : <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            }
            <AlertDescription>
              {connectionResult.message}
            </AlertDescription>
          </div>
        </Alert>
      )}

      <div className="flex justify-end gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleTestConnection}
          disabled={isTestingConnection || !formData.host}
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
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Connection
            </>
          ) : (
            "Add Connection"
          )}
        </Button>
      </div>
    </form>
  );
};

export default ConnectionForm;
