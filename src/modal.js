(function () {

  let modal = null;

  function openMetaModal(onSubmit) {
    if (modal) return; // prevent duplicates

    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'raven-modal-overlay';

    // Modal box
    const box = document.createElement('div');
    box.className = 'raven-modal-box';

    // Title
    const title = document.createElement('h3');
    title.className = 'raven-modal__title';
    title.textContent = 'Save snapshot';

    // Title input
    const titleInput = document.createElement('input');
    titleInput.className = 'raven-modal__input';
    titleInput.id = 'title';
    titleInput.placeholder = 'Title';

    // Description textarea
    const descTextarea = document.createElement('textarea');
    descTextarea.className = 'raven-modal__textarea';
    descTextarea.id = 'desc';
    descTextarea.placeholder = 'Description';

    // Actions container
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'raven-modal__actions';

    // Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.className = 'raven-modal__button raven-modal__button--cancel';
    cancelButton.id = 'cancel';
    cancelButton.textContent = 'Cancel';

    // Save button
    const saveButton = document.createElement('button');
    saveButton.className = 'raven-modal__button raven-modal__button--save';
    saveButton.id = 'save';
    saveButton.textContent = 'Save';

    // Assemble modal
    actionsDiv.appendChild(cancelButton);
    actionsDiv.appendChild(saveButton);
    
    box.appendChild(title);
    box.appendChild(titleInput);
    box.appendChild(descTextarea);
    box.appendChild(actionsDiv);
    
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    modal = overlay;

    // Event handlers
    cancelButton.onclick = () => {
      if (confirm("Are you sure to discard your save?")) {
        closeModal();
      }
    };
    
    saveButton.onclick = () => {
      const titleBox = titleInput.value;
      const descriptionBox = descTextarea.value;
      const title = titleBox !== "" ? titleBox.trim() : "default save title";
      const description = descriptionBox !== "" ? descriptionBox.trim() : "default save description";
      
      onSubmit({ title, description });
      closeModal();
    };

    // Close on overlay click (optional)
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        if (confirm("Are you sure to discard your save?")) {
          closeModal();
        }
      }
    };
  }

  function closeModal() {
    if (modal) {
      modal.remove();
      modal = null;
    }
  }

  // 🔔 Expose API
  window.CacheModal = {
    open(onSubmit) {
      openMetaModal(onSubmit);
    }
  };

})();