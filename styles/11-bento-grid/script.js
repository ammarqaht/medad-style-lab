/* 11 · Bento Grid */
(function () {
  /* Countdown numerals for the live tile (decorative, built here instead of hardcoded markup). */
  var ln = document.getElementById("liveNum");
  if (ln) ln.innerHTML = ["\u0663", "\u0662", "\u0661"].map(function (n) { return "<em>" + n + "</em>"; }).join("");

  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Bento Grid";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  /* In the gallery the page runs inside a small iframe: draw less there. */
  var embedded = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  var tiles = Array.prototype.slice.call(document.querySelectorAll("[data-tile]"));

  /* ---------- Staggered reveal, in reading order per batch ---------- */
  function settle(el) {
    el.classList.add("is-in");
    el.addEventListener("transitionend", function done(e) {
      if (e.target !== el || e.propertyName !== "opacity") return;
      el.classList.add("is-settled");
      el.style.removeProperty("--d");
      el.removeEventListener("transitionend", done);
    });
  }
  if ("IntersectionObserver" in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (e) { return e.isIntersecting; })
        .map(function (e) { return e.target; })
        .sort(function (a, b) { return tiles.indexOf(a) - tiles.indexOf(b); });
      batch.forEach(function (el, i) {
        el.style.setProperty("--d", (i * 0.07).toFixed(2) + "s");
        settle(el);
        revealIO.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -4% 0px" });
    tiles.forEach(function (el) { revealIO.observe(el); });

    /* Pause each tile's loops while it is offscreen. */
    var liveIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle("is-off", !e.isIntersecting); });
    }, { rootMargin: "60px 0px" });
    tiles.forEach(function (el) { liveIO.observe(el); });
  } else {
    tiles.forEach(settle);
  }

  /* ---------- Spotlight that follows the cursor inside tiles ---------- */
  var logoTile = document.querySelector(".t-logo");
  var logoWord = document.querySelector("#logoWord .brand-word");
  if (fine) {
    tiles.forEach(function (t) {
      var raf = 0, ev = null;
      function paint() {
        raf = 0;
        var r = t.getBoundingClientRect();
        t.style.setProperty("--mx", (ev.clientX - r.left).toFixed(1) + "px");
        t.style.setProperty("--my", (ev.clientY - r.top).toFixed(1) + "px");
        if (t === logoTile && !reduce) {
          var w = logoWord.getBoundingClientRect();
          logoWord.style.setProperty("--wx", (ev.clientX - w.left).toFixed(1) + "px");
          logoWord.style.setProperty("--wy", (ev.clientY - w.top).toFixed(1) + "px");
        }
      }
      t.addEventListener("pointerenter", function () { t.classList.add("is-hot"); });
      t.addEventListener("pointerleave", function () {
        t.classList.remove("is-hot");
        if (t === logoTile) { logoWord.style.removeProperty("--wx"); logoWord.style.removeProperty("--wy"); }
      });
      t.addEventListener("pointermove", function (e) {
        ev = e;
        if (!raf) raf = requestAnimationFrame(paint);
      }, { passive: true });
    });
  }

  /* ---------- Magnetic closing button ---------- */
  var cta = document.querySelector(".t-cta");
  var mBtn = document.getElementById("mailBtn");
  if (fine && !reduce) {
    cta.addEventListener("pointermove", function (e) {
      var r = mBtn.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      var d = Math.hypot(dx, dy), reach = 220;
      if (d < reach) {
        var k = (1 - d / reach) * 0.28;
        mBtn.style.transform = "translate(" + (dx * k).toFixed(1) + "px," + (dy * k).toFixed(1) + "px)";
      } else mBtn.style.transform = "";
    }, { passive: true });
    cta.addEventListener("pointerleave", function () { mBtn.style.transform = ""; });
  }

  /* ---------- Live ink: drops falling into still water and diffusing ---------- */
  var tile = document.querySelector(".t-ink");
  var cv = document.getElementById("inkCanvas");
  var ctx = cv.getContext("2d");
  if (!ctx) return;
  var dpr = embedded ? 1 : Math.min(2, window.devicePixelRatio || 1);
  var W = 0, H = 0, SC = 1;
  var cap = embedded ? 420 : 1300;

  /* Soft round sprites, tinted with the green ramp. */
  function sprite(rgb) {
    var s = document.createElement("canvas"); s.width = s.height = 64;
    var g = s.getContext("2d");
    var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(" + rgb + ",1)");
    gr.addColorStop(.4, "rgba(" + rgb + ",.45)");
    gr.addColorStop(1, "rgba(" + rgb + ",0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return s;
  }
  var tones = [sprite("54,201,186"), sprite("26,138,125"), sprite("133,214,205"), sprite("222,242,240")];
  var weights = [0.42, 0.34, 0.18, 0.06];
  function tone() {
    var r = Math.random(), a = 0;
    for (var i = 0; i < weights.length; i++) { a += weights[i]; if (r < a) return tones[i]; }
    return tones[0];
  }

  var parts = [], falling = [], t0 = performance.now();

  function bloom(x, y, power) {
    var n = Math.round((embedded ? 34 : 64) * power * Math.max(0.6, SC));
    for (var i = 0; i < n && parts.length < cap; i++) {
      var a = Math.random() * Math.PI * 2, wisp = i % 3 !== 0;
      var sp = (wisp ? 0.8 + Math.random() * 1.8 : 0.2 + Math.random() * 0.6) * power;
      parts.push({
        x: x, y: y,
        vx: Math.cos(a) * sp * SC, vy: (Math.sin(a) * sp * 0.7 + 0.15) * SC,
        s: (wisp ? 2.5 + Math.random() * 3.5 : 8 + Math.random() * 10) * SC,
        g: (wisp ? 0.04 + Math.random() * 0.08 : 0.14 + Math.random() * 0.24) * SC,
        life: 1, k: 0.0017 + Math.random() * 0.003, img: tone()
      });
    }
  }
  function drip(x, y) {
    falling.push({ x: x, y: -10, ty: y, vy: 2 });
  }
  function stir(x, y, vx, vy) {
    if (parts.length >= cap) return;
    parts.push({ x: x, y: y, vx: vx * 0.1, vy: vy * 0.1, s: 5 + Math.random() * 5, g: 0.16, life: 0.9, k: 0.005, img: tone() });
  }

  function resize() {
    var r = cv.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    SC = Math.max(0.5, Math.min(1.2, Math.min(W, H) / 380));
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function step(dt, now) {
    var t = (now - t0) * 0.001;
    for (var j = falling.length - 1; j >= 0; j--) {
      var f = falling[j];
      f.vy += 0.5 * dt; f.y += f.vy * dt;
      if (Math.random() < 0.6 && parts.length < cap) {
        parts.push({ x: f.x + (Math.random() - .5) * 2, y: f.y, vx: 0, vy: 0.2, s: 1.6, g: 0.025, life: 0.5, k: 0.014, img: tones[0] });
      }
      if (f.y >= f.ty) { bloom(f.x, f.ty, 1); falling.splice(j, 1); }
    }
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      var ang = (Math.sin(p.x * 0.011 + t * 0.35) + Math.cos(p.y * 0.013 - t * 0.27)) * Math.PI;
      p.vx += Math.cos(ang) * 0.018 * dt;
      p.vy += (Math.sin(ang) * 0.018 + 0.004) * dt;
      p.vx *= Math.pow(0.982, dt); p.vy *= Math.pow(0.982, dt);
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.s += p.g * dt * p.life;
      p.life -= p.k * dt;
      if (p.life <= 0 || p.y > H + 60) parts.splice(i, 1);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      ctx.globalAlpha = Math.pow(p.life, 1.2) * 0.6;
      ctx.drawImage(p.img, p.x - p.s, p.y - p.s, p.s * 2, p.s * 2);
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    for (var j = 0; j < falling.length; j++) {
      var f = falling[j];
      ctx.drawImage(tones[3], f.x - 4, f.y - 5, 8, 10);
    }
  }

  function autoDrop() {
    drip(W * (0.28 + Math.random() * 0.44), H * (0.42 + Math.random() * 0.24));
  }

  resize();
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(cv);
  else window.addEventListener("resize", resize);

  if (reduce) {
    /* One still composition: a settled bloom, no motion. */
    bloom(W * 0.5, H * 0.52, 1.3);
    bloom(W * 0.36, H * 0.62, 0.8);
    for (var s = 0; s < 70; s++) step(1, t0 + s * 16);
    draw();
    if ("ResizeObserver" in window) new ResizeObserver(function () { draw(); }).observe(cv);
    return;
  }

  var visible = true, running = false;
  function wake() {
    if (running || !visible || document.hidden) return;
    running = true; prev = performance.now(); nextDrop = prev + 300;
    requestAnimationFrame(frame);
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; wake(); }).observe(tile);
  }
  document.addEventListener("visibilitychange", wake);

  /* Pointer stirs the water; a click lets a drop fall where you point. */
  var last = null;
  tile.addEventListener("pointermove", function (e) {
    var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (last) {
      var vx = x - last.x, vy = y - last.y;
      if (Math.abs(vx) + Math.abs(vy) > 2) stir(x, y, vx, vy);
    }
    last = { x: x, y: y };
  }, { passive: true });
  tile.addEventListener("pointerleave", function () { last = null; });
  tile.addEventListener("click", function (e) {
    var r = cv.getBoundingClientRect();
    if (typeof falling !== "undefined" && falling.length > 6) return;
    drip(e.clientX - r.left, Math.max(24, e.clientY - r.top));
  });

  var prev = performance.now(), lastDraw = 0, nextDrop = prev + 400;
  /* Start mid-story: two blooms already spreading. */
  bloom(W * 0.55, H * 0.5, 1.2);
  for (var w0 = 0; w0 < 70; w0++) step(1, prev - (140 - w0) * 16);
  bloom(W * 0.38, H * 0.66, 0.9);
  bloom(W * 0.62, H * 0.28, 1);
  for (var w1 = 0; w1 < 25; w1++) step(1, prev - (70 - w1) * 16);
  draw();
  function frame(now) {
    var dt = Math.min(3, (now - prev) / 16.67);
    prev = now;
    if (!visible || document.hidden) { running = false; return; }
    if (now > nextDrop) { autoDrop(); nextDrop = now + (embedded ? 2800 : 1700) + Math.random() * 800; }
    step(dt, now);
    if (!embedded || now - lastDraw > 66) { draw(); lastDraw = now; }
    requestAnimationFrame(frame);
  }
  wake();
})();
