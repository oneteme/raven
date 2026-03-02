import { detectNavigation, reloadPage } from "../../utils/raven-utils";
import { getMode, getState, isManual, isOnSession, isPassive, isRecording, isReplaying, removeSession, setRavenState } from "../../settings";
import { examplesContainer } from "./replay";
import { modeMenu } from "./menu";
import { createDiv, createTextDiv } from "../../utils/widgets";
import { rStates } from "../../utils/constants";
import { addPage, demoNav } from "./demo";
import { demoEvent } from "../../utils/ravents";

let panelHoverTimeOut;

export const indicator = createIndicator(),
    modeHeader = createModeHeader('Make your choice'),
    panel = createPanel();


// WIDGETS HELPERS
function createIndicator() {
    const dot = createDiv('raven-indicator__dot'),
        bigLetter = createTextDiv('raven-indicator__big-letter', 'R'),
        topText = createTextDiv('raven-indicator__top-text', 'RAVEN'),
        bottomText = createTextDiv('raven-indicator__bottom-text', 'AVEN'),
        textStack = createDiv('raven-indicator__text-stack', topText, bottomText),
        content = createDiv('raven-indicator__content', dot, bigLetter, textStack),
        indicator = createDiv('raven-indicator raven-indicator--passive', content);
    indicator.addEventListener('mouseenter', () => {
        panel.classList.add('raven-panel--visible');
        panel.classList.remove('raven-panel--hidden');
        indicator.style.display = 'none';
    });

    return indicator;
}

function createModeHeader(text = 'Manual Mode') {
    const title = createDiv('raven-mode-header__title');
    title.textContent = text;
    title.title = text;

    const header = createDiv(`raven-mode-header raven-mode-header--${getState()}`, title);
    if (isManual()) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'raven-mode-header__close';
        closeBtn.title = 'Close';
        closeBtn.appendChild(createDiv('raven-mode-header__close-x'));
        closeBtn.addEventListener('click', () => {
            if (confirm("Exit and deactivate RAVEN?")) {
                removeSession();
                setRavenState(rStates.INACTIVE);
                reloadPage();
            }
        });
        header.appendChild(closeBtn)
    }
    return header;
}

export function setHeaderText(text) {
    const title = modeHeader.querySelector('.raven-mode-header__title');
    title.textContent = text;
    title.title = text
}

function createPanel() {
    const panel = createDiv('raven-panel', modeHeader);

    // Keep panel open when hovering over it
    panel.addEventListener('mouseenter', () => {
        panelHoverTimeOut = clearTimeout(panelHoverTimeOut)
        panelHideTimer = 600
        indicator.style.display = 'none';
        panel.classList.add('raven-panel--visible');
        panel.classList.remove('raven-panel--hidden');
    });

    // Hide panel when clicking outside
    document.addEventListener('click', (e) => {
        const clickedOutside = !panel.contains(e.target) && !indicator.contains(e.target);

        if (clickedOutside) {
            panel.classList.remove('raven-panel--visible');
            panel.classList.add('raven-panel--hidden');
            indicator.style.display = 'flex';
            indicator.style.opacity = '1';
        }
    });
    return panel;
}

// HELPER RAVEN FUNCTIONS
function setMode() {
    // Update panel style
    panel.classList.remove('raven-panel--manual', 'raven-panel--auto');
    panel.classList.add(`raven-panel--${getMode()}`);
}

function setState() {
    // Update indicator
    indicator.className = `raven-indicator ${getState()}`;

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
            startReplay();
        } else {
            panel.appendChild(examplesContainer);
        }
    }
}

function startRecord() {
    panel.appendChild(demoNav);
    detectNavigation(() => { addPage(location.hash, document.title) });
    setTimeout(() => {
        demoEvent();
        addPage(location.hash, document.title)
    }, 1500);

}

function startReplay() {
    panel.appendChild(demoNav);
    // detectNavigation(() => { addPage(location.hash, document.title) });
}

setMode();
setState();

