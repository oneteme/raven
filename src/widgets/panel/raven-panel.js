import { detectNavigation, reloadPage } from "../../utils/raven-utils";
import { getMode, getState, isActivated, isAuto, isEnabled, isManual, isOnSession, isPassive, isRecording, isReplaying, removeSession, setRavenState } from "../../settings";
import { examplesContainer } from "./replay";
import { modeMenu } from "./menu";
import { createDiv, createJsonZoneFileInput, createOptionsContainer, createTextBtn, createTextDiv } from "../../utils/widgets";
import { rStates } from "../../utils/constants";
import { addPage, demoNav } from "./demo";
import { demoEvent, fetchSessions, recordEvent, replayEvent, replaySession } from "../../utils/ravents";

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
function setupPanelMode() {
    // Update panel style
    panel.classList.remove('raven-panel--manual', 'raven-panel--auto');
    panel.classList.add(`raven-panel--${getMode()}`);
}

function setupIndicatorState() {
    // Update indicator
    indicator.className = `raven-indicator ${getState()}`;

    // Update indicator text
    const topText = indicator.querySelector('.raven-indicator__top-text');
    const bottomText = indicator.querySelector('.raven-indicator__bottom-text');
    if (isEnabled() && isActivated()) {
        if (isPassive()) {
            topText.textContent = 'RAVEN';
            bottomText.textContent = 'AVEN';
        } else if (isRecording()) {
            topText.textContent = 'AVEN';
            bottomText.textContent = 'ECORD';
        } else if (isReplaying()) {
            topText.textContent = 'AVEN';
            bottomText.textContent = 'EPLAY';
        }
        document.body.appendChild(createDiv('raven-container', panel, indicator));
    }
}

export function showMenu(fileZoneEvent) {
    panel.appendChild(modeMenu)
    panel.appendChild(createJsonZoneFileInput(fileZoneEvent))
}
export function showRecord() {
    panel.appendChild(demoNav);
    detectNavigation(() => { addPage(location.hash, document.title) });
    setTimeout(() => {
        demoEvent();
        addPage(location.hash, document.title)
    }, 1500);

    setHeaderText("Recording session...");
    const abandonBtn = createTextBtn('raven-button error', "Abandon", "raven-button-text", () => {
        if (confirm("Discard this navigation?")) {
            setRavenState(rStates.PASSIVE);
            reloadPage();
        }
    }),
        saveBtn = createTextBtn('raven-button info', "Save", "raven-button-text", () => recordEvent());
    panel.append(createOptionsContainer(abandonBtn, saveBtn));
}
export function showSessions(donwloadAllEvent) {
    panel.appendChild(examplesContainer);
    setHeaderText(isAuto() ? "Prepared sessions for you" : "Your recorded Sessions");
    if (isManual()) {
        const exitBtn = createTextBtn('raven-button error', "Back", "raven-button-text", () => replayEvent()),
            downloadAllBtn = createTextBtn('raven-button info', "Download All", "raven-button-text", donwloadAllEvent);
        panel.appendChild(createOptionsContainer(exitBtn, downloadAllBtn));
    }
    fetchSessions();
}
export function startReplay(downloadSessionEvent) {
    panel.appendChild(demoNav);
    replaySession();
    const exitBtn = createTextBtn('raven-button error', "Back", "raven-button-text", () => { removeSession(); reloadPage(); }),
        downloadBtn = createTextBtn('raven-button info', "Download", "raven-button-text", downloadSessionEvent);
    if (isManual()) {
        panel.appendChild(createOptionsContainer(exitBtn, downloadBtn));
    } else {
        panel.appendChild(createOptionsContainer(exitBtn));
    }
}
setupPanelMode();
setupIndicatorState();

