import type { CalculatorData, BareHistoryEntry } from "./types";
import { lastItem } from "./utils.js";

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
  key: Key,
  data: CalculatorData[Key]
) {
  calculatorData[key] = data;
  localStorage.setItem("calculator", JSON.stringify(calculatorData));
}

export function addHistoryEntry(entry: BareHistoryEntry) {
  const lastEntry = calculatorData.history[0];
  /* gotta check for undefined here because history might be empty */
  const lastId = lastEntry !== undefined ? lastEntry.id : -1;
  const newEntry = { ...entry, id: lastId + 1 };
  const newHistory = [newEntry, ...calculatorData.history];

  save("history", newHistory);
}

export function get<Key extends keyof CalculatorData>(
  prop: Key
): CalculatorData[Key] {
  return calculatorData[prop];
}
