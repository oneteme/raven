import { createIconBtn, createJsonFileInput, createTextBtn } from "../utils/raven-utils";
import { recordEvent } from "../utils/ravents";
import { getMode, getState, isManual, isRecording, isReplaying } from "../settings";

let
    panelHoverTimeOut,
    panelHideTimer = 600,
    showExamples = false,
    navigationInterval,
    pages = new Set();

export const indicator = createIndicator(),
    panel = createPanel(),
    modeHeader = createModeHeader(),
    examplesContainer = createExamplesContainer();

const toggleButton = createToggleButton(),
    recordIcon = createRecordIcon(),
    recordBtn = createIconBtn('raven-record-button', recordIcon, () => recordEvent()),
    urlsList = createRecordUrlsList(),
    recordedUrlsContainer = createRecordUrls();

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
        indicator.style.opacity = '0';
    });

    return indicator;
}
function createModeHeader() {
    const header = document.createElement('div');
    header.className = 'raven-mode-header raven-mode-header--manual';
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
        panel.classList.add('raven-panel--visible');
        panel.classList.remove('raven-panel--hidden');
        indicator.style.opacity = '0';
    });

    // Hide panel when leaving both indicator and panel
    panel.addEventListener('mouseleave', () => {
        panelHoverTimeOut = setTimeout(() => {
            panel.classList.remove('raven-panel--visible');
            panel.classList.add('raven-panel--hidden');
            indicator.style.opacity = '1';
        }, panelHideTimer);
    });

    return panel;
}

function createToggleButton() {
    const toggleButton = createTextBtn('raven-toggle-button', 'Show Examples', null, () => {
        showExamples = !showExamples;

        if (showExamples) {
            toggleButton.textContent = 'Hide Examples';
            examplesContainer.classList.add('raven-examples-container--visible');
        } else {
            panelHideTimer = 2400
            toggleButton.textContent = 'Show Examples';
            examplesContainer.classList.remove('raven-examples-container--visible');
        }
    })

    return toggleButton;
}

function createRecordIcon() {
    const recordIcon = document.createElement('div');
    recordIcon.className = 'raven-record-icon';
    return recordIcon;
}

// INFORMATION DURING RECORD
function createRecordUrlsList() {
    const urlsList = document.createElement('div');
    urlsList.className = 'raven-urls-list';
    return urlsList
}

function createRecordUrls() {
    const recordedUrlsContainer = document.createElement('div');
    recordedUrlsContainer.className = 'raven-recorded-urls raven-scroll';

    const recordedUrlsTitle = document.createElement('div');
    recordedUrlsTitle.className = 'raven-recorded-urls__title';
    recordedUrlsTitle.innerHTML = 'Recorded Pages <span id="recordedCount" class="raven-recorded-urls__count">0</span>';

    recordedUrlsContainer.appendChild(recordedUrlsTitle);
    recordedUrlsContainer.appendChild(urlsList);
    return recordedUrlsContainer;
}

function addRecordedUrl(url, title = null) {
    if (!pages.has(url)) {
        pages.add(url)
        const urlItem = document.createElement('div');
        urlItem.className = 'raven-url-item';

        const bullet = document.createElement('div');
        bullet.className = 'raven-url-item__bullet';

        const textContainer = document.createElement('div');
        textContainer.className = 'raven-url-item__text-container';

        if (title) {
            // Show both title and URL
            const titleText = document.createElement('div');
            titleText.className = 'raven-url-item__title';
            titleText.textContent = title;

            const urlText = document.createElement('div');
            urlText.className = 'raven-url-item__url';
            urlText.textContent = url;

            textContainer.appendChild(titleText);
            textContainer.appendChild(urlText);
        } else {
            // Show only URL
            const urlText = document.createElement('div');
            urlText.className = 'raven-url-item__url raven-url-item__url--single';
            urlText.textContent = url;
            textContainer.appendChild(urlText);
        }

        urlItem.appendChild(bullet);
        urlItem.appendChild(textContainer);
        urlsList.appendChild(urlItem);

        // Update counter
        setPageCount(pages.size)
    }
}

function setPageCount(count) {
    const counter = document.getElementById('recordedCount');
    if (counter) {
        counter.textContent = count;
    }
}

// SESSIONS CONTAINER
function createExamplesContainer() {
    const examplesContainer = document.createElement('div');
    examplesContainer.className = 'raven-examples-container raven-scroll';
    return examplesContainer;
}

export function appendExamplesOptions(options = []) {
    const examplesOptions = document.createElement('div');
    examplesOptions.className = 'raven-example-options-section';
    examplesContainer.appendChild(examplesOptions);
    options.forEach(btn => {
        examplesOptions.appendChild(btn)
    });
}

export function createDownloadAllBtn(fn) {
    return createTextBtn('raven-button raven-download-all-content', 'Download All', 'raven-button-text', fn)
}

export function createImportBtn(fn) {
    const fileInput = createJsonFileInput(fn);
    return createTextBtn('raven-button raven-import', '+ Import', 'raven-button-text', () => { fileInput.click(); });
}

// HELPER RAVEN FUNCTIONS
export function setMode() {
    // Update mode header
    modeHeader.className = `raven-mode-header raven-mode-header--${getMode()}`;
    modeHeader.textContent = isManual() ? 'Manual Mode' : 'Auto Mode';

    // Update panel style
    panel.classList.remove('raven-panel--manual', 'raven-panel--auto');
    panel.classList.add(`raven-panel--${getMode()}`);
}

export function setState() {
    // Update indicator
    indicator.className = `raven-indicator raven-indicator--${getState()}`;

    // Update indicator text
    const topText = indicator.querySelector('.raven-indicator__top-text');
    const bottomText = indicator.querySelector('.raven-indicator__bottom-text');

    if (isRecording()) {
        topText.textContent = 'AVEN';
        bottomText.textContent = 'ECORD';
        startRecording();
    } else if (isReplaying()) {
        topText.textContent = 'AVEN';
        bottomText.textContent = 'EPLAY';
        panel.appendChild(toggleButton);
        panel.appendChild(examplesContainer);
    } else {
        topText.textContent = 'RAVEN';
        bottomText.textContent = 'AVEN';
        panel.appendChild(recordBtn)
        panel.appendChild(toggleButton);
        panel.appendChild(examplesContainer);
    }
}

function startRecording() {
    detectNavigation();
    panel.appendChild(recordBtn)
    panel.appendChild(recordedUrlsContainer);
    recordIcon.classList.add('raven-record-icon--recording');
    recordBtn.classList.add('raven-record-button--recording');
    recordedUrlsContainer.classList.add('raven-recorded-urls--visible');
    setTimeout(() => {
        addRecordedUrl(location.hash, document.title)
    }, 1000);
}

function stopRecording() {
    recordIcon.classList.remove('raven-record-icon--recording');
    recordBtn.classList.remove('raven-record-button--recording');
    urlsList.innerHTML = '';
    setPageCount(0);
    stopNavigationDetection();
}

function detectNavigation() {
    let last = location.href;
    navigationInterval = setInterval(async () => {
        if (location.href !== last) {
            last = location.href;
            addRecordedUrl(location.hash, document.title)
        }
    }, 100);
}

function stopNavigationDetection() {
    clearInterval(navigationInterval);
}