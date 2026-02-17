import { replayEvent } from "../utils/ravents";
import { isReplaying } from "../settings";

const demoNav = createDemoNav();
if (isReplaying()) {
    document.body.appendChild(demoNav);
    openDemoNav({
        title: "Raven example",
        pages: [
            { title: "Page 1" },
            { title: "Page 2" },
            { title: "Page 3" }
        ],
        currentPageIndex: 2
    });
}

// DEMO NAVIGATION WIDGET
function createDemoNav() {
    const nav = document.createElement('div');
    nav.className = 'raven-demo-nav';

    // Header
    const header = document.createElement('div');
    header.className = 'raven-demo-nav__header';

    const sessionTitle = document.createElement('div');
    sessionTitle.className = 'raven-demo-nav__session-title';
    sessionTitle.textContent = 'Demo Session';

    const menuBtn = document.createElement('button');
    menuBtn.className = 'raven-demo-nav__menu-btn';
    menuBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/></svg>`;

    header.appendChild(sessionTitle);
    header.appendChild(menuBtn);

    // Current page navigation
    const current = document.createElement('div');
    current.className = 'raven-demo-nav__current';

    const arrowLeft = document.createElement('div');
    arrowLeft.className = 'raven-demo-nav__arrow';
    arrowLeft.textContent = '←';

    const pageTitle = document.createElement('div');
    pageTitle.className = 'raven-demo-nav__page-title';
    pageTitle.textContent = 'Page Title';

    const arrowRight = document.createElement('div');
    arrowRight.className = 'raven-demo-nav__arrow';
    arrowRight.textContent = '→';

    current.appendChild(arrowLeft);
    current.appendChild(pageTitle);
    current.appendChild(arrowRight);

    // Dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'raven-demo-nav__dropdown';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'raven-demo-nav__close-btn';
    closeBtn.textContent = 'Exit Demo';

    nav.appendChild(header);
    nav.appendChild(current);
    nav.appendChild(dropdown);
    nav.appendChild(closeBtn);

    // Event listeners
    menuBtn.addEventListener('click', () => {
        dropdown.classList.toggle('raven-demo-nav__dropdown--visible');
    });

    closeBtn.addEventListener('click', () => {
        closeDemoNav();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target)) {
            dropdown.classList.remove('raven-demo-nav__dropdown--visible');
        }
    });

    return nav;
}

function openDemoNav(sessionData) {
    const { title, pages, currentPageIndex } = sessionData;

    // Update session title
    const sessionTitle = demoNav.querySelector('.raven-demo-nav__session-title');
    sessionTitle.textContent = title || 'Demo Session';

    // Update current page
    updateDemoNavPage(pages, currentPageIndex);

    // Show widget
    demoNav.classList.add('raven-demo-nav--visible');
}

function closeDemoNav() {
    replayEvent();
}

function updateDemoNavPage(pages, currentPageIndex) {
    const pageTitle = demoNav.querySelector('.raven-demo-nav__page-title');
    const arrowLeft = demoNav.querySelector('.raven-demo-nav__arrow:first-of-type');
    const arrowRight = demoNav.querySelector('.raven-demo-nav__arrow:last-of-type');
    const dropdown = demoNav.querySelector('.raven-demo-nav__dropdown');

    // Update current page title
    const currentPage = pages[currentPageIndex];
    pageTitle.textContent = currentPage?.title || `Page ${currentPageIndex + 1}`;

    // Update arrows state
    if (currentPageIndex === 0) {
        arrowLeft.classList.add('raven-demo-nav__arrow--disabled');
    } else {
        arrowLeft.classList.remove('raven-demo-nav__arrow--disabled');
    }

    if (currentPageIndex === pages.length - 1) {
        arrowRight.classList.add('raven-demo-nav__arrow--disabled');
    } else {
        arrowRight.classList.remove('raven-demo-nav__arrow--disabled');
    }

    // Arrow click handlers
    arrowLeft.onclick = () => {
        if (currentPageIndex > 0) {
            dispatchEvent(new CustomEvent("raven:navigateToPage", {
                detail: { pageIndex: currentPageIndex - 1, page: pages[currentPageIndex - 1] }
            }));
        }
    };

    arrowRight.onclick = () => {
        if (currentPageIndex < pages.length - 1) {
            dispatchEvent(new CustomEvent("raven:navigateToPage", {
                detail: { pageIndex: currentPageIndex + 1, page: pages[currentPageIndex + 1] }
            }));
        }
    };

    // Populate dropdown
    dropdown.innerHTML = '';
    pages.forEach((page, index) => {
        const item = document.createElement('div');
        item.className = 'raven-demo-nav__dropdown-item';

        if (index === currentPageIndex) {
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
                dispatchEvent(new CustomEvent("raven:navigateToPage", {
                    detail: { pageIndex: index, page: page }
                }));
                dropdown.classList.remove('raven-demo-nav__dropdown--visible');
            });
        }

        dropdown.appendChild(item);
    });
}
