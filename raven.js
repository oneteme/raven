import "./settings.js";
import { debugRaven } from "./settings.js";
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
// Container that holds everything
const container = document.createElement('div');
container.style.cssText = `
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
`;
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
  // The small indicator line at the bottom (visible by default)
  const indicator = document.createElement('div');
  indicator.style.cssText = `
  width: 64px;
  height: 8px;
  background: linear-gradient(90deg, #00a8ff 0%, #0077ff 100%);
  border-radius: 2px 2px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 -2px 8px rgba(0, 120, 255, 0.3);
`;
  const icon = document.createElement('div');
  icon.innerHTML = 'RAVEN';
  icon.style.cssText = `
  font-size: 8px;
  color: white;
  margin-top: -1px;
`;
  indicator.appendChild(icon);
  return indicator;
}
function createPanel() {
  // Main content panel (hidden by default)
  const panel = document.createElement('div');
  panel.style.cssText = `
  background: linear-gradient(135deg, rgba(20, 20, 40, 0.98) 0%, rgba(10, 10, 30, 0.98) 100%);
  backdrop-filter: blur(10px);
  border-radius: 16px 16px 0 0;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
  max-height: 80vh;
  overflow: hidden;
`;
  // Keep panel open when hovering over it
  panel.addEventListener('mouseenter', () => {
    panelHoverTimeOut = clearTimeout(panelHoverTimeOut)
    panelHideTimer = 600
    panel.style.opacity = '1';
    panel.style.transform = 'translateY(0)';
    panel.style.pointerEvents = 'auto';
    panel.style.height = 'auto';
    panel.style.padding = '8px 12px';
    // panel.style.display = 'flex'
    indicator.style.opacity = '0';
  });

  // Hide panel when leaving both indicator and panel
  panel.addEventListener('mouseleave', () => {
    panelHoverTimeOut = setTimeout(() => {
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(100%)';
      panel.style.pointerEvents = 'none';
      panel.style.height = '0';
      panel.style.padding = '0';
      indicator.style.opacity = '1';
      // panel.style.display = 'none'
    }, panelHideTimer);
  });
  return panel;
}
function createToggleButton() {
  // Toggle examples button
  const toggleButton = document.createElement('div');
  toggleButton.textContent = 'Show Examples';
  toggleButton.style.cssText = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  user-select: none;
  margin-top: 4px;
`;
  toggleButton.addEventListener('mouseenter', () => {
    toggleButton.style.background = 'rgba(255, 255, 255, 0.1)';
    toggleButton.style.color = 'rgba(255, 255, 255, 0.9)';
  });

  toggleButton.addEventListener('mouseleave', () => {

    toggleButton.style.background = 'transparent';
    toggleButton.style.color = 'rgba(255, 255, 255, 0.7)';
  });

  // Toggle examples functionality
  toggleButton.addEventListener('click', () => {
    showExamples = !showExamples;

    if (showExamples) {
      toggleButton.textContent = 'Hide Examples';
      examplesContainer.style.maxHeight = '300px';
      examplesContainer.style.marginTop = '8px';
    } else {
      panelHideTimer = 3000
      toggleButton.textContent = 'Show Examples';
      examplesContainer.style.maxHeight = '0';
      examplesContainer.style.marginTop = '0';
    }
  });
  return toggleButton;
};

function createRecordIcon() {
  // Record icon (square for stop, circle for record)
  const recordIcon = document.createElement('div');
  recordIcon.style.cssText = `
  width: 13px;
  height: 13px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
`;
  return recordIcon;
};

function createRecordButton(recordIcon) {
  // Record button
  const button = document.createElement('div');
  button.style.cssText = `
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(229, 57, 53, 0.4);
  position: relative;
`;
  button.appendChild(recordIcon);
  // Button interactions
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)';
    button.style.boxShadow = '0 6px 16px rgba(229, 57, 53, 0.6)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 12px rgba(229, 57, 53, 0.4)';
  });

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
};

function createExamplesContainer() {
  const examplesContainer = document.createElement('div');
  examplesContainer.style.cssText = `
  width: 280px;
  max-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  transition: max-height 0.3s ease;
  margin-top: 0;
`;

  // Custom scrollbar
  const style = document.createElement('style');
  style.textContent = `
  .examples-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .examples-scroll::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  .examples-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
  .examples-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;
  document.head.appendChild(style);
  examplesContainer.classList.add('examples-scroll');
  return examplesContainer;
};

function createRecordUrlsList() {
  const urlsList = document.createElement('div');
  urlsList.style.cssText = `
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
  return urlsList
};

function createRecordUrls() {
  const recordedUrlsContainer = document.createElement('div');

  recordedUrlsContainer.style.cssText = `
  width: 280px;
  max-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  transition: max-height 0.3s ease;
  margin-top: 0;
  opacity: 0;
`;
  recordedUrlsContainer.classList.add('examples-scroll');

  const recordedUrlsTitle = document.createElement('div');
  recordedUrlsTitle.innerHTML = 'Recorded Pages <span id="recordedCount" style="color: #4fc3f7; font-weight: 700;">0</span>';
  recordedUrlsTitle.style.cssText = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  margin-bottom: 6px;
  text-align: center;
`;
  recordedUrlsContainer.appendChild(recordedUrlsTitle);
  recordedUrlsContainer.appendChild(urlsList);
  return recordedUrlsContainer;
};


// INFORMATION DURING RECORD
function addRecordedUrl(url, title = null) {
  if (!pages.has(url)) {
    pages.add(url)
    const urlItem = document.createElement('div');
    urlItem.style.cssText = `
       background: rgba(25, 118, 210, 0.1);
       border: 1px solid rgba(25, 118, 210, 0.3);
       border-radius: 4px;
       padding: 6px 8px;
       display: flex;
       align-items: center;
       gap: 6px;
       cursor: pointer;
       transition: all 0.2s ease;
     `;

    const bullet = document.createElement('div');
    bullet.style.cssText = `
       width: 6px;
       height: 6px;
       background: #4fc3f7;
       border-radius: 50%;
       flex-shrink: 0;
     `;

    const textContainer = document.createElement('div');
    textContainer.style.cssText = `
       flex: 1;
       overflow: hidden;
     `;

    if (title) {
      // Show both title and URL
      const titleText = document.createElement('div');
      titleText.textContent = title;
      titleText.style.cssText = `
         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
         font-size: 11px;
         color: rgba(255, 255, 255, 0.9);
         font-weight: 500;
         overflow: hidden;
         text-overflow: ellipsis;
         white-space: nowrap;
         margin-bottom: 2px;
       `;

      const urlText = document.createElement('div');
      urlText.textContent = url;
      urlText.style.cssText = `
         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace;
         font-size: 9px;
         color: rgba(255, 255, 255, 0.5);
         overflow: hidden;
         text-overflow: ellipsis;
         white-space: nowrap;
       `;

      textContainer.appendChild(titleText);
      textContainer.appendChild(urlText);

      urlItem.addEventListener('mouseenter', () => {
        urlItem.style.background = 'rgba(25, 118, 210, 0.2)';
        urlItem.style.borderColor = 'rgba(25, 118, 210, 0.5)';
        titleText.style.whiteSpace = 'normal';
        urlText.style.whiteSpace = 'normal';
      });

      urlItem.addEventListener('mouseleave', () => {
        urlItem.style.background = 'rgba(25, 118, 210, 0.1)';
        urlItem.style.borderColor = 'rgba(25, 118, 210, 0.3)';
        titleText.style.whiteSpace = 'nowrap';
        urlText.style.whiteSpace = 'nowrap';
      });
    } else {
      // Show only URL
      const urlText = document.createElement('div');
      urlText.textContent = url;
      urlText.style.cssText = `
         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace;
         font-size: 10px;
         color: rgba(255, 255, 255, 0.8);
         overflow: hidden;
         text-overflow: ellipsis;
         white-space: nowrap;
       `;

      textContainer.appendChild(urlText);

      urlItem.addEventListener('mouseenter', () => {
        urlItem.style.background = 'rgba(25, 118, 210, 0.2)';
        urlItem.style.borderColor = 'rgba(25, 118, 210, 0.5)';
        urlText.style.whiteSpace = 'normal';
      });

      urlItem.addEventListener('mouseleave', () => {
        urlItem.style.background = 'rgba(25, 118, 210, 0.1)';
        urlItem.style.borderColor = 'rgba(25, 118, 210, 0.3)';
        urlText.style.whiteSpace = 'nowrap';
      });
    }

    urlItem.appendChild(bullet);
    urlItem.appendChild(textContainer);

    urlsList.appendChild(urlItem);
    // Update counter
    setPageCount(pages.size)
  }
};

function setPageCount(count) {
  const counter = document.getElementById('recordedCount');
  if (counter) {
    counter.textContent = count;
  }
};

// RAVEN EXAMPLES
loadSessions();
assembleDOM();
createEvents();

function assembleSessions(sessions) {
  debugRaven("assemble sessions : ", sessions)
  sessions.forEach((session, index) => {
    createSession(session)
  });
};

async function createSession(session) {
  const item = document.createElement('div');
  item.style.cssText = `
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 8px 10px;
    margin-bottom: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
  `;

  const titleEl = document.createElement('div');
  titleEl.textContent = session.title;
  titleEl.style.cssText = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 4px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: white-space 0.2s ease;
  `;

  const descEl = document.createElement('div');
  descEl.textContent = session.description;
  descEl.style.cssText = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: white-space 0.2s ease;
  `;

  item.appendChild(titleEl);
  item.appendChild(descEl);

  item.addEventListener('mouseenter', () => {
    item.style.background = 'rgba(255, 255, 255, 0.08)';
    item.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    titleEl.style.whiteSpace = 'normal';
    descEl.style.whiteSpace = 'normal';
  });

  item.addEventListener('mouseleave', () => {
    item.style.background = 'rgba(255, 255, 255, 0.05)';
    item.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    titleEl.style.whiteSpace = 'nowrap';
    descEl.style.whiteSpace = 'nowrap';
  });

  item.addEventListener('click', async () => {
    QUERIES.getByIndex("route", "by_session", session.id).then(sessionRoute => {
      if (sessionRoute.length > 0) {
        localStorage.setItem("loadedExample", session.id)
        window.RAVEN.loadedExample = session.id
        setTimeout(() => {
          // window.RAVEN.setupRAVEN()
          window.location.href = sessionRoute[0].route;
        }, 200);
        console.log("selected session : ", sessionRoute[0])
      }
    })
  });

  examplesContainer.appendChild(item);
};

async function loadSessions() {
  window.QUERIES.list("session").then(sessions => {
    if (sessions.length > 0) {
      assembleSessions(sessions)
    }
  });
  // else {
  //   const jsonExamples = await fetch('/assets/RAVEN/saves.json').then(r => r.json());
  //   for (const example of jsonExamples) {
  //     const jsonData = await fetch('/assets/RAVEN/saves/' + example.json).then(r => r.json());
  //     saveExample(example, jsonData)
  //   }
  // }
};

async function saveExample(example, exampleContent) {
  exCount++
  const title = example.title ?? "example " + exCount;
  const description = example.description ?? title + " description";
  const metaData = { json: exampleContent, title, description, url: exampleContent.url };
  const savedExample = await window.QUERIES.saveExample(metaData)
  metaData["metadataId"] = savedExample
  createSession(metaData)
};

// ASSEMBLE RAVEEEEN!!!!🛡️
function assembleDOM() {
  console.log("assembling DOM")
  panel.appendChild(button);
  panel.appendChild(examplesContainer);
  panel.appendChild(recordedUrlsContainer);
  container.appendChild(panel);
  container.appendChild(indicator);
};

function createEvents() {
  // Hover behavior
  // Only show panel when hovering specifically over the indicator
  indicator.addEventListener('mouseenter', () => {
    panel.style.opacity = '1';
    panel.style.transform = 'translateY(0)';
    panel.style.pointerEvents = 'auto';
    panel.style.height = 'auto';
    panel.style.padding = '8px 12px';
    indicator.style.opacity = '0';
  });


  addEventListener("saveExample", (e) => {
    const example = { "title": e.detail.title ?? null, "description": e.detail.description ?? null },
      jsonData = e.detail.json;
    saveExample(example, jsonData)
  })
};


// HELPER RAVEN FUNCTIONS

function startRecording() {
  recordIcon.style.borderRadius = '3px';
  button.style.background = 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)';
  button.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.4)';
  recordedUrlsContainer.style.maxHeight = '200px';
  recordedUrlsContainer.style.marginTop = '8px';
  recordedUrlsContainer.style.opacity = '1';


  // detectNavigation();
  console.log('Recording started');
};

function stopRecording() {
  recordIcon.style.borderRadius = '50%';
  button.style.background = 'linear-gradient(135deg, #e53935 0%, #c62828 100%)';
  button.style.boxShadow = '0 4px 12px rgba(229, 57, 53, 0.4)';
  urlsList.innerHTML = '';
  setPageCount(0);
  stopNavigationDetection();
  console.log('Recording stopped');
};

function detectNavigation() {
  console.log("start navigation detection")
  let last = location.href;
  navigationInterval = setInterval(async () => {
    if (location.href !== last) {
      last = location.href;
      // setupRAVEN();
      console.log("Navigation detected:", last);
      console.log("RAVEN RECORD MODE")
      addRecordedUrl(location.hash, document.title)
    }
  }, 100);
};

function stopNavigationDetection() {
  clearInterval(navigationInterval);
  console.log("Navigation detection stopped");
};


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
};
// Add to page