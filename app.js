const progress = document.querySelector(".progress-bar");
const loader = document.querySelector("#loader");

const spriteRows = [
  "00000111100000",
  "00001222210000",
  "00012222221000",
  "00122022022100",
  "01222222222210",
  "12220222220221",
  "12222211222221",
  "12222222222221",
  "01222333322210",
  "00122333322100",
  "00012222221000",
  "00001244210000",
  "00000144100000",
  "00000011000000"
];

const palette = {
  1: "#15161c",
  2: "#fff7df",
  3: "#ff7900",
  4: "#00a36c"
};

function buildSprite(target, scale = "normal") {
  const node = typeof target === "string" ? document.querySelector(target) : target;
  if (!node) return;
  node.innerHTML = "";
  spriteRows.join("").split("").forEach((cell) => {
    const dot = document.createElement("span");
    dot.className = cell === "0" ? "dot" : "dot on";
    if (cell !== "0") dot.style.setProperty("--c", palette[cell]);
    node.appendChild(dot);
  });
  node.dataset.scale = scale;
}

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  progress.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
}

function revealOnScroll() {
  document.querySelectorAll(".sprite-card, .input-chip, .memory-card, .challenge-grid article, .launch-grid article").forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.88) el.classList.add("visible");
  });
}

window.addEventListener("scroll", () => {
  updateProgress();
  revealOnScroll();
});

window.addEventListener("load", () => {
  buildSprite("#loaderSprite", "small");
  buildSprite("#heroSprite");
  buildSprite("#canvasSprite");
  if (window.lucide) window.lucide.createIcons();
  updateProgress();
  revealOnScroll();
  window.setTimeout(() => loader?.classList.add("done"), 520);
});
