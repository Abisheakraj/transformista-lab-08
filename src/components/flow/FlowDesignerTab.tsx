
import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Database, Filter, ArrowRight, ArrowDown, Plus, Save, Code, Settings, HardDrive, Cog, ArrowRightLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FlowNode, FlowEdge } from "@/types/flow";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Panel,
  Node,
  Edge,
  Position,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface FlowDesignerTabProps {
  projectId: string;
}

interface SchemaTable {
  name: string;
  columns: { name: string; type: string }[];
}

// Custom node types
const TableNode = ({ data }: { data: any }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="font-semibold text-base mb-2">{data.label}</div>
      {data.source && <div className="text-xs text-muted-foreground mb-2">{data.source}</div>}
      {data.columns && (
        <div className="max-h-40 overflow-auto">
          {data.columns.map((col: { name: string; type: string }) => (
            <div key={col.name} className="text-xs py-1 border-b border-gray-100 flex justify-between">
              <span>{col.name}</span>
              <span className="text-muted-foreground">{col.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TransformationNode = ({ data }: { data: any }) => {
  return (
    <div className="bg-blue-50 rounded-lg shadow-md p-4 border border-blue-100">
      <div className="font-semibold text-base mb-2">{data.label}</div>
      <div className="text-xs text-muted-foreground">{data.type} transformation</div>
      <div className="mt-2">
        <Button variant="outline" size="sm" className="w-full">
          <Settings className="h-3 w-3 mr-1" />
          Configure
        </Button>
      </div>
    </div>
  );
};

const nodeTypes = {
  table: TableNode,
  transformation: TransformationNode,
};

type NodeSelectorType = {
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const nodeSelectors: NodeSelectorType[] = [
  {
    type: "table",
    label: "Source Table",
    description: "Add a data source table",
    icon: <Database className="h-5 w-5" />,
  },
  {
    type: "filter",
    label: "Filter",
    description: "Filter data based on conditions",
    icon: <Filter className="h-5 w-5" />,
  },
  {
    type: "join",
    label: "Join",
    description: "Join multiple data sources",
    icon: <ArrowRightLeft className="h-5 w-5" />,
  },
  {
    type: "output",
    label: "Output",
    description: "Data output destination",
    icon: <HardDrive className="h-5 w-5" />,
  },
];

const NodeSelector = ({ isOpen, onClose, onAddNode }: { isOpen: boolean; onClose: () => void; onAddNode: (type: string) => void }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Node</DialogTitle>
          <DialogDescription>Select a node type to add to your flow</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {nodeSelectors.map((nodeType) => (
            <Button
              key={nodeType.type}
              variant="outline"
              className="flex flex-col items-center justify-center h-24 p-4 hover:bg-muted"
              onClick={() => onAddNode(nodeType.type)}
            >
              <div className="text-primary mb-2">{nodeType.icon}</div>
              <div className="font-medium">{nodeType.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{nodeType.description}</div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const FlowDesignerTab = ({ projectId }: FlowDesignerTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<SchemaTable | null>(null);
  const [isTransformSheetOpen, setIsTransformSheetOpen] = useState(false);
  const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // Initial nodes with proper positioning for spacious layout
  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Mock data for available sources
  const mockSources = [
    {
      id: "src1",
      name: "Sales MySQL Database",
      tables: [
        {
          name: "customers",
          columns: [
            { name: "id", type: "int" },
            { name: "name", type: "varchar" },
            { name: "email", type: "varchar" },
            { name: "created_at", type: "timestamp" },
          ],
        },
        {
          name: "orders",
          columns: [
            { name: "id", type: "int" },
            { name: "customer_id", type: "int" },
            { name: "total", type: "decimal" },
            { name: "status", type: "varchar" },
            { name: "created_at", type: "timestamp" },
          ],
        },
        {
          name: "products",
          columns: [
            { name: "id", type: "int" },
            { name: "name", type: "varchar" },
            { name: "price", type: "decimal" },
            { name: "category", type: "varchar" },
          ],
        },
      ],
    },
    {
      id: "src2",
      name: "Customer PostgreSQL Database",
      tables: [
        {
          name: "users",
          columns: [
            { name: "id", type: "serial" },
            { name: "username", type: "varchar" },
            { name: "email", type: "varchar" },
            { name: "active", type: "boolean" },
          ],
        },
        {
          name: "profiles",
          columns: [
            { name: "id", type: "serial" },
            { name: "user_id", type: "int" },
            { name: "full_name", type: "varchar" },
            { name: "address", type: "varchar" },
            { name: "phone", type: "varchar" },
          ],
        },
      ],
    },
  ];

  const filteredDatabases = searchQuery 
    ? mockSources.filter(db => db.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : mockSources;

  const filteredTables = selectedDatabase && searchQuery
    ? mockSources
        .find(db => db.id === selectedDatabase)
        ?.tables.filter(table => table.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : selectedDatabase
    ? mockSources.find(db => db.id === selectedDatabase)?.tables
    : [];

  const onConnect = useCallback((params: Connection) => {
    const newEdge: Edge = {
      ...params,
      id: `edge-${params.source}-${params.target}`,
      animated: true,
      style: { stroke: '#555' },
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);

  const addNodeToFlow = (table: SchemaTable) => {
    const xPos = nodes.length * 300 + 50;
    const newNode: Node = {
      id: `table-${Date.now()}`,
      type: 'table',
      position: { x: xPos, y: 100 },
      data: {
        label: table.name,
        source: selectedDatabase ? mockSources.find(db => db.id === selectedDatabase)?.name : "",
        columns: table.columns,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
    
    setNodes((nds) => [...nds, newNode]);
    setSelectedTable(null);
  };

  const addTransformationNode = (type: string, sourceNodeId: string) => {
    const sourceNode = nodes.find(node => node.id === sourceNodeId);
    if (!sourceNode) return;
    
    const newNode: Node = {
      id: `transformation-${Date.now()}`,
      type: 'transformation',
      position: { x: sourceNode.position.x + 300, y: sourceNode.position.y },
      data: {
        label: `${type} Transformation`,
        type,
        sourceNodeId,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
    
    const newEdge: Edge = {
      id: `edge-${sourceNodeId}-${newNode.id}`,
      source: sourceNodeId,
      target: newNode.id,
      animated: true,
    };
    
    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
    setIsTransformSheetOpen(false);
  };

  const onAddGenericNode = (nodeType: string) => {
    const nodeCount = nodes.filter(n => n.type === nodeType).length;
    let label = "";
    let type = "";
    
    switch (nodeType) {
      case "filter":
        label = "Filter Transformation";
        type = "filter";
        break;
      case "join":
        label = "Join Transformation";
        type = "join";
        break;
      case "output":
        label = "Output Destination";
        type = "output";
        break;
      default:
        label = "New Node";
        type = nodeType;
    }
    
    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType === "output" ? "table" : "transformation",
      position: { 
        x: Math.random() * 300 + 200, 
        y: Math.random() * 200 + 100 
      },
      data: {
        label: `${label} ${nodeCount + 1}`,
        type: type,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
    
    setNodes((nds) => [...nds, newNode]);
    setIsNodeSelectorOpen(false);
  };

  const onSaveFlow = () => {
    console.log("Saving flow:", { nodes, edges });
    // Here you would normally send the flow data to your backend
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Left sidebar */}
      <div className="md:col-span-1">
        <div className="rounded-lg border h-[600px] flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Data Sources</h3>
            </div>
            <Input
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4">
              {!selectedDatabase ? (
                <div className="space-y-4">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Select Database
                  </Label>
                  {filteredDatabases.map((database) => (
                    <div
                      key={database.id}
                      className="group p-3 rounded-md hover:bg-gray-100 cursor-pointer"
                      onClick={() => setSelectedDatabase(database.id)}
                    >
                      <div className="font-medium group-hover:text-primary">{database.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {database.tables.length} tables available
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Tables
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedDatabase(null);
                        setSelectedTable(null);
                      }}
                    >
                      Back
                    </Button>
                  </div>
                  
                  {filteredTables?.map((table) => (
                    <div
                      key={table.name}
                      className={`group p-3 rounded-md hover:bg-gray-100 cursor-pointer ${
                        selectedTable?.name === table.name ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => setSelectedTable(table)}
                    >
                      <div className="font-medium group-hover:text-primary">{table.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {table.columns.length} columns
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
          
          {selectedTable && (
            <div className="p-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{selectedTable.name}</h4>
                <Button size="sm" onClick={() => addNodeToFlow(selectedTable)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add to Flow
                </Button>
              </div>
              <ScrollArea className="h-40">
                <div className="space-y-1">
                  {selectedTable.columns.map((column) => (
                    <div key={column.name} className="text-sm grid grid-cols-2 py-1 border-b border-gray-100">
                      <div>{column.name}</div>
                      <div className="text-muted-foreground text-xs text-right">{column.type}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
      
      {/* Main flow design area */}
      <div className="md:col-span-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Flow Designer</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsNodeSelectorOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Node
            </Button>
            <Button variant="outline" size="sm" onClick={onSaveFlow}>
              <Save className="h-4 w-4 mr-1" />
              Save Flow
            </Button>
            <Button size="sm">
              Preview
            </Button>
          </div>
        </div>
        
        <div ref={reactFlowWrapper} className="h-[600px] border rounded-lg overflow-hidden bg-gray-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.5}
            maxZoom={1.5}
            defaultEdgeOptions={{
              animated: true,
              style: { strokeWidth: 2 }
            }}
          >
            <Background variant="dots" gap={12} size={1} />
            <Controls />
            <MiniMap 
              nodeStrokeColor={(n) => {
                return n.type === 'table' ? '#0041d0' : '#ff0072';
              }}
              nodeColor={(n) => {
                return n.type === 'table' ? '#e6f2ff' : '#ffe6f2';
              }}
            />
          </ReactFlow>
        </div>

        <NodeSelector 
          isOpen={isNodeSelectorOpen}
          onClose={() => setIsNodeSelectorOpen(false)}
          onAddNode={onAddGenericNode}
        />

        <div className="mt-4 text-sm text-muted-foreground">
          <p>The backend developer working on Apache NiFi can use the flow definition generated here to create the actual NiFi processors and connections.</p>
        </div>
      </div>
    </div>
  );
};

export default FlowDesignerTab;
