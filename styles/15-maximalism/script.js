/* 15 · Maximalism */
(function () {
  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Maximalism";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var embedded = false;
  try { embedded = window.self !== window.top; } catch (e) { embedded = true; }
  var animate = !reduce && !embedded;

  /* Mixed weights in a headline, whole word by whole word (joining stays intact). */
  function mixWords(el, classes) {
    if (!el || el.querySelector(".brand-word")) return;
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w, i) {
      return '<span class="mw ' + classes[i % classes.length] + '">' + w.replace(/[<>&]/g, "") + "</span>";
    }).join(" ");
  }
  mixWords(document.getElementById("heroTitle"), ["mw--a", "mw--b", "mw--a", "mw--c"]);
  mixWords(document.getElementById("aboutTitle"), ["mw--c", "mw--b", "mw--a", "mw--b", "mw--d"]);

  /* Reveals */
  var reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); rio.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el, i) {
      if (el.classList.contains("tile")) el.style.transitionDelay = (i % 3) * 0.08 + "s";
      rio.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- the word pool: only words split from MEDAD strings ---------- */
  var PUNCT = /[.،؟؛:!?,]/g, MARKS = /[ً-ْ]/;
  var pool = [];
  [M.hero.headline, M.about.title, M.pillars[0].title, M.pillars[1].title,
   M.pillars[2].title, M.footer.line, M.closing.headline].forEach(function (s) {
    s.split(/\s+/).forEach(function (w) {
      w = w.replace(PUNCT, "");
      if (w.length >= 3 && !MARKS.test(w) && w.indexOf("{") < 0 && pool.indexOf(w) < 0) pool.push(w);
    });
  });
  var BRAND = '<span class="w brand-word" style="color:var(%c)">' + M.brand + "</span>";

  var TONES = {
    dark:  { c: ["--green-50", "--green-100", "--green-200", "--green-300", "--green-400", "--paper", "--green-500"],
             chip: [["--green-400", "--ink"], ["--paper", "--green-800"], ["--green-200", "--green-900"]] },
    mint:  { c: ["--ink", "--green-950", "--green-800", "--green-700", "--green-600", "--green-900"],
             chip: [["--ink", "--green-300"], ["--green-800", "--green-100"], ["--paper", "--green-700"]] },
    paper: { c: ["--green-600", "--green-800", "--ink", "--green-500", "--green-700"],
             chip: [["--green-800", "--green-100"], ["--green-300", "--ink"]] },
    deep:  { c: ["--green-50", "--green-200", "--green-100", "--ink", "--green-950", "--green-300"],
             chip: [["--green-50", "--green-700"], ["--ink", "--green-300"]] },
    ink:   { c: ["--green-300", "--green-400", "--green-100", "--paper", "--green-500", "--green-200"],
             chip: [["--green-400", "--ink"], ["--green-100", "--green-800"]] }
  };
  var WEIGHTS = [300, 400, 500, 700, 900];

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function pick(r, a) { return a[Math.floor(r() * a.length)]; }

  function word(r, tone, s, brandP) {
    var col = pick(r, tone.c), x = r();
    if (x < brandP) return BRAND.replace("%c", col);
    var w = pick(r, pool);
    var fam = r() < 0.55 ? "fs" : "fn";
    var wt = pick(r, WEIGHTS);
    var y = r();
    if (y < 0.12) {
      var ch = pick(r, tone.chip);
      return '<span class="w w--chip ' + fam + '" style="font-weight:' + wt + ';background:var(' + ch[0] + ');color:var(' + ch[1] + ')">' + w + "</span>";
    }
    var size = y < 0.3 ? " w--sm" : (y < 0.4 && s >= 1 ? " w--xs" : "");
    var html = '<span class="w ' + fam + size + '" style="font-weight:' + wt + ';color:var(' + col + ')">' + w + "</span>";
    if (s >= 1.5 && r() < 0.22) html += '<svg class="sep" style="color:var(' + pick(r, tone.c) + ')"><use href="#star"/></svg>';
    return html;
  }

  /* ---------- rows ---------- */
  var fields = [];
  document.querySelectorAll("[data-field]").forEach(function (el) {
    fields.push({ el: el, rows: [], shapes: [], live: false, rect: null });
  });

  function buildRow(f, rowEl) {
    var s = parseFloat(rowEl.getAttribute("data-s")) || 1;
    var tone = TONES[rowEl.getAttribute("data-tone")] || TONES.dark;
    var seed = parseInt(rowEl.getAttribute("data-seed"), 10) || 1;
    var brandP = parseFloat(rowEl.getAttribute("data-brand")) || 0.14;
    var r = rng(seed * 7919);
    var track = document.createElement("div");
    track.className = "track";
    var seq = document.createElement("div");
    seq.className = "seq";
    track.appendChild(seq);
    rowEl.textContent = "";
    rowEl.appendChild(track);
    var need = rowEl.clientWidth + 40, html = "", guard = 0;
    do {
      for (var i = 0; i < 6; i++) html += word(r, tone, s, brandP);
      seq.innerHTML = html;
    } while (seq.getBoundingClientRect().width < need && ++guard < 40);
    var copy = seq.cloneNode(true);
    track.appendChild(copy);
    var W = seq.getBoundingClientRect().width;
    var old = rowEl._row;
    var row = {
      el: track, row: rowEl, W: W,
      x: old ? old.x / old.W * W : r() * W,
      dir: parseFloat(rowEl.getAttribute("data-dir")) || 1,
      v: parseFloat(rowEl.getAttribute("data-v")) || 30,
      boost: 1, skew: 0, cy: 0, h: 0, on: true
    };
    rowEl._row = row;
    paintRow(row);
    return row;
  }
  function paintRow(row) {
    row.el.style.transform = "translate3d(" + row.x.toFixed(2) + "px,0,0)" + (row.skew ? " skewX(" + row.skew.toFixed(2) + "deg)" : "");
  }

  function offsetIn(el, root) {
    var x = 0, y = 0, n = el;
    while (n && n !== root) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x: x, y: y };
  }

  function measure(f) {
    var H = f.el.clientHeight;
    f.rows.forEach(function (row) {
      var o = offsetIn(row.row, f.el);
      row.h = row.row.offsetHeight;
      row.cy = o.y + row.h / 2;
      row.on = o.y < H + 10;
    });
    f.shapes.forEach(function (sh) {
      var o = offsetIn(sh.el, f.el);
      sh.cx = o.x + sh.el.offsetWidth / 2;
      sh.cy = o.y + sh.el.offsetHeight / 2;
      sh.R = Math.max(180, Math.min(320, sh.el.offsetWidth * 0.9));
    });
  }

  function build() {
    fields.forEach(function (f) {
      f.rows = Array.prototype.map.call(f.el.querySelectorAll(".row"), function (r) { return buildRow(f, r); });
      if (!f.shapes.length) {
        f.shapes = Array.prototype.map.call(f.el.querySelectorAll("[data-repel]"), function (el) {
          return { el: el, dx: 0, dy: 0, cx: 0, cy: 0, R: 240 };
        });
      }
      measure(f);
    });
  }
  build();
  /* fonts.ready can resolve before any face starts loading: request the real faces explicitly. */
  function brandFonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var faces = ['300 20px "Thmanyah Sans"', '400 20px "Thmanyah Sans"', '700 20px "Thmanyah Sans"', '900 40px "Thmanyah Serif Display"', '700 40px "Thmanyah Serif Display"'];
    return Promise.race([
      Promise.all(faces.map(function (f) { return document.fonts.load(f, "مداد"); })),
      new Promise(function (r) { setTimeout(r, 1500); })
    ]).catch(function () {});
  }
  brandFonts().then(build);
  if (document.fonts) document.fonts.addEventListener("loadingdone", function () { build(); });

  var lastW = window.innerWidth, rt = 0;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if (window.innerWidth !== lastW) { lastW = window.innerWidth; build(); }
      else fields.forEach(measure);
    }, 180);
  });

  if (!animate) return; /* reduced motion or embedded: static composition */

  /* ---------- live loop: transforms only ---------- */
  var px = -1e5, py = -1e5, hasPointer = false;
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    px = e.clientX; py = e.clientY; hasPointer = true;
  }, { passive: true });
  document.addEventListener("pointerout", function (e) { if (!e.relatedTarget) hasPointer = false; });

  var scrollBoost = 0, lastY = window.scrollY;
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    scrollBoost = Math.min(5, scrollBoost + Math.abs(y - lastY) * 0.03);
    lastY = y;
  }, { passive: true });

  var raf = 0, last = 0;
  function frame(t) {
    raf = 0;
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
    last = t;
    var any = false;
    scrollBoost *= Math.pow(0.12, dt);
    fields.forEach(function (f) {
      if (!f.live) return;
      any = true;
      var rect = f.el.getBoundingClientRect();
      var lx = px - rect.left, ly = py - rect.top;
      var inside = hasPointer && lx >= 0 && ly >= 0 && lx <= rect.width && ly <= rect.height;
      var nx = inside ? Math.max(-1, Math.min(1, (lx - rect.width / 2) / (rect.width / 2))) : 0;
      var reach = Math.max(160, rect.height * 0.26);
      var k = Math.min(1, dt * 5);
      f.rows.forEach(function (row) {
        if (!row.on) return;
        var prox = inside ? Math.max(0, 1 - Math.abs(ly - row.cy) / reach) : 0;
        prox = prox * prox;
        row.boost += (1 + 3.4 * prox + scrollBoost - row.boost) * k;
        row.skew += (-11 * prox * nx - row.skew) * k;
        row.x += row.dir * row.v * row.boost * dt;
        row.x = ((row.x % row.W) + row.W) % row.W;
        paintRow(row);
      });
      f.shapes.forEach(function (sh) {
        var tx = 0, ty = 0;
        if (inside) {
          var vx = sh.cx - lx, vy = sh.cy - ly, d = Math.sqrt(vx * vx + vy * vy) || 1;
          if (d < sh.R) {
            var p = 1 - d / sh.R;
            var push = p * p * 120;
            tx = vx / d * push; ty = vy / d * push;
          }
        }
        var k2 = Math.min(1, dt * 6);
        sh.dx += (tx - sh.dx) * k2;
        sh.dy += (ty - sh.dy) * k2;
        if (Math.abs(sh.dx) > 0.05 || Math.abs(sh.dy) > 0.05 || tx || ty) {
          sh.el.style.transform = "translate3d(" + sh.dx.toFixed(1) + "px," + sh.dy.toFixed(1) + "px,0)";
        }
      });
    });
    if (any) raf = requestAnimationFrame(frame);
    else last = 0;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  function setLive(f, on) {
    on = on && !document.hidden;
    f.live = on;
    f.el.classList.toggle("is-live", on);
    if (on) { last = 0; kick(); }
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var f = fields.filter(function (x) { return x.el === e.target; })[0];
        if (f) { f.vis = e.isIntersecting; setLive(f, f.vis); }
      });
    }, { rootMargin: "60px 0px" });
    fields.forEach(function (f) { io.observe(f.el); });
  } else {
    fields.forEach(function (f) { f.vis = true; setLive(f, true); });
  }
  document.addEventListener("visibilitychange", function () {
    fields.forEach(function (f) { setLive(f, f.vis); });
  });

  /* The pillars backdrop spins only while the section is on screen. */
  var pill = document.querySelector(".pillars");
  if (pill && "IntersectionObserver" in window) {
    var pio = new IntersectionObserver(function (es) {
      pill.classList.toggle("is-live", es[0].isIntersecting && !document.hidden);
    });
    pio.observe(pill);
  }
})();
