/* 05 · Surrealism */
(function () {
  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Surrealism";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";

  /* Quill barbs: fine strokes leaving the shaft, clipped to the vane. */
  var barbs = document.getElementById("barbs");
  if (barbs) {
    for (var y = 34; y <= 448; y += 13) {
      var sx = 66 - 6 * Math.pow(y / 520, 2);
      var p = document.createElementNS(NS, "path");
      p.setAttribute("d",
        "M" + sx + " " + y + " q 24 -10 60 -38" +
        " M" + sx + " " + (y + 6) + " q -24 -10 -60 -38");
      barbs.appendChild(p);
    }
  }

  /* Scenes and words arrive slowly as they enter the frame. */
  var scenes = document.querySelectorAll(".scene");
  var rises = document.querySelectorAll("[data-rise]");
  function show(el) { el.classList.add("is-in"); }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    scenes.forEach(function (el) { io.observe(el); });
    rises.forEach(function (el) { io.observe(el); });
  } else {
    scenes.forEach(show);
    rises.forEach(show);
  }

  if (reduce) {
    /* Keep the reflection still: stop the SVG ripple. */
    document.querySelectorAll("animate").forEach(function (a) { a.parentNode.removeChild(a); });
    return;
  }

  /* Slow, uncanny parallax: drops and quills rise faster than the page,
     the sun and clouds lag behind like distant things. Eased, never snappy. */
  var items = [].map.call(document.querySelectorAll("[data-speed]"), function (el) {
    return { el: el, speed: parseFloat(el.getAttribute("data-speed")) || 0, scene: el.closest(".scene"), cur: 0 };
  });
  var raf = 0;
  function frame() {
    raf = 0;
    var vh = window.innerHeight, moving = false;
    items.forEach(function (it) {
      var r = it.scene.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return;
      var target = (r.top + r.height / 2 - vh / 2) * it.speed;
      it.cur += (target - it.cur) * 0.06;
      if (Math.abs(target - it.cur) > 0.2) moving = true;
      it.el.style.transform = "translate3d(0," + it.cur.toFixed(2) + "px,0)";
    });
    if (moving) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  items.forEach(function (it) {
    var r = it.scene.getBoundingClientRect();
    it.cur = (r.top + r.height / 2 - window.innerHeight / 2) * it.speed;
  });
  kick();
  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick);

  /* Touch the still water and it answers with one slow ring. */
  var plane = document.getElementById("heroPlane");
  plane.addEventListener("pointerdown", function (e) {
    if (e.target.closest("a") || plane.querySelectorAll(".tap").length > 5) return;
    var r = plane.getBoundingClientRect();
    var ring = document.createElement("i");
    ring.className = "tap";
    ring.setAttribute("aria-hidden", "true");
    ring.style.left = (e.clientX - r.left) + "px";
    ring.style.top = (e.clientY - r.top) + "px";
    plane.appendChild(ring);
    ring.addEventListener("animationend", function () { ring.remove(); });
    setTimeout(function () { ring.remove(); }, 6000);
  });
})();
