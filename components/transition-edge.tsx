"use client";

import React, { useState } from "react";
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from "reactflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function TransitionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const offset = data?.offset || 0;
  const isSelfLoop = data?.isSelfLoop || false;
  const index = data?.index || 0;
  const total = data?.total || 1;

  let edgePath: string;
  let labelX: number;
  let labelY: number;

  if (isSelfLoop) {
    // Create self-loop with different positions for multiple transitions
    const loopSize = 40;
    const angleOffset = (index - (total - 1) / 2) * 0.5;
    const angle = Math.PI / 2 + angleOffset;
    const loopX = sourceX + Math.cos(angle) * loopSize;
    const loopY = sourceY + Math.sin(angle) * loopSize;

    edgePath = `M ${sourceX},${sourceY} Q ${loopX},${loopY} ${sourceX},${sourceY}`;
    labelX = loopX;
    labelY = loopY;
  } else {
    // Calculate perpendicular offset for parallel edges
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const perpX = (-dy / length) * offset;
    const perpY = (dx / length) * offset;

    [edgePath, labelX, labelY] = getBezierPath({
      sourceX: sourceX + perpX,
      sourceY: sourceY + perpY,
      sourcePosition,
      targetX: targetX + perpX,
      targetY: targetY + perpY,
      targetPosition,
      curvature: offset !== 0 ? 0.25 + Math.abs(offset) / 200 : 0.25,
    });
  }

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path stroke-slate-600 hover:stroke-slate-900 dark:stroke-slate-400 dark:hover:stroke-slate-300 stroke-4"
        d={edgePath}
        markerEnd={markerEnd}
        style={{
          animation: "dashdraw 0.5s linear infinite",
          strokeDasharray: 5,
          transition: "stroke 0.2s",
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>
          <div className="flex items-center gap-1">
            <Badge
              variant="secondary"
              className=" bg-slate-400 hover:bg-slate-300 border-slate-600 dark:bg-slate-800 border  dark:border-slate-600 px-2 py-1">
              <span className="text-xs font-mono">
                {data?.read || "?"} → {data?.write || "?"},{" "}
                {data?.direction || "?"}
              </span>
            </Badge>
            {isHovered && data?.onDelete && (
              <Button
                variant="destructive"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  data.onDelete();
                }}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
