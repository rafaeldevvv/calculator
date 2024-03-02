function positionPopover(popover, positionTargetElement) {
    const { top, left, height } = positionTargetElement.getBoundingClientRect();
    popover.style.left = left + "px";
    popover.style.top = top + 10 + height + window.scrollY + "px";
}
export default function manageHistoryPopover(popoverToggle) {
    const popoverId = popoverToggle.getAttribute("popovertarget");
    const popover = document.getElementById(popoverId);
    positionPopover(popover, popoverToggle);
    window.addEventListener("resize", () => {
        positionPopover(popover, popoverToggle);
    });
}
