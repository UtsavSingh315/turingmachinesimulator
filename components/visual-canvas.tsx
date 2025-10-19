"use client";

import React, { useCallback, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  Edge,
  NodeTypes,
  EdgeTypes,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StateNode } from "./state-node";
import { TransitionEdge } from "./transition-edge";
import { TransitionDialog } from "./transition-dialog";
import { TMState, Transition, Direction } from "@/lib/types";

interface VisualCanvasProps {
  states: TMState[];
  transitions: Transition[];
  alphabet: string[];
  tapeAlphabet: string[];
  currentState?: string;
  onStatesChange: (states: TMState[]) => void;
  onTransitionsChange: (transitions: Transition[]) => void;
}

const nodeTypes: NodeTypes = {
  stateNode: StateNode,
};

const edgeTypes: EdgeTypes = {
  transitionEdge: TransitionEdge,
};

export function VisualCanvas({
  states,
  transitions,
  alphabet,
  tapeAlphabet,
  currentState,
  onStatesChange,
  onTransitionsChange,
}: VisualCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(
    null
  );
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const nodePositionsRef = React.useRef<Map<string, { x: number; y: number }>>(
    new Map()
  );

  const handleDeleteTransition = useCallback(
    (transitionId: string) => {
      onTransitionsChange(transitions.filter((t) => t.id !== transitionId));
    },
    [transitions, onTransitionsChange]
  );

  React.useEffect(() => {
    const flowNodes: Node[] = states.map((state, index) => {
      let position = nodePositionsRef.current.get(state.id);

      if (!position) {
        position = {
          x: 100 + (index % 4) * 200,
          y: 100 + Math.floor(index / 4) * 150,
        };
        nodePositionsRef.current.set(state.id, position);
      }

      return {
        id: state.id,
        type: "stateNode",
        position,
        connectable: true,
        data: {
          label: state.label,
          type: state.type,
          isActive: currentState === state.id,
        },
      };
    });
    setNodes(flowNodes);
  }, [states, currentState, setNodes]);

  const handleNodesChange = useCallback(
    (changes: any) => {
      changes.forEach((change: any) => {
        if (change.type === "position" && change.position && change.id) {
          nodePositionsRef.current.set(change.id, change.position);
        }
      });
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  React.useEffect(() => {
    // Helper function to calculate angle between two nodes
    const calculateAngle = (sourceNode: Node, targetNode: Node) => {
      const dx = targetNode.position.x - sourceNode.position.x;
      const dy = targetNode.position.y - sourceNode.position.y;
      return Math.atan2(dy, dx);
    };

    // Helper function to get nearest handle ID based on angle
    const getHandleId = (angle: number) => {
      const numHandles = 16;
      const normalizedAngle = ((angle * 180) / Math.PI + 360) % 360;
      const handleIndex =
        Math.round((normalizedAngle / 360) * numHandles) % numHandles;
      return `handle-${handleIndex}`;
    };

    // Get node positions map
    const nodeMap = new Map<string, Node>();
    nodes.forEach((node) => {
      nodeMap.set(node.id, node);
    });

    // Group transitions by source-target pair
    const transitionGroups = new Map<string, Transition[]>();
    transitions.forEach((transition) => {
      const key = `${transition.from}-${transition.to}`;
      if (!transitionGroups.has(key)) {
        transitionGroups.set(key, []);
      }
      transitionGroups.get(key)!.push(transition);
    });

    const flowEdges: Edge[] = [];
    transitionGroups.forEach((group, key) => {
      const isSelfLoop = group[0].from === group[0].to;
      const sourceNode = nodeMap.get(group[0].from);
      const targetNode = nodeMap.get(group[0].to);

      group.forEach((transition, index) => {
        const offset =
          group.length > 1 ? (index - (group.length - 1) / 2) * 30 : 0;

        let sourceHandle: string | undefined;
        let targetHandle: string | undefined;

        if (sourceNode && targetNode && !isSelfLoop) {
          const angleToTarget = calculateAngle(sourceNode, targetNode);
          const angleToSource = calculateAngle(targetNode, sourceNode);
          sourceHandle = getHandleId(angleToTarget);
          targetHandle = getHandleId(angleToSource);
        }

        flowEdges.push({
          id: transition.id,
          source: transition.from,
          target: transition.to,
          sourceHandle: sourceHandle,
          targetHandle: targetHandle,
          type: "transitionEdge",
          animated: true,
          data: {
            read: transition.read,
            write: transition.write,
            direction: transition.direction,
            offset: offset,
            isSelfLoop: isSelfLoop,
            index: index,
            total: group.length,
            transitionId: transition.id,
            onDelete: () => handleDeleteTransition(transition.id),
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#94a3b8",
          },
        });
      });
    });

    setEdges(flowEdges);
  }, [transitions, nodes, handleDeleteTransition]);

  const onConnect = useCallback((connection: Connection) => {
    console.log("onConnect called:", connection);
    if (connection.source && connection.target) {
      console.log("Setting dialog open");
      setPendingConnection(connection);
      setDialogOpen(true);
    }
  }, []);

  const handleSaveTransition = (
    read: string,
    write: string,
    direction: Direction
  ) => {
    if (
      pendingConnection &&
      pendingConnection.source &&
      pendingConnection.target
    ) {
      const newTransition: Transition = {
        id: `e${pendingConnection.source}-${
          pendingConnection.target
        }-${Date.now()}`,
        from: pendingConnection.source,
        to: pendingConnection.target,
        read,
        write,
        direction,
      };
      onTransitionsChange([...transitions, newTransition]);
      setPendingConnection(null);
    }
  };

  const handleAddState = () => {
    const newId = `q${states.length}`;
    const newState: TMState = {
      id: newId,
      label: newId,
      type: "regular",
    };
    onStatesChange([...states, newState]);
  };

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setSelectedEdge(edge.id);
  }, []);

  return (
    <Card className="h-full bg-slate-300 border-slate-500 dark:bg-slate-900 dark:border-slate-700">
      <div className="h-full relative">
        <div className="absolute top-4 left-4 z-10">
          <Button
            onClick={handleAddState}
            size="sm"
            className="gap-2 dark:bg-slate-300 dark:border-slate-500 dark:hover:bg-slate-500 bg-slate-900 border-slate-700 hover:bg-slate-600">
            <Plus className="h-4 w-4" />
            Add State
          </Button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className=" bg-slate-300 dark:bg-slate-900 rounded-lg"
          defaultEdgeOptions={{
            type: "smoothstep",
          }}>
          <Background color="#334155" gap={16} />
          <Controls className="bg-slate-800 border-slate-700" />
          <MiniMap
            className="bg-slate-800  rounded-lg border-2 overflow-clip border-slate-700 opacity-40 "
            nodeColor={(node) => {
              const type = node.data.type;
              if (type === "start") return "#3b82f6";
              if (type === "accept") return "#22c55e";
              if (type === "reject") return "#ef4444";
              return "#64748b";
            }}
          />
        </ReactFlow>

        <TransitionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSaveTransition}
          alphabet={alphabet}
          tapeAlphabet={tapeAlphabet}
        />
      </div>
    </Card>
  );
}
