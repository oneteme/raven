import { isManual } from "../../settings";
import { createJsonFileInput, createTextBtn, detectNavigation } from "../../utils/raven-utils";
import { demoListener, replayEvent, toggleEvent } from "../../utils/ravents";

let showExamples = false;
export const demoNav = createDemoNav(),
    examplesContainer = createExamplesContainer(),
    toggleButton = createToggleButton();

// DEMO NAVIGATION WIDGET
function createDemoNav() {
    const nav = document.createElement('div');
    nav.className = 'raven-demo-nav';

    // Header: session title + menu toggle btn
    const header = document.createElement('div');
    header.className = 'raven-demo-nav__header';

    const sessionTitle = document.createElement('div');
    sessionTitle.className = 'raven-demo-nav__session-title';

    header.appendChild(sessionTitle);
    if (isManual()) {
        // Close button
        header.appendChild(createTextBtn('raven-demo-nav__close-btn', 'Exit Demo', null, () => replayEvent()))

    }
    // Dropdown: all pages list
    const dropdown = document.createElement('div');
    dropdown.className = 'raven-demo-nav__dropdown';

    nav.appendChild(header);
    nav.appendChild(dropdown);

    demoListener((e) => {
        openDemoNav(e.detail.sessionData)
    });

    return nav;
}

function openDemoNav(sessionData) {
    const { title, pages, currentPageIndex } = sessionData;

    // Update session title
    const sessionTitle = demoNav.querySelector('.raven-demo-nav__session-title');
    sessionTitle.textContent = title || 'Demo Session';

    detectNavigation(() => { updateDemoNavPage(pages, currentPageIndex) })
    updateDemoNavPage(pages, currentPageIndex)
    // Show widget
    demoNav.classList.add('raven-demo-nav--visible');
}

function updateDemoNavPage(pages, currentPageIndex) {
    const dropdown = demoNav.querySelector('.raven-demo-nav__dropdown');

    // Populate dropdown
    dropdown.innerHTML = '';
    pages.forEach((page, index) => {
        const item = document.createElement('div');
        item.className = 'raven-demo-nav__dropdown-item';

        if (window.location.href == page.route) {
            item.classList.add('raven-demo-nav__dropdown-item--active');
        }

        const number = document.createElement('div');
        number.className = 'raven-demo-nav__dropdown-number';
        number.textContent = `${index + 1}`;

        const title = document.createElement('div');
        title.className = 'raven-demo-nav__dropdown-title';
        title.textContent = page.title || `Page ${index + 1}`;

        item.appendChild(number);
        item.appendChild(title);

        if (index !== currentPageIndex) {
            item.addEventListener('click', () => {
                window.location.href = page.route
            });
        }
        dropdown.appendChild(item);
    });
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
    return createTextBtn('raven-button raven-download-all-content', 'Download All', 'raven-button-text', fn);
}

export function createImportBtn(fn) {
    const fileInput = createJsonFileInput(fn);
    return createTextBtn('raven-button raven-import', '+ Import', 'raven-button-text', () => { fileInput.click(); });
}

function createToggleButton() {
    const toggleButton = createTextBtn('raven-toggle-button', 'Show Examples', null, () => {
        showExamples = !showExamples;

        if (showExamples) {
            toggleButton.textContent = 'Hide Examples';
            examplesContainer.classList.add('raven-examples-container--visible');
        } else {
            toggleEvent(2400)
            toggleButton.textContent = 'Show Examples';
            examplesContainer.classList.remove('raven-examples-container--visible');
        }
    })

    return toggleButton;
}