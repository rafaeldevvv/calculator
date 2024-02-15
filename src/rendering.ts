import type { HistoryEntry } from "./types";

export function renderHistoryEntry(entry: HistoryEntry) {
  return `
      <button
         type="button"
         role="menuitem"
         class="history-entry text-primary block text-left px-2 rounded capitalize"
         data-close-on-click
         data-entry-id="${entry.id}"
      >
         <span class="history-entry__expression block">
         <strong>expression</strong>: ${entry.expression}
         </span>
         <span class="history-entry__result block mt-1">
         <strong>result</strong>: ${entry.result}
         </span>
      </button>
   `;
}

export function renderHistoryMenuListItem(entry: HistoryEntry) {
  return `<li role="none">${renderHistoryEntry(entry)}</li>`;
}

export function renderHistoryEntries(entries: HistoryEntry[]) {
  return entries.map(renderHistoryMenuListItem).join("");
}
