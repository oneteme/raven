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
function createFolderIcon() {
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('width', '22');
    icon.setAttribute('height', '22');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'none');
    icon.classList.add('raven-file-icon');
    icon.innerHTML = `
    <path d="M3 7a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293L12.707 6.7A1 1 0 0 0 13.414 7H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
      stroke="currentColor" stroke-width="1.5"/>
    <path d="M12 10.5v4M12 10.5l-1.5 1.5M12 10.5l1.5 1.5"
      stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  `;
    return icon;
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

function createFileInputZone(accept = null, fn) {
    // ── Styles ──────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `

  `;
    document.head.appendChild(style);

    // ── Drop zone ────────────────────────────────────────
    const fileInput = createFileInput(accept, fn),
        icon = createFolderIcon(),
        label = createDiv('raven-file-label');
    label.innerHTML = '<b>Click</b> or drop files here';
    const zone = createDiv('raven-file-zone', fileInput, icon, label)

    // ── Events ───────────────────────────────────────────

    zone.addEventListener('dragover', e => {
        e.preventDefault();
        zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', e => {
        if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const dt = new DataTransfer();
        Array.from(e.dataTransfer.files).forEach(file => dt.items.add(file));
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('change'));
    });

    // ── Return both elements to append to your panel ─────
    return zone;
}

export function createFileInput(accept = null, fn = null) {
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

export function createJsonZoneFileInput(fn) {
    const fileInput = createFileInputZone(".json", (e) => { const json = JSON.parse(e.target.result); fn(json) })
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