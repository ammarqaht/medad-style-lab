/* 09 · Glassmorphism */
(function () {
  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Glassmorphism";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var embedded = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Panes surface as they enter ---------- */
  var rises = document.querySelectorAll("[data-rise]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    rises.forEach(function (el) { io.observe(el); });
  } else {
    rises.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Ink in water ---------- */
  var canvas = document.getElementById("ink");
  var ctx = canvas.getContext("2d");
  var css = getComputedStyle(document.documentElement);
  function rgb(name) {
    var h = css.getPropertyValue(name).trim().replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  var C = { 300: rgb("--green-300"), 400: rgb("--green-400"), 500: rgb("--green-500"), 600: rgb("--green-600"), 700: rgb("--green-700"), 800: rgb("--green-800") };
  var BG = rgb("--ink");

  /* Clouds are anchored to sections and drift at their own depth (f) for parallax.
     x, y are fractions of the section box; R is a fraction of the viewport size. */
  var CLOUDS = [
    { s: "hero",    x: .28, y: .55, R: .36, c: 500, a: .80, f: .55 },
    { s: "hero",    x: .76, y: .30, R: .30, c: 600, a: .75, f: .40 },
    { s: "hero",    x: .12, y: .18, R: .15, c: 400, a: .55, f: .75 },
    { s: "hero",    x: .94, y: .95, R: .26, c: 700, a: .80, f: .35 },
    { s: "about",   x: .84, y: .45, R: .26, c: 500, a: .70, f: .55 },
    { s: "about",   x: .18, y: .75, R: .18, c: 400, a: .38, f: .70 },
    { s: "pillars", x: .50, y: .50, R: .34, c: 600, a: .80, f: .50 },
    { s: "pillars", x: .14, y: .22, R: .18, c: 400, a: .45, f: .65 },
    { s: "pillars", x: .86, y: .82, R: .22, c: 500, a: .70, f: .60 },
    { s: "closing", x: .50, y: .52, R: .32, c: 500, a: .80, f: .55 },
    { s: "closing", x: .80, y: .26, R: .15, c: 400, a: .45, f: .72 },
    { s: "footer",  x: .26, y: .50, R: .24, c: 700, a: .85, f: .45 }
  ];
  CLOUDS.forEach(function (b, i) {
    b.seed = i * 1.913 + .7;
    b.w = .05 + (i % 4) * .012;
    b.dx = 0; b.dy = 0; b.vx = 0; b.vy = 0;
  });

  var vw = 0, vh = 0, base = 0, scale = 1, cw = 0, ch = 0;
  var anchors = {};
  function measure() {
    vw = window.innerWidth; vh = window.innerHeight;
    base = Math.max(vw * .9, vh * .7);
    scale = embedded ? 1 / 14 : 1 / 7;
    cw = Math.max(8, Math.ceil(vw * scale));
    ch = Math.max(8, Math.ceil(vh * scale));
    canvas.width = cw; canvas.height = ch;
    var sy = window.scrollY;
    document.querySelectorAll("[data-cloud]").forEach(function (el) {
      var r = el.getBoundingClientRect();
      anchors[el.getAttribute("data-cloud")] = { top: r.top + sy, h: r.height };
    });
  }

  function lobe(x, y, r, col, a) {
    if (r <= 0 || a <= 0) return;
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    var c = col[0] + "," + col[1] + "," + col[2];
    g.addColorStop(0, "rgba(" + c + "," + a + ")");
    g.addColorStop(.42, "rgba(" + c + "," + (a * .55) + ")");
    g.addColorStop(1, "rgba(" + c + ",0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 6.2832);
    ctx.fill();
  }

  /* Drops of ink that bloom where you click, then dissolve. */
  var drops = [];
  function addDrop(x, y, big) {
    if (drops.length > 3) drops.shift();
    var arms = [];
    var n = 4, start = Math.random() * 6.28;
    for (var i = 0; i < n; i++) arms.push({ ang: start + i * (6.28 / n) + Math.random() * .8, len: .6 + Math.random() * .6 });
    drops.push({ x: x, y: y, t: 0, life: big ? 7 : 5.5, size: big ? 1.5 : 1, arms: arms });
  }

  var t = 0, pointer = { x: -9999, y: -9999, vx: 0, vy: 0 };
  function draw(dt) {
    t += dt;
    var sy = reduce ? 0 : window.scrollY;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgb(" + BG.join(",") + ")";
    ctx.fillRect(0, 0, cw, ch);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    for (var i = 0; i < CLOUDS.length; i++) {
      var b = CLOUDS[i], A = anchors[b.s];
      if (!A) continue;
      var R = b.R * base;
      var cx = b.x * vw, cy;
      if (reduce) {
        cy = Math.min(A.top + b.y * A.h, vh * (.15 + (i % 5) * .18)); /* static, all on one screen */
      } else {
        var docY = A.top + b.y * A.h;
        cy = (docY - sy - vh / 2) * b.f + vh / 2;
        /* slow drift */
        cx += Math.sin(t * b.w * 2.1 + b.seed) * R * .18;
        cy += Math.cos(t * b.w * 1.7 + b.seed * 1.3) * R * .14;
        /* the hand stirs the water */
        var ddx = cx + b.dx - pointer.x, ddy = cy + b.dy - pointer.y;
        var dist2 = ddx * ddx + ddy * ddy, reach = R * 1.1;
        if (dist2 < reach * reach) {
          var fall = 1 - Math.sqrt(dist2) / reach;
          b.vx += pointer.vx * fall * .045;
          b.vy += pointer.vy * fall * .045;
        }
        b.vx *= .93; b.vy *= .93;
        b.dx = (b.dx + b.vx) * .985;
        b.dy = (b.dy + b.vy) * .985;
        cx += b.dx; cy += b.dy;
      }
      if (cy + R < -R * .5 || cy - R > vh + R * .5) continue;

      var col = C[b.c];
      /* Three lobes orbit and breathe: the cloud keeps changing shape */
      for (var k = 0; k < 3; k++) {
        var dir = k % 2 ? 1 : -1;
        var ang = b.seed + k * 2.094 + t * b.w * dir * (1 + k * .35);
        var off = R * (.26 + .12 * Math.sin(t * .23 + b.seed + k));
        var lr = R * (.62 + .14 * Math.sin(t * .31 + b.seed * 2 + k * 1.7));
        lobe(cx + Math.cos(ang) * off, cy + Math.sin(ang) * off * .8, lr, col, b.a * (k ? .75 : 1));
      }
      /* a brighter heart where the ink is densest */
      if (b.c >= 500 && b.c <= 600) {
        var ha = b.seed + t * b.w * 1.4;
        lobe(cx + Math.cos(ha) * R * .18, cy + Math.sin(ha) * R * .12, R * .4, C[400], b.c === 500 ? .55 : .38);
      }
    }

    for (var d = drops.length - 1; d >= 0; d--) {
      var p = drops[d];
      p.t += dt;
      var q = p.t / p.life;
      if (q >= 1) { drops.splice(d, 1); continue; }
      var grow = 1 - Math.pow(1 - q, 3);
      var fade = Math.pow(1 - q, 1.5);
      var rr = (24 + 230 * grow) * p.size;
      lobe(p.x, p.y, rr, C[400], .62 * fade);
      for (var m = 0; m < p.arms.length; m++) {
        var arm = p.arms[m], reachA = rr * arm.len * 1.1;
        var curl = arm.ang + grow * .9;
        lobe(p.x + Math.cos(curl) * reachA, p.y + Math.sin(curl) * reachA, rr * .55, C[500], .7 * fade);
      }
      lobe(p.x, p.y, rr * .35, C[300], .4 * fade * fade);
    }
    pointer.vx *= .6; pointer.vy *= .6;
  }

  measure();
  draw(0);
  canvas.classList.add("is-on");

  var resizeT = 0;
  window.addEventListener("resize", function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () { measure(); if (reduce) draw(0); }, 120);
  });
  window.addEventListener("load", function () { measure(); if (reduce) draw(0); });

  if (reduce) return;

  /* ---------- Animation loop: slow, and slower when embedded ---------- */
  var raf = 0, last = 0, onScreen = true, lastScroll = -1;
  var idleStep = embedded ? 90 : 33;   /* ~11fps in the gallery, ~30fps alone */
  var busyStep = embedded ? 90 : 15;   /* full rate while scrolling or stirring */
  function frame(now) {
    raf = requestAnimationFrame(frame);
    var sy = window.scrollY;
    var busy = sy !== lastScroll || Math.abs(pointer.vx) + Math.abs(pointer.vy) > .5 || drops.length;
    if (now - last < (busy ? busyStep : idleStep)) return;
    var dt = last ? Math.min(.1, (now - last) / 1000) : .016;
    last = now; lastScroll = sy;
    draw(dt);
    depth();
  }
  function start() { if (!raf && onScreen && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  if ("IntersectionObserver" in window) {
    /* The ink layer is fixed: it leaves the viewport only when this page is a scrolled-away iframe. */
    new IntersectionObserver(function (e) {
      onScreen = e[e.length - 1].isIntersecting;
      onScreen ? start() : stop();
    }).observe(canvas);
  }
  start();

  /* ---------- Scroll depth for floating panes ---------- */
  var deep = Array.prototype.slice.call(document.querySelectorAll("[data-depth]"));
  var wisps = document.getElementById("wisps");
  function depth() {
    var max = Math.max(1, document.documentElement.scrollHeight - vh);
    wisps.style.setProperty("--wy", (-window.scrollY / max * vh * .22).toFixed(1) + "px");
    for (var i = 0; i < deep.length; i++) {
      var el = deep[i], r = el.getBoundingClientRect();
      var off = (r.top + r.height / 2 - vh / 2) * -parseFloat(el.getAttribute("data-depth"));
      el.style.setProperty("--py", off.toFixed(1) + "px");
    }
  }

  /* First drop: ink falls into the water behind the lens */
  var lens = document.querySelector(".lens");
  setTimeout(function () {
    var r = lens.getBoundingClientRect();
    if (r.bottom > 0) addDrop(r.left + r.width / 2, r.top + r.height / 2, true);
  }, 350);

  /* Click anywhere that is not a control to drop ink */
  window.addEventListener("pointerdown", function (e) {
    if (e.button !== 0 || e.target.closest("a, button, .mdx-nav")) return;
    addDrop(e.clientX, e.clientY, false);
  });

  if (!finePointer || embedded) return;

  /* ---------- Glass tilts to face the cursor ---------- */
  var panes = Array.prototype.slice.call(document.querySelectorAll("[data-tilt]"));
  var px = vw / 2, py = vh / 2, tRaf = 0, hovered = null;
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    pointer.vx = (e.clientX - pointer.x) * (pointer.x < -999 ? 0 : 1);
    pointer.vy = (e.clientY - pointer.y) * (pointer.y < -999 ? 0 : 1);
    pointer.x = e.clientX; pointer.y = e.clientY;
    px = e.clientX; py = e.clientY;
    if (!tRaf) tRaf = requestAnimationFrame(tilt);
  }, { passive: true });
  document.addEventListener("pointerleave", function () {
    pointer.x = pointer.y = -9999;
    panes.forEach(function (p) { p.style.setProperty("--rx", "0deg"); p.style.setProperty("--ry", "0deg"); p.classList.remove("is-hover"); });
  });

  function tilt() {
    tRaf = 0;
    for (var i = 0; i < panes.length; i++) {
      var p = panes[i], r = p.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      var amp = parseFloat(p.getAttribute("data-tilt")) || 1;
      var inside = px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
      var nx, ny, max;
      if (inside) {
        nx = (px - r.left) / r.width * 2 - 1;
        ny = (py - r.top) / r.height * 2 - 1;
        max = 4.2 * amp;
        p.style.setProperty("--mx", ((px - r.left) / r.width * 100).toFixed(1) + "%");
        p.style.setProperty("--my", ((py - r.top) / r.height * 100).toFixed(1) + "%");
      } else {
        nx = Math.max(-1, Math.min(1, (px - (r.left + r.width / 2)) / (vw * .6)));
        ny = Math.max(-1, Math.min(1, (py - (r.top + r.height / 2)) / (vh * .6)));
        max = 1.6 * amp;
      }
      /* Scale by size so wide panes tilt less at their far edges */
      var k = Math.min(1, 520 / Math.max(r.width, 1)) * .5 + .5;
      p.style.setProperty("--ry", (nx * max * k).toFixed(2) + "deg");
      p.style.setProperty("--rx", (-ny * max * k).toFixed(2) + "deg");
      p.classList.toggle("is-hover", inside);
    }
  }

  /* Light follows the cursor inside the ink buttons */
  document.querySelectorAll(".btn--ink").forEach(function (b) {
    b.addEventListener("pointermove", function (e) {
      var r = b.getBoundingClientRect();
      b.style.setProperty("--bx", (e.clientX - r.left) + "px");
      b.style.setProperty("--by", (e.clientY - r.top) + "px");
    });
  });
})();
