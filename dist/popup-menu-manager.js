function getAriaLabel(elt) {
    var _a;
    const labellingElementId = elt.getAttribute("aria-labelledby") || "", labellingContent = (_a = document.querySelector("#" + labellingElementId)) === null || _a === void 0 ? void 0 : _a.textContent;
    let label;
    if (labellingContent != null) {
        label = labellingContent;
    }
    else {
        label = elt.getAttribute("aria-label");
    }
    return label;
}
function lastIndex(arr) {
    return arr.length - 1;
}
export default function managePopupMenu(parent) {
    const menu = parent.querySelector("[role=menu]"), toggleBtn = (parent.querySelector("button") ||
        parent.querySelector("[role=button]"));
    let items = Array.from(menu.querySelectorAll("[role=menuitem]"));
    const menuLabel = getAriaLabel(menu);
    const mutatedMenuLabel = menuLabel.replace(/ /g, "-").replace(/\W/g, "");
    const itemsIds = items.map((_, index) => `${mutatedMenuLabel}-item-${index}`);
    items.forEach((item, index) => {
        item.id = itemsIds[index];
    });
    let focusedItemIndex = null, open = toggleBtn.getAttribute("aria-expanded") === "true";
    const mutationObserver = new MutationObserver(() => {
        items = Array.from(menu.querySelectorAll("[role=menuitem]"));
    });
    mutationObserver.observe(menu, { subtree: true, childList: true });
    function focusItem(itemIndex) {
        const item = items[itemIndex];
        item.focus();
        focusedItemIndex = itemIndex;
        menu.setAttribute("aria-activedescendant", item.id);
    }
    function toggleMenu() {
        if (open) {
            closeMenu();
        }
        else {
            openMenu();
            focusItem(0);
        }
    }
    function handleClickOnDocument(e) {
        const target = e.target;
        if (target !== toggleBtn.nextElementSibling &&
            !toggleBtn.nextElementSibling.contains(target)) {
            closeMenu();
        }
    }
    function openMenu() {
        toggleBtn.ariaExpanded = "true";
        items.forEach((item) => item.addEventListener("click", closeMenu));
        open = true;
        setTimeout(() => window.addEventListener("click", handleClickOnDocument), 0);
    }
    function closeMenu() {
        items.forEach((item) => item.removeEventListener("click", closeMenu));
        menu.removeAttribute("aria-activedescendant");
        toggleBtn.ariaExpanded = "false";
        window.removeEventListener("click", handleClickOnDocument);
        open = false;
    }
    function handleKeyboardInteraction(e) {
        const { key, shiftKey } = e;
        if (open) {
            switch (key) {
                case "ArrowUp": {
                    e.preventDefault();
                    focusedItemIndex = focusedItemIndex;
                    const previousItemId = focusedItemIndex - 1 === -1
                        ? lastIndex(items)
                        : focusedItemIndex - 1;
                    focusItem(previousItemId);
                    break;
                }
                case "ArrowDown": {
                    e.preventDefault();
                    focusedItemIndex = focusedItemIndex;
                    const nextItemId = focusedItemIndex + 1 === lastIndex(items) + 1
                        ? 0
                        : focusedItemIndex + 1;
                    focusItem(nextItemId);
                    break;
                }
                case "Tab": {
                    if (shiftKey) {
                        e.preventDefault();
                        closeMenu();
                        toggleBtn.focus();
                    }
                    else {
                        closeMenu();
                    }
                    break;
                }
                case "End": {
                    focusItem(lastIndex(items));
                    e.preventDefault();
                    break;
                }
                case "Home": {
                    focusItem(0);
                    e.preventDefault();
                    break;
                }
                case "Escape": {
                    closeMenu();
                    e.preventDefault();
                    toggleBtn.focus();
                    break;
                }
            }
        }
        else {
            if (key === "ArrowUp") {
                openMenu();
                focusItem(lastIndex(items));
                handleFocus();
            }
            else if (key === "ArrowDown") {
                openMenu();
                focusItem(0);
                handleFocus();
            }
        }
    }
    function handleBlur() {
        if (!parent.contains(document.activeElement)) {
            window.removeEventListener("keydown", handleKeyboardInteraction);
            parent.removeEventListener("blur", handleBlur);
            window.removeEventListener("click", handleClickOnDocument);
        }
    }
    function handleFocus() {
        window.addEventListener("keydown", handleKeyboardInteraction);
        parent.addEventListener("blur", handleBlur);
    }
    toggleBtn.addEventListener("click", toggleMenu);
    toggleBtn.addEventListener("focus", handleFocus);
}
