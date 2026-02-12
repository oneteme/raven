import { rLogs } from "./constants";
import { createTextButton } from "./raven-utils";

const logsModal = createLogsModal(),
    rMessages = {
        0: createLogMessage("Unknown error occured"),
        10: createLogMessage("Session not found"),
        11: createLogMessage("There are no RAVEN Sessions"),
        20: createLogMessage("RAVEN routes could not be found"),
        30: createLogMessage("RAVEN requests could not be found"),
        41: createLogMessage("Wrong RAVEN file format => no navigations detected", rLogs.ERROR),
        40: createLogMessage("Error fetching file", rLogs.ERROR),
        50: createLogMessage("Download failed => Could not find sessions", rLogs.ERROR)
    };


window.addEventListener('raven:log', (e) => {
    console.log("adding RAVEN log", e.detail)
    addLog(e.detail.log, e.detail.type)
});
function createLogsModal() {
    console.log("creating logs modal")
    const modal = document.createElement('div');
    modal.className = 'raven-logs-modal';

    const box = document.createElement('div');
    box.className = 'raven-logs-modal__box';

    const header = document.createElement('div');
    header.className = 'raven-logs-modal__header';

    const title = document.createElement('div');
    title.className = 'raven-logs-modal__title';
    title.textContent = 'RAVEN LOGS';

    header.appendChild(title);

    const content = document.createElement('div');
    content.className = 'raven-logs-modal__content';

    const footer = document.createElement('div');
    footer.className = 'raven-logs-modal__footer';

    const closeBtn = createTextButton('raven-logs-modal__close-btn', "Close", null, () => { closeLogsModal(); });

    footer.appendChild(closeBtn);

    box.appendChild(header);
    box.appendChild(content);
    box.appendChild(footer);
    modal.appendChild(box);

    document.body.appendChild(modal);

    return modal;
}
// LOGS MODAL FUNCTIONS
function openLogsModal() {
    logsModal.classList.add('raven-logs-modal--visible');
}

function closeLogsModal() {
    console.log("closing modal")
    logsModal.classList.remove('raven-logs-modal--visible');
}

function addLog(message, type = 'info') {
    const content = logsModal.querySelector('.raven-logs-modal__content');

    const logContainer = document.createElement('div');
    logContainer.className = `raven-log-container ${type}`;

    const typeLabel = document.createElement('div');
    typeLabel.className = 'raven-log-container__type';
    typeLabel.textContent = type;

    const text = document.createElement('div');
    text.className = 'raven-log-container__text';
    text.textContent = message;

    const timestamp = document.createElement('div');
    timestamp.className = 'raven-log-container__timestamp';
    timestamp.textContent = new Date().toLocaleTimeString();

    logContainer.appendChild(typeLabel);
    logContainer.appendChild(text);
    logContainer.appendChild(timestamp);

    content.prepend(logContainer)

    // Auto scroll to top
    content.scrollTo({
        top: 0,
        behavior: "auto" // or "smooth"
    });
    openLogsModal();
}

function clearLogs() {
    const content = logsModal.querySelector('.raven-logs-modal__content');
    content.innerHTML = '';
}

console.log("RAVEN messages : ", rMessages)
function createLogMessage(message, type = rLogs.WARNING, italic = false, bold = false) {
    return {
        message,
        type,
        italic,
        bold
    };
};
