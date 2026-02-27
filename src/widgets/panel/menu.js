import { recordEvent, replayEvent } from "../../utils/ravents";
import { createButtonLabelContainer, createDiv, createIconBtn, createRecordIcon, createReplayIcon } from "../../utils/widgets";


const recordBtn = createIconBtn('raven-action-button record', createRecordIcon(), () => recordEvent()),
    replayBtn = createIconBtn('raven-action-button replay', createReplayIcon(), () => replayEvent()),
    recordContainer = createButtonLabelContainer('choice-content', recordBtn, "Record", "#e53935"),
    demoContainer = createButtonLabelContainer('choice-content', replayBtn, "Replay", "#00a8ff"),
    separator = createDiv("raven-btn-separator");
export const modeMenu = createMenuContainer();

function createMenuContainer() {
    menu = createDiv("menu-container", recordContainer, separator, demoContainer);
    return menu;
}