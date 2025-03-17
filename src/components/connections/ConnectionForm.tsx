
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Database, AlertTriangle, Settings } from "lucide-react";
import { fetchDatabases } from "@/lib/api-check";
import { useDatabaseConnections } from "@/hooks/useDatabaseConnections";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import DatabaseSelectDialog from "@/components/connections/DatabaseSelectDialog";

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
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const { addConnection } = useDatabaseConnections();
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string; isFallback?: boolean } | null>(null);
  const [isDatabaseSelectOpen, setIsDatabaseSelectOpen] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    connectionType: "mysql",
    host: "localhost",
    port: "3306",
    database: "",
    username: "root",
    password: "9009"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConnectDatabase = async () => {
    if (!formData.host) {
      toast({
        title: "Missing Information",
        description: "Please provide at least host to connect to the database.",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    setConnectionResult(null);
    
    try {
      console.log("Connecting to database with data:", formData);
      await fetchDatabases({
        db_type: formData.connectionType.toLowerCase(),
        host: formData.host,
        port: formData.port,
        username: formData.username,
        password: formData.password
      });
      
      // If we get here, the connection was successful
      setConnectionResult({
        success: true,
        message: "Connection successful! Database server is accessible."
      });
      
      toast({
        title: "Connection Successful",
        description: "Successfully connected to the database server."
      });
      
      // Open the database selection dialog
      setIsDatabaseSelectOpen(true);
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection Error",
        description: "An unexpected error occurred while connecting to the database.",
        variant: "destructive"
      });
      
      setConnectionResult({
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDatabaseSelect = (database: string) => {
    setFormData(prev => ({ ...prev, database }));
    toast({
      title: "Database Selected",
      description: `Selected database: ${database}`
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.connectionType || !formData.host || !formData.database) {
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
      await fetchDatabases({
        db_type: formData.connectionType.toLowerCase(),
        host: formData.host,
        port: formData.port,
        username: formData.username,
        password: formData.password
      });
      
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
      
      // Reset form
      setFormData({
        name: "",
        connectionType: "mysql",
        host: "localhost",
        port: "3306",
        database: "",
        username: "root",
        password: "9009"
      });
      
      toast({
        title: `${type === "source" ? "Source" : "Target"} connection added`,
        description: `Successfully added ${formData.name} connection.`
      });
    } catch (error) {
      console.error("Error adding connection:", error);
      
      // Check if it's a CORS error
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes('CORS') || errorMessage.includes('cross-origin')) {
        toast({
          title: "CORS Error Detected",
          description: "Please enable the CORS proxy in Settings menu to resolve this issue.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error adding connection",
          description: "There was a problem adding your connection. Please try again.",
          variant: "destructive"
        });
      }
      
      setConnectionResult({
        success: false,
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const connectionTypes = type === "source" 
    ? ["mysql", "postgresql", "oracle", "mssql"] 
    : ["mysql", "postgresql", "bigquery", "snowflake", "redshift"];

  // Detect if the connection error is CORS-related
  const isCorsError = connectionResult && !connectionResult.success && 
    (connectionResult.message.includes("CORS") || 
     connectionResult.message.includes("cross-origin") ||
     connectionResult.message.includes("blocked by CORS"));

  return (
    <>
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

        {/* Database connection fields */}
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
            <Label htmlFor="database">Database Name <span className="text-red-500">*</span></Label>
            <Input
              id="database"
              name="database"
              placeholder="e.g., airportdb"
              value={formData.database}
              onChange={handleInputChange}
              readOnly
              required
            />
            {formData.database && (
              <p className="text-xs text-muted-foreground mt-1">
                Selected database: {formData.database}
              </p>
            )}
          </div>
        </div>

        {/* Authentication fields */}
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

        {/* Connection result alerts */}
        {connectionResult && (
          <Alert 
            className={`${
              connectionResult.success 
                ? connectionResult.isFallback
                  ? "border-yellow-200 bg-yellow-50 text-yellow-800"
                  : "border-green-200 bg-green-50 text-green-800" 
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <div className="flex">
              {connectionResult.success 
                ? connectionResult.isFallback
                  ? <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                  : <CheckCircle className="h-5 w-5 text-green-500 mr-2" /> 
                : <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              }
              <AlertDescription>
                {connectionResult.message}
                {connectionResult.isFallback && (
                  <div className="mt-2 text-sm">
                    <Info className="h-4 w-4 inline mr-1" />
                    Using simulated connection because the backend server may be unavailable.
                  </div>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* CORS error help */}
        {isCorsError && (
          <Alert className="border-amber-200 bg-amber-50 text-amber-800">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              <AlertDescription>
                <p className="font-medium">CORS Issue Detected</p>
                <p className="mt-1">Your browser is blocking cross-origin requests to the API server. Try these solutions:</p>
                <ol className="list-decimal ml-5 mt-2">
                  <li className="mb-2">
                    <Link to="/settings" className="text-blue-600 hover:underline flex items-center gap-1 inline-flex">
                      <Settings className="h-3 w-3" /> Enable the CORS proxy in the Settings menu
                    </Link>
                  </li>
                  <li className="mb-1">Install a CORS browser extension like CORS Unblock</li>
                  <li>Your backend developer can also enable CORS on the server</li>
                </ol>
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Form buttons */}
        <div className="flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleConnectDatabase}
            disabled={isConnecting || !formData.host}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect & Select Database"
            )}
          </Button>
          <Button type="submit" disabled={isLoading || !formData.database}>
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

      <DatabaseSelectDialog
        open={isDatabaseSelectOpen}
        onOpenChange={setIsDatabaseSelectOpen}
        credentials={{
          db_type: formData.connectionType.toLowerCase(),
          host: formData.host,
          port: formData.port,
          username: formData.username,
          password: formData.password
        }}
        onDatabaseSelect={handleDatabaseSelect}
      />
    </>
  );
};

export default ConnectionForm;
