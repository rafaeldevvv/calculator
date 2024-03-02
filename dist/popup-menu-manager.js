function positionPopover(popover, positionTargetElement) {
    const { top, left } = positionTargetElement.getBoundingClientRect();
    popover.style.left = left + "px";
    popover.style.top = top + 10 + positionTargetElement.clientHeight + window.scrollY + "px";
}
export default function manageHistoryPopover(popoverToggle) {
    const popoverId = popoverToggle.getAttribute("popovertarget");
    const popover = document.getElementById(popoverId);
    positionPopover(popover, popoverToggle);
    window.addEventListener("resize", () => {
        if (popover.matches(":popover-open")) {
            positionPopover(popover, popoverToggle);
        }
    });
}
