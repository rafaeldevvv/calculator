function positionPopover(
  popover: HTMLElement,
  positionTargetElement: HTMLElement
) {
  const { top, left, height } = positionTargetElement.getBoundingClientRect();
  popover.style.left = left + 10 + "px";
  popover.style.top = top + height + "px";
}

export default function manageHistoryPopover(
  popoverToggle: HTMLElement,
  positionTarget: HTMLElement
) {
  const popoverId = popoverToggle.getAttribute("popovertarget") as string;

  const popover = document.getElementById(popoverId) as HTMLElement;
  positionPopover(popover, positionTarget);
  window.addEventListener("resize", () => {
    positionPopover(popover, positionTarget);
  });
  window.addEventListener("scroll", () => {
    positionPopover(popover, positionTarget);
  });
  if (!HTMLElement.prototype.hasOwnProperty("popover")) {
    managePopoverControl(popoverToggle, popover);
  }
}

export function managePopoverControl(
  popoverToggle: HTMLElement,
  popover: HTMLElement
) {
  popoverToggle.setAttribute("aria-expanded", "false");
  popover.classList.add("unsupported-popover");
  popover.setAttribute("data-visible", "false");
  popoverToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isExpanded = popoverToggle.getAttribute("aria-expanded") === "true";
    popoverToggle.setAttribute("aria-expanded", !isExpanded as any as string);
    popover.setAttribute("data-visible", !isExpanded as any as string);
  });
  window.addEventListener("click", (e) => {
    const isExpanded = popoverToggle.getAttribute("aria-expanded") === "true";
    const { target } = e;
    if (!popover.contains(target as Node) && isExpanded) {
      popoverToggle.setAttribute("aria-expanded", false as any as string);
      popover.setAttribute("data-visible", false as any as string);
    }
  });
}
