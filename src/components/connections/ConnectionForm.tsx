
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Database } from "lucide-react";
import { testDatabaseConnection } from "@/lib/database-client";

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
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    connectionType: "",
    host: "",
    port: "",
    database: "",
    username: "",
    password: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTestConnection = async () => {
    if (!formData.host || !formData.database) {
      toast({
        title: "Missing Information",
        description: "Please provide at least host and database name to test the connection.",
        variant: "destructive"
      });
      return;
    }

    setIsTestingConnection(true);
    
    try {
      const result = await testDatabaseConnection({
        host: formData.host,
        port: formData.port,
        database: formData.database,
        username: formData.username,
        password: formData.password,
        connectionType: formData.connectionType.toLowerCase()
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
      toast({
        title: "Connection Error",
        description: "An unexpected error occurred while testing the connection.",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
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
    
    // Simulate API call for adding the connection
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Success
      onSuccess();
      
      // Reset form
      setFormData({
        name: "",
        connectionType: "",
        host: "",
        port: "",
        database: "",
        username: "",
        password: ""
      });
      
      toast({
        title: `${type === "source" ? "Source" : "Target"} connection added`,
        description: `Successfully added ${formData.name} connection.`
      });
    } catch (error) {
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
    ? ["MySQL", "PostgreSQL", "Oracle", "MSSQL", "Sybase"] 
    : ["MySQL", "PostgreSQL", "BigQuery", "Snowflake", "Redshift"];

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
                    {dbType}
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
          <Label htmlFor="database">Database Name <span className="text-red-500">*</span></Label>
          <Input
            id="database"
            name="database"
            placeholder="e.g., my_database"
            value={formData.database}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            placeholder="e.g., db_user"
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

      <div className="flex justify-end gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleTestConnection}
          disabled={isTestingConnection || !formData.host || !formData.database}
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
