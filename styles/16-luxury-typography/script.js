/* 16 · Luxury Typography */
(function () {
  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Luxury Typography";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hero = document.getElementById("hero");
  var root = document.documentElement;

  /* ---- The unveiling waits for the display font, so the wipe runs on the real ligature. */
  var played = false;
  function play() {
    if (played) return;
    played = true;
    requestAnimationFrame(function () {
      hero.classList.add("is-play");
      if (!reduce) setTimeout(sweep, 2300);
    });
  }
  if (document.fonts && document.fonts.load) {
    Promise.race([
      document.fonts.load('900 100px "Thmanyah Serif Display"', "مـــــداد"),
      new Promise(function (r) { setTimeout(r, 1200); })
    ]).then(play, play);
  } else {
    play();
  }

  /* ---- Slow reveals for everything below the hero. */
  var targets = document.querySelectorAll("main > section:not(.hero) [data-rise], [data-wipe], [data-row], .closing__frame, .foot[data-rise]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { io.observe(el); });

    /* The small mark in the masthead appears once the great one has left. */
    var past = new IntersectionObserver(function (entries) {
      root.classList.toggle("is-past", !entries[entries.length - 1].isIntersecting);
    }, { threshold: 0, rootMargin: "-30% 0px 0px 0px" });
    past.observe(document.getElementById("unveil"));
  } else {
    targets.forEach(function (el) { el.classList.add("is-in"); });
    root.classList.add("is-past");
  }

  /* ---- Light across the type: a lit duplicate layer follows the cursor, eased. */
  var lits = Array.prototype.map.call(document.querySelectorAll("[data-lit]"), function (el) {
    return { el: el, x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, a: 0, ta: 0 };
  });

  function paint(L) {
    L.el.style.setProperty("--mx", (L.x * 100).toFixed(2) + "%");
    L.el.style.setProperty("--my", (L.y * 100).toFixed(2) + "%");
    L.el.style.setProperty("--la", L.a.toFixed(3));
  }

  if (reduce) {
    /* A still, soft light; no movement. */
    lits.forEach(function (L) { L.x = 0.5; L.y = 0.4; L.a = 0.35; paint(L); });
    return;
  }

  var raf = 0;
  function tick() {
    raf = 0;
    var moving = false;
    lits.forEach(function (L) {
      L.x += (L.tx - L.x) * 0.07;
      L.y += (L.ty - L.y) * 0.07;
      L.a += (L.ta - L.a) * 0.05;
      if (Math.abs(L.tx - L.x) > 0.001 || Math.abs(L.ty - L.y) > 0.001 || Math.abs(L.ta - L.a) > 0.002) moving = true;
      paint(L);
    });
    if (moving && !document.hidden) raf = requestAnimationFrame(tick);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }

  var pointerActive = false;
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    pointerActive = true;
    lits.forEach(function (L) {
      var r = L.el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      L.tx = (e.clientX - r.left) / r.width;
      L.ty = (e.clientY - r.top) / r.height;
      /* Brighter when the cursor is near the word, a faint glow from afar */
      var dx = Math.max(0, Math.abs(L.tx - 0.5) - 0.5), dy = Math.max(0, Math.abs(L.ty - 0.5) - 0.5);
      L.ta = Math.max(0.18, 1 - Math.min(1, (dx + dy) * 1.6));
    });
    kick();
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", function () {
    lits.forEach(function (L) { L.ta = 0.18; });
    kick();
  });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) kick(); });

  /* One slow pass of light across the word after it is unveiled (right to left), then it rests. */
  function sweep() {
    if (pointerActive) return;
    var L = lits[0], t0 = performance.now(), dur = 3200;
    function step(now) {
      if (pointerActive) return;
      var p = Math.min(1, (now - t0) / dur);
      var e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      L.x = L.tx = 1.2 - e * 0.85;
      L.y = L.ty = 0.42;
      L.a = L.ta = p < .5 ? p * 2 * 0.95 : 0.95 - (p - .5) * 2 * 0.65;
      paint(L);
      if (p < 1) requestAnimationFrame(step);
      
    }
    requestAnimationFrame(step);
  }
})();
