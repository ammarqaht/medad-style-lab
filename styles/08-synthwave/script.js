/* 08 · Synthwave */
(function () {
  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Synthwave";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var embedded = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  if (embedded) root.classList.add("in-frame");

  var hero = document.getElementById("hero");
  requestAnimationFrame(function () { hero.classList.add("is-ready"); });

  /* Panels power on as they enter. */
  var reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Closing floor runs only while on screen and the tab is visible. */
  var floor = document.getElementById("floor");
  var floorSeen = false;
  function floorState() { floor.classList.toggle("is-running", floorSeen && !document.hidden && !reduce); }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { floorSeen = e[e.length - 1].isIntersecting; floorState(); }).observe(floor);
  }

  /* ============================================================
     Signature: the horizon. A striped green sun rising behind
     wireframe mountains, over a neon grid rushing at the viewer.
     ============================================================ */
  var stage = document.getElementById("stage");
  var space = document.getElementById("space");
  var top0 = 0;
  var cv = document.getElementById("horizon");
  var ctx = cv.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, embedded ? 1 : 1.75);
  var W = 0, H = 0, ridgeL = [], ridgeR = [];

  var C = {
    g100: "#DEF2F0", g200: "#BCE6E1", g300: "#85D6CD", g400: "#36C9BA",
    g500: "#1A8A7D", g600: "#126E64", g900: "#042421", g950: "#051211"
  };

  // A seeded random keeps the mountains identical on every resize.
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function buildRidges() {
    var r = rng(7);
    ridgeL = []; ridgeR = [];
    var n = 9;
    for (var i = 0; i <= n; i++) {
      var t = i / n;                       // 0 at the edge, 1 toward the sun
      var h = (1 - t) * (0.55 + r() * 0.45) + (i % 2 ? 0.08 : 0.32) * (1 - t);
      ridgeL.push([t * 0.36, Math.max(0, h)]);
      ridgeR.push([t * 0.36, Math.max(0, (1 - t) * (0.5 + r() * 0.5) + (i % 2 ? 0.3 : 0.06) * (1 - t))]);
    }
  }

  function resize() {
    var r = stage.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    top0 = Math.max(0, space.getBoundingClientRect().top - r.top);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!ridgeL.length) buildRidges();
    draw();
  }

  var state = {
    off: 0.35, speed: reduce ? 0 : 7, target: 0.9, rise: reduce ? 1 : 0, sun: 0,
    sway: 0, swayT: 0, boost: 0
  };

  function drawMountains(hz, cx, side, ridge, mh) {
    ctx.beginPath();
    var base = side < 0 ? 0 : W;
    ctx.moveTo(base, hz);
    for (var i = 0; i < ridge.length; i++) {
      var x = side < 0 ? ridge[i][0] * W : W - ridge[i][0] * W;
      x += (cx - W / 2) * 0.35;
      ctx.lineTo(x, hz - ridge[i][1] * mh);
    }
    ctx.lineTo(side < 0 ? W * 0.45 : W * 0.55, hz);
    ctx.closePath();
    var fill = ctx.createLinearGradient(0, hz - mh, 0, hz);
    fill.addColorStop(0, "rgba(8, 58, 53, .98)");
    fill.addColorStop(1, "rgba(5, 18, 17, 1)");
    ctx.fillStyle = fill;
    ctx.fill();
    // wire ribs from each peak down to the base
    ctx.strokeStyle = "rgba(54, 201, 186, .16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var j = 1; j < ridge.length - 1; j++) {
      var px = side < 0 ? ridge[j][0] * W : W - ridge[j][0] * W;
      px += (cx - W / 2) * 0.35;
      ctx.moveTo(px, hz - ridge[j][1] * mh);
      ctx.lineTo(px + (side < 0 ? 1 : -1) * mh * 0.25, hz);
    }
    ctx.stroke();
    // neon ridge line
    ctx.beginPath();
    for (var k = 0; k < ridge.length; k++) {
      var rx = side < 0 ? ridge[k][0] * W : W - ridge[k][0] * W;
      rx += (cx - W / 2) * 0.35;
      if (k) ctx.lineTo(rx, hz - ridge[k][1] * mh); else ctx.moveTo(rx, hz - ridge[k][1] * mh);
    }
    ctx.strokeStyle = "rgba(54, 201, 186, .7)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  function draw() {
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    var hz = Math.round(top0 + (H - top0) * 0.48);
    var cx = W / 2 + state.sway * W * 0.05;

    // sky glow rising to the horizon
    var sky = ctx.createLinearGradient(0, top0 * 0.6, 0, hz);
    sky.addColorStop(0, "rgba(13, 84, 77, 0)");
    sky.addColorStop(1, "rgba(13, 84, 77, .7)");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, hz);

    // sun
    var R = Math.min((hz - top0) * 1.12, W * 0.42, 400);
    var ease = 1 - Math.pow(1 - state.rise, 3);
    var scx = W / 2 + state.sway * W * 0.015;
    var scy = hz + R * 0.18 + (1 - ease) * R * 1.1;
    var halo = ctx.createRadialGradient(scx, scy - R * 0.3, R * 0.2, scx, scy - R * 0.3, R * 2.1);
    halo.addColorStop(0, "rgba(54, 201, 186, " + (0.34 + state.boost * 0.16) * ease + ")");
    halo.addColorStop(0.5, "rgba(26, 138, 125, " + 0.12 * ease + ")");
    halo.addColorStop(1, "rgba(26, 138, 125, 0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, hz);

    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, hz); ctx.clip();
    ctx.beginPath(); ctx.arc(scx, scy, R, 0, Math.PI * 2); ctx.clip();
    // bands = the sun minus the stripe gaps that slide downward and widen
    var ys = scy - R * 0.6, span = hz - ys, N = 9, phase = state.sun % 1;
    ctx.beginPath();
    var cursor = scy - R - 2;
    for (var i = 0; i < N; i++) {
      var p = (i + phase) / N;
      var gy = ys + p * span;
      var gh = 1.2 + Math.pow(p, 1.5) * R * 0.11;
      if (gy > cursor) ctx.rect(scx - R - 2, cursor, R * 2 + 4, gy - cursor);
      cursor = Math.max(cursor, gy + gh);
    }
    if (cursor < hz) ctx.rect(scx - R - 2, cursor, R * 2 + 4, hz - cursor);
    ctx.clip();
    var sg = ctx.createLinearGradient(0, scy - R, 0, hz);
    sg.addColorStop(0, C.g100);
    sg.addColorStop(0.3, C.g200);
    sg.addColorStop(0.58, C.g300);
    sg.addColorStop(0.82, C.g400);
    sg.addColorStop(1, C.g500);
    ctx.fillStyle = sg;
    ctx.fillRect(scx - R, scy - R, R * 2, R * 1.3);
    ctx.restore();

    // mountains in front of the sun's foot
    var mh = Math.min((hz - top0) * 0.5, 190);
    drawMountains(hz, cx, -1, ridgeL, mh);
    drawMountains(hz, cx, 1, ridgeR, mh * 0.85);

    // floor
    var fl = ctx.createLinearGradient(0, hz, 0, H);
    fl.addColorStop(0, C.g900);
    fl.addColorStop(1, C.g950);
    ctx.fillStyle = fl;
    ctx.fillRect(0, hz, W, H - hz);

    var depth = H - hz;
    // horizontal lines rushing forward
    var gap = 1, off = state.off % gap, zFar = 26;
    ctx.lineCap = "round";
    for (var pass = 0; pass < 2; pass++) {
      ctx.lineWidth = pass ? 1.4 : 5;
      for (var k = 0; k < zFar; k++) {
        var z = k * gap + gap - off + 0.02;
        var y = hz + depth / z;
        if (y > H + 4) continue;
        var a = Math.min(1, 1.25 / Math.pow(z, 0.7)) * (1 - z / zFar);
        ctx.strokeStyle = "rgba(54, 201, 186, " + (pass ? a * 0.95 : a * 0.18).toFixed(3) + ")";
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    }
    // vertical lines to the vanishing point
    var S = Math.max(W, 520) / 11;
    var vg = ctx.createLinearGradient(0, hz, 0, H);
    vg.addColorStop(0, "rgba(54, 201, 186, 0)");
    vg.addColorStop(0.25, "rgba(54, 201, 186, .55)");
    vg.addColorStop(1, "rgba(54, 201, 186, 1)");
    var vgw = ctx.createLinearGradient(0, hz, 0, H);
    vgw.addColorStop(0, "rgba(54, 201, 186, 0)");
    vgw.addColorStop(1, "rgba(54, 201, 186, .2)");
    var nV = Math.ceil(W / S) + 6;
    for (var ps = 0; ps < 2; ps++) {
      ctx.lineWidth = ps ? 1.3 : 5;
      ctx.strokeStyle = ps ? vg : vgw;
      ctx.beginPath();
      for (var v = -nV; v <= nV; v++) {
        var X = v * S;
        ctx.moveTo(cx, hz);
        ctx.lineTo(cx + X / 0.45, hz + depth / 0.45);
      }
      ctx.stroke();
    }

    // horizon line and its bloom
    var hl = ctx.createLinearGradient(0, 0, W, 0);
    hl.addColorStop(0, "rgba(133, 214, 205, 0)");
    hl.addColorStop(0.5, "rgba(222, 242, 240, .95)");
    hl.addColorStop(1, "rgba(133, 214, 205, 0)");
    ctx.fillStyle = "rgba(54, 201, 186, .22)";
    ctx.fillRect(0, hz - 6, W, 12);
    ctx.fillStyle = hl;
    ctx.fillRect(0, hz - 1, W, 2);
    // fog that swallows the far grid
    var fog = ctx.createLinearGradient(0, hz, 0, hz + depth * 0.22);
    fog.addColorStop(0, "rgba(13, 84, 77, .75)");
    fog.addColorStop(1, "rgba(13, 84, 77, 0)");
    ctx.fillStyle = fog;
    ctx.fillRect(0, hz, W, depth * 0.22);
  }

  if (window.ResizeObserver) { var ro = new ResizeObserver(resize); ro.observe(stage); ro.observe(space); }
  else window.addEventListener("resize", resize);
  resize();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);

  if (reduce) return;

  /* ---- motion loop: paused offscreen and in hidden tabs, throttled in the gallery ---- */
  var raf = 0, last = 0, onScreen = true;
  var minStep = embedded ? 1000 / 15 : 0;
  function frame(now) {
    raf = 0;
    if (!onScreen || document.hidden) return;
    var dt = last ? Math.min(0.1, (now - last) / 1000) : 0.016;
    if (minStep && last && now - last < minStep) { raf = requestAnimationFrame(frame); return; }
    last = now;
    state.target = 0.9 + state.boost * 2.6;
    state.speed += (state.target - state.speed) * Math.min(1, dt * 1.6);
    state.off += state.speed * dt;
    state.sun += dt * 0.12;
    if (state.rise < 1) state.rise = Math.min(1, state.rise + dt / 1.8);
    state.sway += (state.swayT - state.sway) * Math.min(1, dt * 3);
    draw();
    raf = requestAnimationFrame(frame);
  }
  function play() { if (!raf && onScreen && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { onScreen = e[e.length - 1].isIntersecting; play(); }).observe(stage);
  }
  document.addEventListener("visibilitychange", function () { play(); floorState(); });
  play();

  /* Pointer tilts the camera; hovering a call to action hits the throttle. */
  if (!embedded) {
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      state.swayT = (e.clientX / window.innerWidth - 0.5) * 2;
    }, { passive: true });
  }
  var cta = document.getElementById("heroCta");
  ["pointerenter", "focus"].forEach(function (ev) { cta.addEventListener(ev, function () { state.boost = 1; }); });
  ["pointerleave", "blur"].forEach(function (ev) { cta.addEventListener(ev, function () { state.boost = 0; }); });
})();
