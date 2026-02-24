// WIDGETS
export function createIconBtn(className, icon, fn = null) {
    const button = createDiv(className, icon)
    if (fn) {
        button.onclick = fn;
    }
    return button;
}

export function createDownloadIcon() {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z');

    icon.appendChild(path);
    return icon;
}

export function createRecordIcon() {
    return createDiv('raven-record-icon');
}

export function createReplayIcon() {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('width', '22');
    icon.setAttribute('height', '22');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'none');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z');
    path.setAttribute('fill', 'white');

    icon.appendChild(path);
    return icon;
}

export function createButtonLabelContainer(className, buttonEl, label, labelColor = "white") {
    const labelContainer = createDiv("btn-label-container");
    labelContainer.textContent = label;
    labelContainer.style.color = labelColor;
    return createDiv(className, buttonEl, labelContainer)
}

export function createOptionsContainer(...options) {
    const optionsContainer = createDiv('raven-options-container', ...options);
    return optionsContainer;
}

export function createDownloadBtn(classname, fn = null) {
    return createIconBtn(classname, createDownloadIcon(), fn);
}

export function createTextBtn(className, textContent, textClass = null, fn = null) {
    const buttonContent = createDiv(className)
    if (textClass) {
        const buttonText = document.createElement('div');
        buttonText.className = textClass;
        buttonText.textContent = textContent;
        buttonContent.appendChild(buttonText);
    } else {
        buttonContent.textContent = textContent
    }

    if (fn) {
        buttonContent.onclick = fn;
    }
    return buttonContent
}

export function createFileInput(accept = null, fn) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    if (accept) {
        fileInput.accept = accept;
    }
    fileInput.multiple = true;

    if (fn) {
        fileInput.addEventListener('change', () => {
            const files = Array.from(fileInput.files);

            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        fn(e)
                        console.log("🟢 IMPORTED file ", file.name, " Successfully")
                    } catch (err) {
                        console.error(`🔴 Invalid JSON in file: ${file.name} => Error : `, err);
                    }
                };
                reader.readAsText(file);
            });
            fileInput.value = '';
        });
    }
    return fileInput
}

export function createJsonFileInput(fn) {
    const fileInput = createFileInput(".json", (e) => { const json = JSON.parse(e.target.result); fn(json) })
    return fileInput
}

export function displayNextSiblings(div, display = "none") {
    let next = div.nextElementSibling;

    while (next) {
        next.style.display = display;
        next = next.nextElementSibling;
    }
}

export function createDiv(className, ...children) {
    const div = document.createElement('div');
    div.className = className;
    for (let i = 0; i < children.length; i++) {
        div.appendChild(children[i]);
    }
    return div;
}