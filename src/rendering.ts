import type { HistoryEntry } from "./types";
import { formatNumbers } from "./utils.js";

export function renderHistoryListItem(entry: HistoryEntry) {
  const { id, expression, result } = entry;
  return `
    <li class="history-entry rounded text-primary px-2 p-0.5 bg-secondary js-history-entry" data-entry-id="${id}">
      <button 
        class="js-entry-exp history-entry__expression hover:bg-darker block text-left capitalize p-1 rounded" 
        type="button"
      >
      exp: ${prepareExpressionForPresentation(formatNumbers(expression))}
      </button>
      <div class="flex">
        <button 
          class="js-entry-res history-entry__result hover:bg-darker block text-left capitalize p-1 rounded" 
          type="button"
        >
        res: ${formatNumbers(result.toString())}
        </button>
        <button 
          type="button"
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

export function renderHistoryCount(count: number) {
  return `<p id="history-count" class="fw-600 mt-3 mb-1">${count} calculation${
    count === 1 ? "" : "s"
  } stored:</p>`;
}

export function renderHistoryControls(
  numOfEntries: number,
  numOfShownEntries: number,
  least: number
) {
  const disableSeeMore = numOfEntries <= numOfShownEntries,
    disableSeeLess = numOfShownEntries === least;

  return `
    <div class="js-history-ctrls flex mt-3 gap-x-1 fs-300">
      <button 
        type="button" 
        class="js-see-more-btn history-ctrl block rounded-full aspect-square p-1 disabled:translucent"
        aria-label="See more"
        ${disableSeeMore ? "disabled" : ""}
      >
        <i class="fa-solid fa-plus"></i>
      </button>
      <button 
        type="button" 
        class="js-clear-btn history-ctrl w-full block rounded-full p-1 disabled:translucent"
      >
        Clear history
      </button>
      <button 
        type="button" 
        class="js-see-less-btn history-ctrl block rounded-full aspect-square p-1 disabled:translucent"
        aria-label="See less"
        ${disableSeeLess ? "disabled" : ""}
      >
        <i class="fa-solid fa-minus"></i>
      </button>
    </div>
  `;
}

export function renderHistoryList(entries: HistoryEntry[]) {
  return `
    <ul
      id="history-menu"
      aria-labelledby="history-heading"
      aria-describedby="history-description"
      class="history-list flow"
      aria-live="polite"
    >${renderHistoryEntries(entries)}</ul>
  `;
}

export function renderHistoryEntries(entries: HistoryEntry[]) {
  return entries.map(renderHistoryListItem).join("");
}

export function prepareExpressionForPresentation(exp: string) {
  return exp
    .replace(/([-+÷x^%])/g, `<span class="operator fw-800">$&</span>`)
    .replace(/[()]/g, `<span class="paren fw-800">$&</span>`);
}
