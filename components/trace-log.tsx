"use client";

import React, { useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExecutionStep } from "@/lib/types";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight } from "lucide-react";

interface TraceLogProps {
  steps: ExecutionStep[];
  haltReason?: "accepted" | "rejected" | "undefined";
}

export function TraceLog({ steps, haltReason }: TraceLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps]);

  const getResultIcon = (result: string) => {
    switch (result) {
      case "accepted":
        return (
          <CheckCircle2 className="h-4 w-4 text-green-700 dark:text-green-400" />
        );
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-700 dark:text-red-400" />;
      case "undefined":
        return (
          <AlertCircle className="h-4 w-4 text-orange-700 dark:text-orange-400" />
        );
      default:
        return (
          <ArrowRight className="h-4 w-4 text-blue-700 dark:text-blue-400" />
        );
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case "accepted":
        return (
          <Badge className="bg-green-400/20 text-green-600 border-green-600">
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500">
            Rejected
          </Badge>
        );
      case "undefined":
        return (
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500">
            Undefined
          </Badge>
        );
      default:
        return <Badge variant="outline">Continued</Badge>;
    }
  };

  return (
    <Card className="bg-slate-300 border-slate-500 dark:bg-slate-900 dark:border-slate-700 h-full flex flex-col">
      <CardHeader>
        <CardTitle>Execution Trace</CardTitle>
        <CardDescription>Step-by-step computation history</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollRef}>
          {steps.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-800 dark:text-slate-500">
              <p>
                No execution steps yet. Initialize the tape and run the machine.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md border transition-all ${
                    index === steps.length - 1
                      ? "bg-slate-300 border-slate-500 dark:bg-slate-900 dark:border-slate-700 ring-1 ring-slate-500"
                      : "bg-slate-800/50 border-slate-700"
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getResultIcon(step.result)}
                      <span className="text-xs font-mono text-slate-400">
                        Step {step.stepNumber}
                      </span>
                    </div>
                    {getResultBadge(step.result)}
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800 dark:text-slate-500">
                        State:
                      </span>
                      <code className="font-mono text-blue-600">
                        {step.currentState}
                      </code>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-800 dark:text-slate-500">
                        Position:
                      </span>
                      <code className="font-mono text-yellow-600">
                        {step.headPosition}
                      </code>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-800 dark:text-slate-500">
                        Read:
                      </span>
                      <code className="font-mono text-green-600">
                        {step.symbolRead}
                      </code>
                    </div>

                    {step.transition && (
                      <div className="mt-2 p-2 rounded border bg-slate-300 border-slate-500 dark:bg-slate-900 dark:border-slate-700">
                        <div className="text-xs text-slate-800 dark:text-slate-500 mb-1">
                          Transition:
                        </div>
                        <code className="text-xs font-mono text-slate-800 dark:text-slate-500">
                          δ({step.currentState}, {step.symbolRead}) → (
                          {step.transition.to}, {step.transition.write},{" "}
                          {step.transition.direction})
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {haltReason && (
            <div
              className={`mt-4 p-4 rounded-md border-2 ${
                haltReason === "accepted"
                  ? "bg-green-500/10 border-green-500"
                  : "bg-red-500/10 border-red-500"
              }`}>
              <div className="flex items-center gap-2">
                {haltReason === "accepted" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
                <span className="font-semibold">
                  {haltReason === "accepted"
                    ? "Input Accepted!"
                    : haltReason === "rejected"
                    ? "Input Rejected"
                    : "Undefined Transition"}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                {haltReason === "accepted"
                  ? "The machine reached the accept state."
                  : haltReason === "rejected"
                  ? "The machine reached the reject state."
                  : "No valid transition found for current configuration."}
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
