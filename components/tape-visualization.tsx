"use client";

import React, { useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TapeVisualizationProps {
  tape: Map<number, string>;
  headPosition: number;
  blankSymbol: string;
  inputString: string;
  onInputChange: (input: string) => void;
  onInitialize: () => void;
}

export function TapeVisualization({
  tape,
  headPosition,
  blankSymbol,
  inputString,
  onInputChange,
  onInitialize,
}: TapeVisualizationProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeCell = scrollContainerRef.current.querySelector(
        '[data-active="true"]'
      );
      if (activeCell) {
        activeCell.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [headPosition]);

  const tapeIndices = Array.from(tape.keys());

  const minWritten = tapeIndices.length > 0 ? Math.min(...tapeIndices) : 0;
  const maxWritten = tapeIndices.length > 0 ? Math.max(...tapeIndices) : 0;

  const buffer = 10;

  const minVisible = Math.min(minWritten, headPosition) - buffer;
  const maxVisible = Math.max(maxWritten, headPosition) + buffer;

  const visibleCells = [];
  for (let i = minVisible; i <= maxVisible; i++) {
    visibleCells.push({
      index: i,
      symbol: tape.get(i) || blankSymbol,
    });
  }

  return (
    <Card className="bg-slate-300 border-slate-500 dark:bg-slate-900 dark:border-slate-700">
      <CardHeader>
        <CardTitle>Tape Visualization</CardTitle>
        <CardDescription>Input string and infinite tape view</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="input-string">Input String (Σ*)</Label>
          <div className="flex gap-2">
            <Input
              id="input-string"
              value={inputString}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Enter input string"
              className="bg-slate-300 border-slate-500 dark:bg-slate-900 dark:border-slate-700 font-mono"
            />
            <Button
              onClick={onInitialize}
              className="dark:bg-slate-300 dark:border-slate-500 dark:hover:bg-slate-500 bg-slate-900 border-slate-700 hover:bg-slate-600">
              Initialize
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Tape</Label>
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-400">
              <ChevronLeft className="h-4 w-4" />
              <span>Infinite in both directions</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 ">
            {visibleCells.map((cell) => (
              <div
                key={cell.index}
                data-active={cell.index === headPosition}
                className={`flex-shrink-0 w-12 h-12 border-2 rounded flex flex-col items-center justify-center font-mono text-sm transition-all ${
                  cell.index === headPosition
                    ? "border-yellow-400 bg-yellow-400/20 ring-2 ring-yellow-400/50 shadow-lg shadow-yellow-400/30 scale-110"
                    : "bg-slate-300 border-slate-500 dark:bg-slate-900 dark:border-slate-700"
                }`}>
                <span className="font-bold">
                  {cell.symbol === blankSymbol ? "□" : cell.symbol}
                </span>
                <span className="text-[10px] text-slate-500">{cell.index}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded">
              <span>Head Position:</span>
              <span className="font-mono font-bold text-yellow-400">
                {headPosition}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
