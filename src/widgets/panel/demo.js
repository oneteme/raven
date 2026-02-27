import { isOnSession, ravenLog } from "../../settings";
import { detectNavigation } from "../../utils/raven-utils";
import { demoListener } from "../../utils/ravents";
import { createDiv } from "../../utils/widgets";

let pages = new Set();
export const demoNav = createDemoNav();

function createDemoNav() {
    const dropdown = createDiv('raven-demo-nav__dropdown'),
        nav = createDiv('raven-demo-nav', dropdown);
    demoListener((e) => {
        openDemoNav(e.detail.sessionData)
    });

    return nav;
}

function openDemoNav(sessionData = {}) {
    detectNavigation(() => { checkAndSelectPage(); })
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
        const number = createDiv('raven-demo-nav__dropdown-number');
        number.textContent = pageIndex;

        //Page title
        const pageTitle = createDiv('raven-demo-nav__dropdown-title');
        pageTitle.textContent = title || `Page ${pageIndex}`;

        // URL shown on hover
        const url = createDiv('raven-demo-nav__dropdown-url');
        url.textContent = route;
        url.title = route;
        const routeData = createDiv("raven-demo-nav__route", pageTitle, url),
            item = createDiv('raven-demo-nav__dropdown-item', number, routeData);
        item.onclick = (e) => {
            window.location.href = route;
        };
        const dropdown = demoNav.querySelector('.raven-demo-nav__dropdown');
        dropdown.appendChild(item);
        checkAndSelectPage();
    }
}

function checkAndSelectPage() {
    const checkedRoute = isOnSession() ? window.location.href : window.location.hash;
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
