
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TablePreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSchema: string | null;
  selectedTable: string | null;
  tableData: { columns: string[]; rows: any[][] } | null;
  isLoading: boolean;
}

const TablePreviewDialog = ({ 
  isOpen, 
  onOpenChange, 
  selectedSchema, 
  selectedTable, 
  tableData, 
  isLoading 
}: TablePreviewDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Table Preview: {selectedSchema}.{selectedTable}</DialogTitle>
          <DialogDescription>
            Preview data from the selected table
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
              <span className="ml-2">Loading data...</span>
            </div>
          ) : (
            tableData && (
              <div className="overflow-auto max-h-96">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      {tableData.columns.map((column, idx) => (
                        <th key={idx} className="border px-4 py-2 text-left">{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="border px-4 py-2">{cell?.toString() || ""}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
          {!isLoading && !tableData && (
            <div className="text-center py-10 border border-dashed rounded-md">
              <p className="text-gray-500">No data available for this table</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TablePreviewDialog;
