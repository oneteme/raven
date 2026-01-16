import "./settings.js";
import "./cache-db.js";
import "./raven-interceptor.js";
import "./record.js";
import "./modal.js";

let
  panelHoverTimeOut,
  panelHideTimer = 600,
  showExamples = false,
  exCount = 0,
  navigationInterval,
  pages = new Set();

if (window.RAVEN.isRecordMode) {
  detectNavigation()
}

// CREATE WIDGETS 
const container = document.createElement('div');
container.className = 'raven-container';

const indicator = createIndicator();
const panel = createPanel();
const toggleButton = createToggleButton();
const recordIcon = createRecordIcon();
const button = createRecordButton(recordIcon);
const examplesContainer = createExamplesContainer();
const urlsList = createRecordUrlsList();
const recordedUrlsContainer = createRecordUrls();

// WIDGETS HELPERS
function createIndicator() {
  const indicator = document.createElement('div');
  indicator.className = 'raven-indicator';
  
  const icon = document.createElement('div');
  icon.className = 'raven-indicator__icon';
  icon.innerHTML = 'RAVEN';
  
  indicator.appendChild(icon);
  return indicator;
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
  panel.addEventListener('mouseleave', () => {
    panelHoverTimeOut = setTimeout(() => {
      panel.classList.remove('raven-panel--visible');
      panel.classList.add('raven-panel--hidden');
      indicator.style.opacity = '1';
    }, panelHideTimer);
  });
  
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
    if (!window.RAVEN.isRecordMode) {
      dispatchEvent(new CustomEvent("recording:start"))
    } else {
      dispatchEvent(new CustomEvent("recording:stop"))
      stopRecording();
    }
  });
  
  return button;
}

function createExamplesContainer() {
  const examplesContainer = document.createElement('div');
  examplesContainer.className = 'raven-examples-container raven-scroll';
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

// RAVEN EXAMPLES
loadSessions();
assembleDOM();
createEvents();

function assembleSessions(sessions) {
  sessions.forEach((session, index) => {
    createSession(session)
  });
}

async function createSession(session) {
  const item = document.createElement('div');
  item.className = 'raven-session-item';

  const titleEl = document.createElement('div');
  titleEl.className = 'raven-session-item__title';
  titleEl.textContent = session.title;

  const descEl = document.createElement('div');
  descEl.className = 'raven-session-item__description';
  descEl.textContent = session.description;

  item.appendChild(titleEl);
  item.appendChild(descEl);

  item.addEventListener('click', async () => {
    QUERIES.getByIndex("route", "by_session", session.id).then(sessionRoute => {
      if (sessionRoute.length > 0) {
        localStorage.setItem("loadedExample", session.id)
        window.RAVEN.loadedExample = session.id
        setTimeout(() => {
          window.location.href = sessionRoute[0].route;
        }, 200);
        console.log("selected session : ", sessionRoute[0])
      }
    })
  });

  examplesContainer.appendChild(item);
}

async function loadSessions() {
  window.QUERIES.list("session").then(sessions => {
    if (sessions.length > 0) {
      assembleSessions(sessions)
    }
  });
}

async function saveExample(example, exampleContent) {
  exCount++
  const title = example.title ?? "example " + exCount;
  const description = example.description ?? title + " description";
  const metaData = { json: exampleContent, title, description, url: exampleContent.url };
  const savedExample = await window.QUERIES.saveExample(metaData)
  metaData["metadataId"] = savedExample
  createSession(metaData)
}

// ASSEMBLE RAVEN
function assembleDOM() {
  console.log("assembling DOM")
  panel.appendChild(button);
  panel.appendChild(examplesContainer);
  panel.appendChild(recordedUrlsContainer);
  container.appendChild(panel);
  container.appendChild(indicator);
}

function createEvents() {
  // Hover behavior
  indicator.addEventListener('mouseenter', () => {
    panel.classList.add('raven-panel--visible');
    panel.classList.remove('raven-panel--hidden');
    indicator.style.opacity = '0';
  });

  addEventListener("saveExample", (e) => {
    const example = { 
      "title": e.detail.title ?? null, 
      "description": e.detail.description ?? null 
    };
    const jsonData = e.detail.json;
    saveExample(example, jsonData)
  })
}

// HELPER RAVEN FUNCTIONS
function startRecording() {
  recordIcon.classList.add('raven-record-icon--recording');
  button.classList.add('raven-record-button--recording');
  recordedUrlsContainer.classList.add('raven-recorded-urls--visible');

  console.log('Recording started');
}

function stopRecording() {
  recordIcon.classList.remove('raven-record-icon--recording');
  button.classList.remove('raven-record-button--recording');
  urlsList.innerHTML = '';
  setPageCount(0);
  stopNavigationDetection();
  console.log('Recording stopped');
}

function detectNavigation() {
  console.log("start navigation detection")
  let last = location.href;
  navigationInterval = setInterval(async () => {
    if (location.href !== last) {
      last = location.href;
      console.log("Navigation detected:", last);
      console.log("RAVEN RECORD MODE")
      addRecordedUrl(location.hash, document.title)
    }
  }, 100);
}

function stopNavigationDetection() {
  clearInterval(navigationInterval);
  console.log("Navigation detection stopped");
}

if (window.RAVEN.isEnabled) {
  document.body.appendChild(container);
  if (window.RAVEN.isRecordMode) {
    startRecording();
    setTimeout(() => {
      addRecordedUrl(location.hash, document.title)
    }, 1000);
  } else {
    panel.appendChild(toggleButton);
  }
}