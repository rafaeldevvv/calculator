import { formatNumbers } from "./utils.js";
export function renderHistoryEntry(entry) {
    return `
      <button
         type="button"
         role="menuitem"
         class="history-entry text-primary block text-left px-2 rounded capitalize"
         data-close-on-click
         data-entry-id="${entry.id}"
      >
         <span class="history-entry__expression block">
         <strong>expression</strong>: ${prepareExpressionForPresentation(formatNumbers(entry.expression))}
         </span>
         <span class="history-entry__result block mt-1">
         <strong>result</strong>: ${entry.result.toLocaleString()}
         </span>
      </button>
   `;
}
export function renderHistoryMenuListItem(entry) {
    return `<li role="none">${renderHistoryEntry(entry)}</li>`;
}
export function renderHistoryEntries(entries) {
    return entries.map(renderHistoryMenuListItem).join("");
}
export function prepareExpressionForPresentation(exp) {
    return exp
        .replace(/([-+÷x^%])/g, `<span class="operator fw-800">$&</span>`)
        .replace(/[()]/g, `<span class="paren fw-800">$&</span>`);
}
