import { rLocalStrg, rModes, rStates } from "./constants.js";

(function () {
    if (window.RAVEN.isEnabled) {
        window.addEventListener('keydown', function (e) {
            // Ctrl + Shift + R => Record
            if (window.RAVEN.Mode == rModes.MANUAL && e.ctrlKey && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                if (window.RAVEN.isRecordMode) {
                    snapshot()
                } else {
                    record()
                }
            }
            // Ctrl + Shift + D => Demo
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                if (window.RAVEN.isReplayMode) {
                    localStorage.removeItem(rLocalStrg.EXAMPLE)
                    localStorage.setItem(rLocalStrg.MODE, rModes.MANUAL)
                    localStorage.setItem(rLocalStrg.STATE, rStates.PASSIVE)
                } else {
                    localStorage.setItem(rLocalStrg.MODE, rModes.AUTO)
                    localStorage.setItem(rLocalStrg.STATE, rStates.REPLAY)
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
            localStorage.setItem(rLocalStrg.STATE, rStates.RECORD)
            window.location.reload()
        }

        const snapshot = () => {
            localStorage.setItem(rLocalStrg.STATE, rStates.PASSIVE)
            window.RAVEN.isRecordMode = false
            CacheModal.open(({ title, description }) => {
                window.dispatchEvent(
                    new CustomEvent('snapshot', {
                        detail: { title, description }
                    })
                );
            });
        }
    }
})();