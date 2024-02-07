export function createAlert(announcement) {
    const customAlert = document.createElement("div");
    customAlert.role = "alert";
    customAlert.textContent = announcement;
    return customAlert;
}
let currentTimeout;
export default function announce(announcement, options) {
    var _a;
    const { time = 15000 } = options || {};
    clearTimeout(currentTimeout);
    (_a = document.querySelector("[role=alert]")) === null || _a === void 0 ? void 0 : _a.remove();
    const customAlert = createAlert(announcement.toString());
    document.body.appendChild(customAlert);
    const animationOptions = {
        duration: 0.05 * time,
        iterations: 1,
        fill: "both",
    };
    fadeInDown(customAlert, animationOptions);
    currentTimeout = setTimeout(() => {
        fadeOutUp(customAlert, animationOptions, () => {
            customAlert.remove();
        });
        currentTimeout = undefined;
    }, time * 0.8);
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
