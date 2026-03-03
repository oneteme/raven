import { ravenLog } from "../settings";

export function reloadPage() {
    window.location.reload();
}

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

export function fetchJson(path) {
    return fetch(path).then(response => response.json()).then(json => {
        return json;
    }).catch(err => {
        Promise.reject("Error fetching json with path : ", path, " ERROR => ", err)
    })
}

export function detectNavigation(fn, detectionFrequency = 100) {
    let last = location.href;
    ravenLog("detectNavigation");
    setInterval(() => {
        if (location.href !== last) {
            last = location.href;
            fn()
        }
    }, detectionFrequency);
}



