/* 18 · Ethereal */
(function () {
  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Ethereal";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var embedded = false;
  try { embedded = window.self !== window.top; } catch (e) { embedded = true; }
  if (embedded) root.classList.add("is-embedded");

  /* ---- Headline: split into whole words (Arabic joining stays intact) ---- */
  var title = document.getElementById("heroTitle");
  (function split() {
    var nodes = Array.prototype.slice.call(title.childNodes);
    var i = 0;
    title.textContent = "";
    function word(el) {
      el.classList.add("w");
      el.style.setProperty("--d", (0.9 + i * 0.32).toFixed(2) + "s");
      i++;
      title.appendChild(el);
    }
    nodes.forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { title.appendChild(document.createTextNode(" ")); return; }
          var s = document.createElement("span");
          s.textContent = part;
          word(s);
        });
      } else if (n.nodeType === 1) {
        var w = document.createElement("span");
        w.appendChild(n);
        word(w);
      }
    });
  })();

  /* Wake the hero once the first frame is painted */
  var hero = document.querySelector(".hero");
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { hero.classList.add("is-awake"); });
  });

  /* ---- Scroll reveals: blur easing into focus ---- */
  var mists = document.querySelectorAll("[data-mist]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    mists.forEach(function (el) { io.observe(el); });
  } else {
    mists.forEach(function (el) { el.classList.add("is-in"); });
  }

  if (reduce) return;

  /* ---- Pointer light ---- */
  var lumen = document.getElementById("lumen");
  var px = -9999, py = -9999, lx = window.innerWidth / 2, ly = window.innerHeight * 0.3, lraf = 0;
  function lumenStep() {
    lx += (px - lx) * 0.06;
    ly += (py - ly) * 0.06;
    lumen.style.setProperty("--lx", lx.toFixed(1) + "px");
    lumen.style.setProperty("--ly", ly.toFixed(1) + "px");
    lraf = (Math.abs(px - lx) + Math.abs(py - ly) > 0.5) ? requestAnimationFrame(lumenStep) : 0;
  }
  if (!embedded) {
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      if (px < -9000) { lx = e.clientX; ly = e.clientY; root.classList.add("has-pointer"); }
      px = e.clientX; py = e.clientY;
      if (!lraf) lraf = requestAnimationFrame(lumenStep);
    }, { passive: true });
  }

  /* ---- Ink motes: pale particles that never come near a word ---- */
  var canvas = document.getElementById("motes");
  var ctx = canvas.getContext && canvas.getContext("2d");
  if (!ctx) return;

  var SCALE = 0.5;          /* reduced resolution backing store */
  var FRAME = 1000 / 30;    /* about 30fps */
  var HARD = 46;            /* fully invisible within this distance of text */
  var BAND = 54;            /* then fade in over this distance */
  var W = 0, H = 0, motes = [], zones = [], running = false, last = 0, t = 0;
  var targets = document.querySelectorAll("h1, h2, h3, p, .btn, .top a, .footer a, .footer img");

  /* Soft sprites, drawn once */
  function sprite(rgb, core) {
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var g = c.getContext("2d");
    var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(" + rgb + ",1)");
    gr.addColorStop(core, "rgba(" + rgb + ",.55)");
    gr.addColorStop(1, "rgba(" + rgb + ",0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    return c;
  }
  var SPR = {
    light: sprite("133,214,205", 0.18),   /* green-300 */
    glint: sprite("255,255,255", 0.25),
    ink:   sprite("18,110,100", 0.2),     /* green-600, used very lightly */
    bokeh: sprite("188,230,225", 0.5)     /* green-200 */
  };

  function rand(a, b) { return a + Math.random() * (b - a); }
  function make(kind) {
    var m = {
      kind: kind,
      x: rand(0, W), y: rand(0, H),
      vx: rand(-0.12, 0.12), vy: rand(-0.22, -0.05),
      ph: rand(0, 6.283), sp: rand(0.012, 0.035),
      seen: 0
    };
    if (kind === "bokeh") { m.r = rand(10, 26); m.a = rand(0.12, 0.22); m.vy *= 0.5; }
    else if (kind === "ink") { m.r = rand(1.6, 2.6); m.a = rand(0.14, 0.22); }
    else if (kind === "glint") { m.r = rand(2.4, 4.2); m.a = rand(0.6, 0.9); }
    else { m.r = rand(2.2, 4.6); m.a = rand(0.3, 0.55); }
    return m;
  }
  function seed() {
    var n = Math.round(Math.min(110, Math.max(36, (W * H) / 13000)));
    motes = [];
    for (var i = 0; i < n; i++) {
      var r = Math.random();
      motes.push(make(r < 0.1 ? "ink" : r < 0.3 ? "glint" : "light"));
    }
    for (var b = 0; b < Math.round(n / 12); b++) motes.push(make("bokeh"));
  }
  function resize() {
    var oldW = W;
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.max(1, Math.round(W * SCALE));
    canvas.height = Math.max(1, Math.round(H * SCALE));
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    if (!motes.length || Math.abs(W - oldW) > 80) seed();
    dirty = true;
  }

  /* Measure every text box currently in view */
  /* Text boxes are cached in document space and refreshed only on resize,
     font load, or every 8th frame (reveals still settle). Each frame
     just shifts the cache by the current scroll, so no forced layout. */
  var docRects = [], dirty = true;
  function cacheRects() {
    docRects.length = 0;
    var sy = window.scrollY;
    for (var i = 0; i < targets.length; i++) {
      var r = targets[i].getBoundingClientRect();
      if (r.width === 0) continue;
      docRects.push(r.left, r.top + sy, r.right, r.bottom + sy);
    }
    dirty = false;
  }
  function measure() {
    if (dirty || t % 8 === 0) cacheRects();
    zones.length = 0;
    var sy = window.scrollY;
    for (var i = 0; i < docRects.length; i += 4) {
      var tp = docRects[i + 1] - sy, b = docRects[i + 3] - sy;
      if (b < -120 || tp > H + 120) continue;
      zones.push(docRects[i], tp, docRects[i + 2], b);
    }
  }

  /* Distance to the nearest text box, plus a unit push vector away from it */
  var push = { x: 0, y: 0 };
  function nearest(x, y) {
    var best = 1e9;
    push.x = 0; push.y = 0;
    for (var i = 0; i < zones.length; i += 4) {
      var l = zones[i], tp = zones[i + 1], rr = zones[i + 2], b = zones[i + 3];
      var nx = x < l ? l : x > rr ? rr : x;
      var ny = y < tp ? tp : y > b ? b : y;
      var dx = x - nx, dy = y - ny;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d === 0) { /* inside: head for the closest edge vertically */
        var cy = (tp + b) / 2;
        dy = y < cy ? -1 : 1; dx = 0; d = 0;
      }
      if (d < best) {
        best = d;
        var len = Math.sqrt(dx * dx + dy * dy) || 1;
        push.x = dx / len; push.y = dy / len;
      }
    }
    return best;
  }

  var lastScroll = window.scrollY;
  function step() {
    t += 1;
    measure();
    var ds = window.scrollY - lastScroll;
    lastScroll = window.scrollY;
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < motes.length; i++) {
      var m = motes[i];
      /* slow wander, a little depth on scroll */
      m.x += m.vx + Math.sin(t * m.sp + m.ph) * 0.14;
      m.y += m.vy + Math.cos(t * m.sp * 0.7 + m.ph) * 0.08 - ds * (m.kind === "bokeh" ? 0.06 : 0.16);

      var reach = m.r + HARD + BAND;
      var d = nearest(m.x, m.y) - m.r;
      if (d < reach) {
        var f = 1 - Math.max(0, d) / reach;
        m.x += push.x * f * 1.6;
        m.y += push.y * f * 1.6;
      }
      /* gentle parting around the pointer */
      if (px > -9000) {
        var pdx = m.x - px, pdy = m.y - py, pd = pdx * pdx + pdy * pdy;
        if (pd < 14400 && pd > 1) {
          var pf = (1 - Math.sqrt(pd) / 120) * 0.9 / Math.sqrt(pd);
          m.x += pdx * pf; m.y += pdy * pf;
        }
      }

      /* wrap softly around the viewport */
      var pad = m.r + 30;
      if (m.y < -pad) { m.y = H + pad; m.x = rand(0, W); m.seen = 0; }
      else if (m.y > H + pad) { m.y = -pad; m.x = rand(0, W); m.seen = 0; }
      if (m.x < -pad) m.x = W + pad; else if (m.x > W + pad) m.x = -pad;

      /* fade to nothing near any word */
      var vis = (d - HARD) / BAND;
      vis = vis <= 0 ? 0 : vis >= 1 ? 1 : vis * vis * (3 - 2 * vis);
      m.seen = Math.min(1, m.seen + 0.02);
      var tw = m.kind === "bokeh" ? 0.75 + 0.25 * Math.sin(t * 0.02 + m.ph)
                                   : 0.45 + 0.55 * Math.pow(0.5 + 0.5 * Math.sin(t * m.sp * 2.2 + m.ph), 2);
      var a = m.a * tw * vis * m.seen;
      if (a < 0.01) continue;
      ctx.globalAlpha = a;
      var s = m.r * 2;
      ctx.drawImage(SPR[m.kind], m.x - s, m.y - s, s * 2, s * 2);
    }
    ctx.globalAlpha = 1;
  }

  var rafId = 0;
  function loop(now) {
    if (!running) return;
    rafId = requestAnimationFrame(loop);
    if (now - last < FRAME) return;
    last = now;
    step();
  }
  function start() {
    if (running || embedded || document.hidden) return;
    running = true;
    last = 0;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  resize();
  var rt = 0;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { resize(); if (!running) step(); }, 150);
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });

  var begun = false;
  function begin() {
    if (begun) return;
    begun = true;
    dirty = true;
    canvas.classList.add("is-on");
    if (embedded) {
      /* Gallery preview: one still frame, fully settled */
      motes.forEach(function (m) { m.seen = 1; });
      setTimeout(step, 600);
      return;
    }
    start();
  }
  /* Wait for the faces that set text boxes, but never longer than 1.2s */
  setTimeout(begin, 1200);
  if (document.fonts && document.fonts.load) {
    Promise.all([
      document.fonts.load('300 72px "Thmanyah Serif Display"'),
      document.fonts.load('400 30px "Thmanyah Serif Display"'),
      document.fonts.load('900 156px "Thmanyah Serif Display"', "مـــــداد"),
      document.fonts.load('300 17px "Thmanyah Sans"'),
      document.fonts.load('400 17px "Thmanyah Sans"')
    ]).then(begin, begin);
    if (document.fonts.ready) document.fonts.ready.then(function () { dirty = true; });
  } else {
    begin();
  }
})();
