import { exportSession, getCategoryById, getRouteBySessionId } from "../../db/raven-dao";
import { isManual, ravenLog, setRavenSession } from "../../settings";
import { downloadJson, generateJsonName, reloadPage } from "../../utils/raven-utils";
import { recordEvent } from "../../utils/ravents";
import { createDiv, createDownloadBtn, createJsonFileInput, createSpan, createTextBtn, createTextDiv, displayNextSiblings } from "../../utils/widgets";

export const examplesContainer = createExamplesContainer(),
    emptyStateContainer = createEmptyState();


// SESSIONS CONTAINER
export function createDownloadSessionBtn(session) {
    return createDownloadBtn('raven-session-item__download-btn', (e) => {
        e.stopPropagation();
        exportSession(session).then(exportedJson => {
            const jsonName = generateJsonName(exportedJson.title);
            downloadJson(exportedJson, jsonName)
        })
    });
}

export function createSession(session) {
    const titleEl = createTextDiv('raven-session-item__title', session.title),
        descEl = createTextDiv('raven-session-item__description', session.description),
        item = createDiv('raven-session-item', titleEl, descEl);

    if (isManual()) {
        const downloadBtn = createDownloadSessionBtn(session);
        item.appendChild(downloadBtn);
    }
    item.addEventListener('click', () => {
        getRouteBySessionId(session.id).then(sessionRoute => {
            if (sessionRoute) {
                setRavenSession(session.id)
                setTimeout(() => {
                    window.location.href = sessionRoute.route;
                    reloadPage();
                }, 200);
            } else {
                ravenLog("route not found")
            }
        })
    });
    if (session.category) {
        getCategoryById(session.category).then(category => {
            item.style.display = "none"
            setupSessionCategory(category.name).then(categoryDiv => categoryDiv.appendChild(item));
            ravenLog("found CATEGORY in SESSION", category)
        }).catch(err => {
            ravenLog("NO CATEGORY FOUND")
            examplesContainer.append(item)
        });
    } else {
        examplesContainer.append(item)
    }
    return item
}

function setupSessionCategory(categoryName) {
    return new Promise(res => {
        let div = document.querySelector(`[category="${categoryName}"]`);
        if (!div) {
            div = createCategoryAccordion(categoryName)
            res(div)
        }
        res(div)
    })
}

function createCategoryAccordion(categoryName) {
    const title = createTextDiv('raven-category-header__title', categoryName),
        icon = createSpan('raven-category-header__icon', '▶'),
        // Header
        header = createDiv('raven-category-header', title, icon);

    // Toggle accordion
    header.addEventListener('click', () => {
        const isExpanded = header.classList.contains('raven-category-header--expanded');
        if (isExpanded) {
            header.classList.remove('raven-category-header--expanded');
            displayNextSiblings(header, "none")
        } else {
            header.classList.add('raven-category-header--expanded');
            displayNextSiblings(header, "block")
        }
    });
    const accordion = createDiv('raven-category-accordion', header);
    accordion.setAttribute("category", categoryName);
    examplesContainer.appendChild(accordion);
    return accordion;
}

function createExamplesContainer() {
    const examplesContainer = document.createElement('div');
    examplesContainer.className = 'raven-examples-container raven-scroll';
    return examplesContainer;
}

function createEmptyState() {
    const line = createDiv('raven-empty-line')
    line.textContent = 'No sessions found.';
    const wrapper = createDiv('raven-empty-state', line);

    if (isManual()) {
        const recordBtn = createTextBtn('raven-empty-record', 'Record Session', null, () => recordEvent());
        wrapper.appendChild(recordBtn);
    }
    return wrapper;
}

export function createDownloadAllBtn(fn) {
    return createTextBtn('raven-button raven-download-all-content', 'Download All', 'raven-button-text', fn);
}

export function createImportBtn(fn) {
    const fileInput = createJsonFileInput(fn);
    return createTextBtn('raven-button raven-import', '+ Import', 'raven-button-text', () => { fileInput.click(); });
}