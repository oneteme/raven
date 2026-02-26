import { recordEvent } from "../../utils/ravents";
import { createDiv, createJsonFileInput, createTextBtn } from "../../utils/widgets";

export const examplesContainer = createExamplesContainer(),
    emptyStateContainer = createEmptyState();


// SESSIONS CONTAINER
function createExamplesContainer() {
    const examplesContainer = document.createElement('div');
    examplesContainer.className = 'raven-examples-container raven-scroll';
    return examplesContainer;
}

function createEmptyState() {
    const line = createDiv('raven-empty-line')
    line.textContent = 'No sessions found.';

    const recordBtn = createDiv('raven-empty-record')
    recordBtn.textContent = 'Record Session';
    recordBtn.addEventListener('click', () => { recordEvent() });

    const wrapper = createDiv('raven-empty-state', line, recordBtn)
    return wrapper;
}

export function createDownloadAllBtn(fn) {
    return createTextBtn('raven-button raven-download-all-content', 'Download All', 'raven-button-text', fn);
}

export function createImportBtn(fn) {
    const fileInput = createJsonFileInput(fn);
    return createTextBtn('raven-button raven-import', '+ Import', 'raven-button-text', () => { fileInput.click(); });
}