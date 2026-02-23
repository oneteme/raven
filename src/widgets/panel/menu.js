import { createDiv, createIconBtn, createTextBtn } from "../../utils/raven-utils";


const recordPill = createPill('record-pill', '#cc1111', createIconBtn('raven-record-button', createDiv('raven-record-icon'), () => recordEvent()), "Record", 45),
    demoPill = createPill('replay-pill', '#0c94dd', createIconBtn('raven-record-button', createDiv('raven-record-icon'), () => recordEvent()), "Replay", -45)
export const modeMenu = createMenuContainer();

function createPill(className, color, contentEl, label, rotation = 0) {
    // Compute a darker shade for the bottom capsule half
    const darken = (hex, amt) => {
        const n = parseInt(hex.slice(1), 16);
        const r = Math.max(0, (n >> 16) - amt);
        const g = Math.max(0, ((n >> 8) & 0xff) - amt);
        const b = Math.max(0, (n & 0xff) - amt);
        return `rgb(${r},${g},${b})`;
    };
    const dark = darken(color, 60);

    // Pill capsule
    const topHalf = createDiv('pill-top'),
        shine = createDiv('pill-shine'),
        bottomHalf = createDiv('pill-bottom'),
        contentSlot = createDiv('pill-content', contentEl),
        pillWrap = createDiv('pill-wrap ' + className, topHalf, shine, bottomHalf, contentSlot);
    pillWrap.style.setProperty('--pill-color', color);
    pillWrap.style.setProperty('--pill-glow', color + '88');
    pillWrap.style.setProperty('--pill-top-grad',
        `linear-gradient(145deg, ${color}ee 0%, ${color} 100%)`);
    pillWrap.style.setProperty('--pill-bot-grad',
        `linear-gradient(145deg, ${dark} 0%, ${dark}cc 100%)`);
    pillWrap.style.setProperty('transform', `rotate(${rotation}deg)`);

    // Label below pill
    const pillLabel = createTextBtn('pill-label', label);
    pillLabel.style.setProperty('--pill-color', color);
    // Outer wrapper (holds pill + label together)
    const mount = createDiv('pill-mount', pillWrap, pillLabel);
    return mount;
};

function createMenuContainer() {
    const menu = createDiv("menu-container", demoPill, recordPill);
    return menu;
}