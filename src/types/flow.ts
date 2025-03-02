
export interface FlowNode {
  id: string;
  type: 'table' | 'transformation' | 'output';
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
    source?: string;
    columns?: { name: string; type: string }[];
    type?: string;
    sourceNodeId?: string;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

export interface DataFlow {
  id: string;
  name: string;
  description: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}
