import { detectNavigation, reloadPage } from "../../utils/raven-utils";
import { getMode, getState, isManual, isOnSession, isPassive, isRecording, isReplaying, removeSession, setRavenState } from "../../settings";
import { examplesContainer } from "./replay";
import { modeMenu } from "./menu";
import { addRecordedUrl, recordedUrlsContainer } from "./record";
import { createDiv } from "../../utils/widgets";
import { rStates } from "../../utils/constants";
import { addPage, demoNav } from "./demo";

let panelHoverTimeOut;

export const indicator = createIndicator(),
    modeHeader = createModeHeader('Make your choice choice 1 choice 2 choice 3 choice 4'),
    panel = createPanel();


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
    // corner brackets
    ['tl', 'tr', 'bl', 'br'].forEach(pos => {
        const c = createDiv(`raven-mode-header__corner raven-mode-header__corner--${pos}`);
        header.appendChild(c);
    });
    return header;
}

export function setHeaderText(text) {
    const title = modeHeader.querySelector('.raven-mode-header__title');
    title.textContent = text;
    title.title = text
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
    // panel.addEventListener('mouseleave', () => {
    //     panelHoverTimeOut = setTimeout(() => {
    //         panel.classList.remove('raven-panel--visible');
    //         panel.classList.add('raven-panel--hidden');
    //         indicator.style.display = 'flex';
    //         indicator.style.opacity = '1';
    //     }, panelHideTimer);
    // });
    panel.appendChild(modeHeader)
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
    panel.appendChild(recordedUrlsContainer);
    setTimeout(() => {
        addRecordedUrl(location.hash, document.title)
    }, 1000);

}

function startReplay() {
    panel.appendChild(demoNav);
    // detectNavigation(() => { addPage(location.hash, document.title) });
}

setMode();
setState();

