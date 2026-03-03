import * as utils from "./utils/raven-utils.js";
import * as panelUI from "./widgets/panel/raven-panel.js";
import * as ravents from "./utils/ravents.js";
import * as dao from "./db/raven-dao.js";
import "./settings.js";
import "./raven-interceptor.js";
import "./raven-actions.js";
import "./widgets/modal.js";
import "./widgets/raven-logs.js";
import { getAutoModeIndex, getSession, isActivated, isAuto, isEnabled, isOnSession, isPassive, isRecording, isReplaying, ravenLog, setRavenSession } from "./settings.js";
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

ravents.fetchSessionsListener(() => assembleSessions());

function assembleSessions() {
  ravenLog("SESSION ASSEMBLE");
  loadSessions().then(() => {
    ravenLog("getAllSession")
    dao.getAllSessions().then(sessions => {
      ravenLog("sessions : ", sessions)
      sessions.map(session => createSession(session, dao.getCategoryById,
        (e) => {
          e.stopPropagation();
          exportAndDownloadSession(session);
        },
        (e) => navigateToSession(session)));
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
    ravents.logEvent(50)
  })
}

function exportAndDownloadSessionById(sessionId) {
  return dao.exportSessionById(sessionId).then(exportedJson => {
    const jsonName = utils.generateJsonName(exportedJson.title);
    utils.downloadJson(exportedJson, jsonName);
    return exportedJson;
  }).catch(err => {
    return Promise.reject("exportAndDownloadSessionById -> ERROR : " + err)
  })

}

function exportAndDownloadSession(session) {
  return dao.exportSession(session).then(exportedJson => {
    const jsonName = utils.generateJsonName(exportedJson.title);
    utils.downloadJson(exportedJson, jsonName)
  })
}

function navigateToSession(session) {
  dao.getRouteBySessionId(session.id)
    .then(sessionRoute => {
      if (sessionRoute) {
        setRavenSession(session.id)
        setTimeout(() => {
          window.location.href = sessionRoute.route;
          utils.reloadPage();
        }, 200);
      } else {
        ravenLog("route not found")
      }
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
  return new Promise((res, rej) => {
    if (json.navigations && json.navigations != {}) {
      dao.insertNonExistantCategory(json.category ?? null).then(cateoryId => {
        dao.insertSession(json, cateoryId).then(session => {
          ravenLog("Inserted Session : ", session, " Successfully!")
          res(session);
        })
      })
    } else {
      rej("Wrong RAVEN file format imported! Error : No navigations detected for the session : ", json)
    }
  })
}

ravents.replaySessionListener(() => {
  loadDemoData().then(sessionData => {
    ravenLog("SessionData", sessionData);
    ravents.demoEvent(sessionData);
  })
    .catch(err => console.error(err));
})
function loadDemoData() {
  ravenLog("[loadDemoData]", "session ID ", getSession())
  return dao.getSessionById(getSession()).then(session => {
    panelUI.setHeaderText(session.title);
    return dao.getAllRoutesBySessionId(getSession()).then(routes => {
      return { title: session.title, pages: routes }
    }).catch(err => Promise.reject("DEMO MODE : FAIL => " + err));
  }).catch(err => Promise.reject("DEMO MODE : FAIL => " + err))
}

// ASSEMBLE RAVEN
function assembleDOM() {
  if (isPassive()) {
    panelUI.showMenu((json) => {
      insertImportedSession(json).then(session => {
        ravents.logEvent(101)
      }).catch(err => {
        ravents.logEvent(40)
      })
    })
  } else if (isRecording()) {
    panelUI.showRecord();
  } else if (isReplaying()) {
    if (isOnSession()) {
      panelUI.startReplay(() => { exportAndDownloadSessionById(getSession()) })
    } else {
      panelUI.showSessions(() => exportAndDownloadAllSessions());
    }
  }
}


if (isEnabled() && isActivated()) {
  assembleDOM();
} else {
  if (isEnabled()) {
    ravents.logEvent(1, 20000);
  }
}