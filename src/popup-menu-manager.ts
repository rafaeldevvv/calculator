function getAriaLabel(elt: HTMLElement) {
  const labellingElementId = elt.getAttribute("aria-labelledby") || "",
    labellingContent = document.querySelector(
      "#" + labellingElementId
    )?.textContent;

  let label: string;
  if (labellingContent != null) {
    label = labellingContent;
  } else {
    label = elt.getAttribute("aria-label") as string;
  }

  return label;
}

function lastIndex(arr: any[]) {
  return arr.length - 1;
}

export default function managePopupMenu(parent: HTMLElement) {
  const menu = parent.querySelector("[role=menu]") as HTMLElement,
    toggleBtn = (parent.querySelector("button") ||
      parent.querySelector("[role=button]")) as HTMLElement;

  let items = Array.from(
    menu.querySelectorAll("[role=menuitem]")
  ) as HTMLElement[];

  const menuLabel = getAriaLabel(menu);
  const mutatedMenuLabel = menuLabel.replace(/ /g, "-").replace(/\W/g, "");

  const itemsIds = items.map((_, index) => `${mutatedMenuLabel}-item-${index}`);
  items.forEach((item, index) => {
    item.id = itemsIds[index];
  });

  let focusedItemIndex: null | number = null,
    open = toggleBtn.getAttribute("aria-expanded") === "true";

  const mutationObserver = new MutationObserver(() => {
    items = Array.from(menu.querySelectorAll("[role=menuitem]"));
  });

  mutationObserver.observe(menu, { subtree: true, childList: true });

  function focusItem(itemIndex: number) {
    const item = items[itemIndex];
    item.focus();
    focusedItemIndex = itemIndex;
    menu.setAttribute("aria-activedescendant", item.id);
  }

  function toggleMenu() {
    if (open) {
      closeMenu();
    } else {
      openMenu();
      focusItem(0);
    }
  }

  function handleClickOnDocument(e: Event) {
    const target = e.target as HTMLElement;

    if (
      target !== toggleBtn.nextElementSibling &&
      !toggleBtn.nextElementSibling!.contains(target as HTMLElement)
    ) {
      closeMenu();
    }
  }

  function openMenu() {
    toggleBtn.ariaExpanded = "true";
    items.forEach((item) => item.addEventListener("click", closeMenu));
    open = true;
    setTimeout(
      /* the event is immediately fired when the event listener is assigned,
      so the delay of 0 ms prevents that from happening (i know zero means no delay but the 
      asynchronous model of js helps here) */
      () => window.addEventListener("click", handleClickOnDocument),
      0
    );
  }

  function closeMenu() {
    items.forEach((item) => item.removeEventListener("click", closeMenu));
    menu.removeAttribute("aria-activedescendant");
    toggleBtn.ariaExpanded = "false";
    window.removeEventListener("click", handleClickOnDocument);
    open = false;
  }

  function handleKeyboardInteraction(e: KeyboardEvent) {
    const { key, shiftKey } = e;
    if (open) {
      switch (key) {
        case "ArrowUp": {
          e.preventDefault();
          focusedItemIndex = focusedItemIndex as number;

          const previousItemId =
            focusedItemIndex - 1 === -1
              ? lastIndex(items)
              : focusedItemIndex - 1;
          focusItem(previousItemId);

          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          focusedItemIndex = focusedItemIndex as number;

          const nextItemId =
            focusedItemIndex + 1 === lastIndex(items) + 1
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
          } else {
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
    } else {
      if (key === "ArrowUp") {
        openMenu();
        focusItem(lastIndex(items));
        handleFocus();
      } else if (key === "ArrowDown") {
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
