import { getAllCategories, getCategoryByName, insertCategory } from "./raven-dao";
import { ravenLog } from "./settings";

let showingDropdown = true,
  categoryInputTimeOut,
  categoryError = false;

function loadCategories() {
  getAllCategories().then(categories => {
    // category.select.length = 1; // keep default
    showingDropdown = categories.length > 0;
    categories.forEach(cat => {
      addCategory(cat.id, cat.name)
    });
  })
}

function addCategory(id, name) {
  const option = document.createElement('option');
  option.value = id;
  option.textContent = name;
  category.select.appendChild(option);
}
function createCategory(name) {
  return new Promise((res, rej) => {
    insertCategory(name).then(categoryId => {
      addCategory(categoryId, name)
      category.select.value = categoryId;
      category.input.value = '';
      res(categoryId)
    })
  })
}

/* =========================
   DOM CREATION
========================== */
const overlay = createOverlay();
const modal = createModalBox();

const titleHeader = createTitle();
const titleInput = createTitleInput();
const descTextarea = createDescriptionTextarea();
const checkboxContainer = createDownloadCheckbox();
const checkbox = checkboxContainer.querySelector('#downloadCheckbox');

const category = createCategorySection();
const actions = createActions();

const cancelButton = actions.querySelector('#cancel');
const saveButton = actions.querySelector('#save');

createEvents();

/* =========================
   ELEMENT BUILDERS
========================== */
function createOverlay() {
  const el = document.createElement('div');
  el.className = 'raven-modal-overlay';
  el.style.display = 'none';
  return el;
}

function createModalBox() {
  const el = document.createElement('div');
  el.className = 'raven-modal-box';
  return el;
}

function createTitle() {
  const el = document.createElement('h3');
  el.className = 'raven-modal__title';
  el.textContent = 'Save snapshot';
  return el;
}

function createTitleInput() {
  const el = document.createElement('input');
  el.className = 'raven-modal__input';
  el.placeholder = 'Title';
  return el;
}

function createDescriptionTextarea() {
  const el = document.createElement('textarea');
  el.className = 'raven-modal__textarea';
  el.placeholder = 'Description';
  return el;
}

function createDownloadCheckbox() {
  const wrapper = document.createElement('div');
  wrapper.className = 'raven-modal__checkbox-container';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = 'downloadCheckbox';
  input.className = 'raven-modal__checkbox';

  const label = document.createElement('label');
  label.htmlFor = 'downloadCheckbox';
  label.className = 'raven-modal__checkbox-label';
  label.textContent = 'Download session';

  wrapper.append(input, label);
  return wrapper;
}

function createCategorySection() {
  const container = document.createElement('div');
  container.className = 'raven-modal__category-container';

  const title = document.createElement('div');
  title.className = 'raven-modal__section-title';
  title.textContent = 'Category';

  const row = document.createElement('div');
  row.className = 'raven-modal__category-row';

  const select = document.createElement('select');
  select.className = 'raven-modal__select';

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '-- Select a category --';
  select.appendChild(defaultOption);

  const input = document.createElement('input');
  input.className = 'raven-modal__category-input';
  input.placeholder = 'Enter new category';

  const errorMsg = document.createElement('div');
  errorMsg.className = 'raven-modal__category-error';

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'raven-modal__category-toggle-btn';
  addBtn.textContent = '+ Add Category';

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'raven-modal__category-back-btn';
  backBtn.textContent = 'Use Existing Category';

  const validateBtn = document.createElement('button');
  validateBtn.type = 'button';
  validateBtn.className = 'raven-modal__category-validate-btn';
  validateBtn.textContent = '✓';

  container.append(title, row);

  return { container, row, select, input, errorMsg, addBtn, backBtn, validateBtn };
}

function createActions() {
  const el = document.createElement('div');
  el.className = 'raven-modal__actions';

  el.innerHTML = `
      <button id="cancel" class="raven-modal__button raven-modal__button--cancel">Cancel</button>
      <button id="save" class="raven-modal__button raven-modal__button--save">Save</button>
    `;
  return el;
}

function createEvents() {
  category.addBtn.onclick = () => {
    showingDropdown = false;
    updateCategoryUI();
    category.input.focus();
  };

  category.backBtn.onclick = () => {
    category.input.value = '';
    clearCategoryError();
    showingDropdown = true;
    updateCategoryUI();
  };

  category.validateBtn.onclick = () => {
    const value = category.input.value.trim();
    if (value && !categoryError) {
      // insertCategoryOK(value)
      createCategory(value);
      category.select.value = value;
      category.input.value = '';
      showingDropdown = true;
      updateCategoryUI();
    }
  };

  // Allow Enter key to validate
  category.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      category.validateBtn.click();
    }
    ravenLog("input category")
    clearTimeout(categoryInputTimeOut)
    categoryInputTimeOut = setTimeout(() => {
      getCategoryByName(category.input.value.trim()).then(cat => {
        showCategoryError(cat.name + " already exists")
        categoryError = true;
      }).catch(err => {
        clearCategoryError();
        categoryError = false;
      })
    }, 600);
  });

  cancelButton.onclick = () => {
    if (confirm('Are you sure to discard your save?')) {
      closeModal();
      window.location.reload();
    }
  };

  saveButton.onclick = () => {
    if (!categoryError) {
      submitSession().then(payload => {
        modalSubmit?.(payload);
        closeModal();
      })
    }
  };

  overlay.onclick = e => {
    if (e.target === overlay && confirm('Are you sure to discard your save?')) {
      closeModal();
    }
  };
}
function submitSession() {
  return new Promise(res => {
    const payload = {
      title: titleInput.value.trim() || 'default save title',
      description: descTextarea.value.trim() || 'default save description',
      category: showingDropdown ? (category.select.value ? category.select.selectedOptions[0].text : null) : category.input.value.trim(),
      download: checkbox.checked
    };

    if (!showingDropdown && payload.category) {
      createCategory(payload.category).then(categoryId => {
        payload.categoryId = categoryId;
        res(payload)
      });
    } else {
      payload.categoryId = category.select.value ?? null
      res(payload)
    }
  })
}
/* =========================
   CATEGORY UI
========================== */
function updateCategoryUI() {
  category.row.innerHTML = '';

  if (showingDropdown) {
    category.row.append(category.select, category.addBtn);
  } else {
    const inputRow = document.createElement('div');
    inputRow.style.cssText = 'display: flex; gap: 8px; width: 100%; align-items: center;';
    inputRow.append(category.input, category.validateBtn);

    category.row.append(inputRow, category.errorMsg, category.backBtn);
  }
}

function showCategoryError(errorMessage) {
  category.input.classList.add('raven-modal__category-input--error');
  category.errorMsg.textContent = errorMessage;
  category.errorMsg.classList.add('raven-modal__category-error--visible');
}

function clearCategoryError() {
  category.input.classList.remove('raven-modal__category-input--error');
  category.errorMsg.classList.remove('raven-modal__category-error--visible');
  category.errorMsg.textContent = '';
}

/* =========================
   EVENTS
========================== */


/* =========================
   MODAL CONTROL
========================== */
let modalSubmit = null;

export function openModal(onSubmit) {
  modalSubmit = onSubmit;

  loadCategories();
  updateCategoryUI();

  titleInput.value = '';
  descTextarea.value = '';
  checkbox.checked = false;
  category.select.value = '';
  category.input.value = '';

  overlay.style.display = 'flex';
}

export function closeModal() {
  overlay.style.display = 'none';
}

/* =========================
   ASSEMBLY
========================== */
modal.append(
  titleHeader,
  category.container,
  titleInput,
  descTextarea,
  checkboxContainer,
  actions
);

overlay.appendChild(modal);
document.body.appendChild(overlay);
