import { ravenLog } from "../settings";

const eventTarget = new EventTarget(),
    DEMO = "raven:demo", REPLAY = "raven:replay", RECORD = "raven:record", SNAPSHOT = "raven:snapshot", LOG = "raven:log",
    TOGGLE = "raven:toggle", SESSIONS = "raven:sessions:fetch", REPLAY_SESSION = "raven:session:replay";
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
export function logEvent(code, duration = 10000) {
    raventDispatch(LOG, { code, duration });
}

// **** SESSIONS EVENTS **** //
export function fetchSessionsListener(fn) {
    raventListener(SESSIONS, fn)
}

export function fetchSessions() {
    raventDispatch(SESSIONS);
}

export function replaySessionListener(fn) {
    raventListener(REPLAY_SESSION, fn)
}

export function replaySession() {
    raventDispatch(REPLAY_SESSION)
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

// **** RAVEN WIDGETS **** //
export function toggleEvent(panelHideTimer) {
    raventDispatch(TOGGLE, { panelHideTimer })
}
export function toggleListener(fn) {
    raventListener(TOGGLE, fn)
}