
import { Node as ReactFlowNode, Edge as ReactFlowEdge, MarkerType } from "@xyflow/react";

// Extended base types from ReactFlow
export interface FlowNode extends ReactFlowNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: any;
}

export interface FlowEdge extends ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: React.CSSProperties;
  markerEnd?: {
    type: MarkerType;
    width?: number;
    height?: number;
  };
  data?: any;
}

export interface SchemaTable {
  name: string;
  columns: ColumnType[];
}

export interface ColumnType {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  references?: string;
}

export interface RelationshipData {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  id: string;
}
