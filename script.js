const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif|avif)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

const folders = [
  { name: "产品视频", grid: "videoGrid" },
  { name: "产品图片", grid: "productGrid" },
  { name: "人像摄影", grid: "portraitGrid" }
];

document.getElementById("year").textContent = new Date().getFullYear();

async function loadFolder(folderName, gridId) {
  try {
    const response = await fetch(folderName);
    const text = await response.text();
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(text, "text/html");

    const links = [...htmlDoc.querySelectorAll("a")];
    const files = links.map(a => a.getAttribute("href"))
      .filter(name => IMAGE_EXT.test(name) || VIDEO_EXT.test(name));

    const grid = document.getElementById(gridId);

    files.forEach(file => {
      const path = `${folderName}/${file}`;

      if (IMAGE_EXT.test(file)) {
        const img = document.createElement("img");
        img.src = path;
        grid.appendChild(img);
      }

      if (VIDEO_EXT.test(file)) {
        const video = document.createElement("video");
        video.src = path;
        video.controls = true;
        grid.appendChild(video);
      }
    });

  } catch (err) {
    console.warn("无法加载文件夹:", folderName);
  }
}

folders.forEach(f => {
  loadFolder(f.name, f.grid);
});