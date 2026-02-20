import { rStates } from "./utils/constants.js";
import { openModal } from "./widgets/modal.js";
import { isActivated, isManual, isRecording, isReplaying, ravenLog, removeSession, setRavenState } from "./settings.js";
import { recordEvent, recordListener, replayEvent, replayListener, snapshotEvent } from "./utils/ravents.js";

(function () {
    if (isManual()) {
        window.addEventListener('keydown', function (e) {
            if (isActivated()) {
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
                if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                    setRavenState(rStates.INACTIVE)
                    window.location.reload();
                }
            } else {
                if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                    e.preventDefault();
                    setRavenState(rStates.PASSIVE)
                    window.location.reload();
                }
            }
        });
        recordListener(() => {
            if (isRecording()) {
                snapshot();
            } else {
                record();
            }
        });
        replayListener(() => {
            if (isReplaying()) {
                removeSession();
                setRavenState(rStates.PASSIVE)
            } else {
                setRavenState(rStates.REPLAY)
            }
            window.location.reload();
        });
        const record = () => {
            removeSession()
            setRavenState(rStates.RECORD)
            window.location.reload()
        }
        const snapshot = () => {
            openModal((payload) => {
                setRavenState(rStates.PASSIVE)
                ravenLog("submit : ", payload)
                snapshotEvent(payload)
            });
        }

    }
})();