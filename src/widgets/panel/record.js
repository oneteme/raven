import { ravenLog } from "../../settings";
import { createDiv } from "../../utils/widgets";

let pages = new Set();
const urlsList = createDiv('raven-urls-list raven-scroll');
export const recordedUrlsContainer = createRecordUrls();

// INFORMATION DURING RECORD

function createRecordUrls() {
    const recordedUrlsTitle = createDiv('raven-recorded-urls__title');
    recordedUrlsTitle.innerHTML = 'Recorded Pages <span id="recordedCount" class="raven-recorded-urls__count">0</span>';
    return createDiv('raven-recorded-urls', recordedUrlsTitle, urlsList);
}

export function addRecordedUrl(url, title = null) {
    ravenLog("[ADD RECORDED URL]", url, title)
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