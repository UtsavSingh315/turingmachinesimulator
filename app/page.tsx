"use client";

import React, { useState, useCallback, useRef } from "react";
import { VisualCanvas } from "@/components/visual-canvas";
import { ParametersPanel } from "@/components/parameters-panel";
import { TapeVisualization } from "@/components/tape-visualization";
import { DebuggerControls } from "@/components/debugger-controls";
import { TraceLog } from "@/components/trace-log";
import { ThemeToggle } from "@/components/theme-toggle";
import { TMState, Transition, ExecutionStep, MachineState } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // ShadCN Tabs

export default function Home() {
  const [alphabet, setAlphabet] = useState<string[]>(["0", "1"]);
  const [tapeAlphabet, setTapeAlphabet] = useState<string[]>(["0", "1", "B"]);
  const [blankSymbol, setBlankSymbol] = useState<string>("B");
  const [states, setStates] = useState<TMState[]>([
    { id: "q0", label: "q0", type: "start" },
    { id: "q_f", label: "q_f", type: "accept" },
    { id: "q_reject1", label: "q_reject1", type: "reject" },
  ]);
  const [transitions, setTransitions] = useState<Transition[]>([]);
  const [inputString, setInputString] = useState<string>("");
  const [machineState, setMachineState] = useState<MachineState>({
    currentState: "",
    tape: new Map(),
    headPosition: 0,
    steps: [],
    isRunning: false,
    isHalted: false,
  });
  const [speed, setSpeed] = useState<number>(500);
  const runningRef = useRef<boolean>(false);

  const initializeTape = useCallback(() => {
    const newTape = new Map<number, string>();
    for (let i = 0; i < inputString.length; i++) {
      newTape.set(i, inputString[i]);
    }

    const startState =
      states.find((s) => s.type === "start")?.id || states[0]?.id || "";

    setMachineState({
      currentState: startState,
      tape: newTape,
      headPosition: 0,
      steps: [],
      isRunning: false,
      isHalted: false,
    });
  }, [inputString, states]);

  const findTransition = useCallback(
    (state: string, symbol: string): Transition | undefined => {
      return transitions.find((t) => t.from === state && t.read === symbol);
    },
    [transitions]
  );

  const executeStep = useCallback(() => {
    setMachineState((prev) => {
      if (prev.isHalted) return prev;

      const currentSymbol = prev.tape.get(prev.headPosition) || blankSymbol;
      const transition = findTransition(prev.currentState, currentSymbol);

      const acceptStates = states
        .filter((s) => s.type === "accept")
        .map((s) => s.id);
      const rejectStates = states
        .filter((s) => s.type === "reject")
        .map((s) => s.id);

      if (!transition) {
        const step: ExecutionStep = {
          stepNumber: prev.steps.length + 1,
          currentState: prev.currentState,
          headPosition: prev.headPosition,
          symbolRead: currentSymbol,
          result: "undefined",
        };

        return {
          ...prev,
          steps: [...prev.steps, step],
          isHalted: true,
          isRunning: false,
          haltReason: "undefined",
        };
      }

      const newTape = new Map(prev.tape);
      newTape.set(prev.headPosition, transition.write);

      let newHeadPosition = prev.headPosition;
      if (transition.direction === "L") newHeadPosition--;
      else if (transition.direction === "R") newHeadPosition++;

      let result: "continued" | "accepted" | "rejected" | "undefined" =
        "continued";
      let isHalted = false;
      let haltReason: "accepted" | "rejected" | "undefined" | undefined;

      if (acceptStates.includes(transition.to)) {
        result = "accepted";
        isHalted = true;
        haltReason = "accepted";
      } else if (rejectStates.includes(transition.to)) {
        result = "rejected";
        isHalted = true;
        haltReason = "rejected";
      }

      const step: ExecutionStep = {
        stepNumber: prev.steps.length + 1,
        currentState: prev.currentState,
        headPosition: prev.headPosition,
        symbolRead: currentSymbol,
        transition,
        result,
      };

      return {
        currentState: transition.to,
        tape: newTape,
        headPosition: newHeadPosition,
        steps: [...prev.steps, step],
        isRunning: prev.isRunning && !isHalted,
        isHalted,
        haltReason,
      };
    });
  }, [blankSymbol, findTransition, states]);

  const handleRun = useCallback(() => {
    if (machineState.isRunning) {
      runningRef.current = false;
      setMachineState((prev) => ({ ...prev, isRunning: false }));
      return;
    }

    runningRef.current = true;
    setMachineState((prev) => ({ ...prev, isRunning: true }));

    const runLoop = () => {
      if (!runningRef.current) return;

      setMachineState((prev) => {
        if (prev.isHalted) {
          runningRef.current = false;
          return { ...prev, isRunning: false };
        }

        const currentSymbol = prev.tape.get(prev.headPosition) || blankSymbol;
        const transition = findTransition(prev.currentState, currentSymbol);

        const acceptStates = states
          .filter((s) => s.type === "accept")
          .map((s) => s.id);
        const rejectStates = states
          .filter((s) => s.type === "reject")
          .map((s) => s.id);

        if (!transition) {
          const step: ExecutionStep = {
            stepNumber: prev.steps.length + 1,
            currentState: prev.currentState,
            headPosition: prev.headPosition,
            symbolRead: currentSymbol,
            result: "undefined",
          };

          runningRef.current = false;
          return {
            ...prev,
            steps: [...prev.steps, step],
            isHalted: true,
            isRunning: false,
            haltReason: "undefined",
          };
        }

        const newTape = new Map(prev.tape);
        newTape.set(prev.headPosition, transition.write);

        let newHeadPosition = prev.headPosition;
        if (transition.direction === "L") newHeadPosition--;
        else if (transition.direction === "R") newHeadPosition++;

        let result: "continued" | "accepted" | "rejected" | "undefined" =
          "continued";
        let isHalted = false;
        let haltReason: "accepted" | "rejected" | "undefined" | undefined;

        if (acceptStates.includes(transition.to)) {
          result = "accepted";
          isHalted = true;
          haltReason = "accepted";
          runningRef.current = false;
        } else if (rejectStates.includes(transition.to)) {
          result = "rejected";
          isHalted = true;
          haltReason = "rejected";
          runningRef.current = false;
        }

        const step: ExecutionStep = {
          stepNumber: prev.steps.length + 1,
          currentState: prev.currentState,
          headPosition: prev.headPosition,
          symbolRead: currentSymbol,
          transition,
          result,
        };

        setTimeout(() => {
          if (runningRef.current) runLoop();
        }, speed);

        return {
          currentState: transition.to,
          tape: newTape,
          headPosition: newHeadPosition,
          steps: [...prev.steps, step],
          isRunning: !isHalted,
          isHalted,
          haltReason,
        };
      });
    };

    setTimeout(runLoop, speed);
  }, [machineState.isRunning, blankSymbol, findTransition, states, speed]);

  const handleReset = useCallback(() => {
    runningRef.current = false;
    setMachineState({
      currentState: "",
      tape: new Map(),
      headPosition: 0,
      steps: [],
      isRunning: false,
      isHalted: false,
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-200 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      <header className="text-center py-4 container mx-auto sticky z-90 px-4">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
          Turing Machine Builder & Visualizer
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Design, simulate, and debug Turing machines.
        </p>
      </header>

      <div className="flex flex-col md:flex-row p-4 pt-0 flex-1">
        {/* Canvas */}
        <div className="md:pr-2 md:w-3/4 h-[70vh] md:h-[98vh] md:sticky top-0">
          <VisualCanvas
            states={states}
            transitions={transitions}
            alphabet={alphabet}
            tapeAlphabet={tapeAlphabet}
            currentState={machineState.currentState}
            onStatesChange={setStates}
            onTransitionsChange={setTransitions}
          />
        </div>

        {/* Desktop sidebar */}
        <div className="hidden md:block md:pl-2 md:w-1/4 border-l border-slate-300 dark:border-slate-800 overflow-y-auto">
          <div className="space-y-4 pb-4">
            <ParametersPanel
              alphabet={alphabet}
              tapeAlphabet={tapeAlphabet}
              blankSymbol={blankSymbol}
              states={states}
              transitions={transitions}
              onAlphabetChange={setAlphabet}
              onTapeAlphabetChange={setTapeAlphabet}
              onBlankSymbolChange={setBlankSymbol}
              onStatesChange={setStates}
            />
            <TapeVisualization
              tape={machineState.tape}
              headPosition={machineState.headPosition}
              blankSymbol={blankSymbol}
              inputString={inputString}
              onInputChange={setInputString}
              onInitialize={initializeTape}
            />
            <DebuggerControls
              isRunning={machineState.isRunning}
              isHalted={machineState.isHalted}
              speed={speed}
              onRun={handleRun}
              onStep={executeStep}
              onReset={handleReset}
              onSpeedChange={setSpeed}
            />
            <TraceLog
              steps={machineState.steps}
              haltReason={machineState.haltReason}
            />
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden mt-4 w-full">
          <Tabs defaultValue="parameters" className="w-full">
            <TabsList className="w-full border-b border-slate-300 dark:border-slate-700">
              <TabsTrigger value="parameters" className="flex-1 text-center">
                Parameters
              </TabsTrigger>
              <TabsTrigger value="debug" className="flex-1 text-center">
                Debug
              </TabsTrigger>
            </TabsList>

            <TabsContent value="parameters" className="mt-4 w-full">
              <ParametersPanel
                alphabet={alphabet}
                tapeAlphabet={tapeAlphabet}
                blankSymbol={blankSymbol}
                states={states}
                transitions={transitions}
                onAlphabetChange={setAlphabet}
                onTapeAlphabetChange={setTapeAlphabet}
                onBlankSymbolChange={setBlankSymbol}
                onStatesChange={setStates}
              />
            </TabsContent>

            <TabsContent value="debug" className="mt-4 w-full space-y-4">
              <TapeVisualization
                tape={machineState.tape}
                headPosition={machineState.headPosition}
                blankSymbol={blankSymbol}
                inputString={inputString}
                onInputChange={setInputString}
                onInitialize={initializeTape}
              />
              <DebuggerControls
                isRunning={machineState.isRunning}
                isHalted={machineState.isHalted}
                speed={speed}
                onRun={handleRun}
                onStep={executeStep}
                onReset={handleReset}
                onSpeedChange={setSpeed}
              />
              <TraceLog
                steps={machineState.steps}
                haltReason={machineState.haltReason}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
