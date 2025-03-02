
import { Position } from '@xyflow/react';

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
  // Add these properties for React Flow
  selected?: boolean;
  dragging?: boolean;
  targetPosition?: Position;
  sourcePosition?: Position;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  // Add these properties for React Flow
  animated?: boolean;
  style?: React.CSSProperties;
  type?: string;
  markerEnd?: string;
}

export interface DataFlow {
  id: string;
  name: string;
  description: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}
