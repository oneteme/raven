import "./settings.js";
import * as dao from "./db/raven-dao.js";
import "./raven-interceptor.js";
import "./raven-actions.js";
import "./widgets/modal.js";
import "./widgets/raven-logs.js";
import { getAutoModeIndex, getSession, isActivated, isAuto, isEnabled, isOnSession, isPassive, isRecording, isReplaying, ravenLog } from "./settings.js";
import * as utils from "./utils/raven-utils.js";
import * as panelUI from "./widgets/panel/raven-panel.js";
import { demoEvent, fetchSessionsListener, logEvent, replaySessionListener } from "./utils/ravents.js";
import { createSession, emptyStateContainer, examplesContainer } from "./widgets/panel/replay.js";

// SESSIONS FUNCITONS
function exportSessions(sessions, index = 0, indexJson = { "dir": "", "files": [] }) {
  ravenLog("[EXPORT SESSION]", sessions, index)
  const session = sessions[index]
  dao.exportSession(session).then(exportedJson => {
    const jsonName = utils.generateJsonName(exportedJson.title);
    utils.downloadJson(exportedJson, jsonName)
    indexJson.files.push(jsonName)
    ravenLog("export session index : ", index)
    if (++index < sessions.length) {
      setTimeout(() => {
        exportSessions(sessions, index, indexJson)
      }, 200);
    } else {
      ravenLog("indexJson : ", indexJson)
      utils.downloadJson(indexJson, "index.json")
    }
  })
}

fetchSessionsListener(() => assembleSessions());

function assembleSessions() {
  ravenLog("SESSION ASSEMBLE");
  loadSessions().then(() => {
    ravenLog("getAllSession")
    dao.getAllSessions().then(sessions => {
      ravenLog("sessions : ", sessions)
      sessions.map(o => createSession(o, dao.getCategoryById));
      // examplesContainer.appendChild(sessions);
    }).catch(err => {
      ravenLog("No sessions found")
      examplesContainer.appendChild(emptyStateContainer)
    })
  })

}

function loadSessions() {
  ravenLog("LoadSession")
  return new Promise(resolve => {
    if (isAuto() && getAutoModeIndex() != null) {
      dao.getAllSessions().then(sessions => { //TODO just check if present
        ravenLog("AUTO MODE sessions : ", sessions)
        resolve();
      }).catch(err => { //TODO return empty 
        ravenLog("files exist and Raven is on AUTO Mode")
        utils.fetchJson(getAutoModeIndex()).then(jsonIndex => {
          ravenLog("index files : ", jsonIndex);
          loadFile(jsonIndex.files, 0, jsonIndex.dir ?? "", resolve);
        })
      });
    } else {
      resolve();
    }
  })
}

function exportAndDownloadAllSessions() {
  dao.getAllSessions().then(sessions => {
    exportSessions(sessions);
  }).catch(err => {
    logEvent(50)
  })
}

function exportAndDownloadSession(sessionId) {
  return new Promise((res, rej) => {
    dao.exportSessionById(sessionId).then(exportedJson => {
      const jsonName = utils.generateJsonName(exportedJson.title);
      utils.downloadJson(exportedJson, jsonName);
      res(exportedJson);
    }).catch(err => {
      rej("exportAndDownloadSessionById -> ERROR : " + err)
    })
  })
}

function loadFile(files, index, dir, resolve) {
  ravenLog("loaded path : ", dir + "/" + files[index])
  utils.fetchJson(dir + "/" + files[index])
    .then(json => {
      insertImportedSession(json)
        .catch(err => console.error("Error Importing files for AUTO Mode -> ", err))
        .finally(() => {
          console.log('TEST //', 'finally')
          if (++index < files.length) {
            loadFile(files, index, dir, resolve);
          }
          else {
            resolve();
          };
        })
    });
}

function insertImportedSession(json) {
  ravenLog("json : ", json)
  if (json.navigations && json.navigations != {}) {
    return dao.insertNonExistantCategory(json.category ?? null).then(cateoryId => {
      return dao.insertSession(json, cateoryId).then(session => {
        ravenLog("Inserted Session : ", session, " Successfully!")
        return session
      })
    })
  } else {
    return Promise.reject("Wrong RAVEN file format imported! Error : No navigations detected for the session : ", json)
  }
}

replaySessionListener(() => {
  loadDemoData().then(sessionData => {
    ravenLog("SessionData", sessionData);
    demoEvent(sessionData);
  })
    .catch(err => console.error(err));
})
function loadDemoData() {
  return new Promise((res, rej) => {
    ravenLog("[loadDemoData]", "session ID ", getSession())
    dao.getSessionById(getSession()).then(session => {
      panelUI.setHeaderText(session.title);
      dao.getAllRoutesBySessionId(getSession()).then(routes => {
        res({ title: session.title, pages: routes })
      }).catch(err => rej("DEMO MODE : FAIL => " + err));
    }).catch(err => rej("DEMO MODE : FAIL => " + err))
  })
}
// ASSEMBLE RAVEN
function assembleDOM() {
  if (isPassive()) {
    panelUI.showMenu((json) => {
      insertImportedSession(json).then(session => {
        logEvent(101)
      }).catch(err => {
        logEvent(40)
      })
    })
  } else if (isRecording()) {
    panelUI.showRecord();
  } else if (isReplaying()) {
    if (isOnSession()) {
      panelUI.startReplay(() => { exportAndDownloadSession(getSession()) })
    } else {
      panelUI.showSessions(() => exportAndDownloadAllSessions());
    }
  }
}


if (isEnabled() && isActivated()) {
  assembleDOM();
} else {
  if (isEnabled()) {
    logEvent(1, 20000);
  }
}