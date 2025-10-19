"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Play } from "lucide-react";
import { StateType } from "@/lib/types";

interface StateNodeProps {
  data: {
    label: string;
    type: StateType;
    isActive?: boolean;
  };
}

export function StateNode({ data }: StateNodeProps) {
  const getStateColor = () => {
    switch (data.type) {
      case "start":
        return "border-blue-500 bg-blue-500/10";
      case "accept":
        return "border-green-500 bg-green-500/10";
      case "reject":
        return "border-red-500 bg-red-500/10";
      default:
        return "border-slate-600 bg-slate-800/50";
    }
  };

  const getStateIcon = () => {
    switch (data.type) {
      case "start":
        return <Play className="h-4 w-4 text-blue-400" />;
      case "accept":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "reject":
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getBadgeVariant = () => {
    switch (data.type) {
      case "start":
        return "default";
      case "accept":
        return "default";
      case "reject":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handles = [];
  const numHandles = 16;
  for (let i = 0; i < numHandles; i++) {
    const angle = (i * 360) / numHandles;
    const radian = (angle * Math.PI) / 180;
    const x = 50 + 50 * Math.cos(radian);
    const y = 50 + 50 * Math.sin(radian);

    handles.push(
      <Handle
        key={`source-handle-${i}`}
        type="source"
        position={Position.Top}
        id={`handle-${i}`}
        className="w-2 h-2 !bg-slate-400 !border-slate-600 opacity-0 hover:opacity-100"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          transform: "translate(-50%, -50%)",
        }}
      />
    );

    handles.push(
      <Handle
        key={`target-handle-${i}`}
        type="target"
        position={Position.Top}
        id={`handle-${i}`}
        className="w-2 h-2 !bg-slate-400 !border-slate-600 opacity-0"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          transform: "translate(-50%, -50%)",
        }}
      />
    );
  }

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="!w-3 !h-3 !bg-blue-500 !border-blue-600"
      />
      {/* <Handle
        type="target"
        position={Position.Left}
        id="targetL"
        className="!w-3 !h-3 !bg-blue-500 !border-blue-600"
      /> */}
      <div
        className={`w-24 h-24 rounded-full border-2 transition-all flex items-center justify-center ${getStateColor()} ${
          data.isActive
            ? "ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/50"
            : ""
        }`}>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            {getStateIcon()}
            <span className="font-semibold text-sm">{data.label}</span>
          </div>

          {data.type !== "regular" && (
            <Badge
              variant={getBadgeVariant()}
              className="text-[10px] px-1 py-0">
              {data.type}
            </Badge>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="!w-3 !h-3 !bg-green-500 !border-green-600"
      />
      {/* <Handle
        type="source"
        position={Position.Right}
        id="sourceR"
        className="!w-3 !h-3 !bg-green-500 !border-green-600"
      /> */}
    </div>
  );
}
