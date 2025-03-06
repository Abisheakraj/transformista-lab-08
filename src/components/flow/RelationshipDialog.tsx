import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SchemaTable, ColumnType, RelationshipData } from "@/types/flow";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "@/hooks/use-toast";

interface RelationshipDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  tables: SchemaTable[];
  onRelationshipAdd: (relationship: RelationshipData) => void;
}

export function RelationshipDialog({ open, setOpen, tables, onRelationshipAdd }: RelationshipDialogProps) {
  const [sourceTable, setSourceTable] = useState<string | undefined>(undefined);
  const [targetTable, setTargetTable] = useState<string | undefined>(undefined);
  const [sourceColumn, setSourceColumn] = useState<string | undefined>(undefined);
  const [targetColumn, setTargetColumn] = useState<string | undefined>(undefined);
  const [relationshipId, setRelationshipId] = useState<string>(uuidv4());

  useEffect(() => {
    if (open) {
      setSourceTable(undefined);
      setTargetTable(undefined);
      setSourceColumn(undefined);
      setTargetColumn(undefined);
      setRelationshipId(uuidv4());
    }
  }, [open]);

  const handleAddRelationship = () => {
    if (!sourceTable || !targetTable || !sourceColumn || !targetColumn) {
      toast({
        title: "Missing information",
        description: "Please select all required fields for the relationship",
        type: "destructive"
      });
      return;
    }

    if (sourceTable === targetTable && sourceColumn === targetColumn) {
       toast({
        title: "Invalid information",
        description: "Source and target cannot be the same",
        type: "destructive"
      });
      return;
    }

    const newRelationship: RelationshipData = {
      sourceTable,
      sourceColumn,
      targetTable,
      targetColumn,
      id: relationshipId,
    };

    onRelationshipAdd(newRelationship);
    setOpen(false);
  };

  const getColumnsForTable = (tableName: string | undefined): ColumnType[] => {
    const table = tables.find((table) => table.name === tableName);
    return table ? table.columns : [];
  };

  const sourceColumns = getColumnsForTable(sourceTable);
  const targetColumns = getColumnsForTable(targetTable);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Relationship</AlertDialogTitle>
          <AlertDialogDescription>
            Define a relationship between two tables in your schema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="source-table" className="text-right">
              Source Table
            </Label>
            <Select onValueChange={setSourceTable} defaultValue={sourceTable} value={sourceTable}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.name} value={table.name}>
                    {table.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="source-column" className="text-right">
              Source Column
            </Label>
            <Select onValueChange={setSourceColumn} defaultValue={sourceColumn} value={sourceColumn} disabled={!sourceTable}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {sourceColumns.map((column) => (
                  <SelectItem key={column.name} value={column.name}>
                    {column.name} ({column.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="target-table" className="text-right">
              Target Table
            </Label>
            <Select onValueChange={setTargetTable} defaultValue={targetTable} value={targetTable}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.name} value={table.name}>
                    {table.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="target-column" className="text-right">
              Target Column
            </Label>
            <Select onValueChange={setTargetColumn} defaultValue={targetColumn} value={targetColumn} disabled={!targetTable}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {targetColumns.map((column) => (
                  <SelectItem key={column.name} value={column.name}>
                    {column.name} ({column.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAddRelationship}>Add Relationship</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
