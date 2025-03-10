
import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  NodeChange,
  EdgeChange,
  Connection,
  Position,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Link2, Download, Trash } from 'lucide-react';

interface TableNodeData {
  label: string;
  columns: { name: string; type: string; primaryKey?: boolean; foreignKey?: boolean }[];
}

interface TableRelationship {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
}

const SchemaGraphView: React.FC = () => {
  const { toast } = useToast();
  
  const initialNodes: Node[] = [
    {
      id: 'customers',
      type: 'default',
      data: {
        label: 'Customers Table',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'name', type: 'VARCHAR' },
          { name: 'email', type: 'VARCHAR' },
          { name: 'created_at', type: 'TIMESTAMP' }
        ]
      },
      position: { x: 100, y: 100 },
      style: {
        width: 220,
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: 0,
        overflow: 'hidden'
      },
      targetPosition: Position.Left,
      sourcePosition: Position.Right
    },
    {
      id: 'orders',
      type: 'default',
      data: {
        label: 'Orders Table',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'customer_id', type: 'INTEGER', foreignKey: true },
          { name: 'order_date', type: 'TIMESTAMP' },
          { name: 'total', type: 'DECIMAL' }
        ]
      },
      position: { x: 450, y: 100 },
      style: {
        width: 220,
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: 0,
        overflow: 'hidden'
      },
      targetPosition: Position.Left,
      sourcePosition: Position.Right
    }
  ];

  const initialEdges: Edge[] = [
    {
      id: 'e-customers-orders',
      source: 'customers',
      target: 'orders',
      animated: true,
      label: 'one-to-many',
      type: 'smoothstep',
      style: { stroke: '#6366f1' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#6366f1'
      }
    }
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [addTableDialogOpen, setAddTableDialogOpen] = useState(false);
  const [addRelationshipDialogOpen, setAddRelationshipDialogOpen] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableColumns, setNewTableColumns] = useState('id:INTEGER,name:VARCHAR');
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [relationship, setRelationship] = useState<TableRelationship>({
    sourceTable: '',
    sourceColumn: '',
    targetTable: '',
    targetColumn: ''
  });

  // Update selected nodes when nodes change
  useEffect(() => {
    setSelectedNodes(nodes.filter(node => node.selected));
  }, [nodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#6366f1' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#6366f1'
      }
    }, eds)),
    [setEdges]
  );

  const handleAddTable = () => {
    if (!newTableName.trim()) {
      toast({
        title: 'Error',
        description: 'Table name is required',
        variant: 'destructive'
      });
      return;
    }

    const tableId = newTableName.toLowerCase().replace(/\s+/g, '_');
    
    // Parse columns
    const columns = newTableColumns.split(',').map(columnStr => {
      const [name, type] = columnStr.trim().split(':');
      const isPrimaryKey = name.toLowerCase() === 'id';
      return { name, type: type || 'VARCHAR', primaryKey: isPrimaryKey };
    });

    // Create new table node
    const newNode: Node = {
      id: tableId,
      type: 'default',
      data: {
        label: `${newTableName} Table`,
        columns
      },
      position: { 
        x: Math.random() * 300 + 100, 
        y: Math.random() * 300 + 100
      },
      style: {
        width: 220,
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: 0,
        overflow: 'hidden'
      },
      targetPosition: Position.Left,
      sourcePosition: Position.Right
    };

    setNodes(prevNodes => [...prevNodes, newNode]);
    setNewTableName('');
    setNewTableColumns('id:INTEGER,name:VARCHAR');
    setAddTableDialogOpen(false);

    toast({
      title: 'Table Added',
      description: `${newTableName} table has been added to your schema.`
    });
  };

  const handleAddRelationship = () => {
    const { sourceTable, sourceColumn, targetTable, targetColumn } = relationship;
    
    if (!sourceTable || !sourceColumn || !targetTable || !targetColumn) {
      toast({
        title: 'Error',
        description: 'All fields are required to create a relationship',
        variant: 'destructive'
      });
      return;
    }

    const edgeId = `e-${sourceTable}-${targetTable}-${Date.now()}`;
    
    // Create new edge
    const newEdge: Edge = {
      id: edgeId,
      source: sourceTable,
      target: targetTable,
      animated: true,
      label: 'relates to',
      type: 'smoothstep',
      style: { stroke: '#6366f1' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#6366f1'
      }
    };

    setEdges(prevEdges => [...prevEdges, newEdge]);
    
    // Reset form
    setRelationship({
      sourceTable: '',
      sourceColumn: '',
      targetTable: '',
      targetColumn: ''
    });
    
    setAddRelationshipDialogOpen(false);

    toast({
      title: 'Relationship Added',
      description: `Relationship between ${sourceTable} and ${targetTable} has been created.`
    });
  };

  const handleDeleteSelected = () => {
    if (selectedNodes.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select at least one node to delete',
        variant: 'destructive'
      });
      return;
    }

    const selectedNodeIds = selectedNodes.map(node => node.id);
    
    // Remove selected nodes
    setNodes(nodes.filter(node => !selectedNodeIds.includes(node.id)));
    
    // Remove edges connected to deleted nodes
    setEdges(edges.filter(edge => 
      !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target)
    ));

    toast({
      title: 'Deleted',
      description: `${selectedNodeIds.length} item(s) have been deleted.`
    });
  };

  const handleExportSchema = () => {
    const schema = {
      tables: nodes.map(node => ({
        name: node.id,
        label: node.data.label,
        columns: node.data.columns
      })),
      relationships: edges.map(edge => ({
        id: edge.id,
        sourceTable: edge.source,
        targetTable: edge.target,
        label: edge.label
      }))
    };

    const jsonString = JSON.stringify(schema, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Schema Exported',
      description: 'Your schema has been exported as JSON.'
    });
  };

  // Custom node renderer
  const customNodeComponent = ({ id, data }: { id: string, data: TableNodeData }) => {
    return (
      <div className="table-node">
        <div className="table-node-header bg-indigo-600 text-white px-3 py-2 text-sm font-semibold">
          {data.label}
        </div>
        <div className="table-node-columns">
          {data.columns.map((column, idx) => (
            <div key={idx} className="table-node-column px-3 py-1 text-xs border-b border-gray-100 flex justify-between">
              <div className="flex items-center">
                {column.primaryKey && <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1" title="Primary Key" />}
                {column.foreignKey && <span className="w-2 h-2 bg-blue-400 rounded-full mr-1" title="Foreign Key" />}
                <span>{column.name}</span>
              </div>
              <span className="text-gray-500">{column.type}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Set custom node types
  const nodeTypes = {
    default: customNodeComponent,
  };

  return (
    <div className="w-full h-full">
      <div className="absolute top-3 right-6 z-10 flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => setAddTableDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Table
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => setAddRelationshipDialogOpen(true)}
        >
          <Link2 className="h-4 w-4" />
          Add Relationship
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={handleExportSchema}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={handleDeleteSelected}
        >
          <Trash className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#f0f0f0" gap={16} />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {/* Add Table Dialog */}
      <Dialog open={addTableDialogOpen} onOpenChange={setAddTableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tableName">Table Name</Label>
              <Input
                id="tableName"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                placeholder="e.g. Products"
              />
            </div>
            <div>
              <Label htmlFor="tableColumns">
                Columns (format: name:type, name:type, ...)
              </Label>
              <Input
                id="tableColumns"
                value={newTableColumns}
                onChange={(e) => setNewTableColumns(e.target.value)}
                placeholder="e.g. id:INTEGER, name:VARCHAR"
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: id:INTEGER,name:VARCHAR,price:DECIMAL
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTableDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTable}>Add Table</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Relationship Dialog */}
      <Dialog open={addRelationshipDialogOpen} onOpenChange={setAddRelationshipDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Relationship</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sourceTable">Source Table</Label>
              <Select
                value={relationship.sourceTable}
                onValueChange={(value) => setRelationship({ ...relationship, sourceTable: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source table" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.data.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sourceColumn">Source Column</Label>
              <Select
                value={relationship.sourceColumn}
                onValueChange={(value) => setRelationship({ ...relationship, sourceColumn: value })}
                disabled={!relationship.sourceTable}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source column" />
                </SelectTrigger>
                <SelectContent>
                  {relationship.sourceTable && 
                    nodes.find(node => node.id === relationship.sourceTable)?.data.columns.map((column) => (
                      <SelectItem key={column.name} value={column.name}>
                        {column.name} ({column.type})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="targetTable">Target Table</Label>
              <Select
                value={relationship.targetTable}
                onValueChange={(value) => setRelationship({ ...relationship, targetTable: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target table" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.data.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="targetColumn">Target Column</Label>
              <Select
                value={relationship.targetColumn}
                onValueChange={(value) => setRelationship({ ...relationship, targetColumn: value })}
                disabled={!relationship.targetTable}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target column" />
                </SelectTrigger>
                <SelectContent>
                  {relationship.targetTable && 
                    nodes.find(node => node.id === relationship.targetTable)?.data.columns.map((column) => (
                      <SelectItem key={column.name} value={column.name}>
                        {column.name} ({column.type})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRelationshipDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRelationship}>Add Relationship</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchemaGraphView;
