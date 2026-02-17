import { rStates } from "./utils/constants.js";
import { openModal } from "./widgets/modal.js";
import { isManual, isRecording, isReplaying, ravenLog, removeSession, setRavenState } from "./settings.js";
import { recordEvent, replayEvent, snapshotEvent } from "./utils/ravents.js";

(function () {
    if (isManual()) {
        window.addEventListener('keydown', function (e) {
            // Ctrl + Shift + R => Record
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                recordEvent();
            }
            // Ctrl + Shift + D => Demo
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                replayEvent();
            }
        });
        window.addEventListener("raven:record", () => {
            if (isRecording()) {
                snapshot();
            } else {
                record();
            }
        })
        window.addEventListener("raven:replay", () => {
            if (isReplaying()) {
                removeSession();
                setRavenState(rStates.PASSIVE)
            } else {
                setRavenState(rStates.REPLAY)
            }
            window.location.reload()
        })
        const record = () => {
            removeSession()
            setRavenState(rStates.RECORD)
            window.location.reload()
        }

        const snapshot = () => {
            setRavenState(rStates.PASSIVE)
            openModal((payload) => {
                ravenLog("submit : ", payload)
                snapshotEvent(payload)
            });
        }
    }
})();