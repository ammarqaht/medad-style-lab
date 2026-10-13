/* 01 · Claymorphism */
(function () {
  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Claymorphism";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Spring pop-in. Once settled, drop the stagger so hovers react instantly. */
  var pops = document.querySelectorAll("[data-pop]");
  function settle(el) {
    el.classList.add("is-in");
    el.addEventListener("transitionend", function done(e) {
      if (e.target !== el || e.propertyName !== "transform") return;
      el.style.setProperty("--d", "0s");
      el.removeEventListener("transitionend", done);
    });
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { settle(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
    pops.forEach(function (el) { io.observe(el); });
  } else {
    pops.forEach(settle);
  }

  /* Keyboard presses get the same squash as pointer presses. */
  document.querySelectorAll(".btn").forEach(function (b) {
    b.addEventListener("keydown", function (e) {
      if (e.key === "Enter") b.classList.add("is-pressed");
    });
    b.addEventListener("keyup", function () { b.classList.remove("is-pressed"); });
    b.addEventListener("blur", function () { b.classList.remove("is-pressed"); });
  });

  if (reduce) return;

  /* Pointer parallax on the hero scene. */
  var scene = document.getElementById("scene");
  var layers = scene.querySelectorAll(".layer");
  layers.forEach(function (l) { l.style.setProperty("--depth", l.getAttribute("data-depth")); });

  var raf = 0, tx = 0, ty = 0;
  function apply() {
    raf = 0;
    scene.style.setProperty("--px", tx.toFixed(3));
    scene.style.setProperty("--py", ty.toFixed(3));
  }
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    var r = scene.getBoundingClientRect();
    tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2))) * 1.6;
    ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2))) * 1.2;
    if (!raf) raf = requestAnimationFrame(apply);
  }, { passive: true });

  /* Press the inkwell: it squashes, and the drop hops out of reach. */
  var well = document.getElementById("well");
  var drop = document.getElementById("drop");
  var busy = false;
  function squish() {
    if (busy || !well.animate) return;
    busy = true;
    well.animate([
      { transform: "scale(1, 1)" },
      { transform: "scale(1.09, .86)", offset: .18, easing: "cubic-bezier(.2,.8,.3,1)" },
      { transform: "scale(.95, 1.07)", offset: .46 },
      { transform: "scale(1.025, .975)", offset: .7 },
      { transform: "scale(1, 1)" }
    ], { duration: 780, easing: "ease-out" });
    var hop = drop.animate([
      { transform: "translate(0, 0) scale(1, 1)" },
      { transform: "translate(0, 1cqw) scale(1.12, .88)", offset: .16 },
      { transform: "translate(-2cqw, -12cqw) scale(.92, 1.1)", offset: .48, easing: "cubic-bezier(.3,0,.7,1)" },
      { transform: "translate(0, 0) scale(1.1, .9)", offset: .8 },
      { transform: "translate(0, 0) scale(1, 1)" }
    ], { duration: 920, delay: 60, easing: "ease-out" });
    hop.onfinish = hop.oncancel = function () { busy = false; };
  }
  scene.addEventListener("click", squish);
})();
