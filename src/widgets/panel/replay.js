import * as ravents from "../../utils/ravents";
import * as ui from "../../utils/widgets";
import { isManual, ravenLog } from "../../settings";
export const examplesContainer = createExamplesContainer(),
    emptyStateContainer = createEmptyState();


// SESSIONS CONTAINER
export function createSession(session, getCategoryById, donwloadFn, navigationFn) {
    const titleEl = ui.createTextDiv('raven-session-item__title', session.title),
        descEl = ui.createTextDiv('raven-session-item__description', session.description),
        item = ui.createDiv('raven-session-item', titleEl, descEl);

    if (isManual()) {
        const downloadBtn = ui.createDownloadBtn('raven-session-item__download-btn', donwloadFn);
        item.appendChild(downloadBtn);
    }
    item.addEventListener('click', navigationFn);
    if (session.category) {
        getCategoryById(session.category).then(category => {
            item.style.display = "none"
            const categoryDiv = setupSessionCategory(category.name);
            categoryDiv.appendChild(item);
            ravenLog("found CATEGORY in SESSION", category);
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
    let div = document.querySelector(`[category="${categoryName}"]`);
    if (!div) {
        div = createCategoryAccordion(categoryName)
    }
    return div;

}

function createCategoryAccordion(categoryName) {
    const title = ui.createTextDiv('raven-category-header__title', categoryName),
        icon = ui.createSpan('raven-category-header__icon', '▶'),
        // Header
        header = ui.createDiv('raven-category-header', title, icon);

    // Toggle accordion
    header.addEventListener('click', () => {
        const isExpanded = header.classList.contains('raven-category-header--expanded');
        if (isExpanded) {
            header.classList.remove('raven-category-header--expanded');
            ui.displayNextSiblings(header, "none")
        } else {
            header.classList.add('raven-category-header--expanded');
            ui.displayNextSiblings(header, "block")
        }
    });
    const accordion = ui.createDiv('raven-category-accordion', header);
    accordion.setAttribute("category", categoryName);
    examplesContainer.appendChild(accordion);
    return accordion;
}

function createExamplesContainer() {
    return ui.createDiv('raven-examples-container raven-scroll');
}

function createEmptyState() {
    const line = ui.createDiv('raven-empty-line')
    line.textContent = 'No sessions found.';
    const wrapper = ui.createDiv('raven-empty-state', line);

    if (isManual()) {
        const recordBtn = ui.createTextBtn('raven-empty-record', 'Record Session', null, () => ravents.recordEvent());
        wrapper.appendChild(recordBtn);
    }
    return wrapper;
}

export function createDownloadAllBtn(fn) {
    return ui.createTextBtn('raven-button raven-download-all-content', 'Download All', 'raven-button-text', fn);
}

export function createImportBtn(fn) {
    const fileInput = ui.createJsonFileInput(fn);
    return ui.createTextBtn('raven-button raven-import', '+ Import', 'raven-button-text', () => { fileInput.click(); });
}