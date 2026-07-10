(() => {
  const MODEL_URL = './tfjs_model/model.json';
  const SIZE = 150;
  const CLASSES = [
    { name: 'Bercak Daun Awal', fill: 'fill-amber' },
    { name: 'Hawar Daun Lanjut', fill: 'fill-red' },
    { name: 'Sehat', fill: 'fill-green' },
  ];

  const $ = id => document.getElementById(id);
  const dropZone = $('drop-zone'), fileInput = $('file-input');
  const previewArea = $('preview-area'), preview = $('preview');
  const classifyBtn = $('classify-btn'), resetBtn = $('reset-btn');
  const resultsArea = $('results-area'), resultsHint = $('results-hint');
  const status = $('status');

  let model = null;

  async function init() {
    try {
      model = await tf.loadGraphModel(MODEL_URL);
      tf.tidy(() => model.predict(tf.zeros([1, SIZE, SIZE, 3]))).dispose();
      status.textContent = 'Model siap';
      status.className = 'status ready';
      classifyBtn.disabled = false;
    } catch (e) {
      status.textContent = 'Gagal memuat model';
      status.className = 'status error';
      console.error(e);
    }
  }

  function onFile(file) {
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      previewArea.hidden = false;
      resetResults();
    };
    reader.readAsDataURL(file);
  }

  function resetResults() {
    resultsArea.innerHTML = CLASSES.map(c =>
      `<div class="result-item placeholder">
        <div style="flex:1">
          <div class="result-name">${c.name}</div>
          <div class="bar"><div class="bar-fill ${c.fill}"></div></div>
        </div>
        <span class="result-pct">--%</span>
      </div>`
    ).join('');
    resultsHint.textContent = 'Upload gambar terlebih dahulu untuk melihat hasil klasifikasi.';
  }

  async function classify() {
    if (!model) return;
    classifyBtn.disabled = true;
    status.textContent = 'Proses menganalisa...';
    status.className = 'status';

    await new Promise(r => setTimeout(r, 50));

    const probs = tf.tidy(() => {
      const t = tf.browser.fromPixels(preview)
        .resizeBilinear([SIZE, SIZE]).toFloat().div(255).expandDims(0);
      return model.predict(t);
    });

    const data = await probs.data();
    probs.dispose();

    const sorted = CLASSES.map((c, i) => ({ ...c, p: data[i] }))
      .sort((a, b) => b.p - a.p);

    resultsArea.innerHTML = sorted.map((r, i) => {
      const pct = (r.p * 100).toFixed(1);
      return `<div class="result-item${i === 0 ? ' top' : ''}">
        <div style="flex:1">
          <div class="result-name">${r.name}</div>
          <div class="bar"><div class="bar-fill ${r.fill}" style="width:${pct}%"></div></div>
        </div>
        <span class="result-pct">${pct}%</span>
      </div>`;
    }).join('');

    resultsHint.textContent = 'Klasifikasi selesai.';
    status.textContent = 'Model siap';
    status.className = 'status ready';
    classifyBtn.disabled = false;
  }

  function reset() {
    previewArea.hidden = true;
    fileInput.value = '';
    resetResults();
  }

  dropZone.onclick = () => fileInput.click();
  fileInput.onchange = e => onFile(e.target.files[0]);
  dropZone.ondragover = e => { e.preventDefault(); dropZone.classList.add('drag-over'); };
  dropZone.ondragleave = () => dropZone.classList.remove('drag-over');
  dropZone.ondrop = e => { e.preventDefault(); dropZone.classList.remove('drag-over'); onFile(e.dataTransfer.files[0]); };
  classifyBtn.onclick = classify;
  resetBtn.onclick = reset;

  init();
})();
