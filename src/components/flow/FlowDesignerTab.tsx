
import { useState, useCallback, useEffect, useRef } from "react";
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
  NodeTypes,
  NodeMouseHandler,
  EdgeMouseHandler,
  ConnectionLineType,
  ConnectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Save, Play, Layout, Plus, Trash2, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlowNode, FlowEdge } from "@/types/flow";

interface FlowDesignerTabProps {
  projectId: string;
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onRun?: () => void;
}

// Custom node components
const SourceNode = ({ data }: { data: any }) => (
  <div className="p-4 border-2 border-green-500 bg-green-50 rounded-md w-[220px]">
    <div className="font-semibold text-green-700 mb-2">{data.label}</div>
    {data.tables && (
      <div className="text-xs text-green-600 mt-1">
        {data.tables} tables selected
      </div>
    )}
  </div>
);

const TransformNode = ({ data }: { data: any }) => (
  <div className="p-4 border-2 border-blue-500 bg-blue-50 rounded-md w-[220px]">
    <div className="font-semibold text-blue-700 mb-2">{data.label}</div>
    {data.operation && (
      <div className="text-xs text-blue-600 mt-1">
        Operation: {data.operation}
      </div>
    )}
  </div>
);

const TargetNode = ({ data }: { data: any }) => (
  <div className="p-4 border-2 border-purple-500 bg-purple-50 rounded-md w-[220px]">
    <div className="font-semibold text-purple-700 mb-2">{data.label}</div>
    {data.tables && (
      <div className="text-xs text-purple-600 mt-1">
        {data.tables} tables selected
      </div>
    )}
  </div>
);

const FlowDesignerTab = ({ projectId, onSave, onRun }: FlowDesignerTabProps) => {
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // Define node types
  const nodeTypes: NodeTypes = {
    source: SourceNode,
    transform: TransformNode,
    target: TargetNode,
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
        width: 20,
        height: 20,
        color: "#93c5fd",
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
        width: 20,
        height: 20,
        color: "#93c5fd",
      },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddTransformOpen, setIsAddTransformOpen] = useState(false);
  const [isAddRelationshipMode, setIsAddRelationshipMode] = useState(false);
  const [transformName, setTransformName] = useState("");
  const [transformOperation, setTransformOperation] = useState("filter");

  const onConnect = useCallback(
    (params: Connection) => {
      // Create a custom edge object that matches our FlowEdge interface
      const newEdge = {
        ...params,
        id: `e${params.source}-${params.target}`,
        animated: true,
        style: { stroke: "#93c5fd" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: "#93c5fd",
        },
        label: "connects to",
      };
      
      // Use addEdge to create the edge with the correct type
      setEdges((eds) => addEdge(newEdge, eds));
      
      toast({
        title: "Relationship Added",
        description: "A new relationship has been created between the nodes.",
      });
      
      if (isAddRelationshipMode) {
        setIsAddRelationshipMode(false);
      }
    },
    [setEdges, toast, isAddRelationshipMode]
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
    setIsAddTransformOpen(true);
  };

  const handleAddRelationship = () => {
    setIsAddRelationshipMode(!isAddRelationshipMode);
    
    toast({
      title: isAddRelationshipMode ? "Relationship Mode Disabled" : "Relationship Mode Enabled",
      description: isAddRelationshipMode 
        ? "You can now interact with nodes normally." 
        : "Connect two nodes by dragging from one node to another.",
    });
  };

  const handleAddTransformSubmit = () => {
    const newTransformId = `transform-${nodes.length + 1}`;
    const newTransform: Node = {
      id: newTransformId,
      type: "transform",
      position: { x: 400, y: 400 },
      data: { 
        label: transformName || "New Transformation", 
        operation: transformOperation || "Filter"
      },
    };
    
    setNodes((nds) => [...nds, newTransform]);
    setIsAddTransformOpen(false);
    setTransformName("");
    setTransformOperation("filter");
    
    toast({
      title: "Transformation Added",
      description: "New transformation node has been added to the pipeline."
    });
  };

  const handleDeleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
    
    toast({
      title: "Selection Deleted",
      description: "Selected items have been removed from the pipeline."
    });
  }, [setNodes, setEdges, toast]);

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

  const onNodeClick: NodeMouseHandler = (_, node) => {
    console.log("Node clicked:", node);
  };

  const onEdgeClick: EdgeMouseHandler = (_, edge) => {
    console.log("Edge clicked:", edge);
  };

  return (
    <div className="w-full h-full" style={{ height: "500px" }}>
      <div className="border border-gray-200 rounded-lg overflow-hidden" ref={reactFlowWrapper} style={{ height: "100%" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          connectionMode={ConnectionMode.Loose}
          connectionLineType={ConnectionLineType.SmoothStep}
          connectionLineStyle={{ stroke: '#93c5fd', strokeWidth: 2 }}
          fitView
          attributionPosition="top-right"
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
              variant={isAddRelationshipMode ? "default" : "outline"}
              size="sm" 
              onClick={handleAddRelationship} 
              className="flex items-center gap-1"
            >
              <Link2 className="h-4 w-4" />
              {isAddRelationshipMode ? "Cancel Relationship" : "Add Relationship"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDeleteSelected} 
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete
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

      {/* Add Transform Dialog */}
      <Dialog open={isAddTransformOpen} onOpenChange={setIsAddTransformOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Transformation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="transform-name">Transformation Name</Label>
              <Input
                id="transform-name"
                placeholder="e.g., Filter Customer Data"
                value={transformName}
                onChange={(e) => setTransformName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="transform-operation">Operation Type</Label>
              <Select value={transformOperation} onValueChange={setTransformOperation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="filter">Filter</SelectItem>
                  <SelectItem value="join">Join</SelectItem>
                  <SelectItem value="aggregate">Aggregate</SelectItem>
                  <SelectItem value="sort">Sort</SelectItem>
                  <SelectItem value="custom">Custom SQL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTransformOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTransformSubmit}>
              Add Transformation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlowDesignerTab;
