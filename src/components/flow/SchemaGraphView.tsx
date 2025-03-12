
import { useEffect, useState } from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Download, Plus, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SchemaGraphViewProps {
  schemas?: any[];
  onCreatePipeline?: (nodes: Node[], edges: Edge[]) => void;
}

const SchemaGraphView = ({ schemas = [], onCreatePipeline }: SchemaGraphViewProps) => {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  useEffect(() => {
    initializeGraph();
  }, [schemas]);

  const initializeGraph = () => {
    if (!schemas || schemas.length === 0) {
      // Create some mock data for visualization if no schemas provided
      const mockNodes: Node[] = [
        {
          id: "customers",
          type: "default",
          data: {
            label: "Customers",
            columns: ["id", "name", "email", "created_at"],
            primaryKey: ["id"]
          },
          position: { x: 100, y: 100 },
          style: {
            width: 180,
            padding: 10,
            background: "#f0f9ff",
            borderColor: "#93c5fd",
            borderWidth: 2,
          },
        },
        {
          id: "orders",
          type: "default",
          data: {
            label: "Orders",
            columns: ["id", "customer_id", "total", "status", "created_at"],
            primaryKey: ["id"],
            foreignKeys: [{ columns: ["customer_id"], referencedTable: "customers", referencedColumns: ["id"] }]
          },
          position: { x: 400, y: 100 },
          style: {
            width: 180,
            padding: 10,
            background: "#f0f9ff",
            borderColor: "#93c5fd",
            borderWidth: 2,
          },
        },
        {
          id: "products",
          type: "default",
          data: {
            label: "Products",
            columns: ["id", "name", "price", "category"],
            primaryKey: ["id"]
          },
          position: { x: 100, y: 300 },
          style: {
            width: 180,
            padding: 10,
            background: "#f0f9ff",
            borderColor: "#93c5fd",
            borderWidth: 2,
          },
        },
        {
          id: "order_items",
          type: "default",
          data: {
            label: "Order Items",
            columns: ["id", "order_id", "product_id", "quantity", "price"],
            primaryKey: ["id"],
            foreignKeys: [
              { columns: ["order_id"], referencedTable: "orders", referencedColumns: ["id"] },
              { columns: ["product_id"], referencedTable: "products", referencedColumns: ["id"] }
            ]
          },
          position: { x: 400, y: 300 },
          style: {
            width: 180,
            padding: 10,
            background: "#f0f9ff", 
            borderColor: "#93c5fd",
            borderWidth: 2,
          },
        },
      ];

      const mockEdges: Edge[] = [
        {
          id: "e-customers-orders",
          source: "customers",
          target: "orders",
          animated: true,
          label: "1:N",
          style: { stroke: "#93c5fd" },
        },
        {
          id: "e-orders-order_items",
          source: "orders",
          target: "order_items",
          animated: true,
          label: "1:N",
          style: { stroke: "#93c5fd" },
        },
        {
          id: "e-products-order_items",
          source: "products",
          target: "order_items",
          animated: true,
          label: "1:N",
          style: { stroke: "#93c5fd" },
        },
      ];

      setNodes(mockNodes);
      setEdges(mockEdges);
      setSelectedTables(mockNodes.map(node => node.id));
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
              type: "default",
              data: {
                label: table.name,
                schema: schema.name,
                columns: table.columns.map((col: any) => col.name),
                primaryKey: table.primaryKey,
                foreignKeys: table.foreignKeys
              },
              position: { x: xPos, y: yPos },
              style: {
                width: 180,
                padding: 10,
                background: "#f0f9ff",
                borderColor: "#93c5fd",
                borderWidth: 2,
              },
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
                // Find the target schema
                let targetSchema = schema.name; // Default to same schema
                let targetNodeId = `${targetSchema}-${fk.referencedTable}`;
                
                // Create edge
                schemaEdges.push({
                  id: `e-${sourceNodeId}-${targetNodeId}-${fkIndex}`,
                  source: sourceNodeId,
                  target: targetNodeId,
                  animated: true,
                  label: `${fk.columns.join(',')} -> ${fk.referencedColumns.join(',')}`,
                  style: { stroke: "#93c5fd" },
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

  const onConnect = (params: Connection) => setEdges((eds) => addEdge(params, eds));

  const handleAddTable = () => {
    const newId = `table-${nodes.length + 1}`;
    const newNode: Node = {
      id: newId,
      type: "default",
      data: { label: `New Table ${nodes.length + 1}` },
      position: { x: Math.random() * 400 + 50, y: Math.random() * 400 + 50 },
      style: {
        width: 180,
        padding: 10,
        background: "#f0f9ff",
        borderColor: "#93c5fd",
        borderWidth: 2,
      },
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

  return (
    <div className="w-full h-full" style={{ height: "500px" }}>
      <div className="flex items-center justify-end mb-4 gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleAddTable}>
          <Plus className="h-4 w-4" />
          Add Table
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Link2 className="h-4 w-4" />
          Add Relationship
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleExportSchema}>
          <Download className="h-4 w-4" />
          Export Schema
        </Button>
        <Button variant="default" size="sm" onClick={handleCreatePipeline}>
          Create Pipeline
        </Button>
      </div>
      <div style={{ height: "100%", width: "100%" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          attributionPosition="top-right"
          style={{ background: "#F7F9FB" }}
        >
          <Controls />
          <MiniMap />
          <Background gap={16} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default SchemaGraphView;
