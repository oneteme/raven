import * as utils from "../../utils/raven-utils";
import * as ravents from "../../utils/ravents";
import * as ui from "../../utils/widgets";
import { isOnSession, ravenLog } from "../../settings";

let pages = new Set();
export const demoNav = createDemoNav();

function createDemoNav() {
    const dropdown = ui.createDiv('raven-demo-nav__dropdown'),
        nav = ui.createDiv('raven-demo-nav', dropdown);
    ravents.demoListener((e) => {
        openDemoNav(e.detail.sessionData)
    });

    return nav;
}

function openDemoNav(sessionData = {}) {
    utils.detectNavigation(() => { checkAndSelectPage(); })
    updateDemoNavPage(sessionData.pages ?? []);
    // Show widget
    demoNav.classList.add('raven-demo-nav--visible');
}

function updateDemoNavPage(pages) {
    const dropdown = demoNav.querySelector('.raven-demo-nav__dropdown');
    dropdown.innerHTML = '';
    pages.forEach((page, index) => {
        addPage(page.route, page.title)
    });
}

export function addPage(route, title = null) {
    if (!pages.has(route)) {
        pages.add(route);
        const pageIndex = pages.size;
        //Page number
        const number = ui.createDiv('raven-demo-nav__dropdown-number');
        number.textContent = pageIndex;

        //Page title
        const pageTitle = ui.createDiv('raven-demo-nav__dropdown-title');
        pageTitle.textContent = title || `Page ${pageIndex}`;

        // URL shown on hover
        const url = ui.createDiv('raven-demo-nav__dropdown-url');
        url.textContent = route;
        url.title = route;
        const routeData = ui.createDiv("raven-demo-nav__route", pageTitle, url),
            item = ui.createDiv('raven-demo-nav__dropdown-item', number, routeData);
        item.onclick = (e) => {
            window.location.href = route;
        };
        const dropdown = demoNav.querySelector('.raven-demo-nav__dropdown');
        dropdown.appendChild(item);
        checkAndSelectPage();
    }
}

function checkAndSelectPage() {
    const checkedRoute = isOnSession() || window.location.hash == "" ? window.location.href : window.location.hash;
    ravenLog("checkedRoute", checkedRoute);
    const selectedPage = document.querySelector('.raven-demo-nav__dropdown-item--active');
    if (selectedPage) {
        selectedPage.classList.remove('raven-demo-nav__dropdown-item--active');
    }
    const selector = `.raven-demo-nav__dropdown-url[title="${CSS.escape(checkedRoute)}"]`;
    const link = document.querySelector(selector);

    if (!link) {
        console.warn("No matching link found for:", checkedRoute);
        return;
    }

    const newPage = link.closest('.raven-demo-nav__dropdown-item');

    if (newPage) {
        newPage.classList.add('raven-demo-nav__dropdown-item--active');
    }
}
