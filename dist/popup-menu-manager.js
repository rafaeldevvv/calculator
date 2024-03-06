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
    if (!HTMLElement.prototype.hasOwnProperty("popover")) {
        managePopoverControl(popoverToggle, popover);
    }
}
export function managePopoverControl(popoverToggle, popover) {
    popoverToggle.setAttribute("aria-expanded", "false");
    popover.classList.add("unsupported-popover");
    popover.setAttribute("data-visible", "false");
    popoverToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const isExpanded = popoverToggle.getAttribute("aria-expanded") === "true";
        popoverToggle.setAttribute("aria-expanded", !isExpanded);
        popover.setAttribute("data-visible", !isExpanded);
    });
    window.addEventListener("click", (e) => {
        const isExpanded = popoverToggle.getAttribute("aria-expanded") === "true";
        const { target } = e;
        if (!popover.contains(target) && isExpanded) {
            popoverToggle.setAttribute("aria-expanded", false);
            popover.setAttribute("data-visible", false);
        }
    });
}
