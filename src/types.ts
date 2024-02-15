export interface HistoryEntry {
  expression: string;
  result: number;
  id: number;
}

export interface CalculatorData {
  theme: Theme | null;
  history: HistoryEntry[];
}

export type Theme =
  | "theme-blue"
  | "theme-white"
  | "theme-purple";
