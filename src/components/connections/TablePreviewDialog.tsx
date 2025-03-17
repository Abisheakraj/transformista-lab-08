
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { fetchTablePreview } from "@/lib/api-check";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TablePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: string;
}

const TablePreviewDialog = ({
  open,
  onOpenChange,
  tableName
}: TablePreviewDialogProps) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && tableName) {
      loadTablePreview();
    }
  }, [open, tableName]);

  const loadTablePreview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTablePreview(tableName);
      setTableData(data);
    } catch (err) {
      console.error("Failed to fetch table preview:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      toast({
        title: "Failed to fetch table preview",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get column names from the first row of data
  const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Table Preview: {tableName}</DialogTitle>
          <DialogDescription>
            Preview of the first few rows of the table
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
              <p>Loading table data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p className="mb-2">Failed to load table data</p>
              <p className="text-sm">{error}</p>
              <Button 
                variant="outline" 
                onClick={loadTablePreview} 
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : tableData.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No data found</p>
          ) : (
            <ScrollArea className="h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map(column => (
                      <TableHead key={column}>{column}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map(column => (
                        <TableCell key={`${rowIndex}-${column}`}>
                          {row[column]?.toString() || ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={loadTablePreview} disabled={isLoading}>
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

export default TablePreviewDialog;
