export type Direction = 'L' | 'R' | 'S';

export type StateType = 'start' | 'accept' | 'reject' | 'regular';

export interface TMState {
  id: string;
  label: string;
  type: StateType;
}

export interface Transition {
  id: string;
  from: string;
  to: string;
  read: string;
  write: string;
  direction: Direction;
}

export interface TMConfiguration {
  alphabet: string[];
  tapeAlphabet: string[];
  blankSymbol: string;
  states: TMState[];
  transitions: Transition[];
  startState: string;
  acceptStates: string[];
  rejectStates: string[];
}

export interface TapeCell {
  index: number;
  symbol: string;
}

export interface ExecutionStep {
  stepNumber: number;
  currentState: string;
  headPosition: number;
  symbolRead: string;
  transition?: Transition;
  result: 'continued' | 'accepted' | 'rejected' | 'undefined';
}

export interface MachineState {
  currentState: string;
  tape: Map<number, string>;
  headPosition: number;
  steps: ExecutionStep[];
  isRunning: boolean;
  isHalted: boolean;
  haltReason?: 'accepted' | 'rejected' | 'undefined';
}
