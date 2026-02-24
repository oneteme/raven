import { detectNavigation } from "../../utils/raven-utils";
import { toggleListener } from "../../utils/ravents";
import { getMode, getState, isManual, isOnSession, isPassive, isRecording, isReplaying } from "../../settings";
import { examplesContainer, toggleButton } from "./replay";
import { modeMenu } from "./menu";
import { addRecordedUrl, recordedUrlsContainer } from "./record";
import { createDiv } from "../../utils/widgets";

let panelHoverTimeOut,
    panelHideTimer = 600;

export const indicator = createIndicator(),
    modeHeader = createModeHeader(),
    panel = createPanel();

// EVENTS
toggleListener((e) => panelHideTimer = e.detail.panelHideTimer);
// WIDGETS HELPERS
function createIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'raven-indicator raven-indicator--passive';

    const content = document.createElement('div');
    content.className = 'raven-indicator__content';

    const dot = document.createElement('div');
    dot.className = 'raven-indicator__dot';

    const bigLetter = document.createElement('div');
    bigLetter.className = 'raven-indicator__big-letter';
    bigLetter.textContent = 'R';

    const textStack = document.createElement('div');
    textStack.className = 'raven-indicator__text-stack';

    const topText = document.createElement('div');
    topText.className = 'raven-indicator__top-text';
    topText.textContent = 'RAVEN';

    const bottomText = document.createElement('div');
    bottomText.className = 'raven-indicator__bottom-text';
    bottomText.textContent = 'AVEN';

    textStack.appendChild(topText);
    textStack.appendChild(bottomText);

    content.appendChild(dot);
    content.appendChild(bigLetter);
    content.appendChild(textStack);

    indicator.appendChild(content);
    indicator.addEventListener('mouseenter', () => {
        panel.classList.add('raven-panel--visible');
        panel.classList.remove('raven-panel--hidden');
        indicator.style.display = 'none';
    });

    return indicator;
}

function createModeHeader() {
    const header = createDiv('raven-mode-header raven-mode-header--manual');
    header.textContent = 'Manual Mode';
    return header;
}

function createPanel() {
    const panel = document.createElement('div');
    panel.className = 'raven-panel';

    // Keep panel open when hovering over it
    panel.addEventListener('mouseenter', () => {
        panelHoverTimeOut = clearTimeout(panelHoverTimeOut)
        panelHideTimer = 600
        indicator.style.display = 'none';
        panel.classList.add('raven-panel--visible');
        panel.classList.remove('raven-panel--hidden');
    });

    // Hide panel when leaving both indicator and panel
    panel.addEventListener('mouseleave', () => {
        panelHoverTimeOut = setTimeout(() => {
            panel.classList.remove('raven-panel--visible');
            panel.classList.add('raven-panel--hidden');
            indicator.style.display = 'flex';
            indicator.style.opacity = '1';
        }, panelHideTimer);
    });
    // panel.appendChild(recordPill)
    panel.appendChild(modeHeader)
    return panel;
}

// HELPER RAVEN FUNCTIONS
function setMode() {
    // Update mode header
    modeHeader.className = `raven-mode-header raven-mode-header--${getMode()}`;
    modeHeader.textContent = isManual() ? 'Manual Mode' : 'Auto Mode';

    // Update panel style
    panel.classList.remove('raven-panel--manual', 'raven-panel--auto');
    panel.classList.add(`raven-panel--${getMode()}`);
}

function setState() {
    // Update indicator
    indicator.className = `raven-indicator raven-indicator--${getState()}`;

    // Update indicator text
    const topText = indicator.querySelector('.raven-indicator__top-text');
    const bottomText = indicator.querySelector('.raven-indicator__bottom-text');

    if (isPassive()) {
        topText.textContent = 'RAVEN';
        bottomText.textContent = 'AVEN';
        panel.appendChild(modeMenu)
    } else if (isRecording()) {
        topText.textContent = 'AVEN';
        bottomText.textContent = 'ECORD';
        startRecord();
    } else if (isReplaying()) {
        topText.textContent = 'AVEN';
        bottomText.textContent = 'EPLAY';
        if (isOnSession()) {

        } else {
            panel.appendChild(toggleButton);
            panel.appendChild(examplesContainer);
        }
    }
}

function startRecord() {
    detectNavigation(() => { addRecordedUrl(location.hash, document.title) });
    panel.appendChild(recordedUrlsContainer);
    setTimeout(() => {
        addRecordedUrl(location.hash, document.title)
    }, 1000);
    
}
function startReplay() {

}

setMode();
setState();

