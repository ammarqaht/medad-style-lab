/* 22 · Wabi-Sabi */
(function () {
  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Wabi-Sabi";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var embedded = false;
  try { embedded = window.self !== window.top; } catch (err) { embedded = true; }

  /* Reveals: words soak into the paper, blur to sharp. */
  var bleeds = document.querySelectorAll("[data-bleed]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    bleeds.forEach(function (el) { io.observe(el); });
  } else {
    bleeds.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* The stroke: a soft-edged sheet slides right to left, the brush travelling. */
  var ink = document.getElementById("ink");
  var sheet = document.getElementById("revealSheet");
  var FROM = 1260, TO = -420;
  var painting = 0;

  function ease(t) { /* press, sweep, lift */
    return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function paint(duration) {
    cancelAnimationFrame(painting);
    if (reduce || embedded || document.hidden) { sheet.setAttribute("x", TO); ink.classList.add("is-painted"); return; }
    sheet.setAttribute("x", FROM);
    ink.classList.remove("is-painted");
    void ink.offsetWidth;
    var start = 0;
    function frame(now) {
      if (!start) start = now;
      var t = Math.min(1, (now - start) / duration);
      sheet.setAttribute("x", (FROM + (TO - FROM) * ease(t)).toFixed(1));
      if (t < 1) painting = requestAnimationFrame(frame);
    }
    painting = requestAnimationFrame(function () {
      ink.classList.add("is-painted");
      painting = requestAnimationFrame(frame);
    });
  }
  setTimeout(function () { paint(4200); }, (reduce || embedded) ? 0 : 450);

  /* Click the stroke to wash the paper and paint it again. */
  if (!reduce && !embedded) {
    var again = false;
    ink.addEventListener("click", function () {
      if (again) return;
      again = true;
      ink.classList.remove("is-painted");
      setTimeout(function () { paint(4200); }, 900);
      setTimeout(function () { again = false; }, 5400);
    });
  }

  /* The only loop is the damp wash in the paper: pause it whenever it is not seen. */
  var hero = document.querySelector(".hero");
  if (reduce || embedded) { hero.classList.add("is-paused"); return; }
  var visible = true;
  function sync() { hero.classList.toggle("is-paused", !visible || document.hidden); }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { visible = e[e.length - 1].isIntersecting; sync(); }).observe(hero);
  }
  document.addEventListener("visibilitychange", sync);
})();
