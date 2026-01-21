import { rLocalStrg, rModes, rStates } from "./constants.js";

// SETUP RAVEN
setupRAVEN();
function setupRAVEN() {

    console.log("test raven link")
    const loadedExample = Number.parseInt(localStorage.getItem(rLocalStrg.EXAMPLE));
    let ravenState = rStates.PASSIVE,
        rMode = rModes.MANUAL;
    if (checkParamValue(localStorage.getItem(rLocalStrg.MODE), rModes)) {
        rMode = localStorage.getItem(rLocalStrg.MODE);
    } else if (checkParamValue(window.rMode, rModes)) {
        rMode = window.rMode
    }
    if (checkParamValue(localStorage.getItem(rLocalStrg.STATE), rStates)) {
        ravenState = localStorage.getItem(rLocalStrg.STATE)
    } else if (!Number.isNaN(loadedExample)) {
        ravenState = rStates.REPLAY
    }
    window.RAVEN = {
        Mode: rMode,
        isReplayMode: rMode == rModes.AUTO || (rMode == rModes.MANUAL && (ravenState == rStates.REPLAY || !Number.isNaN(loadedExample))),
        isRecordMode: rMode == rModes.MANUAL && ravenState == rStates.RECORD,
        state: ravenState,
        isEnabled: rMode != rModes.DISABLED,
        loadedExample: Number.isNaN(loadedExample) ? -1 : loadedExample,
        loadedFiles: window.rLoad,
        debugMode: true
    }
    console.log("RAVEN  : ", window.RAVEN)
};
export function checkParamValue(v, rList) {
    return v && Object.values(rList).includes(v.toLowerCase())
}
export function debugRaven(...args) {
    if (window.RAVEN.debugMode) {
        console.log(args)
    }
}