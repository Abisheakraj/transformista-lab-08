
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchDatabaseTables } from "@/lib/api-check";
import { DatabaseConnection } from "@/hooks/useDatabaseConnections";
import { Table, Database, Loader2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import TablePreviewDialog from "./TablePreviewDialog";

interface DatabaseTablesViewProps {
  connection: DatabaseConnection;
  selectedDatabase: string;
}

const DatabaseTablesView = ({
  connection,
  selectedDatabase
}: DatabaseTablesViewProps) => {
  const [tables, setTables] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (connection && selectedDatabase) {
      loadTables();
    }
  }, [connection, selectedDatabase]);

  const loadTables = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const credentials = {
        db_type: connection.connectionType,
        host: connection.host,
        port: connection.port || "3306",
        username: connection.username || "",
        password: connection.password || "",
        database: selectedDatabase
      };
      
      const tableList = await fetchDatabaseTables(credentials);
      setTables(tableList);
    } catch (err) {
      console.error("Failed to fetch tables:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      toast({
        title: "Failed to fetch tables",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableClick = (tableName: string) => {
    setSelectedTable(tableName);
    setPreviewDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-500" />
          {selectedDatabase}
        </CardTitle>
        <CardDescription>
          Tables in the selected database
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
            <p>Loading tables...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p className="mb-2">Failed to load tables</p>
            <p className="text-sm">{error}</p>
            <Button 
              variant="outline" 
              onClick={loadTables} 
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {tables.length === 0 ? (
              <p className="text-center py-4 col-span-3 text-muted-foreground">No tables found</p>
            ) : (
              tables.map(table => (
                <div 
                  key={table}
                  className="border p-3 rounded-md hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  onClick={() => handleTableClick(table)}
                >
                  <div className="flex items-center">
                    <Table className="h-4 w-4 text-blue-500 mr-2" />
                    <span>{table}</span>
                  </div>
                  <Eye className="h-4 w-4 text-gray-400 hover:text-blue-500" />
                </div>
              ))
            )}
          </div>
        )}
        
        <Button 
          variant="outline" 
          onClick={loadTables} 
          className="mt-4"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Refresh Tables"
          )}
        </Button>
      </CardContent>

      {selectedTable && (
        <TablePreviewDialog
          open={previewDialogOpen}
          onOpenChange={setPreviewDialogOpen}
          tableName={selectedTable}
        />
      )}
    </Card>
  );
};

export default DatabaseTablesView;
