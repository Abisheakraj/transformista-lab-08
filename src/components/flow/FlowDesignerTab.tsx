
import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Save, Play, Layout, Plus, Trash2, List, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FlowDesignerTabProps {
  projectId: string;
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onRun?: () => void;
}

const FlowDesignerTab = ({ projectId, onSave, onRun }: FlowDesignerTabProps) => {
  const { toast } = useToast();
  
  // Define node types
  const nodeTypes = {
    source: ({ data }: { data: any }) => (
      <div className="p-4 border-2 border-green-500 bg-green-50 rounded-md w-[220px]">
        <div className="font-semibold text-green-700 mb-2">{data.label}</div>
        {data.tables && (
          <div className="text-xs text-green-600 mt-1">
            {data.tables} tables selected
          </div>
        )}
      </div>
    ),
    transform: ({ data }: { data: any }) => (
      <div className="p-4 border-2 border-blue-500 bg-blue-50 rounded-md w-[220px]">
        <div className="font-semibold text-blue-700 mb-2">{data.label}</div>
        {data.operation && (
          <div className="text-xs text-blue-600 mt-1">
            Operation: {data.operation}
          </div>
        )}
      </div>
    ),
    target: ({ data }: { data: any }) => (
      <div className="p-4 border-2 border-purple-500 bg-purple-50 rounded-md w-[220px]">
        <div className="font-semibold text-purple-700 mb-2">{data.label}</div>
        {data.tables && (
          <div className="text-xs text-purple-600 mt-1">
            {data.tables} tables selected
          </div>
        )}
      </div>
    ),
  };

  // Initial setup for source, transform, and target nodes
  const initialNodes: Node[] = [
    {
      id: "source-1",
      type: "source",
      position: { x: 100, y: 200 },
      data: { 
        label: "Source Database", 
        tables: 4,
        type: "PostgreSQL"
      },
    },
    {
      id: "transform-1",
      type: "transform",
      position: { x: 400, y: 200 },
      data: { 
        label: "Data Transformation", 
        operation: "JOIN + Filter"
      },
    },
    {
      id: "target-1",
      type: "target",
      position: { x: 700, y: 200 },
      data: { 
        label: "Target Database", 
        tables: 2,
        type: "MySQL" 
      },
    },
  ];

  const initialEdges: Edge[] = [
    {
      id: "e1-2",
      source: "source-1",
      target: "transform-1",
      animated: true,
      style: { stroke: "#93c5fd" },
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    },
    {
      id: "e2-3",
      source: "transform-1",
      target: "target-1",
      animated: true,
      style: { stroke: "#93c5fd" },
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleSave = () => {
    setIsSaving(true);
    
    setTimeout(() => {
      setIsSaving(false);
      if (onSave) {
        onSave(nodes, edges);
      }
      
      toast({
        title: "Pipeline Saved",
        description: "Your data transformation pipeline has been saved successfully."
      });
    }, 1000);
  };

  const handleRun = () => {
    setIsRunning(true);
    
    // Simulate running the pipeline
    setTimeout(() => {
      setIsRunning(false);
      if (onRun) {
        onRun();
      }
      
      toast({
        title: "Pipeline Executed",
        description: "Your data transformation pipeline has been executed successfully."
      });
    }, 2000);
  };

  const handleAddTransform = () => {
    const newTransformId = `transform-${nodes.length + 1}`;
    const newTransform: Node = {
      id: newTransformId,
      type: "transform",
      position: { x: 400, y: 400 },
      data: { 
        label: "New Transformation", 
        operation: "Filter"
      },
    };
    
    setNodes((nds) => [...nds, newTransform]);
    
    toast({
      title: "Transformation Added",
      description: "New transformation node has been added to the pipeline."
    });
  };

  const handleAutoLayout = () => {
    // Simple auto-layout algorithm
    const layoutNodes = [...nodes];
    
    // Sort nodes by type (source -> transform -> target)
    layoutNodes.sort((a, b) => {
      const typeOrder = { source: 0, transform: 1, target: 2 };
      return (typeOrder[a.type as keyof typeof typeOrder] || 0) - (typeOrder[b.type as keyof typeof typeOrder] || 0);
    });
    
    // Position nodes in columns
    const newNodes = layoutNodes.map((node, index) => {
      const nodeType = node.type as string;
      let xPos = 150;
      
      if (nodeType.includes("transform")) {
        xPos = 450;
      } else if (nodeType.includes("target")) {
        xPos = 750;
      }
      
      const sameTypeNodes = layoutNodes.filter(n => n.type === nodeType);
      const typeIndex = sameTypeNodes.findIndex(n => n.id === node.id);
      const yPos = 100 + typeIndex * 150;
      
      return {
        ...node,
        position: { x: xPos, y: yPos },
      };
    });
    
    setNodes(newNodes);
    
    toast({
      title: "Pipeline Layout Adjusted",
      description: "The pipeline layout has been automatically arranged."
    });
  };

  return (
    <div className="w-full h-full" style={{ height: "500px" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background gap={16} size={1} />
        
        <Panel position="top-right" className="bg-white p-2 rounded-md shadow-md flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddTransform} 
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Transform
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAutoLayout} 
            className="flex items-center gap-1"
          >
            <Layout className="h-4 w-4" />
            Auto Layout
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave} 
            disabled={isSaving} 
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleRun} 
            disabled={isRunning} 
            className="flex items-center gap-1"
          >
            <Play className="h-4 w-4" />
            {isRunning ? "Running..." : "Run Pipeline"}
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default FlowDesignerTab;
