
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database, FileType, Table, Server } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AddDataSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

const AddDataSourceDialog = ({ open, onOpenChange, projectId }: AddDataSourceDialogProps) => {
  const [sourceType, setSourceType] = useState("");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    host: "",
    port: "",
    username: "",
    password: "",
    database: "",
    filePath: "",
  });

  const handleTypeSelect = (type: string) => {
    setSourceType(type);
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would send the data to your backend
    console.log("Adding data source to project", projectId, {
      type: sourceType,
      ...formData
    });
    
    toast({
      title: "Data source added",
      description: `${formData.name} has been added successfully.`
    });
    
    // Reset form and close dialog
    setSourceType("");
    setStep(1);
    setFormData({
      name: "",
      host: "",
      port: "",
      username: "",
      password: "",
      database: "",
      filePath: "",
    });
    onOpenChange(false);
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Data Source</DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Choose a type of data source to add to your project."
              : `Configure your ${sourceType} connection details.`}
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 ? (
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-36 p-6 hover:bg-muted"
              onClick={() => handleTypeSelect("mysql")}
            >
              <Database className="h-10 w-10 mb-2 text-primary" />
              <span className="font-medium">MySQL</span>
              <span className="text-xs text-muted-foreground mt-1">Connect to MySQL database</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-36 p-6 hover:bg-muted"
              onClick={() => handleTypeSelect("postgresql")}
            >
              <Database className="h-10 w-10 mb-2 text-primary" />
              <span className="font-medium">PostgreSQL</span>
              <span className="text-xs text-muted-foreground mt-1">Connect to PostgreSQL database</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-36 p-6 hover:bg-muted"
              onClick={() => handleTypeSelect("file")}
            >
              <FileType className="h-10 w-10 mb-2 text-primary" />
              <span className="font-medium">CSV/Excel</span>
              <span className="text-xs text-muted-foreground mt-1">Upload file data sources</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-36 p-6 hover:bg-muted"
              onClick={() => handleTypeSelect("api")}
            >
              <Server className="h-10 w-10 mb-2 text-primary" />
              <span className="font-medium">REST API</span>
              <span className="text-xs text-muted-foreground mt-1">Connect to REST endpoints</span>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Data Source Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Sales Database" 
                  required 
                />
              </div>
              
              {sourceType !== "file" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="host">Host</Label>
                      <Input 
                        id="host" 
                        name="host"
                        value={formData.host}
                        onChange={handleInputChange}
                        placeholder="e.g., localhost" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="port">Port</Label>
                      <Input 
                        id="port" 
                        name="port"
                        value={formData.port}
                        onChange={handleInputChange}
                        placeholder={sourceType === "mysql" ? "3306" : "5432"} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="database">Database Name</Label>
                    <Input 
                      id="database" 
                      name="database"
                      value={formData.database}
                      onChange={handleInputChange}
                      placeholder="e.g., salesdb" 
                      required 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="e.g., admin" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        type="password" 
                        required 
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="filePath">File Path</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="filePath" 
                      name="filePath"
                      value={formData.filePath}
                      onChange={handleInputChange}
                      placeholder="Select a file or enter URL" 
                      className="flex-1"
                      required 
                    />
                    <Button type="button" variant="outline">Browse</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: CSV, Excel, JSON
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter className="mt-6 flex justify-between">
              <Button type="button" variant="outline" onClick={goBack}>
                Back
              </Button>
              <Button type="submit">
                Add Data Source
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddDataSourceDialog;
