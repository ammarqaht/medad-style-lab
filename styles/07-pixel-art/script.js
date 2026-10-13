/* 07 · Pixel Art */
(function () {
  var M = window.MEDAD;
  /* Safety net: if anything below throws, never leave the page hidden. */
  var safety = setTimeout(function () {
    document.querySelectorAll("[data-rv]").forEach(function (el) { el.classList.add("is-in"); });
  }, 4000);
  M.fill();
  document.title = M.text(M.meta.title) + " · Pixel Art";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var embedded = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  if (embedded) root.classList.add("is-embedded");

  /* ---------- Palette, read from the shared tokens ---------- */
  var css = getComputedStyle(root);
  function tok(n) { return css.getPropertyValue(n).trim(); }
  var PAL = {
    K: tok("--ink"), N: tok("--green-900"), D: tok("--green-800"), M: tok("--green-600"),
    L: tok("--green-400"), P: tok("--green-200"), T: tok("--green-100"), W: tok("--paper")
  };

  /* ---------- Tiny sprite toolkit: char grids to data URLs ---------- */
  function grid(rows) { return rows.map(function (r) { return r.split(""); }); }
  function blank(w, h) {
    var g = [];
    for (var y = 0; y < h; y++) { g.push([]); for (var x = 0; x < w; x++) g[y].push("."); }
    return g;
  }
  function set(g, x, y, c) { if (g[y] && x >= 0 && x < g[y].length) g[y][x] = c; }
  /* Pad by one cell and wrap every filled shape in a one pixel ink outline */
  function outline(g, c) {
    var h = g.length, w = g[0].length, o = blank(w + 2, h + 2), x, y;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) o[y + 1][x + 1] = g[y][x];
    var res = o.map(function (r) { return r.slice(); });
    for (y = 0; y < h + 2; y++) for (x = 0; x < w + 2; x++) {
      if (o[y][x] !== ".") continue;
      var n = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (d) {
        var r = o[y + d[1]]; return r && r[x + d[0]] && r[x + d[0]] !== ".";
      });
      if (n) res[y][x] = c || "K";
    }
    return res;
  }
  function toURL(frames) {
    var h = frames[0].length, w = frames[0][0].length;
    var c = document.createElement("canvas");
    c.width = w * frames.length; c.height = h;
    var x = c.getContext("2d");
    frames.forEach(function (g, i) {
      for (var yy = 0; yy < h; yy++) for (var xx = 0; xx < w; xx++) {
        var ch = g[yy][xx];
        if (ch === "." || !PAL[ch]) continue;
        x.fillStyle = PAL[ch];
        x.fillRect(i * w + xx, yy, 1, 1);
      }
    });
    return 'url("' + c.toDataURL("image/png") + '")';
  }
  function setVar(name, frames) { root.style.setProperty(name, toURL(frames)); }

  /* ---------- The inkwell with a quill: 4 idle frames ---------- */
  function inkwell(raised, phase, glint) {
    var g = blank(26, 27), r, x;
    var qy = raised ? 0 : 1;
    var A = [1, 2, 3, 3, 3, 3, 2, 1], B = [1, 1, 2, 2, 2, 1, 1, 0];
    for (r = 0; r < 12; r++) {
      var sx = 23 - r, y = r + qy;
      if (r === 0) { set(g, sx, y, "T"); continue; }
      if (r <= 8) {
        for (x = 1; x <= A[r - 1]; x++) if (!(r === 5 && x === 3)) set(g, sx - x, y, "P");
        for (x = 1; x <= B[r - 1]; x++) set(g, sx + x, y, "T");
      }
      set(g, sx, y, "W");
    }
    var Y = 1;
    for (x = 8; x <= 15; x++) { set(g, x, 11 + Y, x >= 14 ? "T" : "L"); set(g, x, 12 + Y, "M"); }
    for (r = 13; r <= 14; r++) for (x = 9; x <= 14; x++) set(g, x, r + Y, x === 13 ? "T" : "P");
    var rows = { 15: [6, 17], 16: [4, 19], 17: [3, 20], 18: [3, 20], 19: [3, 20], 20: [3, 20], 21: [3, 20], 22: [3, 20], 23: [3, 20], 24: [4, 19], 25: [5, 18] };
    Object.keys(rows).forEach(function (k) {
      var ry = +k, a = rows[k][0], b = rows[k][1];
      for (x = a; x <= b; x++) {
        var c = "L";
        if (ry === 18) c = ((x + phase) % 4 < 2) ? "M" : "D";
        else if (ry > 18 && ry < 25) c = "D";
        else if (ry === 25) c = "M";
        if (x === b - 2 && ry >= 16 && ry <= 17) c = "T";
        if (x === b - 2 && ry >= 20 && ry <= 22) c = "M";
        if (x === b - 3 && ry === 16) c = "T";
        set(g, x, ry + Y, c);
      }
    });
    if (glint) set(g, 17, 16 + Y, "W");
    return outline(g);
  }
  setVar("--spr-ink", [inkwell(false, 0, false), inkwell(true, 1, true), inkwell(true, 2, true), inkwell(false, 3, false)]);

  /* ---------- Cursors ---------- */
  var arrow = ["....T", "...TL", "..TLL", ".TLLL", "TLLLM", ".MLLM", "..MLM", "...MM", "....M"];
  setVar("--spr-arrow", [outline(grid(arrow))]);
  setVar("--spr-arrow-lcd", [grid(["......", "....DD", "...DDD", "..DDDD", ".DDDDD", "DDDDDD", ".DDDDD", "..DDDD", "...DDD", "....DD", "......"])]);
  setVar("--spr-tri", [grid(["MMMMMMMMM", ".MMMMMMM.", "..MMMMM..", "...MMM...", "....M....", "........."])]);
  setVar("--spr-tri-sel", [outline(grid(["LLLLLLL", ".LLLLL.", "..LLL..", "...L..."]))]);

  /* ---------- Crescent moon ---------- */
  (function () {
    var g = blank(18, 18);
    for (var y = 0; y < 18; y++) for (var x = 0; x < 18; x++) {
      var a = (x - 8.5) * (x - 8.5) + (y - 8.5) * (y - 8.5);
      var b = (x - 4.5) * (x - 4.5) + (y - 6.5) * (y - 6.5);
      if (a <= 72 && b > 52) set(g, x, y, (x > 12 && y > 4 && y < 13) ? "T" : "P");
    }
    setVar("--spr-moon", [g]);
  })();

  /* ---------- Cloud strip (tiles horizontally) ---------- */
  (function () {
    var g = blank(200, 12);
    function rect(x, y, w, h) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) set(g, x + i, y + j, "D"); }
    function cloud(x, y, w) {
      rect(x + 8, y, Math.round(w * .35), 2);
      rect(x + 4, y + 2, w - 10, 2);
      rect(x + 2, y + 4, w - 4, 2);
      rect(x, y + 6, w, 3);
    }
    cloud(6, 2, 38); cloud(84, 4, 26); cloud(132, 1, 48);
    setVar("--spr-cloud", [g]);
  })();

  /* ---------- Inventory icons ---------- */
  setVar("--ico-0", [outline(grid([
    "MMMMMMMMMMMMMM",
    "MTMPMLMMMMMMMM",
    "MMMMMMMMMMMMMM",
    "TTTTTTTTTTTTTT",
    "TLLLLLTDDDDDDT",
    "TLLLLLTTTTTTTT",
    "TLLLLLTDDDDDTT",
    "TLLLLLTTTTTTTT",
    "TLLLLLTDDDDTTT",
    "TTTTTTTTTTTTTT",
    "TDDDDDDDDDDDDT",
    "TTTTTTTTTTTTTT"
  ]))]);
  setVar("--ico-1", [outline(grid([
    "...........TT.",
    "...........TL.",
    ".......TT..TL.",
    ".......PL..TL.",
    "...TT..PL..TL.",
    "...PL..PL..TL.",
    "...PL..PL..TL.",
    "...PL..PL..TL.",
    "...PL..PL..TL.",
    "..............",
    "WWWWWWWWWWWWWW",
    "MMMMMMMMMMMMMM"
  ]))]);
  setVar("--ico-2", [outline(grid([
    "..MLLLLLLLLT..",
    "PPMLLLLLLLLTPP",
    "P.MLLLLLLLLT.P",
    "P.MLLLLLLLLT.P",
    ".PPMLLLLLLTPP.",
    "...MLLLLLLT...",
    "....MLLLLT....",
    "......MT......",
    "......MT......",
    ".....MLLT.....",
    "...MMMMMMMM...",
    "...MDDDDDDM..."
  ]))]);

  /* ---------- The ground: drawn at one cell per --p, crisp at any width ---------- */
  var hero = document.getElementById("title");
  var land = document.getElementById("land");
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function drawLand() {
    var u = parseFloat(getComputedStyle(root).getPropertyValue("--p")) || 4;
    var H = Math.min(230, Math.max(150, window.innerHeight * .24)); /* matches --land */
    var w = Math.ceil(hero.clientWidth / u), h = Math.ceil(H / u);
    land.width = w; land.height = h;
    land.style.width = w * u + "px"; land.style.height = h * u + "px";
    var c = land.getContext("2d"), rand = rng(7), x, y, r;
    var yS = Math.round(h * .5);
    function px(xx, yy, ww, hh, col) { c.fillStyle = col; c.fillRect(xx, yy, ww, hh); }
    /* Far hills: stepped plateaus */
    var lvl = 6;
    for (x = 0; x < w;) {
      var seg = 3 + Math.floor(rand() * 6);
      lvl = Math.max(3, Math.min(yS - 3, lvl + Math.floor(rand() * 5) - 2));
      px(x, yS - lvl, seg, lvl, PAL.D);
      x += seg;
    }
    /* Ground: grass lip, then ink bricks */
    px(0, yS, w, h - yS, PAL.K);
    px(0, yS, w, 2, PAL.M);
    px(0, yS + 2, w, 1, PAL.D);
    for (x = 2; x < w; x += 5 + Math.floor(rand() * 9)) px(x, yS - 1, 2, 1, PAL.M);
    for (y = yS + 6, r = 0; y < h; y += 5, r++) {
      px(0, y, w, 1, PAL.N);
      for (x = (r % 2) * 6; x < w; x += 12) px(x, y + 1, 1, 4, PAL.N);
    }
    hero.style.setProperty("--surface", (h - yS) * u + "px");
  }
  drawLand();
  var rt = 0;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(drawLand, 150); });

  /* ---------- Reveal ---------- */
  var rvs = document.querySelectorAll("[data-rv]");
  function show(el) { el.classList.add("is-in"); }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    rvs.forEach(function (el) { io.observe(el); });
    clearTimeout(safety); /* the observer took over */

    /* Pause sprite, cloud and cursor loops for zones out of view */
    var zio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle("is-off", !e.isIntersecting); });
    });
    document.querySelectorAll("[data-zone]").forEach(function (z) { zio.observe(z); });
  } else {
    rvs.forEach(show);
    clearTimeout(safety);
  }

  /* ---------- Pressed buttons from the keyboard ---------- */
  document.querySelectorAll(".pbtn").forEach(function (b) {
    b.addEventListener("keydown", function (e) { if (e.key === "Enter") b.classList.add("is-pressed"); });
    b.addEventListener("keyup", function () { b.classList.remove("is-pressed"); });
    b.addEventListener("blur", function () { b.classList.remove("is-pressed"); });
  });

  /* ---------- Sprite hop on click ---------- */
  ["heroSprite", "portraitSprite"].forEach(function (id) {
    var s = document.getElementById(id);
    s.addEventListener("click", function (e) {
      e.stopPropagation();
      if (reduce) return;
      s.classList.remove("is-hop"); void s.offsetWidth; s.classList.add("is-hop");
    });
    s.addEventListener("animationend", function (e) { if (e.animationName === "hop") s.classList.remove("is-hop"); });
  });

  /* ---------- The dialog: types the introduction word by word ----------
     Every word (and the brand word as one unit) is its own span, so the
     Arabic joining inside a word is never split. The full text is in the
     DOM from the start; typing only flips opacity, so nothing reflows. */
  var dialog = document.getElementById("dialog");
  var text = document.getElementById("dialogText");
  (function wrap(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 1) { n.classList.add("w"); return; }
      if (n.nodeType !== 3) return;
      var frag = document.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var s = document.createElement("span");
        s.className = "w"; s.textContent = part;
        frag.appendChild(s);
      });
      node.replaceChild(frag, n);
    });
  })(text);
  var words = text.querySelectorAll(".w");
  var idx = 0, timer = 0, state = "idle", inView = false;

  function cur(i) {
    text.querySelectorAll(".is-cur").forEach(function (w) { w.classList.remove("is-cur"); });
    if (i >= 0 && words[i]) words[i].classList.add("is-cur");
  }
  function finish() {
    clearTimeout(timer); timer = 0;
    words.forEach(function (w) { w.classList.add("is-on"); });
    cur(-1);
    text.classList.remove("is-typing");
    dialog.classList.add("is-done");
    state = "done";
  }
  function tick() {
    timer = 0;
    if (state !== "typing") return;
    if (!inView || document.hidden) return; /* resumes on visibility */
    var w = words[idx];
    w.classList.add("is-on");
    cur(idx);
    idx++;
    if (idx >= words.length) { timer = setTimeout(function () { if (state === "typing") finish(); }, 500); return; }
    var t = w.textContent || "";
    var delay = 90 + Math.min(t.length, 8) * 16;
    if (/[.،:؛]$/.test(t)) delay += 320;
    timer = setTimeout(tick, delay);
  }
  function start() {
    words.forEach(function (w) { w.classList.remove("is-on"); });
    idx = 0;
    text.classList.add("is-typing");
    dialog.classList.remove("is-done");
    state = "typing";
    clearTimeout(timer);
    timer = setTimeout(tick, 380);
  }
  function resume() { if (state === "typing" && !timer && inView && !document.hidden) timer = setTimeout(tick, 200); }

  if (reduce || !("IntersectionObserver" in window)) {
    finish();
  } else {
    text.classList.add("is-typing");
    var dio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        /* Start at 45% visible, or as soon as it shows if it can never reach 45% (short viewports). */
        var tall = e.boundingClientRect.height * 0.45 > window.innerHeight;
        inView = e.isIntersecting && (e.intersectionRatio >= 0.45 || tall);
        if (inView && state === "idle") start();
        else if (inView) resume();
      });
    }, { threshold: [0, 0.1, 0.45] });
    dio.observe(dialog);
    document.addEventListener("visibilitychange", resume);
  }

  function advance() {
    if (reduce) return;
    if (state === "typing") finish();
    else if (state === "done") start();
  }
  dialog.addEventListener("click", advance);
  dialog.addEventListener("keydown", function (e) {
    if (e.repeat) return;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); advance(); }
  });
})();
