import "./settings.js";
import { getRouteBySessionId, getAllSessions, insertSession, exportSession, getCategoryById, insertNonExistantCategory, getSessionById, getAllRoutesBySessionId, exportSessionById } from "./db/raven-dao.js";
import "./raven-interceptor.js";
import "./raven-actions.js";
import "./widgets/modal.js";
import "./widgets/raven-logs.js";
import { getImportedFiles, getSession, isActivated, isAuto, isEnabled, isManual, isOnSession, isPassive, isRecording, isReplaying, ravenLog, removeSession, setRavenSession, setRavenState } from "./settings.js";
import { downloadJson, fetchJson, generateJsonName, reloadPage } from "./utils/raven-utils.js";
import { indicator, panel, setHeaderText } from "./widgets/panel/raven-panel.js";
import { demoEvent, logEvent, recordEvent, replayEvent } from "./utils/ravents.js";
import { createSession, emptyStateContainer, examplesContainer } from "./widgets/panel/replay.js";
import { createDiv, createJsonZoneFileInput, createOptionsContainer, createTextBtn } from "./utils/widgets.js";
import { rStates } from "./utils/constants.js";

// CREATE WIDGETS 
const container = document.createElement('div');
container.className = 'raven-container';


// SESSIONS FUNCITONS
function exportSessions(sessions, index = 0, indexJson = { "dir": "", "files": [] }) {
  ravenLog("[EXPORT SESSION]", sessions, index)
  const session = sessions[index]
  exportSession(session).then(exportedJson => {
    const jsonName = generateJsonName(exportedJson.title);
    downloadJson(exportedJson, jsonName)
    indexJson.files.push(jsonName)
    ravenLog("export session index : ", index)
    if (++index < sessions.length) {
      setTimeout(() => {
        exportSessions(sessions, index, indexJson)
      }, 200);
    } else {
      ravenLog("indexJson : ", indexJson)
      downloadJson(indexJson, "index.json")
    }
  })
}

function assembleSessions() {
  ravenLog("SESSION ASSEMBLE");
  loadSessions().then(() => {
    getAllSessions().then(sessions => {
      ravenLog("sessions : ", sessions)
      sessions.map(createSession);
      // examplesContainer.appendChild(sessions);
    }).catch(err => {
      examplesContainer.appendChild(emptyStateContainer)
    })
  })

}

function loadSessions() {
  return new Promise(resolve => {
    if (isManual()) {
      resolve();
    } else if (isAuto() && getImportedFiles() != null)
      getAllSessions().then(sessions => {
        ravenLog("AUTO MODE sessions : ", sessions)
        resolve();
      }).catch(err => {
        ravenLog("files exist and Raven is on AUTO Mode")
        fetchJson(getImportedFiles()).then(jsonIndex => {
          ravenLog("index files : ", jsonIndex);
          loadFile(jsonIndex.files, 0, jsonIndex.dir ?? "", resolve);
        })
      });
  })
}

function exportAndDownloadAllSessions() {
  getAllSessions().then(sessions => {
    exportSessions(sessions);
  }).catch(err => {
    logEvent(50)
  })
}

function exportAndDownloadSession(session) {
  exportSession(session).then(exportedJson => {
    const jsonName = generateJsonName(exportedJson.title);
    downloadJson(exportedJson, jsonName);
    res(exportedJson);
  }).catch(err => {
    rej("exportAndDownloadSession -> ERROR : " + err)
  })
}

function exportAndDownloadSessionById(sessionId) {
  return new Promise((res, rej) => {
    exportSessionById(sessionId).then(exportedJson => {
      const jsonName = generateJsonName(exportedJson.title);
      downloadJson(exportedJson, jsonName);
      res(exportedJson);
    }).catch(err => {
      rej("exportAndDownloadSessionById -> ERROR : " + err)
    })
  })
}

function loadFile(files, index, dir, resolve) {
  ravenLog("loaded path : ", dir + "/" + files[index])
  fetchJson(dir + "/" + files[index])
    .then(json => {
      insertImportedSession(json).then(session => {
        checkForEOF(files, index, dir, resolve);
      }).catch(err => {
        console.error("Error Importing files for AUTO Mode -> ", err)
        checkForEOF(files, index, dir, resolve);
      })
    })
}

function insertImportedSession(json) {
  return new Promise((res, rej) => {
    ravenLog("json : ", json)
    if (json.navigations && json.navigations != {}) {
      insertNonExistantCategory(json.category ?? null).then(cateoryId => {
        insertSession(json, cateoryId).then(session => {
          ravenLog("Inserted Session : ", session, " Successfully!")
          res(session)
        })
      })
    } else {
      rej("Wrong RAVEN file format imported! Error : No navigations detected for the session : ", json)
    }
  })
}

function checkForEOF(files, index, dir, resolve) {
  if (++index < files.length) {
    loadFile(files, index, dir, resolve)
  }
  else {
    resolve();
  }
}

function loadDemoData() {
  return new Promise((res, rej) => {
    ravenLog("[loadDemoData]", "session ID ", getSession())
    getSessionById(getSession()).then(session => {
      setHeaderText(session.title);
      getAllRoutesBySessionId(getSession()).then(routes => {
        res({ title: session.title, pages: routes })
      }).catch(err => rej("DEMO MODE : FAIL => " + err));
    }).catch(err => rej("DEMO MODE : FAIL => " + err))
  })
}
// ASSEMBLE RAVEN
function assembleDOM() {
  if (isPassive()) {
    panel.appendChild(createJsonZoneFileInput((json) => {
      insertImportedSession(json).then(session => {
        // createSession(session)
        logEvent(101)
      }).catch(err => {
        logEvent(40)
      })
    }))
  } else if (isRecording()) {
    setHeaderText("Recording session...");
    const abandonBtn = createTextBtn('raven-button error', "Abandon", "raven-button-text", () => {
      if (confirm("Discard this navigation?")) {
        setRavenState(rStates.PASSIVE);
        reloadPage();
      }
    }),
      saveBtn = createTextBtn('raven-button info', "Save", "raven-button-text", () => recordEvent());
    panel.append(createOptionsContainer(abandonBtn, saveBtn));
  } else if (isReplaying()) {
    if (isOnSession()) {
      loadDemoData().then(sessionData => { ravenLog("SessionData", sessionData); demoEvent(sessionData); }).catch(err => console.error(err));
      const exitBtn = createTextBtn('raven-button error', "Return", "raven-button-text", () => { removeSession(); reloadPage(); }),
        downloadBtn = createTextBtn('raven-button info', "Download", "raven-button-text", () => { exportAndDownloadSessionById(getSession()) });
      if (isManual()) {
        panel.appendChild(createOptionsContainer(exitBtn, downloadBtn));
      } else {
        panel.appendChild(createOptionsContainer(exitBtn));
      }

    } else {
      setHeaderText(isAuto() ? "Prepared sessions for you" : "Your recorded Sessions");
      assembleSessions();
      if (isManual()) {
        const exitBtn = createTextBtn('raven-button error', "Exit", "raven-button-text", () => replayEvent()),
          downloadAllBtn = createTextBtn('raven-button info', "Download All", "raven-button-text", () => exportAndDownloadAllSessions());
        panel.appendChild(createOptionsContainer(exitBtn, downloadAllBtn));
      }
    }
  }
  // if (isManual()) {
  //   const downloadAllBtn = createDownloadAllBtn(() => {
  //     getAllSessions().then(sessions => {
  //       exportSessions(sessions);
  //       logEvent(100)
  //     })
  //       .catch(err => {
  //         logEvent(50)
  //         console.error("[RAVEN DOWNLOAD ALL]", err)
  //       })
  //   }),
  //     importBtn = createImportBtn((json) => {
  //       insertImportedSession(json).then(session => {
  //         createSession(session)
  //         logEvent(101)
  //       }).catch(err => {
  //         logEvent(40)
  //       })
  //     });

  // }
  document.body.appendChild(createDiv('raven-container', panel, indicator))
}


if (isEnabled() && isActivated()) {
  assembleDOM();
} else {
  if (isEnabled()) {
    logEvent(1, 15000);
  }
}