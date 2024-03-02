function positionPopover(
  popover: HTMLElement,
  positionTargetElement: HTMLElement
) {
  const { top, left, height } = positionTargetElement.getBoundingClientRect();
  popover.style.left = left + "px";
  popover.style.top = top + 10 + height + window.scrollY + "px";
}

export default function manageHistoryPopover(popoverToggle: HTMLElement) {
  const popoverId = popoverToggle.getAttribute("popovertarget") as string;

  const popover = document.getElementById(popoverId) as HTMLElement;
  positionPopover(popover, popoverToggle);
  window.addEventListener("resize", () => {
    positionPopover(popover, popoverToggle);
  });
}
