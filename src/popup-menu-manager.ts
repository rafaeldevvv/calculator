function positionPopover(
  popover: HTMLElement,
  positionTargetElement: HTMLElement
) {
  const { top, left } = positionTargetElement.getBoundingClientRect();
  popover.style.left = left + "px";
  popover.style.top = top + 10 + positionTargetElement.clientHeight + window.scrollY + "px";
}

export default function manageHistoryPopover(popoverToggle: HTMLElement) {
  const popoverId = popoverToggle.getAttribute("popovertarget") as string;

  const popover = document.getElementById(popoverId) as HTMLElement;
  positionPopover(popover, popoverToggle);
  window.addEventListener("resize", () => {
    if (popover.matches(":popover-open")) {
      positionPopover(popover, popoverToggle);
    }
  });
}
