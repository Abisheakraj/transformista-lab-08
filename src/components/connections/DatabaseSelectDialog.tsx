
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, Loader2 } from "lucide-react";
import { fetchDatabases } from "@/lib/api-check";
import { useToast } from "@/hooks/use-toast";

interface DatabaseSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentials: {
    db_type: string;
    host: string;
    port: string;
    username: string;
    password: string;
  };
  onDatabaseSelect: (database: string) => void;
}

const DatabaseSelectDialog = ({
  open,
  onOpenChange,
  credentials,
  onDatabaseSelect
}: DatabaseSelectDialogProps) => {
  const [databases, setDatabases] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadDatabases();
    }
  }, [open]);

  const loadDatabases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching databases with credentials:", credentials);
      const dbs = await fetchDatabases(credentials);
      console.log("Databases fetched successfully:", dbs);
      setDatabases(dbs);
    } catch (err) {
      console.error("Failed to fetch databases:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      toast({
        title: "Failed to fetch databases",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDatabase = (database: string) => {
    console.log("Database selected from dialog:", database);
    
    // Call the onDatabaseSelect callback with the selected database
    onDatabaseSelect(database);
    
    // Close the dialog
    onOpenChange(false);
    
    toast({
      title: "Database Selected",
      description: `Selected database: ${database}`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Database</DialogTitle>
          <DialogDescription>
            Choose a database to connect to
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
              <p>Loading databases...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p className="mb-2">Failed to load databases</p>
              <p className="text-sm">{error}</p>
              <Button 
                variant="outline" 
                onClick={loadDatabases} 
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-72">
              <div className="space-y-1">
                {databases.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No databases found</p>
                ) : (
                  databases.map(db => (
                    <Button
                      key={db}
                      variant="ghost"
                      className="w-full justify-start text-left"
                      onClick={() => handleSelectDatabase(db)}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      {db}
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={loadDatabases} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DatabaseSelectDialog;
