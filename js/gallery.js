(function () {
  const grid = document.getElementById('galleryGrid');
  const emptyState = document.getElementById('galleryEmpty');
  const filtersContainer = document.querySelector('.gallery-filters');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbCounter = document.getElementById('lbCounter');
  const lbOriginal = document.getElementById('lbOriginal');
  const lbClose = document.getElementById('lbClose');
  let images = [];
  let filtered = [];
  let currentIdx = 0;
  let returnFocus = null;

  // Image URLs: grid uses 480px thumbs; the lightbox picks a 1600/3000px size via srcset
  const thumbUrl = (img) => 'gallery/thumbs/' + img.file;
  const originalUrl = (img) => 'gallery/' + img.file;
  const largeSrcset = (img) =>
    `gallery/large/1600/${img.file} 1600w, gallery/large/3000/${img.file} 3000w`;

  // Render in batches so the grid scales to any manifest size
  const BATCH_SIZE = 24;
  let renderedCount = 0;
  const sentinel = document.createElement('div');
  grid.after(sentinel);
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && renderedCount < filtered.length) appendBatch();
  }, { rootMargin: '600px' }).observe(sentinel);

  fetch('gallery/images.json')
    .then((r) => r.json())
    .then((data) => {
      images = data;
      if (!images.length) { emptyState.hidden = false; return; }
      buildFilters();
      renderGallery(images);
    })
    .catch(() => { emptyState.hidden = false; });

  function buildFilters() {
    const cats = [...new Set(images.map((i) => i.category).filter(Boolean))];
    cats.forEach((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = cat;
      btn.dataset.filter = cat;
      btn.setAttribute('aria-pressed', 'false');
      filtersContainer.appendChild(btn);
    });
  }

  filtersContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    filtersContainer.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });
    const cat = btn.dataset.filter;
    renderGallery(cat === 'all' ? images : images.filter((i) => i.category === cat));
  });

  function renderGallery(items) {
    filtered = items;
    grid.replaceChildren();
    renderedCount = 0;
    appendBatch();
  }

  // Real caption, or null when it's just a camera filename like "IMG 1026"
  const CAMERA_NAME = /^(IMG|DSC|DSCF|PXL)[\s_-]?\d+$/i;
  const realCaption = (img) => (img.caption && !CAMERA_NAME.test(img.caption.trim()) ? img.caption : null);
  const describe = (img) => realCaption(img) || (img.category ? img.category + ' photo' : 'Photo');

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function appendBatch() {
    const batch = filtered.slice(renderedCount, renderedCount + BATCH_SIZE);
    batch.forEach((img, i) => {
      const idx = renderedCount + i;
      const item = el('button', 'gallery-item');
      item.type = 'button';
      item.setAttribute('aria-label', 'Open ' + describe(img));

      const thumb = el('img');
      thumb.src = thumbUrl(img);
      thumb.alt = describe(img);
      thumb.loading = 'lazy';
      thumb.decoding = 'async';
      // reserve the right box before the thumb loads (no layout shift)
      if (img.w && img.h) { thumb.width = img.w; thumb.height = img.h; }

      item.append(thumb);
      item.addEventListener('click', () => openLightbox(idx));
      grid.appendChild(item);
    });
    renderedCount += batch.length;
  }

  // Lightbox
  function openLightbox(idx) {
    returnFocus = document.activeElement;
    currentIdx = idx;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    updateLightbox();
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (returnFocus) returnFocus.focus();
  }

  function step(delta) {
    currentIdx = (currentIdx + delta + filtered.length) % filtered.length;
    updateLightbox();
  }

  // Display box for the image: fit 90vw × 85vh while keeping its aspect ratio
  function fitBox(img) {
    if (!img.w || !img.h) return null;
    const scale = Math.min((window.innerWidth * 0.9) / img.w, (window.innerHeight * 0.85) / img.h);
    return { w: Math.round(img.w * scale), h: Math.round(img.h * scale) };
  }

  function sizesFor(img) {
    const box = fitBox(img);
    return box ? box.w + 'px' : '90vw';
  }

  function preload(img) {
    const p = new Image();
    p.sizes = sizesFor(img);
    p.srcset = largeSrcset(img);
  }

  function updateLightbox() {
    const img = filtered[currentIdx];
    const box = fitBox(img);
    lbImg.style.width = box ? box.w + 'px' : '';
    lbImg.style.height = box ? box.h + 'px' : '';

    // Show the (already cached) thumb instantly, then swap in the sharp size once it's loaded
    lbImg.removeAttribute('srcset');
    lbImg.src = thumbUrl(img);
    lbImg.alt = describe(img);
    const sharp = new Image();
    sharp.sizes = sizesFor(img);
    sharp.srcset = largeSrcset(img);
    sharp.onload = () => {
      if (filtered[currentIdx] !== img) return; // user moved on
      lbImg.sizes = sharp.sizes;
      lbImg.srcset = sharp.srcset;
      lbImg.src = sharp.currentSrc;
    };

    lbCaption.textContent = realCaption(img) || '';
    lbCounter.textContent = (currentIdx + 1) + ' / ' + filtered.length;
    lbOriginal.href = originalUrl(img);

    if (filtered.length > 1) {
      preload(filtered[(currentIdx + 1) % filtered.length]);
      preload(filtered[(currentIdx - 1 + filtered.length) % filtered.length]);
    }
  }

  window.addEventListener('resize', () => {
    if (!lightbox.classList.contains('open')) return;
    const box = fitBox(filtered[currentIdx]);
    if (!box) return;
    lbImg.style.width = box.w + 'px';
    lbImg.style.height = box.h + 'px';
  });

  lbClose.addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', () => step(-1));
  document.getElementById('lbNext').addEventListener('click', () => step(1));
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
    step(dx < 0 ? 1 : -1);
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'Tab') trapFocus(e);
  });

  // Keep Tab cycling inside the open dialog
  function trapFocus(e) {
    const focusables = [...lightbox.querySelectorAll('button, a[href]')]
      .filter((n) => n.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
})();
