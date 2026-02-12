export function downloadJson(json, filename = 'cache.json') {
    const blob = new Blob(
        [JSON.stringify(json, null, 2)],
        { type: 'application/json' }
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}

export function generateJsonName(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return name.replaceAll(" ", "_") + "_" + timestamp + ".json";
}


// WIDGETS
export function createDownloadButton(classname, fn = null) {
    const button = document.createElement('div');
    button.className = classname;

    // Create SVG icon for download all
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z');

    icon.appendChild(path);
    button.appendChild(icon);
    if (fn) {
        button.onclick = fn;
    }
    return button;
}
export function createTextButton(className, textContent, textClass = null, fn = null) {
    const buttonContent = document.createElement('div'),
        buttonText = document.createElement('div');
    buttonContent.className = className;
    buttonText.className = textClass ?? className + "-text";
    buttonText.textContent = textContent;
    buttonContent.appendChild(buttonText);
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