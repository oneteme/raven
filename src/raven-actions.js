import * as ravents from "./utils/ravents.js";
import * as utils from "./utils/raven-utils.js";
import { rStates } from "./utils/constants.js";
import { openModal } from "./widgets/modal.js";
import { isActivated, isManual, isRecording, isReplaying, ravenLog, removeSession, setRavenState } from "./settings.js";

(function () {
    if (isManual()) {
        window.addEventListener('keydown', function (e) {
            if (isActivated()) {
                // Ctrl + Shift + R => Record
                if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                    e.preventDefault();
                    ravents.recordEvent();
                }
                // Ctrl + Shift + D => Demo
                if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                    e.preventDefault();
                    ravents.replayEvent();
                }
                if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                    e.preventDefault();
                    setRavenState(rStates.INACTIVE)
                    utils.reloadPage();
                }
            } else {
                if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                    e.preventDefault();
                    setRavenState(rStates.PASSIVE)
                    utils.reloadPage();
                }
            }
        });
        ravents.recordListener(() => {
            if (isRecording()) {
                snapshot();
            } else {
                record();
            }
        });
        ravents.replayListener(() => {
            if (isReplaying()) {
                removeSession();
                setRavenState(rStates.PASSIVE)
            } else {
                setRavenState(rStates.REPLAY)
            }
            utils.reloadPage();
        });
        const record = () => {
            removeSession()
            setRavenState(rStates.RECORD)
            utils.reloadPage()
        }
        const snapshot = () => {
            openModal((payload) => {
                setRavenState(rStates.PASSIVE)
                ravenLog("submit : ", payload)
                ravents.snapshotEvent(payload)
            });
        }

    }
})();