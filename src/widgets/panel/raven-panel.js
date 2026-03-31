import * as utils from "../../utils/raven-utils";
import * as ui from "../../utils/widgets";
import * as demo from "./demo";
import * as ravents from "../../utils/ravents";
import { getMode, getState, isActivated, isAuto, isEnabled, isManual, isPassive, isRecording, isReplaying, removeSession, setRavenState } from "../../settings";
import { examplesContainer } from "./replay";
import { modeMenu } from "./menu";
import { rStates } from "../../utils/constants";

export const indicator = createIndicator(),
    modeHeader = createModeHeader('Make your choice'),
    panel = createPanel();


// WIDGETS HELPERS
function createIndicator() {
    const dot = ui.createDiv('raven-indicator__dot'),
        bigLetter = ui.createTextDiv('raven-indicator__big-letter', 'R'),
        topText = ui.createTextDiv('raven-indicator__top-text', 'RAVEN'),
        bottomText = ui.createTextDiv('raven-indicator__bottom-text', 'AVEN'),
        textStack = ui.createDiv('raven-indicator__text-stack', topText, bottomText),
        content = ui.createDiv('raven-indicator__content', dot, bigLetter, textStack),
        indicator = ui.createDiv('raven-indicator raven-indicator--passive', content);
    indicator.addEventListener('mouseenter', () => {
        panel.classList.add('raven-panel--visible');
        panel.classList.remove('raven-panel--hidden');
        indicator.style.display = 'none';
    });

    return indicator;
}

function createModeHeader(text = 'Manual Mode') {
    const title = ui.createDiv('raven-mode-header__title');
    title.textContent = text;
    title.title = text;

    const header = ui.createDiv(`raven-mode-header raven-mode-header--${getState()}`, title);
    if (isManual()) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'raven-mode-header__close';
        closeBtn.title = 'Close';
        closeBtn.appendChild(ui.createDiv('raven-mode-header__close-x'));
        closeBtn.addEventListener('click', () => {
            if (confirm("Exit and deactivate RAVEN?")) {
                removeSession();
                setRavenState(rStates.INACTIVE);
                utils.reloadPage();
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
    const panel = ui.createDiv('raven-panel', modeHeader);

    // Keep panel open when hovering over it
    panel.addEventListener('mouseenter', () => {
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
        document.body.appendChild(ui.createDiv('raven-container', panel, indicator));
    }
}

export function showMenu(fileZoneEvent) {
    panel.appendChild(modeMenu)
    panel.appendChild(ui.createJsonZoneFileInput(fileZoneEvent))
}

export function showRecord() {
    panel.appendChild(demo.demoNav);
    utils.detectNavigation(() => { demo.addPage(location.hash != "" ? location.hash : location.href, document.title) }, 100);
    setTimeout(() => {
        console.warn("current hash : ", location.hash)
        ravents.demoEvent();
        demo.addPage(location.hash != "" ? location.hash : location.href, document.title)
    }, 1500);

    setHeaderText("Recording session...");
    const abandonBtn = ui.createTextBtn('raven-button error', "Abandon", "raven-button-text", () => {
        if (confirm("Discard this navigation?")) {
            setRavenState(rStates.PASSIVE);
            utils.reloadPage();
        }
    }),
        saveBtn = ui.createTextBtn('raven-button info', "Save", "raven-button-text", () => ravents.recordEvent());
    panel.append(ui.createOptionsContainer(abandonBtn, saveBtn));
}

export function showSessions(donwloadAllEvent) {
    panel.appendChild(examplesContainer);
    setHeaderText(isAuto() ? "Prepared sessions for you" : "Your recorded Sessions");
    if (isManual()) {
        const exitBtn = ui.createTextBtn('raven-button error', "Back", "raven-button-text", () => ravents.replayEvent()),
            downloadAllBtn = ui.createTextBtn('raven-button info', "Download All", "raven-button-text", donwloadAllEvent);
        panel.appendChild(ui.createOptionsContainer(exitBtn, downloadAllBtn));
    }
    ravents.fetchSessions();
}

export function startReplay(downloadSessionEvent) {
    panel.appendChild(demo.demoNav);
    ravents.replaySession();
    const exitBtn = ui.createTextBtn('raven-button error', "Back", "raven-button-text", () => { removeSession(); utils.reloadPage(); }),
        downloadBtn = ui.createTextBtn('raven-button info', "Download", "raven-button-text", downloadSessionEvent);
    if (isManual()) {
        panel.appendChild(ui.createOptionsContainer(exitBtn, downloadBtn));
    } else {
        panel.appendChild(ui.createOptionsContainer(exitBtn));
    }
}

setupPanelMode();
setupIndicatorState();

