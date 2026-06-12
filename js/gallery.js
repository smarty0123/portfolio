(function () {
  const grid = document.getElementById('galleryGrid');
  const emptyState = document.getElementById('galleryEmpty');
  const filtersContainer = document.querySelector('.gallery-filters');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbCounter = document.getElementById('lbCounter');
  let images = [];
  let filtered = [];
  let currentIdx = 0;

  // Render in batches so the grid scales to any manifest size
  const BATCH_SIZE = 24;
  let renderedCount = 0;
  const sentinel = document.createElement('div');
  grid.after(sentinel);
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && renderedCount < filtered.length) appendBatch();
  }, { rootMargin: '600px' }).observe(sentinel);

  // Load images from JSON
  fetch('gallery/images.json')
    .then(r => r.json())
    .then(data => {
      images = data;
      if (!images.length) { emptyState.style.display = 'block'; return; }
      buildFilters();
      renderGallery(images);
    })
    .catch(() => { emptyState.style.display = 'block'; });

  function buildFilters() {
    const cats = [...new Set(images.map(i => i.category).filter(Boolean))];
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.textContent = cat;
      btn.dataset.filter = cat;
      btn.addEventListener('click', () => filterBy(cat, btn));
      filtersContainer.appendChild(btn);
    });
  }

  function filterBy(cat, btn) {
    document.querySelectorAll('.gallery-filters button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const subset = cat === 'all' ? images : images.filter(i => i.category === cat);
    renderGallery(subset);
  }

  // "All" button handler
  filtersContainer.querySelector('[data-filter="all"]').addEventListener('click', function () {
    document.querySelectorAll('.gallery-filters button').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    renderGallery(images);
  });

  function renderGallery(items) {
    filtered = items;
    grid.innerHTML = '';
    renderedCount = 0;
    appendBatch();
  }

  function appendBatch() {
    const batch = filtered.slice(renderedCount, renderedCount + BATCH_SIZE);
    batch.forEach((img, i) => {
      const idx = renderedCount + i;
      const div = document.createElement('div');
      div.className = 'gallery-item';
      div.innerHTML = `
        <img src="gallery/thumbs/${img.file}" alt="${img.caption || ''}" loading="lazy" />
        <div class="overlay">
          ${img.category ? `<span class="tag">${img.category}</span>` : ''}
          ${img.caption ? `<span class="caption">${img.caption}</span>` : ''}
        </div>`;
      div.addEventListener('click', () => openLightbox(idx));
      grid.appendChild(div);
    });
    renderedCount += batch.length;
  }

  // Lightbox
  function openLightbox(idx) {
    currentIdx = idx;
    updateLightbox();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  function updateLightbox() {
    const img = filtered[currentIdx];
    lbImg.src = 'gallery/' + img.file;
    lbImg.alt = img.caption || '';
    lbCaption.textContent = img.caption || '';
    lbCounter.textContent = (currentIdx + 1) + ' / ' + filtered.length;
  }
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', () => {
    currentIdx = (currentIdx - 1 + filtered.length) % filtered.length;
    updateLightbox();
  });
  document.getElementById('lbNext').addEventListener('click', () => {
    currentIdx = (currentIdx + 1) % filtered.length;
    updateLightbox();
  });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  // Swipe navigation on touch screens
  let touchStartX = null;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(dx) < 40) return;
    currentIdx = (currentIdx + (dx < 0 ? 1 : -1) + filtered.length) % filtered.length;
    updateLightbox();
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') { currentIdx = (currentIdx - 1 + filtered.length) % filtered.length; updateLightbox(); }
    if (e.key === 'ArrowRight') { currentIdx = (currentIdx + 1) % filtered.length; updateLightbox(); }
  });
})();
