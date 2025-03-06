
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { RelationshipData, ColumnType } from "@/types/flow";
import { Node } from "@xyflow/react";

interface RelationshipDialogProps { 
  isOpen: boolean; 
  onClose: () => void; 
  nodes: Node[];
  onAddRelationship: (relationship: RelationshipData) => void;
}

const RelationshipDialog = ({ 
  isOpen, 
  onClose, 
  nodes,
  onAddRelationship
}: RelationshipDialogProps) => {
  const [sourceTable, setSourceTable] = useState("");
  const [sourceColumn, setSourceColumn] = useState("");
  const [targetTable, setTargetTable] = useState("");
  const [targetColumn, setTargetColumn] = useState("");
  
  const sourceTableNode = nodes.find(node => node.id === sourceTable);
  const targetTableNode = nodes.find(node => node.id === targetTable);
  
  // Provide default empty arrays
  const sourceColumns: ColumnType[] = sourceTableNode?.data?.columns ? 
    Array.isArray(sourceTableNode.data.columns) ? sourceTableNode.data.columns : [] 
    : [];
  
  const targetColumns: ColumnType[] = targetTableNode?.data?.columns ? 
    Array.isArray(targetTableNode.data.columns) ? targetTableNode.data.columns : []
    : [];
  
  const handleSubmit = () => {
    if (!sourceTable || !sourceColumn || !targetTable || !targetColumn) {
      toast({
        title: "Missing information",
        description: "Please select all required fields for the relationship",
        variant: "destructive"
      });
      return;
    }
    
    onAddRelationship({
      sourceTable,
      sourceColumn,
      targetTable,
      targetColumn,
      id: `rel-${Date.now()}`
    });
    
    // Reset form
    setSourceTable("");
    setSourceColumn("");
    setTargetTable("");
    setTargetColumn("");
    onClose();
  };
  
  const tableNodes = nodes.filter(node => node.type === 'table');
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Table Relationship</DialogTitle>
          <DialogDescription>Define a relationship between two tables</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="source-table">Source Table</Label>
            <select 
              id="source-table"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={sourceTable}
              onChange={(e) => {
                setSourceTable(e.target.value);
                setSourceColumn("");
              }}
            >
              <option value="">Select a table</option>
              {tableNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.data?.label ? String(node.data.label) : "Unnamed Table"}
                </option>
              ))}
            </select>
          </div>
          
          {sourceTable && (
            <div className="space-y-2">
              <Label htmlFor="source-column">Source Column</Label>
              <select 
                id="source-column"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={sourceColumn}
                onChange={(e) => setSourceColumn(e.target.value)}
              >
                <option value="">Select a column</option>
                {sourceColumns.map((col) => (
                  <option key={col.name} value={col.name}>
                    {col.name} ({col.type})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex justify-center">
            <div className="bg-muted rounded-full p-2">
              <ArrowDown className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="target-table">Target Table</Label>
            <select 
              id="target-table"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={targetTable}
              onChange={(e) => {
                setTargetTable(e.target.value);
                setTargetColumn("");
              }}
            >
              <option value="">Select a table</option>
              {tableNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.data?.label ? String(node.data.label) : "Unnamed Table"}
                </option>
              ))}
            </select>
          </div>
          
          {targetTable && (
            <div className="space-y-2">
              <Label htmlFor="target-column">Target Column</Label>
              <select 
                id="target-column"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={targetColumn}
                onChange={(e) => setTargetColumn(e.target.value)}
              >
                <option value="">Select a column</option>
                {targetColumns.map((col) => (
                  <option key={col.name} value={col.name}>
                    {col.name} ({col.type})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Relationship
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RelationshipDialog;
