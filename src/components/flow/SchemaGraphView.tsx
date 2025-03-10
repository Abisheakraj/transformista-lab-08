
import { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  MarkerType,
  Panel,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from "@/components/ui/button";
import { Plus, FileDown, ZoomIn, ZoomOut, Link, Unlink, Trash2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SchemaGraphViewProps {
  readOnly?: boolean;
  onTableMappingChange?: (tables: any[], connections: any[]) => void;
}

// Initial mock data for database tables and relationships
const initialNodes = [
  {
    id: 'db-source',
    type: 'input',
    data: { 
      label: (
        <div className="p-2">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
              <ellipse cx="12" cy="6" rx="8" ry="3" />
              <path d="M4 6v6a8 3 0 0 0 16 0V6" />
              <path d="M4 12v6a8 3 0 0 0 16 0v-6" />
            </svg>
            <span className="font-semibold">PostgreSQL Database</span>
          </div>
          <div className="text-xs text-left space-y-1">
            <div><span className="font-medium">Type:</span> postgres</div>
            <div><span className="font-medium">Host:</span> localhost</div>
            <div><span className="font-medium">Port:</span> 5432</div>
            <div><span className="font-medium">Database:</span> sales</div>
          </div>
        </div>
      )
    },
    position: { x: 50, y: 50 },
    style: { 
      background: 'white', 
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '10px',
      width: 220 
    },
  },
  {
    id: 'customers-table',
    data: { 
      label: (
        <div className="p-2">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <line x1="3" x2="21" y1="9" y2="9" />
              <line x1="3" x2="21" y1="15" y2="15" />
              <line x1="12" x2="12" y1="3" y2="21" />
            </svg>
            <span className="font-semibold">Customers Table</span>
          </div>
          <div className="text-xs text-left">
            <div className="font-medium mb-1">Columns:</div>
            <ul className="space-y-1">
              <li className="flex items-center">
                <span className="text-indigo-600 mr-1">id</span> 
                <span className="text-gray-500">(integer)</span> 
                <span className="ml-1 text-xs px-1 py-0.5 bg-blue-100 text-blue-800 rounded">PK</span>
              </li>
              <li className="flex items-center">
                <span className="text-indigo-600 mr-1">name</span> 
                <span className="text-gray-500">(varchar)</span>
              </li>
              <li className="flex items-center">
                <span className="text-indigo-600 mr-1">email</span> 
                <span className="text-gray-500">(varchar)</span>
              </li>
              <li className="flex items-center">
                <span className="text-indigo-600 mr-1">created_at</span> 
                <span className="text-gray-500">(timestamp)</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    position: { x: 400, y: 50 },
    style: { 
      background: 'white', 
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '10px',
      width: 220 
    },
  },
  {
    id: 'orders-table',
    data: { 
      label: (
        <div className="p-2">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <line x1="3" x2="21" y1="9" y2="9" />
              <line x1="3" x2="21" y1="15" y2="15" />
              <line x1="12" x2="12" y1="3" y2="21" />
            </svg>
            <span className="font-semibold">Orders Table</span>
          </div>
          <div className="text-xs text-left">
            <div className="font-medium mb-1">Columns:</div>
            <ul className="space-y-1">
              <li className="flex items-center">
                <span className="text-indigo-600 mr-1">id</span> 
                <span className="text-gray-500">(integer)</span> 
                <span className="ml-1 text-xs px-1 py-0.5 bg-blue-100 text-blue-800 rounded">PK</span>
              </li>
              <li className="flex items-center">
                <span className="text-indigo-600 mr-1">customer_id</span> 
                <span className="text-gray-500">(integer)</span>
                <span className="ml-1 text-xs px-1 py-0.5 bg-yellow-100 text-yellow-800 rounded">FK</span>
              </li>
              <li className="flex items-center">
                <span className="text-indigo-600 mr-1">amount</span> 
                <span className="text-gray-500">(decimal)</span>
              </li>
              <li className="flex items-center">
                <span className="text-indigo-600 mr-1">order_date</span> 
                <span className="text-gray-500">(date)</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    position: { x: 400, y: 300 },
    style: { 
      background: 'white', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      padding: '10px',
      width: 220 
    },
  },
  {
    id: 'db-target',
    type: 'output',
    data: { 
      label: (
        <div className="p-2">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
              <path d="M18.5 13.3 6.4 2.4a1 1 0 0 0-1.4 0l-2.9 2.9a1 1 0 0 0 0 1.4l12.4 11.1a1 1 0 0 0 1.4 0l2.9-2.9a1 1 0 0 0 0-1.6Z" />
              <path d="M2 22h20" />
              <path d="M16 8.5V15c0 1.7-1.3 3-3 3H9c-1.7 0-3-1.3-3-3V8.5" />
            </svg>
            <span className="font-semibold">Analytics Database</span>
          </div>
          <div className="text-xs text-left space-y-1">
            <div><span className="font-medium">Type:</span> snowflake</div>
            <div><span className="font-medium">Account:</span> xy12345</div>
            <div><span className="font-medium">Database:</span> analytics</div>
            <div><span className="font-medium">Schema:</span> public</div>
          </div>
        </div>
      )
    },
    position: { x: 750, y: 175 },
    style: { 
      background: 'white', 
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '10px',
      width: 220 
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'db-to-customers',
    source: 'db-source',
    target: 'customers-table',
    animated: true,
    style: { stroke: '#6366F1' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#6366F1',
    },
  },
  {
    id: 'db-to-orders',
    source: 'db-source',
    target: 'orders-table',
    animated: true,
    style: { stroke: '#6366F1' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#6366F1',
    },
  },
  {
    id: 'customers-to-orders',
    source: 'customers-table',
    target: 'orders-table',
    style: { stroke: '#10B981' },
    label: 'has many',
    labelBgPadding: [8, 4] as [number, number],
    labelBgBorderRadius: 4,
    labelBgStyle: { fill: '#ECFDF5', color: '#10B981', fillOpacity: 0.7 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#10B981',
    },
  },
  {
    id: 'customers-to-target',
    source: 'customers-table',
    target: 'db-target',
    animated: true,
    style: { stroke: '#8B5CF6' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#8B5CF6',
    },
  },
  {
    id: 'orders-to-target',
    source: 'orders-table',
    target: 'db-target',
    animated: true,
    style: { stroke: '#8B5CF6' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#8B5CF6',
    },
  },
];

// Available database tables for adding
const availableTables = [
  {
    id: 'products-table',
    name: 'Products',
    columns: [
      { name: 'id', type: 'integer', isPrimary: true },
      { name: 'name', type: 'varchar' },
      { name: 'price', type: 'decimal' },
      { name: 'created_at', type: 'timestamp' },
    ]
  },
  {
    id: 'categories-table',
    name: 'Categories',
    columns: [
      { name: 'id', type: 'integer', isPrimary: true },
      { name: 'name', type: 'varchar' },
      { name: 'description', type: 'text' },
    ]
  },
  {
    id: 'inventory-table',
    name: 'Inventory',
    columns: [
      { name: 'id', type: 'integer', isPrimary: true },
      { name: 'product_id', type: 'integer', isForeign: true },
      { name: 'quantity', type: 'integer' },
      { name: 'location', type: 'varchar' },
    ]
  },
];

const SchemaGraphView = ({ readOnly = false, onTableMappingChange }: SchemaGraphViewProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);
  const [isAddRelationshipDialogOpen, setIsAddRelationshipDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState('');
  const [relationshipSource, setRelationshipSource] = useState('');
  const [relationshipTarget, setRelationshipTarget] = useState('');
  const [relationshipType, setRelationshipType] = useState('one-to-many');
  
  useEffect(() => {
    if (onTableMappingChange) {
      onTableMappingChange(nodes, edges);
    }
  }, [nodes, edges, onTableMappingChange]);
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#8B5CF6' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#8B5CF6',
      },
    }, eds)),
    [setEdges]
  );
  
  const handleAddTable = () => {
    setIsAddTableDialogOpen(true);
  };
  
  const handleAddTableConfirm = () => {
    if (!selectedTable) {
      toast({
        title: "Table Selection Required",
        description: "Please select a table to add to the schema",
        variant: "destructive"
      });
      return;
    }
    
    const tableToAdd = availableTables.find(table => table.id === selectedTable);
    if (!tableToAdd) return;
    
    // Create a new table node
    const tableNode: any = {
      id: tableToAdd.id,
      data: { 
        label: (
          <div className="p-2">
            <div className="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <line x1="3" x2="21" y1="9" y2="9" />
                <line x1="3" x2="21" y1="15" y2="15" />
                <line x1="12" x2="12" y1="3" y2="21" />
              </svg>
              <span className="font-semibold">{tableToAdd.name} Table</span>
            </div>
            <div className="text-xs text-left">
              <div className="font-medium mb-1">Columns:</div>
              <ul className="space-y-1">
                {tableToAdd.columns.map((column, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="text-indigo-600 mr-1">{column.name}</span> 
                    <span className="text-gray-500">({column.type})</span> 
                    {column.isPrimary && <span className="ml-1 text-xs px-1 py-0.5 bg-blue-100 text-blue-800 rounded">PK</span>}
                    {column.isForeign && <span className="ml-1 text-xs px-1 py-0.5 bg-yellow-100 text-yellow-800 rounded">FK</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      },
      position: { 
        x: Math.random() * 300 + 400, 
        y: Math.random() * 300 + 100
      },
      style: { 
        background: 'white', 
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '10px',
        width: 220 
      },
    };
    
    setNodes(nodes => [...nodes, tableNode]);
    
    // Connect to source database
    setEdges(edges => [
      ...edges,
      {
        id: `db-to-${tableToAdd.id}`,
        source: 'db-source',
        target: tableToAdd.id,
        animated: true,
        style: { stroke: '#6366F1' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#6366F1',
        },
      }
    ]);
    
    setIsAddTableDialogOpen(false);
    setSelectedTable('');
    
    toast({
      title: "Table Added",
      description: `${tableToAdd.name} table has been added to the schema.`
    });
  };
  
  const handleAddRelationship = () => {
    setIsAddRelationshipDialogOpen(true);
  };
  
  const handleAddRelationshipConfirm = () => {
    if (!relationshipSource || !relationshipTarget) {
      toast({
        title: "Selection Required",
        description: "Please select both source and target tables",
        variant: "destructive"
      });
      return;
    }
    
    if (relationshipSource === relationshipTarget) {
      toast({
        title: "Invalid Selection",
        description: "Source and target tables must be different",
        variant: "destructive"
      });
      return;
    }
    
    const relationshipId = `${relationshipSource}-to-${relationshipTarget}`;
    
    // Check if this relationship already exists
    const existingEdge = edges.find(edge => 
      edge.source === relationshipSource && edge.target === relationshipTarget
    );
    
    if (existingEdge) {
      toast({
        title: "Relationship Exists",
        description: "This relationship already exists in the schema",
        variant: "destructive"
      });
      return;
    }
    
    // Create the relationship
    let labelText = '';
    let edgeStyle = { stroke: '#10B981' };
    
    switch (relationshipType) {
      case 'one-to-one':
        labelText = 'has one';
        break;
      case 'one-to-many':
        labelText = 'has many';
        break;
      case 'many-to-many':
        labelText = 'many to many';
        edgeStyle = { stroke: '#F59E0B' };
        break;
      default:
        labelText = 'relates to';
    }
    
    const newEdge: Edge = {
      id: relationshipId,
      source: relationshipSource,
      target: relationshipTarget,
      style: edgeStyle,
      label: labelText,
      labelBgPadding: [8, 4] as [number, number],
      labelBgBorderRadius: 4,
      labelBgStyle: { fill: '#ECFDF5', color: '#10B981', fillOpacity: 0.7 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edgeStyle.stroke,
      },
    };
    
    setEdges(edges => [...edges, newEdge]);
    
    setIsAddRelationshipDialogOpen(false);
    setRelationshipSource('');
    setRelationshipTarget('');
    setRelationshipType('one-to-many');
    
    toast({
      title: "Relationship Added",
      description: "The relationship has been added to the schema."
    });
  };
  
  const handleExportSchema = () => {
    try {
      const schemaData = {
        nodes: nodes,
        edges: edges,
        metadata: {
          createdAt: new Date().toISOString(),
          version: '1.0'
        }
      };
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schemaData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "schema-mapping.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast({
        title: "Schema Exported",
        description: "Schema mapping has been exported successfully as JSON."
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the schema.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSelected = () => {
    if (selectedNode) {
      // Don't allow deleting source or target databases
      if (selectedNode === 'db-source' || selectedNode === 'db-target') {
        toast({
          title: "Cannot Delete",
          description: "Source and target database nodes cannot be deleted.",
          variant: "destructive"
        });
        return;
      }
      
      // Remove the node
      setNodes(nodes => nodes.filter(node => node.id !== selectedNode));
      
      // Remove any edges connected to this node
      setEdges(edges => edges.filter(edge => 
        edge.source !== selectedNode && edge.target !== selectedNode
      ));
      
      setSelectedNode(null);
      
      toast({
        title: "Node Deleted",
        description: "The selected node and its connections have been deleted."
      });
    } else {
      toast({
        title: "No Selection",
        description: "Please select a node to delete."
      });
    }
  };

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  };

  return (
    <div className={`h-[600px] border border-gray-200 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-white`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
        className="react-flow-graph-improved"
      >
        <Controls />
        <MiniMap className="bg-white border rounded shadow-sm" />
        <Background gap={12} size={1} color="#f1f5f9" />
        
        {!readOnly && (
          <Panel position="top-right" className="bg-white p-2 rounded-lg shadow-md border border-gray-200">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleAddTable} className="bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700">
                <Plus className="h-4 w-4 mr-1" /> Add Table
              </Button>
              <Button variant="outline" onClick={handleAddRelationship} className="bg-white hover:bg-green-50 border-green-200 text-green-700">
                <Link className="h-4 w-4 mr-1" /> Add Relationship
              </Button>
              <Button variant="outline" onClick={handleDeleteSelected} disabled={!selectedNode} className="bg-white hover:bg-red-50 border-red-200 text-red-700">
                <Trash2 className="h-4 w-4 mr-1" /> Delete Selected
              </Button>
              <Button variant="outline" onClick={handleExportSchema} className="bg-white hover:bg-purple-50 border-purple-200 text-purple-700">
                <FileDown className="h-4 w-4 mr-1" /> Export
              </Button>
            </div>
          </Panel>
        )}

        <Panel position="bottom-right" className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {}}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {}}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
        </Panel>
        
        {selectedNode && (
          <Panel position="bottom-left" className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500">
              Selected: <span className="font-medium text-indigo-600">{selectedNode}</span>
            </div>
          </Panel>
        )}
      </ReactFlow>
      
      {/* Add Table Dialog */}
      <Dialog open={isAddTableDialogOpen} onOpenChange={setIsAddTableDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Table to Schema</DialogTitle>
            <DialogDescription>
              Select a table to add to your database schema.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="table">Table</Label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {availableTables.map(table => (
                    <SelectItem key={table.id} value={table.id}>
                      {table.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTableDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTableConfirm}>
              Add Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Relationship Dialog */}
      <Dialog open={isAddRelationshipDialogOpen} onOpenChange={setIsAddRelationshipDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Relationship</DialogTitle>
            <DialogDescription>
              Define a relationship between two tables.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="source">Source Table</Label>
              <Select value={relationshipSource} onValueChange={setRelationshipSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source table" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.filter(node => node.id !== 'db-source' && node.id !== 'db-target').map(node => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.id.replace('-table', '')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="relationship">Relationship Type</Label>
              <Select value={relationshipType} onValueChange={setRelationshipType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-to-one">One-to-One</SelectItem>
                  <SelectItem value="one-to-many">One-to-Many</SelectItem>
                  <SelectItem value="many-to-many">Many-to-Many</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="target">Target Table</Label>
              <Select value={relationshipTarget} onValueChange={setRelationshipTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target table" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.filter(node => node.id !== 'db-source' && node.id !== 'db-target').map(node => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.id.replace('-table', '')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRelationshipDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRelationshipConfirm}>
              Add Relationship
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchemaGraphView;
