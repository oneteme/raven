import * as ravents from "../../utils/ravents";
import * as ui from "../../utils/widgets";

const recordBtn = ui.createIconBtn('raven-action-button record', ui.createRecordIcon(), () => ravents.recordEvent()),
    replayBtn = ui.createIconBtn('raven-action-button replay', ui.createReplayIcon(), () => ravents.replayEvent()),
    recordContainer = ui.createButtonLabelContainer('choice-content', recordBtn, "Record", "#e53935"),
    demoContainer = ui.createButtonLabelContainer('choice-content', replayBtn, "Replay", "#00a8ff"),
    separator = ui.createDiv("raven-btn-separator");
export const modeMenu = createMenuContainer();

function createMenuContainer() {
    menu = ui.createDiv("menu-container", recordContainer, separator, demoContainer);
    return menu;
}