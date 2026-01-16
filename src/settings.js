import { rLocalStrg, rModes, rStates } from "./constants.js";

// SETUP RAVEN
setupRAVEN();
function setupRAVEN() {
    const ravenState = localStorage.getItem(rLocalStrg.STATE) ?? rStates.PASSIVE,
        loadedExample = parseInt(localStorage.getItem(rLocalStrg.EXAMPLE)),
        rMode = localStorage.getItem(rLocalStrg.MODE) ?? rModes.MANUAL;
    window.RAVEN = {
        Mode: rMode,
        isReplayMode: rMode == rModes.AUTO,
        isRecordMode: rMode == rModes.MANUAL && ravenState == rStates.RECORD,
        state: ravenState,
        isEnabled: rMode != rModes.DISABLED,
        loadedExample: isNaN(loadedExample) ? -1 : loadedExample,
        debugMode: true
    }
    console.log("RAVEN : ", window.RAVEN)
};

// export function debugRaven(...args) {
//     if (window.RAVEN.debugMode) {
//         console.log(args)
//     }
// }