
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileDown, ZoomIn, ZoomOut, Database, Table, FilePlus, Trash2, Link2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { exportSchemaMapping } from '@/lib/database-client';

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

// Fixed the Edge typing issues by ensuring labelBgPadding is a tuple [number, number]
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
    labelBgPadding: [8, 4] as [number, number], // Fixed: Now it's a tuple with 2 elements
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

interface SchemaGraphViewProps {
  editable?: boolean;
  pipelineData?: {
    sourceData?: any;
    targetData?: any;
    fileData?: any;
  };
  onSchemaChange?: (nodes: Node[], edges: Edge[]) => void;
  showSourceTarget?: boolean;
  height?: string;
}

const SchemaGraphView = ({ 
  editable = false, 
  pipelineData, 
  onSchemaChange, 
  showSourceTarget = true,
  height = '600px'
}: SchemaGraphViewProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);
  const [isAddRelationshipDialogOpen, setIsAddRelationshipDialogOpen] = useState(false);
  const [relationshipSource, setRelationshipSource] = useState("");
  const [relationshipTarget, setRelationshipTarget] = useState("");
  const [relationshipType, setRelationshipType] = useState("one-to-many");
  const [newTableData, setNewTableData] = useState({
    name: "",
    columns: [{ name: "id", type: "integer", isPK: true, isFK: false, reference: "" }]
  });

  // Update parent component when schema changes
  useEffect(() => {
    if (onSchemaChange) {
      onSchemaChange(nodes, edges);
    }
  }, [nodes, edges, onSchemaChange]);
  
  // Process pipelineData if it's provided
  useEffect(() => {
    if (pipelineData) {
      if (pipelineData.sourceData || pipelineData.targetData) {
        // Here we would process the source/target data to update the schema
        console.log("Processing pipeline data:", pipelineData);
      }
    }
  }, [pipelineData]);
  
  const onConnect = useCallback(
    (params: Connection) => {
      setIsAddRelationshipDialogOpen(true);
      setRelationshipSource(params.source || "");
      setRelationshipTarget(params.target || "");
    },
    []
  );
  
  const handleAddTable = () => {
    setIsAddTableDialogOpen(true);
  };
  
  const handleExportSchema = () => {
    const schemaData = exportSchemaMapping(nodes, edges);
    
    // Create a download link for the schema
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(schemaData);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "schema-mapping.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: "Schema Exported",
      description: "Schema mapping has been exported successfully."
    });
  };

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  };

  const handleAddRelationship = () => {
    const newEdge: Edge = {
      id: `${relationshipSource}-to-${relationshipTarget}`,
      source: relationshipSource,
      target: relationshipTarget,
      style: { stroke: '#10B981' },
      animated: relationshipType === "reference" ? true : false,
      label: relationshipType === "one-to-one" ? "1:1" : 
             relationshipType === "one-to-many" ? "1:N" :
             relationshipType === "many-to-many" ? "N:N" : "ref",
      labelBgPadding: [8, 4] as [number, number],
      labelBgBorderRadius: 4,
      labelBgStyle: { fill: '#ECFDF5', color: '#10B981', fillOpacity: 0.7 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#10B981',
      },
    };
    
    setEdges((eds) => [...eds, newEdge]);
    setIsAddRelationshipDialogOpen(false);
    setRelationshipSource("");
    setRelationshipTarget("");
    setRelationshipType("one-to-many");
    
    toast({
      title: "Relationship Added",
      description: "New table relationship has been created."
    });
  };

  const handleDeleteNode = () => {
    if (selectedNode) {
      setNodes((nodes) => nodes.filter((node) => node.id !== selectedNode));
      setEdges((edges) => edges.filter((edge) => 
        edge.source !== selectedNode && edge.target !== selectedNode));
      setSelectedNode(null);
      
      toast({
        title: "Table Deleted",
        description: "The table and its relationships have been removed."
      });
    }
  };

  const addNewColumn = () => {
    setNewTableData({
      ...newTableData,
      columns: [
        ...newTableData.columns, 
        { name: "", type: "varchar", isPK: false, isFK: false, reference: "" }
      ]
    });
  };

  const handleColumnChange = (index: number, field: string, value: string | boolean) => {
    const updatedColumns = [...newTableData.columns];
    updatedColumns[index] = { 
      ...updatedColumns[index], 
      [field]: value 
    };
    
    setNewTableData({
      ...newTableData,
      columns: updatedColumns
    });
  };

  const handleAddNewTable = () => {
    if (!newTableData.name) {
      toast({
        title: "Table Name Required",
        description: "Please provide a name for the table.",
        variant: "destructive"
      });
      return;
    }
    
    // Create new node for the table
    const newNodeId = `table-${Date.now()}`;
    const columnsJSX = (
      <ul className="space-y-1">
        {newTableData.columns.map((col, idx) => (
          <li key={idx} className="flex items-center">
            <span className="text-indigo-600 mr-1">{col.name}</span> 
            <span className="text-gray-500">({col.type})</span>
            {col.isPK && 
              <span className="ml-1 text-xs px-1 py-0.5 bg-blue-100 text-blue-800 rounded">PK</span>
            }
            {col.isFK && 
              <span className="ml-1 text-xs px-1 py-0.5 bg-yellow-100 text-yellow-800 rounded">FK</span>
            }
          </li>
        ))}
      </ul>
    );
    
    const newNode = {
      id: newNodeId,
      data: { 
        label: (
          <div className="p-2">
            <div className="flex items-center gap-2 mb-2">
              <Table className="w-5 h-5 text-green-500" />
              <span className="font-semibold">{newTableData.name}</span>
            </div>
            <div className="text-xs text-left">
              <div className="font-medium mb-1">Columns:</div>
              {columnsJSX}
            </div>
          </div>
        )
      },
      position: { 
        x: Math.random() * 400 + 200, 
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
    
    setNodes((nodes) => [...nodes, newNode]);
    
    // Create edges for foreign key relationships
    const newEdges: Edge[] = [];
    newTableData.columns.forEach((col) => {
      if (col.isFK && col.reference) {
        newEdges.push({
          id: `${newNodeId}-to-${col.reference}`,
          source: newNodeId,
          target: col.reference,
          style: { stroke: '#10B981' },
          label: 'references',
          labelBgPadding: [8, 4] as [number, number],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: '#ECFDF5', color: '#10B981', fillOpacity: 0.7 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#10B981',
          },
        });
      }
    });
    
    if (newEdges.length > 0) {
      setEdges((edges) => [...edges, ...newEdges]);
    }
    
    // Reset form and close dialog
    setNewTableData({
      name: "",
      columns: [{ name: "id", type: "integer", isPK: true, isFK: false, reference: "" }]
    });
    setIsAddTableDialogOpen(false);
    
    toast({
      title: "Table Added",
      description: `The ${newTableData.name} table has been added to the schema.`
    });
  };

  // Filter nodes if showSourceTarget is false
  const displayNodes = showSourceTarget 
    ? nodes 
    : nodes.filter(node => !['db-source', 'db-target'].includes(node.id));

  // Filter edges if showSourceTarget is false
  const displayEdges = showSourceTarget 
    ? edges 
    : edges.filter(edge => 
        !['db-source', 'db-target'].includes(edge.source) && 
        !['db-source', 'db-target'].includes(edge.target));

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden`} style={{ height }}>
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={editable ? onConnect : undefined}
        onNodeClick={onNodeClick}
        connectionLineStyle={{ stroke: '#10B981' }}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
        {editable && (
          <Panel position="top-right" className="bg-white p-2 rounded shadow-md border border-gray-200">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleAddTable}>
                <Plus className="h-4 w-4 mr-1" /> Add Table
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportSchema}>
                <FileDown className="h-4 w-4 mr-1" /> Export
              </Button>
              {selectedNode && (
                <Button size="sm" variant="outline" onClick={handleDeleteNode} className="text-red-500">
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              )}
            </div>
          </Panel>
        )}
      </ReactFlow>

      {/* Add Table Dialog */}
      <Dialog open={isAddTableDialogOpen} onOpenChange={setIsAddTableDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
            <DialogDescription>
              Define the structure of your new database table.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tableName">Table Name</Label>
              <Input
                id="tableName"
                placeholder="e.g., products"
                value={newTableData.name}
                onChange={(e) => setNewTableData({...newTableData, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-4">
              <Label>Columns</Label>
              {newTableData.columns.map((column, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <Input
                      placeholder="Column name"
                      value={column.name}
                      onChange={(e) => handleColumnChange(idx, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Select
                      value={column.type}
                      onValueChange={(value) => handleColumnChange(idx, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="integer">Integer</SelectItem>
                        <SelectItem value="varchar">Varchar</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="timestamp">Timestamp</SelectItem>
                        <SelectItem value="decimal">Decimal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-5 flex items-center space-x-2">
                    <label className="text-xs flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={column.isPK}
                        onChange={(e) => handleColumnChange(idx, 'isPK', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span>PK</span>
                    </label>
                    <label className="text-xs flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={column.isFK}
                        onChange={(e) => handleColumnChange(idx, 'isFK', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span>FK</span>
                    </label>
                    {column.isFK && (
                      <Select
                        value={column.reference}
                        onValueChange={(value) => handleColumnChange(idx, 'reference', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="References" />
                        </SelectTrigger>
                        <SelectContent>
                          {nodes.map((node) => (
                            <SelectItem key={node.id} value={node.id}>
                              {node.id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addNewColumn}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Column
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTableDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleAddNewTable}>
              Add Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Relationship Dialog */}
      <Dialog open={isAddRelationshipDialogOpen} onOpenChange={setIsAddRelationshipDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Add Table Relationship</DialogTitle>
            <DialogDescription>
              Define the relationship between these two tables.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-center items-center gap-4">
              <div className="border p-2 rounded text-center">
                <div className="font-semibold">{relationshipSource}</div>
                <div className="text-xs text-gray-500">Source</div>
              </div>
              <Link2 className="text-gray-400" />
              <div className="border p-2 rounded text-center">
                <div className="font-semibold">{relationshipTarget}</div>
                <div className="text-xs text-gray-500">Target</div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="relationshipType">Relationship Type</Label>
              <Select
                value={relationshipType}
                onValueChange={setRelationshipType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-to-one">One to One (1:1)</SelectItem>
                  <SelectItem value="one-to-many">One to Many (1:N)</SelectItem>
                  <SelectItem value="many-to-many">Many to Many (N:N)</SelectItem>
                  <SelectItem value="reference">Reference</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRelationshipDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRelationship}>
              Add Relationship
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchemaGraphView;
