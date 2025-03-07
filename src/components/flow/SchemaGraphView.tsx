
import { useCallback, useState } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from "@/components/ui/button";
import { Plus, FileDown, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

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

const initialEdges = [
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
    labelBgPadding: [8, 4],
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

const SchemaGraphView = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  
  const handleAddTable = () => {
    toast({
      title: "Add Table",
      description: "This would open a dialog to add a new table to the schema graph."
    });
  };
  
  const handleExportSchema = () => {
    toast({
      title: "Schema Exported",
      description: "Schema mapping has been exported successfully."
    });
  };

  const onNodeClick = (event: React.MouseEvent, node: any) => {
    setSelectedNode(node.id);
  };

  return (
    <div className="h-[600px] border border-gray-200 rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
        <Panel position="top-right" className="bg-white p-2 rounded shadow-md border border-gray-200">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleAddTable}>
              <Plus className="h-4 w-4 mr-1" /> Add Table
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportSchema}>
              <FileDown className="h-4 w-4 mr-1" /> Export
            </Button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default SchemaGraphView;
