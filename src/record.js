import { rStates } from "./constants.js";
import { openModal } from "./modal.js";
import { isManual, isRecording, isReplaying, ravenLog, removeSession, setRavenState } from "./settings.js";

(function () {
    if (isManual()) {
        window.addEventListener('keydown', function (e) {
            // Ctrl + Shift + R => Record
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                if (isRecording()) {
                    snapshot()
                } else {
                    record()
                }
            }
            // Ctrl + Shift + D => Demo
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                if (isReplaying()) {
                    removeSession();
                    setRavenState(rStates.PASSIVE)
                } else {
                    setRavenState(rStates.REPLAY)
                }
                window.location.reload()
            }
        });
        window.addEventListener("recording:start", () => {
            record();
        })
        window.addEventListener("recording:stop", () => {
            snapshot();
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
                window.dispatchEvent(
                    new CustomEvent('snapshot', {
                        detail: payload
                    })
                );
            });
        }
    }
})();