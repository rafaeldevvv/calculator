import { lastIndex } from "./utils.js";
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
export default function managePopupMenu(parent) {
    const menu = parent.querySelector("[role=menu]"), toggleBtn = (parent.querySelector("button") ||
        parent.querySelector("[role=button]")), clickableArea = parent.querySelector(".js-menu-clickable-area");
    let items = Array.from(menu.querySelectorAll("[role=menuitem]"));
    const menuLabel = getAriaLabel(menu);
    const mutatedMenuLabel = menuLabel.replace(/ /g, "-").replace(/\W/g, "");
    function generateItemsIds() {
        return items.map((_, index) => `${mutatedMenuLabel}-item-${index}`);
    }
    function setUpItems() {
        const itemsIds = generateItemsIds();
        items.forEach((item, index) => {
            item.tabIndex = -1;
            item.id = itemsIds[index];
        });
    }
    setUpItems();
    let focusedItemIndex = null, open = toggleBtn.getAttribute("aria-expanded") === "true";
    const mutationObserver = new MutationObserver(() => {
        items = Array.from(menu.querySelectorAll("[role=menuitem]"));
        setUpItems();
    });
    mutationObserver.observe(parent, { subtree: true, childList: true });
    function focusItem(itemIndex) {
        const item = items[itemIndex];
        if (!item)
            return;
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
        if (target !== clickableArea &&
            !clickableArea.contains(target)) {
            closeMenu();
        }
    }
    function openMenu() {
        toggleBtn.ariaExpanded = "true";
        items.forEach((item) => {
            item.tabIndex = 0;
            item.addEventListener("click", closeMenu);
        });
        open = true;
        setTimeout(() => window.addEventListener("click", handleClickOnDocument), 0);
        window.addEventListener("keydown", handleKeyboardInteractionForOpenMenu);
    }
    function closeMenu() {
        items.forEach((item) => {
            item.tabIndex = -1;
            item.removeEventListener("click", closeMenu);
        });
        menu.removeAttribute("aria-activedescendant");
        toggleBtn.ariaExpanded = "false";
        window.removeEventListener("click", handleClickOnDocument);
        window.removeEventListener("keydown", handleKeyboardInteractionForOpenMenu);
        removeEventListeners();
        open = false;
    }
    function handleKeyboardInteractionForOpenMenu(e) {
        const { key, shiftKey } = e;
        switch (key) {
            case "ArrowUp": {
                e.preventDefault();
                focusedItemIndex = focusedItemIndex;
                const previousItemId = focusedItemIndex - 1 === -1 ? lastIndex(items) : focusedItemIndex - 1;
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
    function handleKeyboardInteractionForClosedMenu(e) {
        const { key } = e;
        if (!open) {
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
    function removeEventListeners() {
        window.removeEventListener("keydown", handleKeyboardInteractionForClosedMenu);
        toggleBtn.removeEventListener("focusout", removeEventListeners);
    }
    function handleFocus() {
        window.addEventListener("keydown", handleKeyboardInteractionForClosedMenu);
        toggleBtn.addEventListener("focusout", removeEventListeners);
    }
    toggleBtn.addEventListener("click", toggleMenu);
    toggleBtn.addEventListener("focus", handleFocus);
}
