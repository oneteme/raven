import { rLogs } from "../utils/constants";
import { logListener } from "../utils/ravents";

const toastsContainer = createToastsContainer(),
    rMessages = {
        0: createLogMessage("Unknown error occured"),
        10: createLogMessage("Session not found"),
        11: createLogMessage("There are no RAVEN Sessions"),
        20: createLogMessage("RAVEN routes could not be found"),
        30: createLogMessage("RAVEN requests could not be found"),
        40: createLogMessage("<i>Session import</i> : FAIL => <b>Wrong RAVEN file format</b>", rLogs.ERROR),
        41: createLogMessage("Error fetching file", rLogs.ERROR),
        50: createLogMessage("<i>Download All</i> : FAIL => <b>No sessions found</b>", rLogs.ERROR),
        100: createLogMessage("<i>All Sessions export</i> : SUCCESS", rLogs.SUCCESS),
        101: createLogMessage("<i>Session import</i> : SUCCESS", rLogs.SUCCESS)
    };
let logs = new Map();

logListener((e) => {
    showToastNotification(e.detail.code)
});

function createToastsContainer() {
    const container = document.createElement('div');
    container.className = 'raven-toasts-container';
    document.body.appendChild(container);
    return container;
}

function showToastNotification(code, duration = 10000) {
    const logMessage = rMessages[code] ?? rMessages[0];

    const message = logMessage.text,
        type = logMessage.type;

    // Check if toast already exists (by code)
    if (logs.has(code)) {
        const existingToast = logs.get(code);
        existingToast.count++;
        updateToastBadge(existingToast);
        resetToastTimer(existingToast, duration);
        return;
    }

    const toast = document.createElement('div');
    toast.className = `raven-toast ${type}`;

    // Header with title, badge, and close button
    const header = document.createElement('div');
    header.className = 'raven-toast__header';

    const title = document.createElement('div');
    title.className = 'raven-toast__title';
    title.textContent = `RAVEN ${type.toUpperCase()}`;

    const badge = document.createElement('div');
    badge.className = 'raven-toast__badge';
    badge.style.display = 'none'; // Hidden by default
    badge.textContent = '1';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'raven-toast__close';
    closeBtn.innerHTML = '×';

    title.appendChild(badge);
    header.appendChild(title);
    header.appendChild(closeBtn);

    // Message
    const messageEl = document.createElement('div');
    messageEl.className = 'raven-toast__message';
    messageEl.innerHTML = message;

    // Progress bar
    const progress = document.createElement('div');
    progress.className = 'raven-toast__progress';

    const progressBar = document.createElement('div');
    progressBar.className = 'raven-toast__progress-bar';
    progressBar.style.width = '100%';

    progress.appendChild(progressBar);

    toast.appendChild(header);
    toast.appendChild(messageEl);
    toast.appendChild(progress);

    toastsContainer.appendChild(toast);

    const toastData = {
        element: toast,
        badge: badge,
        progressBar: progressBar,
        count: 1,
        timers: {},
        code: code
    };

    logs.set(code, toastData);

    // Start timer
    startToastTimer(toastData, duration);

    // Click to dismiss
    toast.addEventListener('click', () => {
        removeToast(toastData);
    });

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeToast(toastData);
    });
}

function updateToastBadge(toastData) {
    if (toastData.count > 1) {
        toastData.badge.style.display = 'flex';
        toastData.badge.textContent = "(" + toastData.count + ")";
        // Trigger animation
        toastData.badge.style.animation = 'none';
        setTimeout(() => {
            toastData.badge.style.animation = 'badgePop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        }, 10);
    }
}

function startToastTimer(toastData, duration) {
    let startTime = Date.now();

    // Progress bar animation
    toastData.timers.progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration * 100));
        toastData.progressBar.style.width = `${remaining}%`;
        if (remaining <= 0) {
            clearInterval(toastData.timers.progressInterval);
        }
    }, 50);

    // Auto remove
    toastData.timers.autoRemove = setTimeout(() => {
        removeToast(toastData);
    }, duration);
}

function resetToastTimer(toastData, duration) {
    // Clear existing timers
    clearInterval(toastData.timers.progressInterval);
    clearTimeout(toastData.timers.autoRemove);

    // Reset progress bar
    toastData.progressBar.style.width = '100%';

    // Start new timer
    startToastTimer(toastData, duration);
}

function removeToast(toastData) {
    // Clear timers
    clearInterval(toastData.timers.progressInterval);
    clearTimeout(toastData.timers.autoRemove);

    // Remove from active toasts (by code)
    logs.delete(toastData.code);

    // Animate out
    toastData.element.classList.add('raven-toast--removing');

    setTimeout(() => {
        if (toastData.element.parentNode) {
            toastData.element.remove();
        }
    }, 300);
}

function createLogMessage(text, type = rLogs.WARNING) {
    return {
        text,
        type
    };
};
