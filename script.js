const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif|avif)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

const GITHUB_USER = "Auster2";     // 改成你的用户名
const GITHUB_REPO = "Auster2.github.io";      // ⚠️ 改成你的仓库名

const folders = [
  { name: "产品视频", grid: "videoGrid" },
  { name: "产品图片", grid: "productGrid" },
  { name: "人像摄影", grid: "portraitGrid" }
];

document.getElementById("year").textContent = new Date().getFullYear();

async function loadFolder(folderName, gridId) {
  try {
    const apiURL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${encodeURIComponent(folderName)}`;
    
    const response = await fetch(apiURL);
    if (!response.ok) {
      console.warn("GitHub API 请求失败:", folderName);
      return;
    }

    const files = await response.json();
    const grid = document.getElementById(gridId);

    files.forEach(file => {
      if (file.type !== "file") return;

      const fileName = file.name;

      if (IMAGE_EXT.test(fileName)) {
        const img = document.createElement("img");
        img.src = file.download_url;  // GitHub raw 地址
        grid.appendChild(img);
      }

      if (VIDEO_EXT.test(fileName)) {
        const video = document.createElement("video");
        video.src = file.download_url;
        video.controls = true;
        grid.appendChild(video);
      }
    });

  } catch (err) {
    console.error("加载失败:", folderName, err);
  }
}

folders.forEach(f => loadFolder(f.name, f.grid));