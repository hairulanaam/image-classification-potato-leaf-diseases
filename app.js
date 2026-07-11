(() => {
  const MODEL_URL = './tfjs_model/model.json';
  const MODEL_CACHE_URL = 'indexeddb://potato-disease-model-v1';
  const SIZE = 150;
  const CLASSES = [
    {
      name: 'Early Blight (Bercak Kering)',
      description: 'Penyakit bercak kering (early blight) pada daun tanaman kentang disebabkan oleh jamur Alternaria Solani yang ditularkan melalui udara. Gejala awal bercak kering pada daun bagian bawah, berwarna cokelat berupa tanda khas lingkaran berpusat (seperti cincin) pada bercak tersebut, sporulasi tidak nampak seperti embun putih. (Sumber: Sholihah & Dijaya, 2019)',
    },
    {
      name: 'Late Blight (Hawar Daun)',
      description: 'Penyakit busuk daun (late blight) atau yang biasanya disebut dengan “hawar daun” pada daun tanaman kentang disebabkan oleh jamur Phytophthora Infestans yang ditularkan nelalui udara serta air. Gejala pada penyakit ini mempunyai bercak pada bagian tepi atau tengah. Serangan penyakit ini dapat menyebar ke tangkai, batang, dan umbi kentang. Serangan penyakit ini dapat berkembang dengan cepat dan mematikan seluruh daun jika hujan atau kelembaban yang cukup tinggi. (Sumber: Sholihah & Dijaya, 2019)',
    },
    {
      name: 'Sehat',
      description: 'Daun tanaman kentang dalam kondisi sehat. Daun berwarna hijau cerah hingga hijau tua secara merata, tidak terdapat bercak, perubahan warna, atau tanda-tanda serangan patogen. Struktur daun utuh, permukaan daun bersih, dan tanaman menunjukkan pertumbuhan yang normal dan vigor.',
    },
  ];

  const $ = id => document.getElementById(id);
  const dropZone = $('drop-zone'), fileInput = $('file-input');
  const dropText = $('drop-text'), preview = $('preview');
  const classifyBtn = $('classify-btn'), status = $('status');
  const resultsDiv = $('results');
  const resultClass = $('result-class');
  const resultConfidence = $('result-confidence');
  const resultDescription = $('result-description');
  const infoBtn = $('info-btn'), infoLabel = $('info-label');
  const modalOverlay = $('modal-overlay');
  const modalClose = $('modal-close');

  let model = null;
  let modelLoadPromise = null;

  async function loadModelOnce() {
    if (model) return model;
    if (modelLoadPromise) return modelLoadPromise;

    modelLoadPromise = (async () => {
    try {
        return await tf.loadGraphModel(MODEL_CACHE_URL);
      } catch (cachedError) {
        try {
          const loadedModel = await tf.loadGraphModel(MODEL_URL);
          try {
            await loadedModel.save(MODEL_CACHE_URL);
          } catch (saveError) {
            console.warn('Gagal menyimpan model ke cache browser:', saveError);
          }
          return loadedModel;
        } catch (networkError) {
          throw networkError;
        }
      }
    })();

    try {
      model = await modelLoadPromise;
      return model;
    } finally {
      modelLoadPromise = null;
    }
  }

  async function init() {
    status.textContent = 'Silahkan pilih gambar untuk klasifikasi';
    status.className = 'status ready';
    classifyBtn.disabled = false;
    classifyBtn.classList.remove('is-loading');
  }

  function onFile(file) {
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      dropZone.classList.add('has-image');
      resultsDiv.hidden = true;
    };
    reader.readAsDataURL(file);
  }

  async function classify() {
    if (!preview.src) {
      status.textContent = 'Gambar masih kosong. Silakan pilih gambar terlebih dahulu';
      status.className = 'status error';
      return;
    }

    classifyBtn.disabled = true;
    classifyBtn.classList.add('is-loading');
    status.textContent = model ? 'Proses menganalisa' : 'Memproses gambar';
    status.className = 'status';

    await new Promise(r => setTimeout(r, 50));

    try {
      if (!model) {
        model = await loadModelOnce();
        tf.tidy(() => model.predict(tf.zeros([1, SIZE, SIZE, 3]))).dispose();
      }

      const probs = tf.tidy(() => {
        const t = tf.browser.fromPixels(preview)
          .resizeBilinear([SIZE, SIZE]).toFloat().div(255).expandDims(0);
        return model.predict(t);
      });

      const data = await probs.data();
      probs.dispose();

      let maxIdx = 0;
      for (let i = 1; i < data.length; i++) {
        if (data[i] > data[maxIdx]) maxIdx = i;
      }

      const topClass = CLASSES[maxIdx];
      const confidence = (data[maxIdx] * 100).toFixed(1);

      resultClass.textContent = topClass.name;
      resultConfidence.innerHTML = `<span class="confidence-badge">Akurasi: ${confidence}%</span>`;
      resultDescription.textContent = topClass.description;
      resultsDiv.hidden = false;

      status.textContent = 'Pilih gambar lain untuk klasifikasi berikutnya';
      status.className = 'status ready';
    } catch (e) {
      console.error(e);
      status.textContent = 'Terjadi kesalahan saat klasifikasi';
      status.className = 'status error';
    } finally {
      classifyBtn.classList.remove('is-loading');
      classifyBtn.disabled = false;
    }
  }

  const openModal = () => { modalOverlay.hidden = false; };
  infoBtn.onclick = openModal;
  if (infoLabel) infoLabel.onclick = openModal;
  modalClose.onclick = () => { modalOverlay.hidden = true; };
  modalOverlay.onclick = (e) => {
    if (e.target === modalOverlay) modalOverlay.hidden = true;
  };

  dropZone.onclick = () => fileInput.click();
  fileInput.onchange = e => { if (e.target.files[0]) onFile(e.target.files[0]); };
  dropZone.ondragover = e => { e.preventDefault(); dropZone.classList.add('drag-over'); };
  dropZone.ondragleave = () => dropZone.classList.remove('drag-over');
  dropZone.ondrop = e => { e.preventDefault(); dropZone.classList.remove('drag-over'); if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]); };
  classifyBtn.onclick = classify;

  init();
})();
