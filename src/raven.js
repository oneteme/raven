import "./settings.js";
import { getRouteBySessionId, getAllSessions, insertSession, exportSession, getCategoryById, getCategoryByName } from "./raven-dao.js";
import "./raven-interceptor.js";
import "./record.js";
import "./modal.js";
import { rModes, rStates } from "./constants.js";
import { getImportedFiles, getMode, getState, isAuto, isEnabled, isManual, isRecording, ravenError, ravenLog, setRavenSession } from "./settings.js";
import { createDownloadButton, createTextButton, displayNextSiblings, downloadJson, generateJsonName } from "./raven-utils.js";

let
  panelHoverTimeOut,
  panelHideTimer = 600,
  showExamples = false,
  navigationInterval,
  pages = new Set();

// CREATE WIDGETS 
const container = document.createElement('div');
container.className = 'raven-container';

const indicator = createIndicator();
const panel = createPanel();
const modeHeader = createModeHeader();
const toggleButton = createToggleButton();
const recordIcon = createRecordIcon();
const button = createRecordButton(recordIcon);
const examplesContainer = createExamplesContainer();
const urlsList = createRecordUrlsList();
const recordedUrlsContainer = createRecordUrls();

// WIDGETS HELPERS
function createIndicator() {
  const indicator = document.createElement('div');
  indicator.className = 'raven-indicator raven-indicator--passive';

  const content = document.createElement('div');
  content.className = 'raven-indicator__content';

  const dot = document.createElement('div');
  dot.className = 'raven-indicator__dot';

  const bigLetter = document.createElement('div');
  bigLetter.className = 'raven-indicator__big-letter';
  bigLetter.textContent = 'R';

  const textStack = document.createElement('div');
  textStack.className = 'raven-indicator__text-stack';

  const topText = document.createElement('div');
  topText.className = 'raven-indicator__top-text';
  topText.textContent = 'RAVEN';

  const bottomText = document.createElement('div');
  bottomText.className = 'raven-indicator__bottom-text';
  bottomText.textContent = 'AVEN';

  textStack.appendChild(topText);
  textStack.appendChild(bottomText);

  content.appendChild(dot);
  content.appendChild(bigLetter);
  content.appendChild(textStack);

  indicator.appendChild(content);
  indicator.addEventListener('mouseenter', () => {
    panel.classList.add('raven-panel--visible');
    panel.classList.remove('raven-panel--hidden');
    indicator.style.opacity = '0';
  });

  return indicator;
}
function createModeHeader() {
  const header = document.createElement('div');
  header.className = 'raven-mode-header raven-mode-header--manual';
  header.textContent = 'Manual Mode';
  return header;
}

function createPanel() {
  const panel = document.createElement('div');
  panel.className = 'raven-panel';

  // Keep panel open when hovering over it
  panel.addEventListener('mouseenter', () => {
    panelHoverTimeOut = clearTimeout(panelHoverTimeOut)
    panelHideTimer = 600
    panel.classList.add('raven-panel--visible');
    panel.classList.remove('raven-panel--hidden');
    indicator.style.opacity = '0';
  });

  // Hide panel when leaving both indicator and panel
  // panel.addEventListener('mouseleave', () => {
  //   panelHoverTimeOut = setTimeout(() => {
  //     panel.classList.remove('raven-panel--visible');
  //     panel.classList.add('raven-panel--hidden');
  //     indicator.style.opacity = '1';
  //   }, panelHideTimer);
  // });

  return panel;
}

function createToggleButton() {
  const toggleButton = document.createElement('div');
  toggleButton.className = 'raven-toggle-button';
  toggleButton.textContent = 'Show Examples';

  // Toggle examples functionality
  toggleButton.addEventListener('click', () => {
    showExamples = !showExamples;

    if (showExamples) {
      toggleButton.textContent = 'Hide Examples';
      examplesContainer.classList.add('raven-examples-container--visible');
    } else {
      panelHideTimer = 3000
      toggleButton.textContent = 'Show Examples';
      examplesContainer.classList.remove('raven-examples-container--visible');
    }
  });

  return toggleButton;
}

function createRecordIcon() {
  const recordIcon = document.createElement('div');
  recordIcon.className = 'raven-record-icon';
  return recordIcon;
}

function createRecordButton(recordIcon) {
  const button = document.createElement('div');
  button.className = 'raven-record-button';
  button.appendChild(recordIcon);

  // Recording functionality
  button.addEventListener('click', () => {
    if (isRecording()) {
      dispatchEvent(new CustomEvent("recording:stop"))
      stopRecording();
    } else {
      dispatchEvent(new CustomEvent("recording:start"))
    }
  });

  return button;
}


function createExamplesContainer() {
  const examplesContainer = document.createElement('div');
  examplesContainer.className = 'raven-examples-container raven-scroll';

  if (isManual()) {
    // Create download all section
    const examplesOptions = document.createElement('div'),
      downloadAllBtn = createTextButton('raven-button raven-download-all-content', 'Download All', 'raven-button-text', () => { getAllSessions().then(sessions => exportSessions(sessions)) }),
      importBtn = createTextButton('raven-button raven-import', '+ Import', 'raven-button-text');

    examplesOptions.className = 'raven-example-options-section';
    examplesOptions.appendChild(downloadAllBtn)
    examplesOptions.appendChild(importBtn)
    examplesContainer.appendChild(examplesOptions);
  }
  return examplesContainer;
}

function createRecordUrlsList() {
  const urlsList = document.createElement('div');
  urlsList.className = 'raven-urls-list';
  return urlsList
}

function createRecordUrls() {
  const recordedUrlsContainer = document.createElement('div');
  recordedUrlsContainer.className = 'raven-recorded-urls raven-scroll';

  const recordedUrlsTitle = document.createElement('div');
  recordedUrlsTitle.className = 'raven-recorded-urls__title';
  recordedUrlsTitle.innerHTML = 'Recorded Pages <span id="recordedCount" class="raven-recorded-urls__count">0</span>';

  recordedUrlsContainer.appendChild(recordedUrlsTitle);
  recordedUrlsContainer.appendChild(urlsList);
  return recordedUrlsContainer;
}

// INFORMATION DURING RECORD
function addRecordedUrl(url, title = null) {
  if (!pages.has(url)) {
    pages.add(url)
    const urlItem = document.createElement('div');
    urlItem.className = 'raven-url-item';

    const bullet = document.createElement('div');
    bullet.className = 'raven-url-item__bullet';

    const textContainer = document.createElement('div');
    textContainer.className = 'raven-url-item__text-container';

    if (title) {
      // Show both title and URL
      const titleText = document.createElement('div');
      titleText.className = 'raven-url-item__title';
      titleText.textContent = title;

      const urlText = document.createElement('div');
      urlText.className = 'raven-url-item__url';
      urlText.textContent = url;

      textContainer.appendChild(titleText);
      textContainer.appendChild(urlText);
    } else {
      // Show only URL
      const urlText = document.createElement('div');
      urlText.className = 'raven-url-item__url raven-url-item__url--single';
      urlText.textContent = url;
      textContainer.appendChild(urlText);
    }

    urlItem.appendChild(bullet);
    urlItem.appendChild(textContainer);
    urlsList.appendChild(urlItem);

    // Update counter
    setPageCount(pages.size)
  }
}

function setPageCount(count) {
  const counter = document.getElementById('recordedCount');
  if (counter) {
    counter.textContent = count;
  }
}

// SESSIONS FUNCITONS
function exportSessions(sessions, index = 0, indexJson = { "dir": "", "files": [] }) {
  const session = sessions[index]
  exportSession(session).then(exportedJson => {
    const jsonName = generateJsonName(exportedJson.title);
    downloadJson(exportedJson, jsonName)
    indexJson.files.push(jsonName)
    ravenLog("export session index : ", index)
    if (++index < sessions.length) {
      exportSessions(sessions, index, indexJson)
    } else {
      ravenLog("indexJson : ", indexJson)
      downloadJson(indexJson, "index.json")
    }
  })
}

function assembleSessions() {
  loadSessions().then(() => {
    getAllSessions().then(sessions => {
      sessions.map(createSession)
      ravenLog("sessions : ", sessions)
      // examplesContainer.appendChild(sessions);
    })
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
  const downloadBtn = createDownloadButton('raven-session-item__download-btn', (e) => {
    e.stopPropagation();
    exportSession(session).then(exportedJson => {
      const jsonName = generateJsonName(exportedJson.title);
      downloadJson(exportedJson, jsonName)
    })
  });
  item.appendChild(titleEl);
  item.appendChild(descEl);
  item.appendChild(downloadBtn);
  item.addEventListener('click', () => {
    getRouteBySessionId(session.id).then(sessionRoute => {
      if (sessionRoute) {
        setRavenSession(session.id)
        setTimeout(() => {
          window.location.href = sessionRoute.route;
          window.location.reload()
        }, 200);
      } else {
        ravenLog("route not found")
      }
    })
  });
  getCategoryById(session.category).then(category => {
    item.style.display = "none"
    setupSessionCategory(category.name).then(categoryDiv => categoryDiv.appendChild(item));
    ravenLog("found CATEGORY in SESSION", category)
  }).catch(err => {
    examplesContainer.append(item)
  });
  return item
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
  examplesContainer.appendChild(accordion)
  return accordion;
}
function loadSessions() {
  return new Promise(resolve => {
    if (isManual()) {
      resolve();
    } else if (isAuto() && getImportedFiles() != null)
      getAllSessions().then(sessions => {
        ravenLog("sessions : ", sessions)
        if (sessions.length <= 0) {
          ravenLog("files exist and Raven is on AUTO Mode")
          fetch(getImportedFiles()).then((response) => response.json()).then(jsonIndex => {
            ravenLog("index files : ", jsonIndex);
            loadFile(jsonIndex.files, 0, jsonIndex.dir ?? "", resolve);
          })
        } else {
          resolve();
        }
      });
  })
}

function loadFile(files, index, dir, resolve) {
  ravenLog("loaded path : ", dir + "/" + files[index])
  fetch(dir + "/" + files[index]).then(response => response.json()).then(json => {
    ravenLog("json : ", json)
    insertSession(json).then(session => {
      ravenLog("all requests and routes for session : ", session, " have been inserted successfully")
      if (++index < files.length) {
        loadFile(files, index, dir, resolve)
      }
      else {
        resolve();
      }
    })

  })
}
// ASSEMBLE RAVEN
function assembleDOM() {
  panel.appendChild(modeHeader);
  setMode(getMode())
  setState(getState())
  panel.appendChild(examplesContainer);
  panel.appendChild(recordedUrlsContainer);
  container.appendChild(panel);
  container.appendChild(indicator);
}

// HELPER RAVEN FUNCTIONS
function setMode(mode) {
  ravenLog("setting RAVEN MODE : ", mode)
  // Update mode header
  modeHeader.className = `raven-mode-header raven-mode-header--${mode}`;
  modeHeader.textContent = mode === rModes.MANUAL ? 'Manual Mode' : 'Auto Mode';

  // Update panel style
  panel.classList.remove('raven-panel--manual', 'raven-panel--auto');
  panel.classList.add(`raven-panel--${mode}`);
}

function setState(state) {
  ravenLog("setting RAVEN STATE : ", state)
  // Update indicator
  indicator.className = `raven-indicator raven-indicator--${state}`;

  // Update indicator text
  const topText = indicator.querySelector('.raven-indicator__top-text');
  const bottomText = indicator.querySelector('.raven-indicator__bottom-text');

  if (state === rStates.RECORD) {
    topText.textContent = 'AVEN';
    bottomText.textContent = 'ECORD';
    panel.appendChild(button)
    startRecording();
  } else if (state === rStates.REPLAY) {
    topText.textContent = 'AVEN';
    bottomText.textContent = 'EPLAY';
    panel.appendChild(toggleButton);
  } else {
    topText.textContent = 'RAVEN';
    bottomText.textContent = 'AVEN';
    panel.appendChild(button)
    panel.appendChild(toggleButton);
  }
}

function startRecording() {
  detectNavigation();
  recordIcon.classList.add('raven-record-icon--recording');
  button.classList.add('raven-record-button--recording');
  recordedUrlsContainer.classList.add('raven-recorded-urls--visible');
  setTimeout(() => {
    addRecordedUrl(location.hash, document.title)
  }, 1000);
}

function stopRecording() {
  recordIcon.classList.remove('raven-record-icon--recording');
  button.classList.remove('raven-record-button--recording');
  urlsList.innerHTML = '';
  setPageCount(0);
  stopNavigationDetection();
}

function detectNavigation() {
  let last = location.href;
  navigationInterval = setInterval(async () => {
    if (location.href !== last) {
      last = location.href;
      addRecordedUrl(location.hash, document.title)
    }
  }, 100);
}



function stopNavigationDetection() {
  clearInterval(navigationInterval);
}

if (isEnabled()) {
  assembleSessions();
  assembleDOM();
  document.body.appendChild(container);
}