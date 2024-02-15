import type { CalculatorData, HistoryEntry } from "./types";

const savedData = localStorage.getItem("calculator");

let calculatorData: CalculatorData;
if (savedData) {
  calculatorData = JSON.parse(savedData);
} else {
  calculatorData = {
    history: [],
    theme: null,
  };
}

export function save<Key extends keyof CalculatorData>(
  prop: Key,
  data: CalculatorData[Key]
) {
  calculatorData[prop] = data;
  localStorage.setItem("calculator", JSON.stringify(calculatorData));
}

export function addHistoryEntry(entry: HistoryEntry) {
  calculatorData.history.unshift(entry);
}

export function get<Key extends keyof CalculatorData>(
  prop: Key
): CalculatorData[Key] {
  return calculatorData[prop];
}
