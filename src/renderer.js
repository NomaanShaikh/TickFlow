const bar = document.getElementById("ticker-bar");
const text = document.getElementById("ticker-text");
const panel = document.getElementById("settings-panel");

const speedSlider = document.getElementById("speed-slider");
const fontSizeSlider = document.getElementById("font-size-slider");
const fontFamily = document.getElementById("font-family");
const colorPicker = document.getElementById("color-picker");

let speed = 150;
let x = 0;
let textWidth = 0;
let lastTime = null;
let isEditing = false;
let isSaved = true;

/* ---------- LOAD FROM FILE ---------- */
(async () => {
  const saved = await window.TickFlowAPI.loadState();

  // 🔥 BACKWARD COMPATIBLE
  if (typeof saved === "string") {
    text.innerHTML = saved;
  } else if (saved && typeof saved === "object") {
    text.innerHTML = saved.text || "";
    if (saved.fontFamily) text.style.fontFamily = saved.fontFamily;
    if (saved.fontSize) text.style.fontSize = saved.fontSize;
    if (saved.color) text.style.color = saved.color;
  }

  measureText();
  hardReset();
})();

/* ---------- ENGINE ---------- */
function hardReset() {
  x = bar.offsetWidth;
}

function measureText() {
  const clone = text.cloneNode(true);
  clone.style.position = "absolute";
  clone.style.visibility = "hidden";
  clone.style.whiteSpace = "nowrap";
  clone.style.transform = "none";
  document.body.appendChild(clone);
  textWidth = Math.ceil(clone.getBoundingClientRect().width);
  document.body.removeChild(clone);
}

function animate(t) {
  if (!lastTime) lastTime = t;
  const delta = (t - lastTime) / 1000;
  lastTime = t;

  if (!isEditing && isSaved) {
    x -= speed * delta;

    if (x <= -textWidth) {
      hardReset();
    }

    text.style.transform = `translateX(${x}px) translateY(-50%)`;
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

/* ---------- HOTKEYS ---------- */
document.addEventListener("keydown", async (e) => {

  if (isEditing && e.key === "Enter") {
    e.preventDefault();
    return;
  }

  if (e.ctrlKey && e.key.toLowerCase() === "e") {
    e.preventDefault();
    isEditing = true;
    isSaved = false;
    text.contentEditable = true;
    text.classList.add("editing");
    text.focus();
    return;
  }

  if (e.ctrlKey && e.key.toLowerCase() === "s") {
    e.preventDefault();

    const state = {
      text: text.innerHTML,
      fontFamily: text.style.fontFamily,
      fontSize: text.style.fontSize,
      color: text.style.color
    };

    await window.TickFlowAPI.saveState(state);

    isEditing = false;
    isSaved = true;
    text.contentEditable = false;
    text.classList.remove("editing");

    measureText();
    showSavedPopup();
    return;
  }

  if (e.ctrlKey && e.shiftKey && e.code === "Comma") {
    panel.classList.toggle("open");
  }
});

/* ---------- CONTROLS ---------- */
speedSlider.oninput = () => {
  speed = Number(speedSlider.value);
};

fontSizeSlider.oninput = () => {
  text.style.fontSize = fontSizeSlider.value + "px";
  measureText();
};

fontFamily.onchange = () => {
  text.style.fontFamily = fontFamily.value;
  measureText();
};

colorPicker.oninput = () => {
  if (!isEditing) return;
  document.execCommand("styleWithCSS", false, true);
  document.execCommand("foreColor", false, colorPicker.value);
};

/* ---------- SAVED POPUP ---------- */
function showSavedPopup() {
  const popup = document.createElement("div");
  popup.innerText = "SAVED SUCCESSFULLY";
  popup.style.position = "absolute";
  popup.style.right = "20px";
  popup.style.top = "50%";
  popup.style.transform = "translateY(-50%)";
  popup.style.color = "#00ff88";
  popup.style.fontSize = "14px";

  bar.appendChild(popup);
  setTimeout(() => popup.remove(), 5000);
}
