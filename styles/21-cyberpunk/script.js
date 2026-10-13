/* 21 · Cyberpunk */
(function () {
  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Cyberpunk";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var embedded = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  if (embedded) root.classList.add("in-frame");

  /* The sign duplicates are decoration; only the sign itself is announced. */
  document.querySelectorAll(".sign [data-copy] .brand-word, .reflect [data-copy] .brand-word").forEach(function (s) {
    s.removeAttribute("role"); s.removeAttribute("aria-label");
  });

  var hero = document.getElementById("hero");
  var sign = document.getElementById("sign");
  var stage = document.getElementById("stage");

  /* ---------- Reveals ---------- */
  var ons = document.querySelectorAll("[data-on]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    ons.forEach(function (el) { io.observe(el); });
  } else {
    ons.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Loops run only on screen, visible, and not embedded ---------- */
  var heroSeen = true;
  var loops = document.querySelectorAll("[data-loop]");
  var seen = new Map();
  function loopState() {
    var ok = !document.hidden && !embedded && !reduce;
    loops.forEach(function (el) { el.classList.toggle("is-live", ok && !!seen.get(el)); });
    rainState();
  }
  if ("IntersectionObserver" in window) {
    var lo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        seen.set(e.target, e.isIntersecting);
        if (e.target === hero) heroSeen = e.isIntersecting;
      });
      loopState();
    });
    loops.forEach(function (el) { lo.observe(el); });
  } else {
    loops.forEach(function (el) { seen.set(el, true); });
  }
  document.addEventListener("visibilitychange", loopState);

  /* ---------- Glitch slices on hover or focus (whole lines, never per letter) ---------- */
  document.querySelectorAll(".glitch").forEach(function (g) {
    g.setAttribute("data-glitch", g.textContent);
    var last = 0;
    function fire() {
      if (reduce) return;
      var now = Date.now();
      if (now - last < 1200) return;
      last = now;
      g.classList.remove("is-glitching");
      void g.offsetWidth;
      g.classList.add("is-glitching");
    }
    g.addEventListener("animationend", function (e) { if (e.target === g) g.classList.remove("is-glitching"); });
    var host = g.closest(".holo, .bulkhead, .hero__panel") || g;
    host.addEventListener("pointerenter", fire);
    host.addEventListener("focusin", fire);
    if (host !== g) g.addEventListener("pointerenter", fire);
  });

  /* ---------- City silhouette (seeded so it never jumps on resize) ---------- */
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  var NS = "http://www.w3.org/2000/svg";
  function city(svg, seed, opts) {
    var r = rng(seed), x = 0, out = "";
    svg.setAttribute("viewBox", "0 0 1000 100");
    while (x < 1000) {
      var w = opts.wMin + r() * opts.wMax;
      var h = opts.hMin + r() * (100 - opts.hMin);
      out += '<rect x="' + x.toFixed(1) + '" y="' + (100 - h).toFixed(1) + '" width="' + (w + .6).toFixed(1) + '" height="' + h.toFixed(1) + '" fill="' + opts.fill + '"/>';
      if (r() < opts.antenna) {
        out += '<rect x="' + (x + w * .5).toFixed(1) + '" y="' + (100 - h - 8).toFixed(1) + '" width=".6" height="8" fill="' + opts.fill + '"/>';
      }
      for (var wy = 100 - h + 4; wy < 96; wy += 5) {
        for (var wx = x + 3; wx < x + w - 3; wx += 5) {
          var p = r();
          if (p < opts.lit) out += '<rect x="' + wx.toFixed(1) + '" y="' + wy.toFixed(1) + '" width="2.2" height="1.6" fill="' + (p < opts.lit * .25 ? "#1A8A7D" : "#0D544D") + '" opacity="' + (.35 + r() * .5).toFixed(2) + '"/>';
        }
      }
      x += w + r() * opts.gap;
    }
    svg.innerHTML = out;
  }
  city(document.getElementById("cityFar"), 2141, { wMin: 18, wMax: 46, hMin: 30, fill: "#0E1A19", lit: .2, antenna: .25, gap: 4 });
  city(document.getElementById("cityNear"), 777, { wMin: 40, wMax: 90, hMin: 20, fill: "#060C0B", lit: .06, antenna: .4, gap: 2 });

  /* ---------- Horizon and light source follow the sign ---------- */
  var geo = { horizon: 0, sx: 0, sy: 0, sr: 0, panel: null };
  function measure() {
    var hr = hero.getBoundingClientRect();
    var sr = sign.getBoundingClientRect();
    var bottom = sr.bottom - hr.top;
    geo.horizon = bottom + 6;
    geo.sx = sr.left - hr.left + sr.width / 2;
    geo.sy = sr.top - hr.top + sr.height / 2;
    geo.sr = Math.max(sr.width, sr.height) * .75;
    var pr = hero.querySelector(".hero__panel").getBoundingClientRect();
    geo.panel = { l: pr.left - hr.left, t: pr.top - hr.top, r: pr.right - hr.left, b: pr.bottom - hr.top };
    hero.style.setProperty("--horizon", (geo.horizon / hr.height * 100).toFixed(2) + "%");
    hero.style.setProperty("--sx", (geo.sx / hr.width * 100).toFixed(2) + "%");
    hero.style.setProperty("--sy", (geo.sy / hr.height * 100).toFixed(2) + "%");
  }

  /* ---------- Neon flicker: rare, short, partial. Never more than two dips a second. ---------- */
  var lit = { la: 1, lb: 1, lf: 1 };
  function applyLit() {
    hero.style.setProperty("--la", lit.la);
    hero.style.setProperty("--lb", lit.lb);
    hero.style.setProperty("--lf", lit.lf);
    var g = (lit.la * .62 + lit.lb * .38) * .85 + lit.lf * .15;
    hero.style.setProperty("--glow", g.toFixed(3));
  }
  var patterns = [
    [[{ la: .55, lb: .55 }, 70], [{ la: 1, lb: 1 }, 0]],
    [[{ la: .5, lb: .5 }, 60], [{ la: 1, lb: 1 }, 540], [{ la: .7, lb: .7 }, 90], [{ la: 1, lb: 1 }, 0]],
    [[{ lb: .2 }, 120], [{ lb: 1 }, 580], [{ lb: .35 }, 260], [{ lb: 1 }, 0]],
    [[{ lb: .28 }, 1500], [{ lb: 1 }, 0]],
    [[{ lf: .12 }, 950], [{ lf: 1 }, 0]]
  ];
  var flickTimer = 0;
  function flickerOn() { return heroSeen && !document.hidden && !embedded && !reduce; }
  function schedule(ms) {
    clearTimeout(flickTimer);
    flickTimer = setTimeout(burst, ms != null ? ms : 3800 + Math.random() * 6200);
  }
  function burst() {
    if (!flickerOn()) { schedule(2000); return; }
    var seq = patterns[Math.floor(Math.random() * patterns.length)], i = 0;
    (function step() {
      var s = seq[i++];
      if (!s) { schedule(); return; }
      for (var k in s[0]) lit[k] = s[0][k];
      applyLit();
      if (i < seq.length) flickTimer = setTimeout(step, s[1]);
      else schedule();
    })();
  }
  applyLit();
  if (!reduce && !embedded) schedule(1600);

  /* ---------- Rain ---------- */
  var cv = document.getElementById("rain");
  var ctx = cv.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, embedded ? 1 : 1.5);
  var W = 0, H = 0, drops = [], ripples = [], raf = 0, lastT = 0;

  function makeDrop(d, fresh) {
    var near = Math.random() < .45;
    d.near = near;
    d.len = near ? 14 + Math.random() * 16 : 6 + Math.random() * 8;
    d.v = near ? 900 + Math.random() * 500 : 420 + Math.random() * 240;
    d.a = near ? .16 + Math.random() * .16 : .07 + Math.random() * .08;
    d.x = Math.random() * (W + 80);
    d.y = fresh ? Math.random() * H : -d.len - Math.random() * 80;
    d.stop = geo.horizon + Math.random() * Math.max(10, H - geo.horizon);
    return d;
  }
  function resize() {
    measure();
    var r = hero.getBoundingClientRect();
    W = Math.round(r.width); H = Math.round(r.height);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.min(embedded ? 120 : 300, Math.round(W * H / 4800));
    drops = [];
    for (var i = 0; i < n; i++) drops.push(makeDrop({}, true));
    ripples = [];
    draw(0);
  }
  function inPanel(x, y) {
    var p = geo.panel;
    return p && x > p.l - 4 && x < p.r + 4 && y > p.t - 4 && y < p.b + 4;
  }
  var WIND = -.14;
  function draw(dt) {
    ctx.clearRect(0, 0, W, H);
    var glow = (lit.la * .62 + lit.lb * .38);
    var paths = { far: new Path2D(), near: new Path2D(), litFar: new Path2D(), litNear: new Path2D() };
    for (var i = 0; i < drops.length; i++) {
      var d = drops[i];
      d.y += d.v * dt; d.x += d.v * WIND * dt;
      if (d.y > d.stop) {
        if (d.near && dt && ripples.length < 60 && !inPanel(d.x, d.stop)) ripples.push({ x: d.x, y: d.stop, t: 0 });
        makeDrop(d, false);
      }
      if (inPanel(d.x, d.y)) continue;           /* keep streaks off the text plate */
      var x2 = d.x - d.len * WIND, y2 = d.y - d.len;
      var dx = d.x - geo.sx, dy = d.y - geo.sy;
      var isLit = dx * dx + dy * dy < geo.sr * geo.sr;
      var p = d.near ? (isLit ? paths.litNear : paths.near) : (isLit ? paths.litFar : paths.far);
      p.moveTo(d.x, d.y); p.lineTo(x2, y2);
    }
    ctx.lineCap = "round";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(188, 230, 225, .1)"; ctx.stroke(paths.far);
    ctx.strokeStyle = "rgba(54, 201, 186, " + (.18 + .3 * glow).toFixed(3) + ")"; ctx.stroke(paths.litFar);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(188, 230, 225, .22)"; ctx.stroke(paths.near);
    ctx.strokeStyle = "rgba(133, 214, 205, " + (.25 + .45 * glow).toFixed(3) + ")"; ctx.stroke(paths.litNear);

    /* Flat ripples on the wet street: thin rings, never dots. */
    ctx.lineWidth = 1;
    for (var j = ripples.length - 1; j >= 0; j--) {
      var rp = ripples[j];
      rp.t += dt;
      var k = rp.t / .5;
      if (k >= 1) { ripples.splice(j, 1); continue; }
      ctx.strokeStyle = "rgba(133, 214, 205, " + (.28 * (1 - k)).toFixed(3) + ")";
      ctx.beginPath();
      ctx.ellipse(rp.x, rp.y, 4 + k * 16, 1 + k * 3.2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  function frame(t) {
    raf = 0;
    var dt = lastT ? Math.min(.05, (t - lastT) / 1000) : 0;
    lastT = t;
    draw(dt);
    if (running()) raf = requestAnimationFrame(frame);
  }
  function running() { return heroSeen && !document.hidden && !embedded && !reduce; }
  function rainState() {
    if (running() && !raf && W) { lastT = 0; raf = requestAnimationFrame(frame); }
  }

  var rt = 0;
  window.addEventListener("resize", function () { refit(); });
  resize();
  loopState();
  function refit() { clearTimeout(rt); rt = setTimeout(function () { resize(); rainState(); }, 120); }
  if (document.fonts) {
    if (document.fonts.ready) document.fonts.ready.then(refit);
    if (document.fonts.load) {
      Promise.all([
        document.fonts.load('900 100px "Thmanyah Serif Display"', "مـــــداد"),
        document.fonts.load('400 17px "Thmanyah Sans"', "مداد")
      ]).then(refit, refit);
    }
    if (document.fonts.addEventListener) document.fonts.addEventListener("loadingdone", refit);
  }
  if ("ResizeObserver" in window) {
    var lastHW = 0, lastHH = 0;
    new ResizeObserver(function (en) {
      var r = en[en.length - 1].contentRect;
      if (Math.round(r.width) === lastHW && Math.round(r.height) === lastHH) return;
      lastHW = Math.round(r.width); lastHH = Math.round(r.height);
      refit();
    }).observe(hero);
  }
})();
