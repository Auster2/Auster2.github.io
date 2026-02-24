// Config
const GITHUB_USER = "Auster2";
const GITHUB_REPO = "Auster2.github.io";

const IMAGE_EXTS = /\.(jpe?g|png|webp|gif|avif|bmp|tiff?)$/i;
const VIDEO_EXTS = /\.(mp4|webm|mov|avi)$/i;

const FOLDERS = {
  video:    "videos/",
  product:  "images/product/",
  portrait: "images/portrait/"
};

// Custom cursor
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
  cursorRing.style.left = e.clientX + 'px';
  cursorRing.style.top  = e.clientY + 'px';
});
document.addEventListener('mouseover', e => {
  if (e.target.matches('a,button,.photo-item,.video-item')) document.body.classList.add('hovering');
});
document.addEventListener('mouseout', e => {
  if (e.target.matches('a,button,.photo-item,.video-item')) document.body.classList.remove('hovering');
});

// Footer year (if you add footer later)
if (document.getElementById('footerYear')) {
  document.getElementById('footerYear').textContent = new Date().getFullYear();
}

// Reveal
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Helpers
function getFilename(path) {
  return path.split('/').pop().replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
}

function renderGrid(gridId, countId, emptyId, list, type = 'image') {
  const grid = document.getElementById(gridId);
  const count = document.getElementById(countId);
  const empty = document.getElementById(emptyId);

  if (!grid || !count) return;

  if (list.length === 0) {
    count.textContent = '— 0 件';
    if (empty) empty.style.display = 'block';
    grid.innerHTML = '';
    return;
  }

  count.textContent = `— ${list.length} 件`;
  if (empty) empty.style.display = 'none';
  grid.innerHTML = '';

  list.forEach((src, i) => {
    const item = document.createElement('div');
    item.className = type === 'video' ? 'video-item reveal' : 'photo-item reveal';

    const name = getFilename(src);

    if (type === 'video') {
      item.innerHTML = `
        <video src="${src}" muted loop playsinline preload="metadata"></video>
        <div class="video-overlay">
          <span class="video-name">${name}</span>
        </div>`;
    } else {
      item.innerHTML = `
        <img src="${src}" alt="${name}" loading="lazy" />
        <div class="photo-overlay">
          <span class="photo-name">${name}</span>
        </div>`;
    }

    item.addEventListener('click', () => openLightbox(src, type, i, list));
    grid.appendChild(item);
    observer.observe(item);
  });
}

// Lightbox
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbVideo = document.getElementById('lbVideo');
const lbCaption = document.getElementById('lbCaption');
let currentList = [];
let currentIndex = 0;

function openLightbox(src, type, idx, list) {
  currentIndex = idx;
  currentList = list;

  const isVideo = VIDEO_EXTS.test(src);

  lbImg.src = isVideo ? '' : src;
  lbVideo.src = isVideo ? src : '';
  if (isVideo) {
    lbVideo.muted = true;
    lbVideo.loop = true;
    lbVideo.play().catch(() => {});
  }

  lbCaption.textContent = getFilename(src);
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lb.classList.remove('active');
  lbVideo.pause();
  lbVideo.src = '';
  document.body.style.overflow = '';
}

function navigate(dir) {
  currentIndex = (currentIndex + dir + currentList.length) % currentList.length;
  const src = currentList[currentIndex];
  const isVideo = VIDEO_EXTS.test(src);

  lbImg.src = isVideo ? '' : src;
  lbVideo.src = isVideo ? src : '';
  if (isVideo) {
    lbVideo.muted = true;
    lbVideo.loop = true;
    lbVideo.play().catch(() => {});
  }
  lbCaption.textContent = getFilename(src);
}

document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbPrev').addEventListener('click', () => navigate(-1));
document.getElementById('lbNext').addEventListener('click', () => navigate(1));
lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lb.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navigate(-1);
  if (e.key === 'ArrowRight') navigate(1);
});

// Load from GitHub
async function loadFromGitHub() {
  let loaded = false;

  for (const [key, path] of Object.entries(FOLDERS)) {
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${path}`);
      if (!res.ok) continue;
      const files = await res.json();
      if (!Array.isArray(files)) continue;

      const validFiles = files
        .filter(f => f.type === 'file' && (key === 'video' ? VIDEO_EXTS : IMAGE_EXTS).test(f.name))
        .map(f => `${path}${f.name}`);

      if (validFiles.length > 0) {
        loaded = true;
      }

      if (key === 'video') {
        renderGrid('videoGrid', 'videoCount', 'videoEmpty', validFiles, 'video');
      } else if (key === 'product') {
        renderGrid('productGrid', 'productCount', 'productEmpty', validFiles, 'image');
      } else if (key === 'portrait') {
        renderGrid('portraitGrid', 'portraitCount', 'portraitEmpty', validFiles, 'image');
      }
    } catch (e) {
      console.error(`加载 ${key} 失败:`, e);
    }
  }

  return loaded;
}

async function init() {
  const ok = await loadFromGitHub();
  if (!ok) {
    // 如果全部失败，可以加全局提示，但这里三个分类各自有 empty state
  }
}

init();