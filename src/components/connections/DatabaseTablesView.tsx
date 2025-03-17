
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatabaseConnection } from "@/hooks/useDatabaseConnections";
import { Table, Database, Loader2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import TablePreviewDialog from "./TablePreviewDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { selectDatabaseAndGetTables, fetchTablePreview } from "@/lib/database-client";
import { 
  Table as UITable,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const [previewData, setPreviewData] = useState<{ columns: string[], rows: any[][] } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
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
      
      console.log("Fetching tables for database:", selectedDatabase);
      const tableList = await selectDatabaseAndGetTables(credentials);
      setTables(tableList);
      toast({
        title: "Tables loaded",
        description: `Successfully loaded ${tableList.length} tables from database ${selectedDatabase}`
      });
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

  const handleTableSelect = async (tableName: string) => {
    setSelectedTable(tableName);
    loadTablePreview(tableName);
  };

  const loadTablePreview = async (tableName: string) => {
    setIsPreviewLoading(true);
    setPreviewData(null);
    
    try {
      const data = await fetchTablePreview(tableName);
      setPreviewData(data);
    } catch (err) {
      console.error("Failed to fetch table preview:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: "Failed to fetch table preview",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsPreviewLoading(false);
    }
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
          <div className="space-y-4">
            {tables.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No tables found</p>
            ) : (
              <>
                <div className="flex items-center">
                  <Table className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="mr-2">Select a table to preview:</span>
                </div>
                <Select onValueChange={handleTableSelect} value={selectedTable || undefined}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map(table => (
                      <SelectItem key={table} value={table}>
                        <div className="flex items-center">
                          <Table className="h-4 w-4 text-blue-500 mr-2" />
                          {table}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        )}
        
        {/* Preview Section */}
        {selectedTable && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium flex items-center">
                <Eye className="h-4 w-4 mr-2 text-blue-500" />
                Preview of {selectedTable}
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => loadTablePreview(selectedTable)}
                disabled={isPreviewLoading}
              >
                {isPreviewLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Refresh Preview"
                )}
              </Button>
            </div>
            
            {isPreviewLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                <p>Loading preview data...</p>
              </div>
            ) : previewData ? (
              <div className="border rounded-md overflow-hidden">
                <div className="max-h-[400px] overflow-auto">
                  <UITable>
                    <TableHeader>
                      <TableRow>
                        {previewData.columns.map((column, index) => (
                          <TableHead key={index}>{column}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex}>
                              {cell !== null && cell !== undefined ? String(cell) : "NULL"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </UITable>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed rounded-md">
                <p className="text-gray-500">No preview data available</p>
              </div>
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
    </Card>
  );
};

export default DatabaseTablesView;
