export function createAlert(announcement: string) {
  const customAlert = document.createElement("div");
  customAlert.role = "alert";
  customAlert.textContent = announcement;
  return customAlert;
}

let currentTimeout: number | undefined;

export default function announce(
  announcement: { toString(): string },
  options?: {
    /** How much time the alert remains in the screen. */
    time: number;
  }
) {
  const { time = 12000 } = options || {};

  clearTimeout(currentTimeout);
  document.querySelector("[role=alert]")?.remove();

  const customAlert = createAlert(announcement.toString());
  document.body.appendChild(customAlert);

  const animationDuration = Math.min(0.1 * time, 300);

  const animationOptions = {
    duration: animationDuration,
    iterations: 1,
    fill: "both",
  } as const;

  fadeInDown(customAlert, animationOptions);
  currentTimeout = setTimeout(() => {
    fadeOutUp(customAlert, animationOptions, () => {
      customAlert.remove();
    });
    currentTimeout = undefined;
  }, time - animationDuration);
}

function fadeInDown(element: HTMLElement, options?: KeyframeAnimationOptions) {
  element.animate(
    [
      { opacity: 0, top: "-3.5rem" },
      { opacity: 1, top: "1.5rem" },
    ],
    options
  );
}

function fadeOutUp(
  element: HTMLElement,
  options?: KeyframeAnimationOptions,
  callback?: () => void
) {
  const fadeOut = element.animate(
    [
      { opacity: 1, top: "1.5rem" },
      { opacity: 0, top: "-3.5rem" },
    ],
    options
  );
  if (callback) fadeOut.onfinish = callback;
}
