export function createAlert(announcement) {
    const customAlert = document.createElement("div");
    customAlert.role = "alert";
    customAlert.textContent = announcement;
    return customAlert;
}
let currentTimeout, showingAlert = false, animationDuration;
export default function alertUser(announcement, options) {
    var _a;
    const { duration = 10000 } = options || {};
    clearTimeout(currentTimeout);
    (_a = document.querySelector("[role=alert]")) === null || _a === void 0 ? void 0 : _a.remove();
    const customAlert = createAlert(announcement.toString());
    document.body.appendChild(customAlert);
    showingAlert = true;
    animationDuration = Math.min(0.1 * duration, 300);
    const animationOptions = {
        duration: animationDuration,
        iterations: 1,
        fill: "both",
    };
    fadeInDown(customAlert, animationOptions);
    currentTimeout = setTimeout(() => {
        dismiss();
        currentTimeout = undefined;
    }, duration - animationDuration);
}
let dismissing = false;
export function dismiss() {
    if (!showingAlert || dismissing)
        return;
    const animationOptions = {
        duration: animationDuration,
        iterations: 1,
        fill: "both",
    };
    const customAlert = document.querySelector("[role='alert']");
    clearTimeout(currentTimeout);
    currentTimeout = undefined;
    dismissing = true;
    fadeOutUp(customAlert, animationOptions, () => {
        customAlert.remove();
        showingAlert = false;
        dismissing = false;
        animationDuration = undefined;
    });
}
function fadeInDown(element, options) {
    element.animate([
        { opacity: 0, top: "-3.5rem" },
        { opacity: 1, top: "1.5rem" },
    ], options);
}
function fadeOutUp(element, options, callback) {
    const fadeOut = element.animate([
        { opacity: 1, top: "1.5rem" },
        { opacity: 0, top: "-3.5rem" },
    ], options);
    if (callback)
        fadeOut.onfinish = callback;
}
