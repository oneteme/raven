export const rModes = {
    AUTO: "auto",
    MANUAL: "manual",
    DISABLED: "disabled"
}

export const rStates = {
    RECORD: "recording",
    REPLAY: "demo",
    PASSIVE: "passive"
}

export const rLocalStrg = {
    MODE: "jarvis.raven.mode",
    SESSION: "jarvis.raven.session",
    STATE: "jarvis.raven.state"
}

export const rLogs = {
    SUCCESS: "success",
    WARNING: "warning",
    ERROR: "error"
}

export const startReplayEvent = "raven:replay:start"
export const stopReplayEvent = "raven:replay:stop"
export const startRecordingEvent = "raven:recording:start"
export const stopRecordingEvent = "raven:recording:stop"