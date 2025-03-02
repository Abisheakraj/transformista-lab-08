
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, Database, Filter, ArrowRight, ArrowDown, Plus, Save, Code, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FlowNode, FlowEdge } from "@/types/flow";

interface FlowDesignerTabProps {
  projectId: string;
}

interface SchemaTable {
  name: string;
  columns: { name: string; type: string }[];
}

const FlowDesignerTab = ({ projectId }: FlowDesignerTabProps) => {
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<SchemaTable | null>(null);
  const [isTransformSheetOpen, setIsTransformSheetOpen] = useState(false);
  
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

  const addNodeToFlow = (table: SchemaTable) => {
    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type: "table",
      position: { x: nodes.length * 250 + 50, y: 100 },
      data: {
        label: table.name,
        source: selectedDatabase ? mockSources.find(db => db.id === selectedDatabase)?.name : "",
        columns: table.columns,
      },
    };
    
    setNodes([...nodes, newNode]);
    setSelectedTable(null);
  };

  const addTransformationNode = (type: string, sourceNodeId: string) => {
    const sourceNode = nodes.find(node => node.id === sourceNodeId);
    if (!sourceNode) return;
    
    const newNode: FlowNode = {
      id: `transformation-${Date.now()}`,
      type: "transformation",
      position: { x: sourceNode.position.x, y: sourceNode.position.y + 200 },
      data: {
        label: `${type} Transformation`,
        type,
        sourceNodeId,
      },
    };
    
    const newEdge: FlowEdge = {
      id: `edge-${sourceNodeId}-${newNode.id}`,
      source: sourceNodeId,
      target: newNode.id,
    };
    
    setNodes([...nodes, newNode]);
    setEdges([...edges, newEdge]);
    setIsTransformSheetOpen(false);
  };

  // This would be replaced with a proper flow visualization library like React Flow
  const visualizeFlow = () => {
    if (nodes.length === 0) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Your flow is empty. Start by selecting source tables from the left panel.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative bg-gray-50 rounded-lg border h-[600px] p-4 overflow-auto">
        {nodes.map(node => (
          <div
            key={node.id}
            className={`absolute p-4 rounded-lg shadow-md w-56 ${
              node.type === 'table' ? 'bg-white' : 'bg-blue-50'
            }`}
            style={{ left: node.position.x, top: node.position.y }}
          >
            <div className="font-semibold mb-2">{node.data.label}</div>
            {node.type === 'table' && (
              <>
                <div className="text-xs text-muted-foreground mb-2">{node.data.source}</div>
                <div className="max-h-32 overflow-auto">
                  {node.data.columns?.map(col => (
                    <div key={col.name} className="text-xs py-1 border-b border-gray-100 flex justify-between">
                      <span>{col.name}</span>
                      <span className="text-muted-foreground">{col.type}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <Sheet open={isTransformSheetOpen} onOpenChange={setIsTransformSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Transform
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Add Transformation</SheetTitle>
                        <SheetDescription>
                          Select a transformation to apply to the data from {node.data.label}.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="grid gap-4 py-4">
                        <Button 
                          variant="outline" 
                          className="justify-start" 
                          onClick={() => addTransformationNode("filter", node.id)}
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          Filter Records
                        </Button>
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => addTransformationNode("aggregate", node.id)}
                        >
                          <ArrowDown className="h-4 w-4 mr-2" />
                          Aggregate Data
                        </Button>
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => addTransformationNode("join", node.id)}
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Join Tables
                        </Button>
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => addTransformationNode("custom", node.id)}
                        >
                          <Code className="h-4 w-4 mr-2" />
                          Custom SQL
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            )}
            {node.type === 'transformation' && (
              <div className="flex justify-end mt-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-3 w-3 mr-1" />
                  Configure
                </Button>
              </div>
            )}
          </div>
        ))}
        
        {/* Simple representation of edges - in a real app, use a proper flow library */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {edges.map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            
            if (!sourceNode || !targetNode) return null;
            
            const sourceX = sourceNode.position.x + 112; // Center of node width (224/2)
            const sourceY = sourceNode.position.y + 80; // Bottom of source node
            const targetX = targetNode.position.x + 112;
            const targetY = targetNode.position.y;
            
            return (
              <g key={edge.id}>
                <path
                  d={`M${sourceX},${sourceY} C${sourceX},${sourceY + 50} ${targetX},${targetY - 50} ${targetX},${targetY}`}
                  fill="none"
                  stroke="#888"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
                  </marker>
                </defs>
              </g>
            );
          })}
        </svg>
      </div>
    );
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
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-1" />
              Save Flow
            </Button>
            <Button size="sm">
              Preview
            </Button>
          </div>
        </div>
        
        {visualizeFlow()}

        <div className="mt-4 text-sm text-muted-foreground">
          <p>This is a simplified flow visualization. In a production app, we would integrate with a proper flow visualization library like React Flow.</p>
          <p>The backend developer working on Apache NiFi can use the flow definition generated here to create the actual NiFi processors and connections.</p>
        </div>
      </div>
    </div>
  );
};

export default FlowDesignerTab;
