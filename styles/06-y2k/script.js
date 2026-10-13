/* 06 · Y2K Aesthetic */
(function () {
  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Y2K Aesthetic";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SVGNS = "http://www.w3.org/2000/svg";

  /* Bouncy pop-in. Once settled, drop the stagger so hovers react instantly. */
  var pops = document.querySelectorAll("[data-pop]");
  function settle(el) {
    el.classList.add("is-in");
    el.addEventListener("transitionend", function done(e) {
      if (e.target !== el || e.propertyName !== "opacity") return;
      el.style.setProperty("--d", "0s");
      el.removeEventListener("transitionend", done);
    });
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { settle(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    pops.forEach(function (el) { io.observe(el); });
  } else {
    pops.forEach(settle);
  }

  /* Keyboard presses get the same squish as pointer presses. */
  document.querySelectorAll(".pill").forEach(function (b) {
    b.addEventListener("keydown", function (e) { if (e.key === "Enter") b.classList.add("is-pressed"); });
    b.addEventListener("keyup", function () { b.classList.remove("is-pressed"); });
    b.addEventListener("blur", function () { b.classList.remove("is-pressed"); });
  });

  var blobSvg = document.querySelector(".blob-svg");
  if (reduce) {
    if (blobSvg && blobSvg.pauseAnimations) blobSvg.pauseAnimations();
    return;
  }

  /* A sparkle that pops at (x, y) in viewport coords and drifts away. */
  var live = 0;
  function spark(x, y, size, dx, dy, dur) {
    if (live > 28 || !document.body.animate) return;
    var s = document.createElementNS(SVGNS, "svg");
    s.setAttribute("class", "trail");
    s.setAttribute("aria-hidden", "true");
    var u = document.createElementNS(SVGNS, "use");
    u.setAttribute("href", "#spark");
    s.appendChild(u);
    s.style.left = x + "px";
    s.style.top = y + "px";
    s.style.width = s.style.height = size + "px";
    s.style.margin = (-size / 2) + "px 0 0 " + (-size / 2) + "px";
    document.body.appendChild(s);
    live++;
    var rot = Math.random() * 90 - 45;
    var a = s.animate([
      { transform: "translate(0,0) scale(.1) rotate(0deg)", opacity: 0 },
      { transform: "translate(" + dx * .35 + "px," + dy * .35 + "px) scale(1) rotate(" + rot + "deg)", opacity: 1, offset: .3 },
      { transform: "translate(" + dx + "px," + dy + "px) scale(.2) rotate(" + rot * 2 + "deg)", opacity: 0 }
    ], { duration: dur, easing: "cubic-bezier(.22,1,.36,1)" });
    a.onfinish = a.oncancel = function () { s.remove(); live--; };
  }

  /* Pointer: chrome catches the light and tilts; a sparkle trail follows. */
  var hero = document.getElementById("hero");
  var chrome = document.getElementById("chrome");
  var raf = 0, lx = 0, ly = 0, last = 0;
  function apply() {
    raf = 0;
    chrome.style.setProperty("--lx", lx.toFixed(3));
    chrome.style.setProperty("--ly", ly.toFixed(3));
  }
  hero.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    var r = chrome.getBoundingClientRect();
    lx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
    ly = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
    if (!raf) raf = requestAnimationFrame(apply);
    var now = performance.now();
    if (now - last > 70) {
      last = now;
      spark(e.clientX, e.clientY, 10 + Math.random() * 14, (Math.random() - .5) * 40, 14 + Math.random() * 26, 900);
    }
  }, { passive: true });
  hero.addEventListener("pointerleave", function () {
    lx = 0; ly = 0;
    if (!raf) raf = requestAnimationFrame(apply);
  });

  /* Tap the chrome: it wobbles like liquid metal and throws a ring of sparkles. */
  function burst(cx, cy, n, radius) {
    for (var i = 0; i < n; i++) {
      var ang = (i / n) * Math.PI * 2 + Math.random() * .4;
      var d = radius * (.7 + Math.random() * .5);
      spark(cx, cy, 14 + Math.random() * 18, Math.cos(ang) * d, Math.sin(ang) * d, 1000 + Math.random() * 300);
    }
  }
  function wobble(e) {
    chrome.classList.remove("is-wobble");
    void chrome.offsetWidth;
    chrome.classList.add("is-wobble");
    var r = chrome.getBoundingClientRect();
    var x = e && e.clientX ? e.clientX : r.left + r.width / 2;
    var y = e && e.clientY ? e.clientY : r.top + r.height / 2;
    burst(x, y, 12, Math.min(220, r.width * .35));
  }
  chrome.addEventListener("click", wobble);
  chrome.addEventListener("animationend", function (e) {
    if (e.animationName === "wobble") chrome.classList.remove("is-wobble");
  });

  /* Gel pills throw a few sparkles when pressed. */
  document.querySelectorAll(".pill--lg").forEach(function (b) {
    b.addEventListener("pointerdown", function (e) { burst(e.clientX, e.clientY, 7, 70); });
  });
})();
