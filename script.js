/* =========================================================
   Mohsin & Hafsa — wedding invitation
   Everything you need to edit is in the EVENTS block below.
   ========================================================= */

// The countdown on the opening page — the Mehendi, in Pakistan time (UTC+5).
const COUNTDOWN_TO = "2026-11-26T16:00:00+05:00";

const EVENTS = {
  mehndi: {
    venue:   "Bride's Residence",
    // The venue for the little map on the back of the card.
    // An address, a place name, or plain coordinates all work, e.g.
    //   "Pearl One, MM Alam Road, Gulberg, Lahore"   or   "31.5204, 74.3587"
    mapQuery: "31.5217113, 74.2590803",
    mapZoom:  18,
    // Optional: paste the exact Google Maps link to open when the map is tapped.
    // Leave it empty and the link is built from mapQuery automatically.
    mapsUrl: "https://maps.app.goo.gl/oAyNXLPT3PQ3jqc57"
  },
  baraat: {
    venue:   "VICEROY By Mughal-E-Azam",
    mapQuery: "31.4415346, 74.1980143",
    mapZoom:  17,
    mapsUrl: "https://maps.app.goo.gl/k6Zv5H84i4DAFnhu9"
  },
  walima: {
    venue:   "Suffa Developers Farm House",
    mapQuery: "31.469506, 74.5227005",
    mapZoom:  16,
    mapsUrl: "https://maps.app.goo.gl/A9VNbBG1PWBV9tNZ8"
  }
};

/* ---------------------------------------------------------
   nothing below needs editing for a normal update
   --------------------------------------------------------- */

const scenes = Array.from(document.querySelectorAll(".scene"));
const dotButtons = Array.from(document.querySelectorAll(".dots button"));
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const swipeHint = document.getElementById("swipeHint");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let current = 1;
let locked = false;

/* ---------- hold everything back until the artwork is in ---------- */
function preloadEverything() {
  const loader = document.getElementById("loader");
  const fill = document.getElementById("loaderFill");
  const pct = document.getElementById("loaderPct");
  if (!loader) { document.body.classList.remove("is-loading"); return; }

  const art = [
    "env-body.png", "env-flap.png", "env-flap-lining.png", "seal.png", "dawat-nama.png",
    "mehndi-card.jpg", "baraat-card.jpg", "walima-card.jpg"
  ];
  const frames = Array.from(document.querySelectorAll(".map-frame[data-src]"));
  const sound = document.getElementById("sealSound");
  const total = art.length + 1 + frames.length + (sound ? 1 : 0);   // artwork, fonts, maps, music
  let done = 0;
  let finished = false;

  const show = () => {
    const p = Math.min(100, Math.round((done / total) * 100));
    if (fill) fill.style.width = p + "%";
    if (pct) pct.textContent = p + "%";
  };

  const reveal = () => {
    if (finished) return;
    finished = true;
    if (fill) fill.style.width = "100%";
    if (pct) pct.textContent = "100%";
    window.setTimeout(() => {
      loader.classList.add("is-done");
      document.body.classList.remove("is-loading");
    }, 420);
  };

  const step = () => { done += 1; show(); if (done >= total) reveal(); };

  art.forEach((src) => {
    const img = new Image();
    img.onload = step;
    img.onerror = step;          // a missing file must never trap anyone
    img.src = src;
  });

  // fonts count once, and never hold the door for more than four seconds
  let fontsCounted = false;
  const fontsDone = () => { if (!fontsCounted) { fontsCounted = true; step(); } };
  // the music only needs enough buffered to play straight through
  if (sound) {
    let soundCounted = false;
    const soundDone = () => { if (!soundCounted) { soundCounted = true; step(); } };
    sound.addEventListener("canplaythrough", soundDone, { once: true });
    sound.addEventListener("error", soundDone, { once: true });
    sound.load();
    window.setTimeout(soundDone, 6000);
  }

  // the maps come from Google, so they get their own ceiling
  frames.forEach((frame) => {
    let counted = false;
    const mark = () => { if (!counted) { counted = true; step(); } };
    frame.addEventListener("load", mark, { once: true });
    frame.addEventListener("error", mark, { once: true });
    frame.src = frame.dataset.src;
    frame.removeAttribute("data-src");
    window.setTimeout(mark, 7000);
  });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fontsDone).catch(fontsDone);
  else fontsDone();
  window.setTimeout(fontsDone, 4000);

  show();
  window.setTimeout(reveal, 15000);   // slow connection: open anyway rather than trap anyone
}

/* ---------- countdown on the opening page ---------- */
function startCountdown() {
  const box = document.getElementById("countdown");
  if (!box) return;
  const cells = {};
  box.querySelectorAll("[data-cd]").forEach((el) => { cells[el.dataset.cd] = el; });
  const caption = box.querySelector("[data-cd-caption]");
  const target = new Date(COUNTDOWN_TO).getTime();
  if (Number.isNaN(target)) return;

  const pad = (n) => String(n).padStart(2, "0");

  const tick = () => {
    let left = Math.floor((target - Date.now()) / 1000);
    if (left <= 0) {
      left = 0;
      if (caption) caption.textContent = "The day is here";
    }
    cells.days.textContent = Math.floor(left / 86400);
    cells.hours.textContent = pad(Math.floor(left / 3600) % 24);
    cells.minutes.textContent = pad(Math.floor(left / 60) % 60);
    cells.seconds.textContent = pad(left % 60);
  };

  tick();
  window.setInterval(tick, 1000);
}

/* ---------- the little map on the back of each card ---------- */
function mapEmbed(data) {
  const q = (data.mapQuery || "").trim();
  if (!q) return "";
  return "https://maps.google.com/maps?q=" + encodeURIComponent(q) + "&z=" + (data.mapZoom || 15) + "&hl=en&output=embed";
}

function mapLink(data) {
  if (data.mapsUrl) return data.mapsUrl;
  const q = (data.mapQuery || "").trim();
  return q ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q) : "";
}

/* ---------- fill in the details ---------- */
function fillCards() {
  document.querySelectorAll(".card-shell").forEach((shell) => {
    const data = EVENTS[shell.dataset.event];
    if (!data) return;

    shell.querySelectorAll("[data-field]").forEach((el) => {
      const value = data[el.dataset.field];
      if (value) el.textContent = value;
    });

    const map = shell.querySelector("[data-map]");
    const frame = map && map.querySelector(".map-frame");
    const embed = mapEmbed(data);
    const href = mapLink(data);

    if (href) {
      if (map) map.href = href;
    } else if (map) {
      map.removeAttribute("href");
    }

    // the map itself is only fetched the first time someone flips the card over
    if (map && embed) {
      frame.dataset.src = embed;
      map.classList.add("has-map");
    } else if (map) {
      map.classList.remove("has-map");
    }
  });
}

/* ---------- flip a card to its location side ---------- */
function wireCards() {
  document.querySelectorAll(".card-shell").forEach((shell) => {
    const scene = shell.closest(".scene");
    const buttons = [
      ...shell.querySelectorAll(".flip-btn"),
      ...(scene ? scene.querySelectorAll(".flip-btn[data-flip]") : [])
    ];
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const flipped = shell.classList.toggle("is-flipped");
        const frame = shell.querySelector(".map-frame");
        if (flipped && frame && frame.dataset.src && !frame.src) frame.src = frame.dataset.src;
        if (btn.dataset.flip !== undefined) {
          btn.textContent = flipped ? btn.dataset.back : btn.dataset.front;
        }
        const target = shell.querySelector(flipped ? ".card-back .flip-btn" : ".card-front .flip-btn");
        window.setTimeout(() => (target || btn).focus({ preventScroll: true }), 460);
      });
    });
  });
}

/* ---------- last page: envelope seals on its own, then the words ---------- */
let closingTimer = null;
function playClosing() {
  const scene = document.getElementById("scene-5");
  if (!scene) return;
  const wrap = scene.querySelector(".envelope-wrap.closing");
  const rest = scene.querySelector(".closing-text");
  const inner = scene.querySelector(".scene-inner");
  if (!wrap || !rest || !inner) return;
  window.clearTimeout(closingTimer);
  // centre the envelope on its own by balancing whatever sits above and below it
  const gap = parseFloat(window.getComputedStyle(inner).rowGap) || 0;
  const kids = Array.from(inner.children);
  const here = kids.indexOf(wrap);
  let above = 0, below = 0;
  kids.forEach((kid, i) => {
    if (i === here) return;
    const h = kid.getBoundingClientRect().height + gap;
    if (i < here) above += h; else below += h;
  });
  const lift = (below - above) / 2;
  wrap.style.setProperty("--lift", Math.round(lift) + "px");
  scene.classList.add("is-sealing");
  closingTimer = window.setTimeout(() => scene.classList.remove("is-sealing"), reduceMotion ? 260 : 3150);
}

function stopClosing() {
  const scene = document.getElementById("scene-5");
  window.clearTimeout(closingTimer);
  if (scene) scene.classList.remove("is-sealing");
}

/* ---------- stagger whatever each scene holds ---------- */
function markReveals() {
  scenes.forEach((scene) => {
    if (scene.classList.contains("scene-close")) return;
    const inner = scene.querySelector(".scene-inner");
    if (!inner) return;
    Array.from(inner.children).forEach((child, i) => {
      child.classList.add("reveal");
      child.style.setProperty("--i", String(i));
    });
  });
}

/* ---------- drifting petals ---------- */
function makePetals() {
  if (reduceMotion) return;
  document.querySelectorAll(".petals").forEach((field) => {
    const count = Number(field.dataset.petals || 8);
    for (let i = 0; i < count; i++) {
      const petal = document.createElement("span");
      petal.className = "petal";
      petal.style.setProperty("--x", (4 + (92 / count) * i + Math.random() * 6).toFixed(1) + "%");
      petal.style.setProperty("--s", (9 + Math.random() * 12).toFixed(0) + "px");
      petal.style.setProperty("--dur", (17 + Math.random() * 16).toFixed(1) + "s");
      petal.style.setProperty("--delay", (-Math.random() * 22).toFixed(1) + "s");
      petal.style.setProperty("--sway", (Math.random() * 90 - 45).toFixed(0) + "px");
      petal.innerHTML = '<svg viewBox="0 0 16 20" aria-hidden="true"><use href="#petal"/></svg>';
      field.appendChild(petal);
    }
  });
}

/* ---------- moving between pages ---------- */
function goTo(n, { instant = false } = {}) {
  const target = Math.min(Math.max(n, 1), scenes.length);
  if (target === current || locked) return;

  // page one is a sealed envelope: the only way forward is tapping the seal,
  // so swiping, the arrow keys and everything else are ignored there
  const sealed = document.getElementById("envelope");
  if (current === 1 && target !== 1 && sealed && !sealed.classList.contains("is-open")) return;

  locked = true;
  window.setTimeout(() => { locked = false; }, instant ? 0 : 620);

  scenes.forEach((scene) => {
    const isTarget = Number(scene.dataset.scene) === target;
    scene.classList.toggle("is-active", isTarget);
    scene.setAttribute("aria-hidden", isTarget ? "false" : "true");
    if (!isTarget) {
      scene.scrollTop = 0;
      scene.querySelectorAll(".card-shell.is-flipped").forEach((s) => s.classList.remove("is-flipped"));
      scene.querySelectorAll(".flip-btn[data-flip]").forEach((b) => { b.textContent = b.dataset.front; });
    }
  });

  current = target;
  document.body.dataset.scene = String(target);

  // artwork is fetched when its page is first reached, and the next one is warmed up
  [scenes[target - 1], scenes[target]].forEach((scene) => {
    if (!scene) return;
    scene.querySelectorAll("img[data-src]").forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
  });

  dotButtons.forEach((btn) => {
    btn.setAttribute("aria-current", btn.dataset.go === String(target) ? "true" : "false");
  });
  prevBtn.disabled = target === 1;
  nextBtn.disabled = target === scenes.length;

  if (target > 1) swipeHint.classList.add("is-hidden");

  // back on page one the invitation should be sealed again
  if (target === 1) shutEnvelope();
  if (target === scenes.length) playClosing(); else stopClosing();
}

/* ---------- the envelope on page one ---------- */
function shutEnvelope() {
  const envelope = document.getElementById("envelope");
  if (!envelope) return;
  const scene = envelope.closest(".scene");
  envelope.classList.add("no-anim");
  envelope.classList.remove("is-open");
  if (scene) scene.classList.remove("is-opening");
  envelope.setAttribute("aria-label", "Open the invitation");
  void envelope.offsetWidth;
  window.requestAnimationFrame(() => envelope.classList.remove("no-anim"));
}

function wireEnvelope() {
  const envelope = document.getElementById("envelope");
  if (!envelope) return;

  const open = () => {
    if (envelope.classList.contains("is-open")) { goTo(2); return; }
    envelope.classList.add("is-open");
    envelope.closest(".scene").classList.add("is-opening");
    envelope.setAttribute("aria-label", "Invitation opened");

    // the tap itself is what lets a browser play sound, so this has to happen here
    const sound = document.getElementById("sealSound");
    if (sound) {
      try {
        sound.currentTime = 0;
        const played = sound.play();
        if (played && played.catch) played.catch(() => {});
      } catch (err) { /* a browser that will not play it is not worth stopping for */ }
    }
    window.setTimeout(() => goTo(2), reduceMotion ? 140 : 2650);
  };

  envelope.addEventListener("click", open);
  envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
  });
}

/* ---------- controls ---------- */
function wireNav() {
  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));
  dotButtons.forEach((btn) => btn.addEventListener("click", () => goTo(Number(btn.dataset.go))));

  document.getElementById("restart").addEventListener("click", () => {
    shutEnvelope();
    goTo(1);
  });

  document.addEventListener("keydown", (e) => {
    if (e.target.closest("button, a, [role='button']") && (e.key === "Enter" || e.key === " ")) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") goTo(current + 1);
    if (e.key === "ArrowLeft" || e.key === "PageUp") goTo(current - 1);
    if (e.key === "Home") goTo(1);
    if (e.key === "End") goTo(scenes.length);
  });

  // swipe, with vertical scrolling left alone
  let startX = 0, startY = 0, tracking = false;
  const stage = document.getElementById("stage");

  stage.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
  }, { passive: true });

  stage.addEventListener("touchend", (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    goTo(dx < 0 ? current + 1 : current - 1);
  }, { passive: true });
}

/* ---------- go ---------- */
fillCards();
wireCards();
markReveals();
makePetals();
wireEnvelope();
wireNav();
startCountdown();
preloadEverything();

document.body.dataset.scene = "1";
prevBtn.disabled = true;
dotButtons[0].setAttribute("aria-current", "true");
scenes.forEach((s, i) => s.setAttribute("aria-hidden", i === 0 ? "false" : "true"));
window.setTimeout(() => { if (current === 1) swipeHint.classList.add("is-hidden"); }, 7000);
