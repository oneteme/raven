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
import { emptyStateContainer, examplesContainer } from "./widgets/panel/replay.js";
import { createDiv, createDownloadBtn, createJsonZoneFileInput, createOptionsContainer, createTextBtn, displayNextSiblings } from "./utils/widgets.js";
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
      sessions.map(createSession)
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

function createSession(session) {
  const item = document.createElement('div');
  item.className = 'raven-session-item';

  const titleEl = document.createElement('div');
  titleEl.className = 'raven-session-item__title';
  titleEl.textContent = session.title;

  const descEl = document.createElement('div');
  descEl.className = 'raven-session-item__description';
  descEl.textContent = session.description;

  // Create download button
  const downloadBtn = createDownloadBtn('raven-session-item__download-btn', (e) => {
    e.stopPropagation();
    exportSession(session).then(exportedJson => {
      const jsonName = generateJsonName(exportedJson.title);
      downloadJson(exportedJson, jsonName)
    })
  });
  item.appendChild(titleEl);
  item.appendChild(descEl);
  if (isManual()) {
    item.appendChild(downloadBtn);
  }
  item.addEventListener('click', () => {
    getRouteBySessionId(session.id).then(sessionRoute => {
      if (sessionRoute) {
        setRavenSession(session.id)
        setTimeout(() => {
          window.location.href = sessionRoute.route;
          reloadPage()
        }, 200);
      } else {
        ravenLog("route not found")
      }
    })
  });
  if (session.category) {
    getCategoryById(session.category).then(category => {
      item.style.display = "none"
      setupSessionCategory(category.name).then(categoryDiv => categoryDiv.appendChild(item));
      ravenLog("found CATEGORY in SESSION", category)
    }).catch(err => {
      ravenLog("NO CATEGORY FOUND")
      examplesContainer.append(item)
    });
  } else {
    examplesContainer.append(item)
  }
  return item
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
function setupSessionCategory(categoryName) {
  return new Promise(res => {
    let div = document.querySelector(`[category="${categoryName}"]`);
    if (!div) {
      div = createCategoryAccordion(categoryName)
      res(div)
    }
    res(div)
  })
}

function createCategoryAccordion(categoryName) {
  const accordion = document.createElement('div');
  accordion.className = 'raven-category-accordion';

  // Header
  const header = document.createElement('div');
  header.className = 'raven-category-header';

  const title = document.createElement('div');
  title.className = 'raven-category-header__title';
  title.textContent = categoryName;

  const icon = document.createElement('span');
  icon.className = 'raven-category-header__icon';
  icon.textContent = '▶';

  header.appendChild(title);
  header.appendChild(icon);


  // Toggle accordion
  header.addEventListener('click', () => {
    const isExpanded = header.classList.contains('raven-category-header--expanded');
    if (isExpanded) {
      header.classList.remove('raven-category-header--expanded');
      displayNextSiblings(header, "none")
    } else {
      header.classList.add('raven-category-header--expanded');
      displayNextSiblings(header, "block")
    }
  });
  accordion.setAttribute("category", categoryName);
  accordion.appendChild(header);
  examplesContainer.appendChild(accordion);
  return accordion;
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
        createSession(session)
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
      stopBtn = createTextBtn('raven-button info', "Save", "raven-button-text", () => recordEvent());
    panel.append(createOptionsContainer(abandonBtn, stopBtn));
  } else if (isReplaying()) {
    if (isOnSession()) {
      loadDemoData().then(sessionData => { ravenLog("SessionData", sessionData); demoEvent(sessionData); }).catch(err => console.error(err));
      const exitBtn = createTextBtn('raven-button error', "Exit", "raven-button-text", () => { removeSession(); reloadPage(); }),
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
}