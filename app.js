(() => {
  const MODEL_URL = './tfjs_model/model.json';
  const SIZE = 150;
  const CLASSES = [
    {
      name: 'Bercak Daun Awal',
      description: 'Penyakit Early Blight disebabkan oleh jamur Alternaria solani. Ciri-cirinya adalah munculnya bercak-bercak cokelat gelap berbentuk lingkaran konsentris (seperti papan target) pada daun bagian bawah tanaman yang lebih tua. Bercak biasanya dikelilingi oleh area kuning (klorosis). Jika tidak ditangani, daun akan menguning, mengering, dan rontok sehingga mengurangi hasil panen.',
    },
    {
      name: 'Hawar Daun Lanjut',
      description: 'Penyakit Late Blight disebabkan oleh oomycete Phytophthora infestans. Ciri-cirinya adalah munculnya bercak besar berwarna hijau gelap hingga cokelat kehitaman yang tampak basah (water-soaked) pada daun, batang, dan umbi. Pada kondisi lembap, sering terlihat pertumbuhan jamur putih seperti kapas di bagian bawah daun. Penyakit ini sangat agresif dan dapat menghancurkan seluruh tanaman dalam waktu singkat.',
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
      dropZone.classList.add('has-image');
      resultsDiv.hidden = true;
    };
    reader.readAsDataURL(file);
  }

  async function classify() {
    if (!model || !preview.src) return;
    classifyBtn.disabled = true;
    status.textContent = 'Proses menganalisa...';
    status.className = 'status';

    await new Promise(r => setTimeout(r, 50));

    try {
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

      status.textContent = 'Model siap';
      status.className = 'status ready';
    } catch (e) {
      console.error(e);
      status.textContent = 'Terjadi kesalahan saat klasifikasi';
      status.className = 'status error';
    }
    classifyBtn.disabled = false;
  }

  // Modal
  const openModal = () => { modalOverlay.hidden = false; };
  infoBtn.onclick = openModal;
  if (infoLabel) infoLabel.onclick = openModal;
  modalClose.onclick = () => { modalOverlay.hidden = true; };
  modalOverlay.onclick = (e) => {
    if (e.target === modalOverlay) modalOverlay.hidden = true;
  };

  // Upload events
  dropZone.onclick = () => fileInput.click();
  fileInput.onchange = e => { if (e.target.files[0]) onFile(e.target.files[0]); };
  dropZone.ondragover = e => { e.preventDefault(); dropZone.classList.add('drag-over'); };
  dropZone.ondragleave = () => dropZone.classList.remove('drag-over');
  dropZone.ondrop = e => { e.preventDefault(); dropZone.classList.remove('drag-over'); if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]); };
  classifyBtn.onclick = classify;

  init();
})();
