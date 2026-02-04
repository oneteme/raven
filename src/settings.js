import { rLocalStrg, rModes, rStates } from "./constants.js";

// SETUP RAVEN
export let ravenParams = {
    mode: rModes.MANUAL,
    state: rStates.PASSIVE,
    loadedExample: -1,
    isReplayMode: false,
    isRecordMode: false,
    isEnabled: true,
    loadedFiles: null,
    debugMode: true
}
setDebugMode(window.rDebug);
export function RAVEN() {
    ravenLog("setting paramters")
    setRavenState(getLocalValue(rLocalStrg.STATE));
    setRavenSession(getLocalValue(rLocalStrg.SESSION));
    setRavenMode(window.rMode ?? getLocalValue(rLocalStrg.MODE));
    ravenParams.isRecordMode = isRecording();
    ravenParams.isReplayMode = isReplaying();
    ravenParams.loadedFiles = window.rLoad;

    ravenLog("New RAVEN params : ", ravenParams);
}
RAVEN();
// RAVEN DEBUG
function debugRaven(fn) {
    if (ravenParams.debugMode) {
        fn(console)
        // ravenLog(args)
    }
}
export function ravenLog(...args) {
    debugRaven(console => console.log(args))
}
export function ravenWarn(...args) {
    debugRaven(console => console.warn(args))
}
export function ravenError(...args) {
    debugRaven(console => console.error(args))
}

// CHECKING FOR PARAMETERS
function checkParamValue(v, rList) {
    return v && Object.values(rList).includes(v.toLowerCase())
}
function checkState(state = null) {
    return checkParamValue(state ?? getLocalValue(rLocalStrg.STATE), rStates);
}
function checkMode(mode = null) {
    return checkParamValue(mode ?? getLocalValue(rLocalStrg.MODE), rModes);
}
export function isAuto() {
    return ravenParams.mode == rModes.AUTO
}
export function isManual() {
    return ravenParams.mode == rModes.MANUAL
}
export function isEnabled() {
    return ravenParams.mode != rModes.DISABLED
}
export function isRecording() {
    return isManual() && ravenParams.state == rStates.RECORD
}
export function isReplaying() {
    return ravenParams.state == rStates.REPLAY
}
export function getMode() {
    return ravenParams.mode
}
export function getState() {
    return ravenParams.state
}
export function getSession() {
    return ravenParams.loadedExample
}
export function getImportedFiles() {
    return ravenParams.loadedFiles
}
// SETTING PARAMETERS VALUES

export function setRavenState(state) {
    ravenLog("RAVEN SET STATE TO : ", state)
    state = checkParamValue(state, rStates) ? state : rStates.PASSIVE;
    setLocalValue(rLocalStrg.STATE, state)
    ravenParams.state = state
    ravenParams.isRecordMode = isRecording();
    ravenParams.isReplayMode = isReplaying();
}

export function setRavenMode(mode) {
    ravenLog("Setting mode : ", mode)
    mode = checkParamValue(mode, rModes) ? mode : rModes.MANUAL;
    setLocalValue(rLocalStrg.MODE, mode);
    ravenParams.mode = mode;
    switch (mode) {
        case rModes.AUTO:
            setRavenState(rStates.REPLAY)
            break;
        case rModes.DISABLED:
            ravenParams.isEnabled = false;
            break;
    }
}

export function setRavenSession(sessionId) {
    sessionId = Number.parseInt(sessionId);
    ravenLog("Setting RAVEN session : ", sessionId)
    if (!Number.isNaN(sessionId)) {
        setLocalValue(rLocalStrg.SESSION, sessionId)
        ravenParams.loadedExample = sessionId
        setRavenState(rStates.REPLAY)
    } else {
        removeSession();
        ravenLog("Session id is not a Number")
    }
}

export function removeSession() {
    removeLocalValue(rLocalStrg.SESSION)
}
function setDebugMode(mode) {
    ravenParams.debugMode = mode ?? false;
}

// LOCAL STORAGE SETTINGS

function setLocalValue(k, v) {
    sessionStorage.setItem(k, v);
}
function getLocalValue(k) {
    return sessionStorage.getItem(k)
}
function removeLocalValue(k) {
    sessionStorage.removeItem(k)
}