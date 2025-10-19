"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { TMState, StateType, Transition } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface ParametersPanelProps {
  alphabet: string[];
  tapeAlphabet: string[];
  blankSymbol: string;
  states: TMState[];
  transitions: Transition[];
  onAlphabetChange: (alphabet: string[]) => void;
  onTapeAlphabetChange: (tapeAlphabet: string[]) => void;
  onBlankSymbolChange: (symbol: string) => void;
  onStatesChange: (states: TMState[]) => void;
}

export function ParametersPanel({
  alphabet,
  tapeAlphabet,
  blankSymbol,
  states,
  transitions,
  onAlphabetChange,
  onTapeAlphabetChange,
  onBlankSymbolChange,
  onStatesChange,
}: ParametersPanelProps) {
  const [newSymbol, setNewSymbol] = useState("");
  const [newTapeSymbol, setNewTapeSymbol] = useState("");

  const handleAddAlphabetSymbol = () => {
    if (newSymbol && !alphabet.includes(newSymbol)) {
      onAlphabetChange([...alphabet, newSymbol]);
      if (!tapeAlphabet.includes(newSymbol)) {
        onTapeAlphabetChange([...tapeAlphabet, newSymbol]);
      }
      setNewSymbol("");
    }
  };

  const handleAddTapeSymbol = () => {
    if (newTapeSymbol && !tapeAlphabet.includes(newTapeSymbol)) {
      onTapeAlphabetChange([...tapeAlphabet, newTapeSymbol]);
      setNewTapeSymbol("");
    }
  };

  const handleRemoveAlphabetSymbol = (symbol: string) => {
    onAlphabetChange(alphabet.filter((s) => s !== symbol));
  };

  const handleRemoveTapeSymbol = (symbol: string) => {
    if (symbol !== blankSymbol) {
      onTapeAlphabetChange(tapeAlphabet.filter((s) => s !== symbol));
    }
  };

  const handleStateTypeChange = (stateId: string, newType: StateType) => {
    const updatedStates = states.map((state) => {
      if (state.id === stateId) {
        return { ...state, type: newType };
      }
      if (newType === "start" && state.type === "start") {
        return { ...state, type: "regular" as StateType };
      }
      if (newType === "accept" && state.type === "accept") {
        return { ...state, type: "regular" as StateType };
      }
      if (newType === "reject" && state.type === "reject") {
        return { ...state, type: "regular" as StateType };
      }
      return state;
    });
    onStatesChange(updatedStates);
  };

  const handleDeleteState = (stateId: string) => {
    onStatesChange(states.filter((s) => s.id !== stateId));
  };

  return (
    <Card className="bg-slate-300 border-slate-500 dark:bg-slate-900 dark:border-slate-700">
      <CardHeader>
        <CardTitle>Machine Parameters</CardTitle>
        <CardDescription>
          Define alphabets, symbols, and state properties
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Input Alphabet (Σ)</Label>
          <div className="flex gap-2">
            <Input
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              placeholder="Add symbol"
              className="bg-slate-300 border-slate-500 dark:bg-slate-900 dark:border-slate-700"
              onKeyDown={(e) => e.key === "Enter" && handleAddAlphabetSymbol()}
            />
            <Button onClick={handleAddAlphabetSymbol} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {alphabet.map((symbol) => (
              <Badge key={symbol} variant="secondary" className="gap-1">
                {symbol}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-400"
                  onClick={() => handleRemoveAlphabetSymbol(symbol)}
                />
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="bg-slate-700" />

        <div className="space-y-2">
          <Label>Tape Alphabet (Γ)</Label>
          <div className="flex gap-2">
            <Input
              value={newTapeSymbol}
              onChange={(e) => setNewTapeSymbol(e.target.value)}
              placeholder="Add tape symbol"
              className="bg-slate-300 border-slate-500 dark:bg-slate-900 dark:border-slate-700"
              onKeyDown={(e) => e.key === "Enter" && handleAddTapeSymbol()}
            />
            <Button onClick={handleAddTapeSymbol} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tapeAlphabet.map((symbol) => (
              <Badge key={symbol} variant="secondary" className="gap-1">
                {symbol}
                {symbol !== blankSymbol && (
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-400"
                    onClick={() => handleRemoveTapeSymbol(symbol)}
                  />
                )}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Blank Symbol</Label>
          <Select value={blankSymbol} onValueChange={onBlankSymbolChange}>
            <SelectTrigger className="bg-slate-300 border-slate-500 dark:bg-slate-900 dark:border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tapeAlphabet.map((symbol) => (
                <SelectItem key={symbol} value={symbol}>
                  {symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator className="bg-slate-700" />

        <div className="space-y-2">
          <Label>States Configuration</Label>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {states.map((state) => (
              <div
                key={state.id}
                className="flex items-center gap-2 p-2 rounded-md border bg-slate-400 border-slate-500 dark:bg-slate-900 dark:border-slate-700">
                <span className="font-mono text-sm flex-1">{state.label}</span>
                <Select
                  value={state.type}
                  onValueChange={(val) =>
                    handleStateTypeChange(state.id, val as StateType)
                  }>
                  <SelectTrigger className="w-[130px] bg-slate-300 border-slate-500 dark:bg-slate-900 dark:border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="start">Start</SelectItem>
                    <SelectItem value="accept">Accept</SelectItem>
                    <SelectItem value="reject">Reject</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteState(state.id)}
                  className="hover:bg-red-500/20 hover:text-red-400">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Transition Functions</Label>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {transitions.map((transition) => (
              <div
                key={transition.id}
                className="flex items-center gap-2 p-2 rounded-md border bg-slate-400 border-slate-500 dark:bg-slate-900 dark:border-slate-700">
                <span className="font-mono text-sm flex-1">
                  δ({transition.from}, {transition.read}) = ({transition.to},
                  {transition.write}, {transition.direction})
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
