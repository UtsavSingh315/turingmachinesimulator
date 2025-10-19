"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Play, StepForward, RotateCcw, Pause } from "lucide-react";

interface DebuggerControlsProps {
  isRunning: boolean;
  isHalted: boolean;
  speed: number;
  onRun: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export function DebuggerControls({
  isRunning,
  isHalted,
  speed,
  onRun,
  onStep,
  onReset,
  onSpeedChange,
}: DebuggerControlsProps) {
  return (
    <Card className="bg-slate-300 border-slate-500 dark:bg-slate-900 dark:border-slate-700">
      <CardHeader>
        <CardTitle>Execution Controls</CardTitle>
        <CardDescription>Run, step, and control the simulation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onRun}
            disabled={isHalted}
            className="flex-1 gap-2 dark:bg-slate-300 dark:border-slate-500 dark:hover:bg-slate-500 bg-slate-900 border-slate-700 hover:bg-slate-600"
            variant={isRunning ? "secondary" : "default"}>
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run
              </>
            )}
          </Button>

          <Button
            onClick={onStep}
            disabled={isHalted || isRunning}
            className="flex-1 gap-2 dark:bg-slate-300 dark:border-slate-500 dark:hover:bg-slate-500 bg-slate-900 border-slate-700 hover:bg-slate-600">
            <StepForward className="h-4 w-4 " />
            Step
          </Button>

          <Button
            onClick={onReset}
            variant="destructive"
            className="flex-1 gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Execution Speed</Label>
            <span className="text-sm text-slate-400">{speed}ms delay</span>
          </div>
          <Slider
            value={[speed]}
            onValueChange={(vals) => onSpeedChange(vals[0])}
            min={50}
            max={2000}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>Fast</span>
            <span>Slow</span>
          </div>
        </div>

        {isHalted && (
          <div className="p-3 rounded-md  border bg-slate-300 border-slate-500 dark:bg-slate-900 dark:border-slate-700">
            <p className="text-sm text-slate-300">
              Machine has halted. Click <strong>Reset</strong> to start over.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
