"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Direction } from "@/lib/types";

interface TransitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (read: string, write: string, direction: Direction) => void;
  alphabet: string[];
  tapeAlphabet: string[];
}

export function TransitionDialog({
  open,
  onOpenChange,
  onSave,
  alphabet,
  tapeAlphabet,
}: TransitionDialogProps) {
  const [read, setRead] = useState<string>("");
  const [write, setWrite] = useState<string>("");
  const [direction, setDirection] = useState<Direction>("R");

  const handleSave = () => {
    if (read && write && direction) {
      onSave(read, write, direction);
      setRead("");
      setWrite("");
      setDirection("R");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-300 border-slate-500 dark:bg-slate-900 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle>Define Transition</DialogTitle>
          <DialogDescription>
            Specify the transition rule: <br /> δ(q, read) = (q', write,
            direction)
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="read">Read Symbol</Label>
            <Select value={read} onValueChange={setRead}>
              <SelectTrigger
                id="read"
                className="bg-slate-300 border-slate-500 dark:bg-slate-900 dark:border-slate-700">
                <SelectValue placeholder="Select symbol to read" />
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

          <div className="grid gap-2">
            <Label htmlFor="write">Write Symbol</Label>
            <Select value={write} onValueChange={setWrite}>
              <SelectTrigger
                id="write"
                className="bg-slate-300 border-slate-500 dark:bg-slate-900 dark:border-slate-700">
                <SelectValue placeholder="Select symbol to write" />
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

          <div className="grid gap-2">
            <Label htmlFor="direction">Move Direction</Label>
            <Select
              value={direction}
              onValueChange={(val) => setDirection(val as Direction)}>
              <SelectTrigger
                id="direction"
                className="bg-slate-300 border-slate-500 dark:bg-slate-900 dark:border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Left (L)</SelectItem>
                <SelectItem value="R">Right (R)</SelectItem>
                <SelectItem value="S">Stay (S)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="destructive" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!read || !write}
            className="dark:bg-slate-300 dark:border-slate-500 dark:hover:bg-slate-500 bg-slate-900 border-slate-700 hover:bg-slate-600">
            Save Transition
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
