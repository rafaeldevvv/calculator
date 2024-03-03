import { formatNumbers } from "./utils.js";
export function renderHistoryListItem(entry) {
    const { id, expression, result } = entry;
    return `
    <li class="history-entry rounded text-primary px-2 p-0.5 bg-secondary js-history-entry" data-entry-id="${id}">
      <button class="js-entry-exp history-entry__expression hover:bg-darker block text-left capitalize p-1 rounded">exp: ${prepareExpressionForPresentation(formatNumbers(expression))}</button>
      <div class="flex">
        <button class="js-entry-res history-entry__result hover:bg-darker block text-left capitalize p-1 rounded">res: ${formatNumbers(result.toString())}</button>
        <button 
          title="Delete entry"
          aria-label="Delete entry"
          class="js-entry-del text-primary fs-300 js-remove-entry-btn hover:bg-darker p-1 rounded text-right uppercase"
        >
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </li>
  `;
}
export function renderHistoryList(entries) {
    return `
    <ul
      id="history-menu"
      aria-labelledby="history-heading"
      aria-describedby="history-description"
      class="history-list flow"
    >${renderHistoryEntries(entries)}</ul>
  `;
}
export function renderHistoryEntries(entries) {
    return entries.map(renderHistoryListItem).join("");
}
export function prepareExpressionForPresentation(exp) {
    return exp
        .replace(/([-+÷x^%])/g, `<span class="operator fw-800">$&</span>`)
        .replace(/[()]/g, `<span class="paren fw-800">$&</span>`);
}
