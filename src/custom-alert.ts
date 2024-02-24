export function createAlert(announcement: string) {
  const customAlert = document.createElement("div");
  customAlert.role = "alert";
  customAlert.textContent = announcement;
  return customAlert;
}

let currentTimeout: number | undefined,
  showingAlert = false,
  animationDuration: undefined | null | number;

export default function alertUser(
  announcement: { toString(): string },
  options?: {
    /** How much time the alert remains in the screen. */
    duration: number;
  }
) {
  const { duration = 10000 } = options || {};

  clearTimeout(currentTimeout);
  document.querySelector("[role=alert]")?.remove();

  const customAlert = createAlert(announcement.toString());
  document.body.appendChild(customAlert);
  showingAlert = true;

  animationDuration = Math.min(0.1 * duration, 300);

  const animationOptions = {
    duration: animationDuration,
    iterations: 1,
    fill: "both",
  } as const;

  fadeInDown(customAlert, animationOptions);
  currentTimeout = setTimeout(() => {
    dismiss();
    currentTimeout = undefined;
  }, duration - animationDuration);
}

export function dismiss() {
  if (!showingAlert) return;

  const animationOptions = {
    duration: animationDuration as number,
    iterations: 1,
    fill: "both",
  } as const;

  const customAlert = document.querySelector("[role='alert']") as HTMLElement;

  clearTimeout(currentTimeout);
  currentTimeout = undefined;

  fadeOutUp(customAlert, animationOptions, () => {
    customAlert.remove();
    showingAlert = false;
    animationDuration = undefined;  
  });
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
