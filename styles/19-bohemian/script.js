/* 19 · Bohemian */
(function () {
  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Bohemian";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var embedded = false;
  try { embedded = window.self !== window.top; } catch (e) { embedded = true; }

  var arch = document.querySelector(".arch");
  var thread = document.querySelector(".hero__thread");

  /* Stagger the ink: stems first, leaves after, so the drawing grows. */
  arch.querySelectorAll(".ink").forEach(function (p, i) {
    p.style.setProperty("--dd", (0.3 + (i % 18) * 0.07).toFixed(2) + "s");
  });
  arch.querySelectorAll(".leaf").forEach(function (p, i) {
    p.style.setProperty("--dd", (1.2 + (i % 20) * 0.06).toFixed(2) + "s");
  });

  /* Slow reveals */
  var items = document.querySelectorAll("[data-reveal]");
  function show(el) { el.classList.add("is-in"); }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -5% 0px" });
    /* A fully clipped arch never reports as intersecting, so arch cards
       are revealed through their parent row instead. */
    var rows = [];
    items.forEach(function (el) {
      if (el.hasAttribute("data-arch")) {
        if (rows.indexOf(el.parentElement) < 0) rows.push(el.parentElement);
      } else io.observe(el);
    });
    var rowIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll("[data-arch]").forEach(show);
        rowIo.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    rows.forEach(function (r) { rowIo.observe(r); });
  } else {
    items.forEach(show);
  }
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { arch.classList.add("is-drawn"); });
  });
  if (thread) thread.classList.add("is-in");

  if (reduce || embedded) return;

  /* Leaf sway: each stem is a damped spring that idles on a slow sine,
     and takes a gust from the pointer as it passes over the window. */
  var stems = Array.prototype.map.call(arch.querySelectorAll(".sway"), function (g, i) {
    return {
      el: g,
      amp: parseFloat(g.getAttribute("data-amp")) || 2,
      period: parseFloat(g.getAttribute("data-period")) || 7,
      phase: i * 1.37,
      gust: 0,
      vel: 0,
      tassel: g.classList.contains("tassel")
    };
  });

  var running = false, visible = true, raf = 0, last = 0;
  function frame(now) {
    raf = 0;
    if (!running) return;
    var dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    var t = now / 1000;
    for (var i = 0; i < stems.length; i++) {
      var s = stems[i];
      /* spring back toward rest */
      s.vel += (-s.gust * 18 - s.vel * 3.2) * dt;
      s.vel = Math.max(-40, Math.min(40, s.vel));
      s.gust = Math.max(-12, Math.min(12, s.gust + s.vel * dt));
      var a = Math.sin((t / s.period) * Math.PI * 2 + s.phase) * s.amp + s.gust;
      s.el.style.transform = "rotate(" + a.toFixed(3) + "deg)";
    }
    raf = requestAnimationFrame(frame);
  }
  function update() {
    var should = visible && !document.hidden;
    if (should && !running) { running = true; last = 0; raf = requestAnimationFrame(frame); }
    else if (!should && running) { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { visible = e[e.length - 1].isIntersecting; update(); }).observe(arch);
  }
  document.addEventListener("visibilitychange", update);
  update();

  /* A breeze: pointer motion across the arch pushes the stems.
     The push follows the pointer's horizontal direction. */
  var lastX = null;
  arch.addEventListener("pointermove", function (e) {
    if (lastX === null) { lastX = e.clientX; return; }
    var dx = e.clientX - lastX;
    lastX = e.clientX;
    var push = Math.max(-6, Math.min(6, dx * 0.35));
    for (var i = 0; i < stems.length; i++) {
      var v = stems[i].vel + push * (stems[i].tassel ? 2.2 : 1) * (0.7 + (i % 3) * 0.15);
      stems[i].vel = Math.max(-40, Math.min(40, v));
    }
  }, { passive: true });
  arch.addEventListener("pointerleave", function () { lastX = null; });
})();
