function positionPopover(popover, positionTarget) {
    const { top, left } = positionTarget.getBoundingClientRect();
    popover.style.left = left + "px";
    popover.style.top = top + 10 + positionTarget.clientHeight + "px";
}
export default function manageHistoryPopover(popoverToggle) {
    const popoverId = popoverToggle.getAttribute("popovertarget");
    const popover = document.getElementById(popoverId);
    positionPopover(popover, popoverToggle);
    window.addEventListener("resize", () => {
        positionPopover(popover, popoverToggle);
    });
}
