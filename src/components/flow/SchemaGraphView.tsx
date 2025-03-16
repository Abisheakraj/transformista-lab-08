
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
  Node,
  Handle,
  Position,
  MarkerType,
  ConnectionLineType,
  ConnectionMode,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Download, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FlowNode, FlowEdge } from "@/types/flow";

interface TableColumn {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
}

interface DbTable {
  id: string;
  name: string;
  schema: string;
  columns: TableColumn[];
}

interface SchemaGraphViewProps {
  schemas?: any[];
  onCreatePipeline?: (nodes: Node[], edges: Edge[]) => void;
  onTableMappingChange?: (nodes: Node[], edges: Edge[]) => void;
}

const TableNode = ({ data }: { data: any }) => {
  return (
    <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm w-[220px]">
      <div className="font-bold border-b pb-2 text-indigo-700">{data.label}</div>
      <div className="mt-2 text-sm">
        {data.columns?.map((col: TableColumn, index: number) => (
          <div key={index} className="flex items-center py-1 border-b border-gray-100">
            <span className={`${col.isPrimaryKey ? 'font-semibold text-blue-600' : ''} ${col.isForeignKey ? 'text-indigo-600' : ''}`}>
              {col.name}
            </span>
            <span className="ml-auto text-xs text-gray-500">{col.type}</span>
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Right} id="right" className="w-3 h-3 bg-indigo-500" />
      <Handle type="target" position={Position.Left} id="left" className="w-3 h-3 bg-indigo-500" />
    </div>
  );
};

const SchemaGraphView = ({ schemas = [], onCreatePipeline, onTableMappingChange }: SchemaGraphViewProps) => {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [nodeTypes] = useState({ tableNode: TableNode });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Only initialize once or when schemas change
    if (!initialized || schemas.length > 0) {
      initializeGraph();
      setInitialized(true);
    }
  }, [schemas, initialized]);

  const initializeGraph = () => {
    if (!schemas || schemas.length === 0) {
      const mockTableData: DbTable[] = [
        {
          id: "customers",
          name: "Customers",
          schema: "public",
          columns: [
            { name: "id", type: "integer", isPrimaryKey: true },
            { name: "name", type: "varchar" },
            { name: "email", type: "varchar" },
            { name: "created_at", type: "timestamp" }
          ]
        },
        {
          id: "orders",
          name: "Orders",
          schema: "public",
          columns: [
            { name: "id", type: "integer", isPrimaryKey: true },
            { name: "customer_id", type: "integer", isForeignKey: true },
            { name: "total", type: "decimal" },
            { name: "status", type: "varchar" },
            { name: "created_at", type: "timestamp" }
          ]
        },
        {
          id: "products",
          name: "Products",
          schema: "public",
          columns: [
            { name: "id", type: "integer", isPrimaryKey: true },
            { name: "name", type: "varchar" },
            { name: "price", type: "decimal" },
            { name: "category", type: "varchar" }
          ]
        },
        {
          id: "order_items",
          name: "Order Items",
          schema: "public",
          columns: [
            { name: "id", type: "integer", isPrimaryKey: true },
            { name: "order_id", type: "integer", isForeignKey: true },
            { name: "product_id", type: "integer", isForeignKey: true },
            { name: "quantity", type: "integer" },
            { name: "price", type: "decimal" }
          ]
        }
      ];

      const mockNodes: Node[] = mockTableData.map((table, index) => ({
        id: table.id,
        type: "tableNode",
        data: {
          label: table.name,
          columns: table.columns,
          schema: table.schema
        },
        position: { 
          x: (index % 2) * 350 + 100, 
          y: Math.floor(index / 2) * 250 + 100 
        },
      }));

      const mockEdges: Edge[] = [
        {
          id: "e-customers-orders",
          source: "customers",
          target: "orders",
          sourceHandle: "right",
          targetHandle: "left",
          animated: true,
          label: "1:N",
          style: { stroke: "#9b87f5", strokeWidth: 2 },
          labelStyle: { fill: "#6E59A5", fontWeight: 500 },
          labelBgStyle: { fill: "#F7F9FB" },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: "#9b87f5",
          },
        },
        {
          id: "e-orders-order_items",
          source: "orders",
          target: "order_items",
          sourceHandle: "right",
          targetHandle: "left",
          animated: true,
          label: "1:N",
          style: { stroke: "#9b87f5", strokeWidth: 2 },
          labelStyle: { fill: "#6E59A5", fontWeight: 500 },
          labelBgStyle: { fill: "#F7F9FB" },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: "#9b87f5",
          },
        },
        {
          id: "e-products-order_items",
          source: "products",
          target: "order_items",
          sourceHandle: "right",
          targetHandle: "left",
          animated: true,
          label: "1:N",
          style: { stroke: "#9b87f5", strokeWidth: 2 },
          labelStyle: { fill: "#6E59A5", fontWeight: 500 },
          labelBgStyle: { fill: "#F7F9FB" },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: "#9b87f5",
          },
        },
      ];

      setNodes(mockNodes);
      setEdges(mockEdges);
      setSelectedTables(mockTableData.map(table => table.id));
    } else {
      // Generate graph from actual schema data
      const schemaNodes: Node[] = [];
      const schemaEdges: Edge[] = [];
      let yOffset = 0;

      schemas.forEach((schema) => {
        if (schema.tables) {
          schema.tables.forEach((table: any, tableIndex: number) => {
            const nodeId = `${schema.name}-${table.name}`;
            const xPos = (tableIndex % 2) * 300 + 100;
            const yPos = Math.floor(tableIndex / 2) * 200 + 100 + yOffset;

            schemaNodes.push({
              id: nodeId,
              type: "tableNode",
              data: {
                label: table.name,
                schema: schema.name,
                columns: table.columns.map((col: any) => ({
                  name: col.name,
                  type: col.type,
                  isPrimaryKey: table.primaryKey?.includes(col.name),
                  isForeignKey: table.foreignKeys?.some((fk: any) => fk.columns.includes(col.name))
                })),
              },
              position: { x: xPos, y: yPos },
            });
          });
          yOffset += schema.tables.length * 100;
        }
      });

      // Add edges based on foreign keys
      schemas.forEach((schema) => {
        if (schema.tables) {
          schema.tables.forEach((table: any) => {
            const sourceNodeId = `${schema.name}-${table.name}`;
            
            if (table.foreignKeys) {
              table.foreignKeys.forEach((fk: any, fkIndex: number) => {
                let targetSchema = schema.name; // Default to same schema
                let targetNodeId = `${targetSchema}-${fk.referencedTable}`;
                
                schemaEdges.push({
                  id: `e-${sourceNodeId}-${targetNodeId}-${fkIndex}`,
                  source: sourceNodeId,
                  target: targetNodeId,
                  animated: true,
                  label: `${fk.columns.join(',')} -> ${fk.referencedColumns.join(',')}`,
                  style: { stroke: "#9b87f5", strokeWidth: 2 },
                  labelStyle: { fill: "#6E59A5", fontWeight: 500 },
                  labelBgStyle: { fill: "#F7F9FB" },
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20,
                    color: "#9b87f5",
                  },
                });
              });
            }
          });
        }
      });

      setNodes(schemaNodes);
      setEdges(schemaEdges);
      setSelectedTables(schemaNodes.map(node => node.id));
    }
  };

  const onConnect = useCallback((params: Connection) => {
    const newEdge = {
      ...params,
      id: `e-${params.source}-${params.target}`,
      animated: true,
      style: { stroke: "#9b87f5", strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: "#9b87f5",
      },
      label: "1:N",
      labelStyle: { fill: "#6E59A5", fontWeight: 500 },
      labelBgStyle: { fill: "#F7F9FB" },
    };
    setEdges((eds) => addEdge(newEdge, eds));
    
    toast({
      title: "Relationship Added",
      description: "A new relationship has been created between the tables."
    });
    
    if (onTableMappingChange) {
      const updatedEdges = [...edges, newEdge as Edge];
      onTableMappingChange(nodes, updatedEdges);
    }
  }, [nodes, edges, setEdges, onTableMappingChange, toast]);

  const handleAddTable = () => {
    const newId = `table-${nodes.length + 1}`;
    const newNode: Node = {
      id: newId,
      type: "tableNode",
      data: { 
        label: `New Table ${nodes.length + 1}`,
        columns: [
          { name: "id", type: "integer", isPrimaryKey: true },
          { name: "name", type: "varchar" },
          { name: "created_at", type: "timestamp" }
        ]
      },
      position: { x: Math.random() * 400 + 50, y: Math.random() * 400 + 50 },
    };
    
    setNodes((nds) => [...nds, newNode]);
    setSelectedTables((prev) => [...prev, newId]);
    
    toast({
      title: "Table Added",
      description: "New table has been added to the schema graph."
    });
  };

  const handleCreatePipeline = () => {
    if (onCreatePipeline) {
      onCreatePipeline(nodes, edges);
      
      toast({
        title: "Pipeline Created",
        description: "Pipeline has been created from the selected schema elements."
      });
    }
  };

  const handleExportSchema = () => {
    const schemaData = {
      nodes,
      edges,
      selectedTables,
    };
    
    const dataStr = JSON.stringify(schemaData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", "schema-graph.json");
    linkElement.click();
    
    toast({
      title: "Schema Exported",
      description: "Schema graph has been exported to a JSON file."
    });
  };

  const handleDeleteSelected = useCallback(() => {
    const selectedNodeIds = nodes.filter(node => node.selected).map(node => node.id);
    const selectedEdgeIds = edges.filter(edge => edge.selected).map(edge => edge.id);
    
    if (selectedNodeIds.length === 0 && selectedEdgeIds.length === 0) {
      toast({
        title: "Nothing Selected",
        description: "Please select nodes or edges to delete.",
        variant: "destructive"
      });
      return;
    }
    
    setNodes(nodes => nodes.filter(node => !selectedNodeIds.includes(node.id)));
    setEdges(edges => edges.filter(edge => !selectedEdgeIds.includes(edge.id)));
    
    toast({
      title: "Items Deleted",
      description: `Deleted ${selectedNodeIds.length} tables and ${selectedEdgeIds.length} relationships.`
    });
  }, [nodes, edges, setNodes, setEdges, toast]);

  return (
    <div className="w-full h-full" style={{ height: "500px" }}>
      <div className="flex items-center justify-end mb-4 gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleAddTable}>
          <Plus className="h-4 w-4" />
          Add Table
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleDeleteSelected}>
          <Trash2 className="h-4 w-4" />
          Delete Selected
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleExportSchema}>
          <Download className="h-4 w-4" />
          Export Schema
        </Button>
        <Button variant="default" size="sm" onClick={handleCreatePipeline} className="bg-indigo-600 hover:bg-indigo-700">
          Create Pipeline
        </Button>
      </div>
      <div style={{ height: "calc(100% - 40px)", width: "100%" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          connectionLineType={ConnectionLineType.SmoothStep}
          connectionLineStyle={{ stroke: '#9b87f5', strokeWidth: 2 }}
          fitView
          attributionPosition="top-right"
          style={{ background: "#F7F9FB" }}
        >
          <Controls />
          <MiniMap nodeColor={(n) => {
            return n.type === 'tableNode' ? '#e5deff' : '#f1f5f9';
          }} />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e7eb" />
        </ReactFlow>
      </div>
    </div>
  );
};

export default SchemaGraphView;
