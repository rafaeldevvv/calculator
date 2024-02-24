export interface BareHistoryEntry {
  expression: string;
  result: number | string;
}

export interface HistoryEntry extends BareHistoryEntry {
  id: number;
}

export interface CalculatorData {
  theme: Theme | null;
  history: HistoryEntry[];
}

export type Theme = "theme-blue" | "theme-white" | "theme-purple";
