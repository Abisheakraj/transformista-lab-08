
import { Position } from '@xyflow/react';

export interface FlowNode {
  id: string;
  type: 'table' | 'transformation' | 'output' | 'source' | 'transform' | 'target';
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
    operation?: string;
    tables?: number;
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
  sourceHandle?: string | null;
  targetHandle?: string | null;
  // Make animated optional to match Edge type
  animated?: boolean;
  style?: React.CSSProperties;
  type?: string;
  markerEnd?: string | {
    type: string;
    width: number;
    height: number;
    color: string;
  };
  label?: string;
}

export interface DataFlow {
  id: string;
  name: string;
  description: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}
