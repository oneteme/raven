import { ravenLog } from "../settings";

const eventTarget = new EventTarget(),
    DEMO = "raven:demo", REPLAY = "raven:replay", RECORD = "raven:record", SNAPSHOT = "raven:snapshot", LOG = "raven:log";
function raventDispatch(event, payload = null) {
    ravenLog("[RAVEN EVENTS DISPATCHER]", event);
    eventTarget.dispatchEvent(new CustomEvent(event, { detail: payload }));
}
function raventListener(event, fn) {
    ravenLog("[RAVEN EVENTS LISTENER]", event);
    eventTarget.addEventListener(event, fn)
}
// **** RAVEN LOGS **** //
export function logListener(fn) {
    raventListener(LOG, fn)
}
export function logEvent(code) {
    raventDispatch(LOG, { code });
}

// **** RAVEN ACTIONS **** //
export function snapshotLisener(fn) {
    raventListener(SNAPSHOT, fn)
}

export function snapshotEvent(payload) {
    raventDispatch(SNAPSHOT, payload);
}

export function recordListener(fn) {
    raventListener(RECORD, fn)
}

export function recordEvent() {
    raventDispatch(RECORD);
}

export function replayListener(fn) {
    raventListener(REPLAY, fn)
}

export function replayEvent() {
    raventDispatch(REPLAY);
}

export function demoListener(fn) {
    raventListener(DEMO, fn)
}

export function demoEvent(sessionData) {
    raventDispatch(DEMO, { sessionData })
}



