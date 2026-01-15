(function () {

  let modal = null;

  function openMetaModal(onSubmit) {
    if (modal) return; // prevent duplicates

    // Overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Modal box
    const box = document.createElement('div');
    box.style.cssText = `
      background: #fff;
      padding: 20px;
      width: 320px;
      border-radius: 8px;
      font-family: sans-serif;
    `;

    box.innerHTML = `
      <h3 style="margin-top:0">Save snapshot</h3>
      <input id="title" placeholder="Title"
        style="width:100%; margin-bottom:10px; padding:6px"/>
      <textarea id="desc" placeholder="Description"
        style="width:100%; height:60px; margin-bottom:10px; padding:6px"></textarea>
      <div style="text-align:right">
        <button id="cancel">Cancel</button>
        <button id="save" style="margin-left:8px">Save</button>
      </div>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);
    modal = overlay;

    box.querySelector('#cancel').onclick = () => {
      if (confirm("Are you sure to discard your save?")) {
        closeModal;
      }
    };
    box.querySelector('#save').onclick = () => {
      const titleBox = box.querySelector('#title').value,
      descriptionBox = box.querySelector('#desc').value,
      title = titleBox!=""?titleBox.trim():"default save title",
      description = descriptionBox!=""?descriptionBox.trim():"default save description";
      onSubmit({ title, description });
      closeModal();
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
