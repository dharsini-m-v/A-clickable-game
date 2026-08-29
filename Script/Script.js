"use strict";

/* =========================================================
   CONFIG
========================================================= */
const API_BASE = window.location.origin; // backend is served from the same origin

/* =========================================================
   THEME
========================================================= */
const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const themeIcon = themeToggle.querySelector(".theme-icon");

function setTheme(theme) {
  body.setAttribute("data-theme", theme);
  themeIcon.textContent = theme === "light" ? "☀️" : "🌙";
  localStorage.setItem("wonderworld-theme", theme);
}
setTheme(localStorage.getItem("wonderworld-theme") || "light");

themeToggle.addEventListener("click", () => {
  const next = body.getAttribute("data-theme") === "light" ? "dark" : "light";
  setTheme(next);
  playPop(660);
});

/* =========================================================
   SOUND (Web Audio API — tiny, non-annoying blips)
========================================================= */
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  return audioCtx;
}
function playPop(freq = 520) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}
// unlock audio context on first user gesture
document.addEventListener("click", () => { getAudioCtx(); }, { once: true });

function bounce(el) {
  el.classList.remove("bounce");
  void el.offsetWidth; // restart animation
  el.classList.add("bounce");
}

/* =========================================================
   SPARKLE CURSOR TRAIL
========================================================= */
const canvas = document.getElementById("sparkle-canvas");
const ctx2d = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const SPARKLE_COLORS = ["#FF6B6B", "#FFA53C", "#FFD93C", "#4ECB71", "#3EC1F3", "#B673FF", "#FF8FD9"];

let lastSparkle = 0;
window.addEventListener("pointermove", (e) => {
  const now = performance.now();
  if (now - lastSparkle < 28) return; // throttle for performance
  lastSparkle = now;
  for (let i = 0; i < 2; i++) {
    particles.push({
      x: e.clientX + (Math.random() - 0.5) * 6,
      y: e.clientY + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2 - 0.4,
      life: 1,
      size: Math.random() * 3 + 2,
      color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
    });
  }
  if (particles.length > 140) particles.splice(0, particles.length - 140);
});

function animateSparkles() {
  ctx2d.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p) => {
    p.x += p.vx; p.y += p.vy; p.life -= 0.025;
    ctx2d.globalAlpha = Math.max(p.life, 0);
    ctx2d.fillStyle = p.color;
    ctx2d.beginPath();
    ctx2d.arc(p.x, p.y, p.size * Math.max(p.life, 0), 0, Math.PI * 2);
    ctx2d.fill();
  });
  particles = particles.filter((p) => p.life > 0);
  ctx2d.globalAlpha = 1;
  requestAnimationFrame(animateSparkles);
}
animateSparkles();

/* =========================================================
   NAVIGATION
========================================================= */
const screens = document.querySelectorAll(".screen");
const navStack = ["screen-home"];

function showScreen(id, pushToStack = true) {
  screens.forEach((s) => s.classList.toggle("active", s.id === id));
  if (pushToStack) {
    if (navStack[navStack.length - 1] !== id) navStack.push(id);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("homeBtn").addEventListener("click", () => {
  navStack.length = 0; navStack.push("screen-home");
  showScreen("screen-home", false);
  playPop(500);
});

document.getElementById("backBtn").addEventListener("click", () => {
  if (navStack.length > 1) navStack.pop();
  showScreen(navStack[navStack.length - 1], false);
  playPop(420);
});

document.getElementById("getStartedBtn").addEventListener("click", (e) => {
  bounce(e.currentTarget);
  playPop(700);
  setTimeout(() => showScreen("screen-categories"), 180);
});

document.querySelectorAll(".category-card").forEach((card) => {
  card.addEventListener("click", () => {
    bounce(card);
    playPop(620);
    const category = card.dataset.category;
    setTimeout(() => openCategory(category), 160);
  });
});

document.getElementById("toEditorBtn").addEventListener("click", (e) => {
  bounce(e.currentTarget);
  playPop(560);
  setTimeout(() => showScreen("screen-editor"), 150);
});

/* =========================================================
   LEARNING CONTENT
   (Real photos are fetched live from Wikipedia's public thumbnail
   API for each item, so kids see realistic, recognizable images.)
========================================================= */
const CATEGORY_DATA = {
  animals: {
    title: "🦁 Animals",
    items: [
      { name: "Lion", wiki: "Lion" },
      { name: "Tiger", wiki: "Tiger" },
      { name: "Elephant", wiki: "African bush elephant" },
      { name: "Rhinoceros", wiki: "Rhinoceros" },
    ],
  },
  fruits: {
    title: "🍎 Fruits",
    items: [
      { name: "Apple", wiki: "Apple" },
      { name: "Banana", wiki: "Banana" },
      { name: "Blueberry", wiki: "Blueberry" },
      { name: "Orange", wiki: "Orange (fruit)" },
    ],
  },
  vegetables: {
    title: "🥕 Vegetables",
    items: [
      { name: "Potato", wiki: "Potato" },
      { name: "Ladies Finger (Okra)", wiki: "Okra" },
      { name: "Brinjal (Eggplant)", wiki: "Eggplant" },
      { name: "Bitter Gourd", wiki: "Bitter melon" },
    ],
  },
  birds: {
    title: "🦚 Birds",
    items: [
      { name: "Peacock", wiki: "Indian peafowl" },
      { name: "Parrot", wiki: "Parrot" },
      { name: "Kingfisher", wiki: "Common kingfisher" },
      { name: "Sparrow", wiki: "House sparrow" },
    ],
  },
};

const thumbCache = {};
async function fetchThumbnail(wikiTitle) {
  if (thumbCache[wikiTitle]) return thumbCache[wikiTitle];
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`
    );
    const data = await res.json();
    const url = (data.originalimage && data.originalimage.source) ||
                (data.thumbnail && data.thumbnail.source) || null;
    thumbCache[wikiTitle] = url;
    return url;
  } catch (err) {
    return null;
  }
}

function openCategory(category) {
  const data = CATEGORY_DATA[category];
  if (!data) return;
  document.getElementById("itemsTitle").textContent = data.title;
  const grid = document.getElementById("itemGrid");
  grid.innerHTML = "";

  data.items.forEach((item) => {
    const card = document.createElement("button");
    card.className = "item-card";
    card.innerHTML = `
      <img src="" alt="${item.name}" loading="lazy" />
      <div class="item-name">${item.name}</div>
    `;
    const imgEl = card.querySelector("img");
    imgEl.style.background = "linear-gradient(135deg,#eee,#ddd)";
    fetchThumbnail(item.wiki).then((url) => {
      if (url) imgEl.src = url;
    });
    card.addEventListener("click", () => {
      bounce(card);
      playPop(680);
      openItemPopup(item, imgEl.src);
    });
    grid.appendChild(card);
  });

  showScreen("screen-items");
}

const itemPopup = document.getElementById("itemPopup");
const popupImage = document.getElementById("popupImage");
const popupName = document.getElementById("popupName");

function openItemPopup(item, imgSrc) {
  popupImage.src = imgSrc || "";
  popupName.textContent = item.name;
  itemPopup.classList.add("active");
}
document.getElementById("popupClose").addEventListener("click", () => {
  itemPopup.classList.remove("active");
  playPop(400);
});
itemPopup.addEventListener("click", (e) => {
  if (e.target === itemPopup) itemPopup.classList.remove("active");
});

/* =========================================================
   IMAGE EDITOR
========================================================= */
const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const editorWorkspace = document.getElementById("editorWorkspace");
const previewImage = document.getElementById("previewImage");
const previewFrame = document.getElementById("previewFrame");
const fileNameLabel = document.getElementById("fileNameLabel");
const dimsLabel = document.getElementById("dimsLabel");

let sessionId = null;
let originalPreviewURL = null;
let currentPreviewURL = null;
let zoomLevel = 1;

async function uploadFile(file) {
  if (!file) return;
  if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
    alert("Please choose a JPG or PNG image.");
    return;
  }
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.detail || "Upload failed.");
    return;
  }
  const data = await res.json();
  sessionId = data.session_id;
  fileNameLabel.textContent = `📄 ${data.filename}`;
  dimsLabel.textContent = `${data.width} × ${data.height}px`;

  originalPreviewURL = URL.createObjectURL(file);
  currentPreviewURL = originalPreviewURL;
  previewImage.src = currentPreviewURL;

  uploadArea.classList.add("hidden");
  editorWorkspace.classList.remove("hidden");
  setCompareMode("edited");
  resetZoom();
}

uploadArea.addEventListener("click", (e) => {
  if (e.target.closest(".upload-button")) return;
  fileInput.click();
});
fileInput.addEventListener("change", (e) => uploadFile(e.target.files[0]));

["dragenter", "dragover"].forEach((evt) =>
  uploadArea.addEventListener(evt, (e) => { e.preventDefault(); uploadArea.classList.add("drag-over"); })
);
["dragleave", "drop"].forEach((evt) =>
  uploadArea.addEventListener(evt, (e) => { e.preventDefault(); uploadArea.classList.remove("drag-over"); })
);
uploadArea.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  uploadFile(file);
});

async function applyOperation(operation, params = {}, base = "current") {
  if (!sessionId) return;
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("operation", operation);
  formData.append("params", JSON.stringify(params));
  formData.append("base", base);

  const res = await fetch(`${API_BASE}/process`, { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.detail || "That edit could not be applied.");
    return;
  }
  const blob = await res.blob();
  const w = res.headers.get("X-Image-Width");
  const h = res.headers.get("X-Image-Height");
  if (currentPreviewURL && currentPreviewURL !== originalPreviewURL) {
    URL.revokeObjectURL(currentPreviewURL);
  }
  currentPreviewURL = URL.createObjectURL(blob);
  setCompareMode("edited");
  if (w && h) dimsLabel.textContent = `${w} × ${h}px`;
}

document.querySelectorAll(".tool-btn[data-op]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const op = btn.dataset.op;
    bounce(btn);
    playPop(600);

    if (op === "__original") { setCompareMode("original"); return; }
    if (op === "__reset") { await resetEdit(); return; }
    if (op === "resize") {
      const w = document.getElementById("resizeW").value;
      const h = document.getElementById("resizeH").value;
      if (!w && !h) return;
      await applyOperation("resize", { width: w, height: h });
      return;
    }
    if (op === "threshold_binary") {
      await applyOperation("threshold_binary", { thresh: document.getElementById("threshSlider").value });
      return;
    }
    await applyOperation(op);
  });
});

// Live-ish sliders (applied on release for performance, always vs. the CURRENT edited image)
function wireSlider(sliderId, labelId, operation, key) {
  const slider = document.getElementById(sliderId);
  const label = document.getElementById(labelId);
  slider.addEventListener("input", () => { label.textContent = slider.value; });
  slider.addEventListener("change", () => {
    playPop(560);
    const params = {}; params[key] = slider.value;
    applyOperation(operation, params);
  });
}
wireSlider("brightnessSlider", "brightnessVal", "brightness", "value");
wireSlider("contrastSlider", "contrastVal", "contrast", "value");
wireSlider("blurSlider", "blurVal", "blur", "ksize");
wireSlider("threshSlider", "threshVal", "threshold_binary", "thresh");

async function resetEdit() {
  if (!sessionId) return;
  const formData = new FormData();
  formData.append("session_id", sessionId);
  const res = await fetch(`${API_BASE}/reset`, { method: "POST", body: formData });
  if (!res.ok) return;
  const blob = await res.blob();
  if (currentPreviewURL && currentPreviewURL !== originalPreviewURL) URL.revokeObjectURL(currentPreviewURL);
  currentPreviewURL = URL.createObjectURL(blob);
  setCompareMode("edited");
}

document.getElementById("resetAllBtn").addEventListener("click", async () => {
  playPop(440);
  await resetEdit();
  [...document.querySelectorAll('input[type=range]')].forEach((s) => {
    if (s.id === "blurSlider") s.value = 5; else if (s.id === "threshSlider") s.value = 127; else s.value = 0;
    s.dispatchEvent(new Event("input"));
  });
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  if (!sessionId) return;
  playPop(760);
  window.open(`${API_BASE}/download?session_id=${sessionId}&fmt=png`, "_blank");
});

/* compare original vs edited */
function setCompareMode(mode) {
  document.getElementById("showOriginal").classList.toggle("active", mode === "original");
  document.getElementById("showEdited").classList.toggle("active", mode === "edited");
  previewImage.src = mode === "original" ? originalPreviewURL : currentPreviewURL;
}
document.getElementById("showOriginal").addEventListener("click", () => setCompareMode("original"));
document.getElementById("showEdited").addEventListener("click", () => setCompareMode("edited"));

/* zoom */
const zoomLabel = document.getElementById("zoomLabel");
function applyZoom() {
  previewImage.style.transform = `scale(${zoomLevel})`;
  zoomLabel.textContent = `${Math.round(zoomLevel * 100)}%`;
}
function resetZoom() { zoomLevel = 1; applyZoom(); }
document.getElementById("zoomIn").addEventListener("click", () => { zoomLevel = Math.min(zoomLevel + 0.2, 4); applyZoom(); });
document.getElementById("zoomOut").addEventListener("click", () => { zoomLevel = Math.max(zoomLevel - 0.2, 0.2); applyZoom(); });
document.getElementById("zoomFit").addEventListener("click", () => { zoomLevel = 1; applyZoom(); });
document.getElementById("zoomReset").addEventListener("click", resetZoom);
