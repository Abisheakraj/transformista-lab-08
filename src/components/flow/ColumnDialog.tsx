
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
import { ColumnType } from "@/types/flow";

interface ColumnDialogProps { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (tableId: string, columns: ColumnType[]) => void; 
  tableId: string;
  existingColumns?: ColumnType[];
}

const ColumnDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  tableId, 
  existingColumns = [] 
}: ColumnDialogProps) => {
  const [columns, setColumns] = useState<ColumnType[]>(existingColumns);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState("varchar");
  const [isPrimaryKey, setIsPrimaryKey] = useState(false);
  const [isForeignKey, setIsForeignKey] = useState(false);
  const [references, setReferences] = useState("");

  useEffect(() => {
    setColumns(existingColumns);
  }, [existingColumns, isOpen]);

  const handleAddColumn = () => {
    if (!newColumnName) return;
    
    const newColumn: ColumnType = {
      name: newColumnName,
      type: newColumnType,
      isPrimaryKey,
      isForeignKey,
      references: isForeignKey ? references : undefined
    };
    
    setColumns([...columns, newColumn]);
    setNewColumnName("");
    setNewColumnType("varchar");
    setIsPrimaryKey(false);
    setIsForeignKey(false);
    setReferences("");
  };

  const handleRemoveColumn = (index: number) => {
    const updatedColumns = [...columns];
    updatedColumns.splice(index, 1);
    setColumns(updatedColumns);
  };

  const handleSave = () => {
    onSave(tableId, columns);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Table Columns</DialogTitle>
          <DialogDescription>Add, edit or remove columns for this table</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border rounded-md">
            <div className="grid grid-cols-12 gap-2 p-3 bg-muted font-medium text-sm">
              <div className="col-span-4">Column Name</div>
              <div className="col-span-3">Type</div>
              <div className="col-span-2">Primary Key</div>
              <div className="col-span-2">Foreign Key</div>
              <div className="col-span-1"></div>
            </div>
            
            <ScrollArea className="h-[200px]">
              {columns.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No columns defined yet. Add columns below.
                </div>
              ) : (
                <div className="divide-y">
                  {columns.map((column, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 p-3 items-center">
                      <div className="col-span-4">{column.name}</div>
                      <div className="col-span-3">{column.type}</div>
                      <div className="col-span-2">
                        {column.isPrimaryKey ? (
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-amber-500 rounded-full mr-1.5" />
                            <span>Yes</span>
                          </div>
                        ) : "No"}
                      </div>
                      <div className="col-span-2">
                        {column.isForeignKey ? (
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-1.5" />
                            <span>Yes</span>
                          </div>
                        ) : "No"}
                      </div>
                      <div className="col-span-1 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 rounded-full hover:bg-red-100"
                          onClick={() => handleRemoveColumn(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          
          <div className="border rounded-md p-3">
            <h4 className="font-medium mb-3">Add New Column</h4>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-4">
                <Label htmlFor="column-name" className="mb-1 block text-xs">Column Name</Label>
                <Input 
                  id="column-name" 
                  value={newColumnName} 
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="e.g., customer_id"
                />
              </div>
              <div className="col-span-3">
                <Label htmlFor="column-type" className="mb-1 block text-xs">Data Type</Label>
                <select 
                  id="column-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newColumnType}
                  onChange={(e) => setNewColumnType(e.target.value)}
                >
                  <option value="varchar">varchar</option>
                  <option value="int">int</option>
                  <option value="bigint">bigint</option>
                  <option value="boolean">boolean</option>
                  <option value="timestamp">timestamp</option>
                  <option value="date">date</option>
                  <option value="decimal">decimal</option>
                  <option value="text">text</option>
                  <option value="json">json</option>
                </select>
              </div>
              <div className="col-span-2">
                <div className="h-7"></div> {/* Spacer to align with inputs */}
                <div className="flex items-center h-10">
                  <input 
                    type="checkbox" 
                    id="is-primary" 
                    checked={isPrimaryKey}
                    onChange={() => setIsPrimaryKey(!isPrimaryKey)}
                    className="mr-2"
                  />
                  <Label htmlFor="is-primary" className="text-sm cursor-pointer">Primary Key</Label>
                </div>
              </div>
              <div className="col-span-2">
                <div className="h-7"></div> {/* Spacer to align with inputs */}
                <div className="flex items-center h-10">
                  <input 
                    type="checkbox" 
                    id="is-foreign" 
                    checked={isForeignKey}
                    onChange={() => setIsForeignKey(!isForeignKey)}
                    className="mr-2"
                  />
                  <Label htmlFor="is-foreign" className="text-sm cursor-pointer">Foreign Key</Label>
                </div>
              </div>
              <div className="col-span-1">
                <div className="h-7"></div> {/* Spacer to align with inputs */}
                <Button 
                  onClick={handleAddColumn} 
                  disabled={!newColumnName} 
                  className="h-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {isForeignKey && (
              <div className="mt-3">
                <Label htmlFor="references" className="mb-1 block text-xs">References Table.Column</Label>
                <Input 
                  id="references" 
                  value={references} 
                  onChange={(e) => setReferences(e.target.value)}
                  placeholder="e.g., users.id"
                  className="max-w-[300px]"
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Columns
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnDialog;
