import { ravenLog } from "../settings";

function raventDispatch(event, payload = null) {
    ravenLog("[RAVEN EVENTS]", event)
    window.dispatchEvent(new CustomEvent(event, { detail: payload }));
}

// **** RAVEN LOGS **** //
export function logEvent(code) {
    raventDispatch("raven:log", { code })
}

// **** RAVEN ACTIONS **** //
export function snapshotEvent(payload) {
    raventDispatch("snapshot", payload)
}

export function recordEvent() {
    raventDispatch("raven:record")
}

export function replayEvent() {
    raventDispatch("raven:replay")
}

