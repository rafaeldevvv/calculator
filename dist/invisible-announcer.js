const host = document.createElement("visually-hidden-announcer");
const shadow = host.attachShadow({ mode: "open" });
const visuallyHiddenStyles = {
    clip: "rect(1px, 1px, 1px, 1px)",
    "clip-path": "inset(50%)",
    height: "1px",
    width: "1px",
    margin: -"1px",
    overflow: "hidden",
    padding: "0",
    position: "absolute",
};
const assertiveAnnouncer = document.createElement("div");
assertiveAnnouncer.ariaLive = "assertive";
assertiveAnnouncer.ariaAtomic = "true";
const politeAnnouncer = document.createElement("div");
politeAnnouncer.ariaLive = "polite";
politeAnnouncer.ariaAtomic = "true";
Object.assign(assertiveAnnouncer.style, visuallyHiddenStyles);
Object.assign(politeAnnouncer.style, visuallyHiddenStyles);
host.style.position = "absolute";
shadow.appendChild(assertiveAnnouncer);
shadow.appendChild(politeAnnouncer);
document.body.appendChild(host);
export function announcePolitely(announcement) {
    politeAnnouncer.textContent = announcement.toString();
}
export function announceAssertively(announcement) {
    assertiveAnnouncer.textContent = announcement.toString();
}
