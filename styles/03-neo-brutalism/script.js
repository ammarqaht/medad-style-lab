/* 03 · Neo-Brutalism */
(function () {
  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Neo-Brutalism";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  /* Box the last word of the headline as a green block. Whole word only,
     so Arabic joining stays intact. */
  var title = document.getElementById("heroTitle");
  var words = M.hero.headline.split(" ");
  var last = words.pop();
  title.innerHTML = M.html(words.join(" ")) + " <span class=\"hl\">" + M.html(last) + "</span>";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Stamp-in on scroll. Once landed, drop the stagger so hovers snap instantly. */
  var pops = document.querySelectorAll("[data-pop]");
  function land(el) {
    el.classList.add("is-in");
    setTimeout(function () { el.style.setProperty("--d", "0s"); }, 700);
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { land(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    pops.forEach(function (el) { io.observe(el); });
  } else {
    pops.forEach(land);
  }

  /* Keyboard presses push the button into its shadow, like a click. */
  document.querySelectorAll(".btn").forEach(function (b) {
    b.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") b.classList.add("is-pressed");
    });
    b.addEventListener("keyup", function () { b.classList.remove("is-pressed"); });
    b.addEventListener("blur", function () { b.classList.remove("is-pressed"); });
  });

  /* Marquee bands. Clone units until the track covers the band plus one unit,
     then slide by whole pixels. RTL: the green band moves right so the next
     words arrive from the left; the ink band runs against it. Scrolling
     speeds them up, and scrolling up reverses both. */
  var bands = [].slice.call(document.querySelectorAll(".band")).map(function (band) {
    var track = band.querySelector(".band__track");
    var unit = track.querySelector(".band__unit");
    return { band: band, track: track, unit: unit, dir: +band.getAttribute("data-dir") || 1, pos: 0, w: 0 };
  });

  function build() {
    bands.forEach(function (b) {
      while (b.track.children.length > 1) b.track.removeChild(b.track.lastChild);
      b.w = b.unit.getBoundingClientRect().width;
      if (!b.w) return;
      var need = Math.ceil((b.band.clientWidth + b.w) / b.w) + 1;
      for (var i = 1; i < need; i++) b.track.appendChild(b.unit.cloneNode(true));
    });
  }
  build();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  var rt = 0;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(build, 150); });

  if (reduce) return;

  var lastY = window.scrollY, boost = 0, flip = 1, prev = 0, visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; })
      .observe(document.querySelector(".bands"));
  }
  window.addEventListener("scroll", function () {
    var y = window.scrollY, dy = y - lastY;
    lastY = y;
    if (dy > 0) flip = 1; else if (dy < 0) flip = -1;
    boost = Math.min(boost + Math.abs(dy) * 0.6, 40);
  }, { passive: true });

  function tick(t) {
    var dt = prev ? Math.min(t - prev, 50) : 16;
    prev = t;
    if (visible) {
      var speed = (0.07 + boost * 0.012) * dt * flip; /* px per frame */
      bands.forEach(function (b) {
        if (!b.w) return;
        b.pos += speed * b.dir;
        var off = ((b.pos % b.w) + b.w) % b.w;
        b.track.style.transform = "translate3d(" + Math.round(off) + "px,0,0)";
      });
    }
    boost *= 0.92;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
