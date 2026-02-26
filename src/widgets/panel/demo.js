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
    detectNavigation(() => { updateDemoNavPage(sessionData.pages ?? []) })
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

// function updateDemoNavPage(pages, currentPageIndex) {
//     const dropdown = demoNav.querySelector('.raven-demo-nav__dropdown');

//     dropdown.innerHTML = '';
//     pages.forEach((page, index) => {

//         const number = createDiv('raven-demo-nav__dropdown-number');
//         number.textContent = `${index + 1}`;

//         const title = createDiv('raven-demo-nav__dropdown-title');
//         title.textContent = page.title || `Page ${index + 1}`;

//         // URL shown on hover
//         const url = createDiv('raven-demo-nav__dropdown-url');
//         url.textContent = page.route;
//         url.title = page.route;

//         const routeData = createDiv("raven-demo-nav__route", title, url);
//         const item = createDiv('raven-demo-nav__dropdown-item', number, routeData);

//         if (window.location.href == page.route) {
//             item.classList.add('raven-demo-nav__dropdown-item--active');
//         }
//         dropdown.appendChild(item);
//     });
// }

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
        if (window.location.href == route) {
            item.classList.add('raven-demo-nav__dropdown-item--active');
        }
        item.onclick = (e) => {
            window.location.href = route;
        };
        const dropdown = demoNav.querySelector('.raven-demo-nav__dropdown');
        dropdown.appendChild(item);
    }
}
