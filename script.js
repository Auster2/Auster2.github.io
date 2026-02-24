// ─── 分類圖片/影片列表（請自行修改這裡） ────────────────────────────────
const CATEGORIES = {
  video: [
    // "videos/product-01.mp4",
    // "videos/product-02.mp4",
  ],
  product: [
    // "images/product/01.jpg",
    // "images/product/02.jpg",
    // "images/product/03.webp",
  ],
  portrait: [
    // "images/portrait/01.jpg",
    // "images/portrait/02.jpg",
    // "images/portrait/03.jpg",
  ]
};

// 如果你想用 GitHub 自動掃描，請保留下面這段並填入正確資訊
const USE_GITHUB_AUTO = false;
const GITHUB_USER = "Auster2";
const GITHUB_REPO = "Auster2.github.io";

// ────────────────────────────────────────────────────────────────────────

const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
  cursorRing.style.left = e.clientX + 'px';
  cursorRing.style.top  = e.clientY + 'px';
});

document.addEventListener('mouseover', e => {
  if (e.target.closest('a, button, .photo-item, .video-item')) {
    document.body.classList.add('hovering');
  }
});
document.addEventListener('mouseout', e => {
  if (e.target.closest('a, button, .photo-item, .video-item')) {
    document.body.classList.remove('hovering');
  }
});

// ── 渲染函式 ───────────────────────────────────────────────────────────
function renderItems(gridId, items, type = 'image') {
  const grid = document.getElementById(gridId);
  const countEl = document.getElementById(gridId.replace('Grid','Count'));
  if (!grid || !countEl) return;

  if (items.length === 0) {
    countEl.textContent = '— 0 件';
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:4rem;color:#666;">尚無作品</p>';
    return;
  }

  countEl.textContent = `— ${items.length} 件`;
  grid.innerHTML = '';

  items.forEach((src, index) => {
    const item = document.createElement('div');
    item.className = type === 'video' ? 'video-item reveal' : 'photo-item reveal';

    if (type === 'video') {
      item.innerHTML = `
        <video src="${src}" muted loop playsinline preload="metadata"></video>
        <div class="video-overlay">
          <span class="video-name">${getFilename(src)}</span>
        </div>`;
    } else {
      item.innerHTML = `
        <img src="${src}" alt="${getFilename(src)}" loading="lazy" />
        <div class="photo-overlay">
          <span class="photo-name">${getFilename(src)}</span>
        </div>`;
    }

    item.addEventListener('click', () => openLightbox(src, type, index));
    grid.appendChild(item);
  });
}

function getFilename(path) {
  return path.split('/').pop().replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
}

// ── Lightbox ───────────────────────────────────────────────────────────
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbVideo = document.getElementById('lbVideo');
const lbCaption = document.getElementById('lbCaption');
let currentList = [];
let currentIndex = 0;

function openLightbox(src, type, idx) {
  currentIndex = idx;
  currentList = type === 'video' ? CATEGORIES.video : 
                type === 'product' ? CATEGORIES.product : CATEGORIES.portrait;

  lbImg.src = type === 'image' ? src : '';
  lbVideo.src = type === 'video' ? src : '';
  lbVideo.muted = true;
  lbVideo.loop = true;
  lbVideo.play().catch(()=>{});

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
  const isVideo = currentList === CATEGORIES.video;

  lbImg.src = isVideo ? '' : src;
  lbVideo.src = isVideo ? src : '';
  lbVideo.muted = true;
  lbVideo.loop = true;
  lbVideo.play().catch(()=>{});
  lbCaption.textContent = getFilename(src);
}

document.getElementById('lbClose').onclick = closeLightbox;
document.getElementById('lbPrev').onclick = () => navigate(-1);
document.getElementById('lbNext').onclick = () => navigate(1);
lb.onclick = e => { if (e.target === lb) closeLightbox(); };

document.addEventListener('keydown', e => {
  if (!lb.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft')  navigate(-1);
  if (e.key === 'ArrowRight') navigate(1);
});

// ── 初始化 ─────────────────────────────────────────────────────────────
function init() {
  renderItems('videoGrid',    CATEGORIES.video,   'video');
  renderItems('productGrid',  CATEGORIES.product, 'image');
  renderItems('portraitGrid', CATEGORIES.portrait,'image');

  // 可選：如果想用 GitHub API 自動載入，請自行實作或使用原本的 loadFromGitHub 邏輯
}

init();

// 滾動出現效果
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));