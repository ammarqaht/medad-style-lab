/* 20 · Victorian */
(function () {
  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Victorian";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  var NS = "http://www.w3.org/2000/svg";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Inline the mirrored ornament groups so each stroke can draw itself. */
  document.querySelectorAll("use[data-inline]").forEach(function (u) {
    var ref = u.getAttribute("href") || u.getAttribute("xlink:href") || "";
    var src = document.getElementById(ref.slice(1));
    if (!src) return;
    var g = document.createElementNS(NS, "g");
    var t = u.getAttribute("transform");
    if (t) g.setAttribute("transform", t);
    Array.prototype.forEach.call(src.childNodes, function (ch) {
      if (ch.nodeType !== 1) return;
      if (ch.localName === "use") { /* nested use: inline one level deeper */
        var inner = document.getElementById((ch.getAttribute("href") || "").slice(1));
        var gg = document.createElementNS(NS, "g");
        var tt = ch.getAttribute("transform");
        if (tt) gg.setAttribute("transform", tt);
        if (inner) Array.prototype.forEach.call(inner.childNodes, function (c2) {
          if (c2.nodeType === 1) gg.appendChild(c2.cloneNode(true));
        });
        g.appendChild(gg);
      } else g.appendChild(ch.cloneNode(true));
    });
    u.parentNode.replaceChild(g, u);
  });

  var draws = Array.prototype.slice.call(document.querySelectorAll(".draw"));

  function arm(svg) {
    var i = 0;
    svg.querySelectorAll("path, rect, circle, ellipse, line").forEach(function (el) {
      if (el.closest("defs, pattern")) return;
      if (getComputedStyle(el).stroke === "none") return;
      el.setAttribute("pathLength", "1");
      el.setAttribute("data-len", "1");
      /* dash 1, gap 3: offset 1.05 hides it fully (no stray round caps), 0 shows it whole */
      el.style.strokeDasharray = "1 3";
      el.style.strokeDashoffset = "1.05";
      el.style.setProperty("--i", i++);
    });
    svg.classList.add("armed");
  }
  function play(svg) {
    if (svg.classList.contains("drawn")) return;
    svg.classList.add("drawn");
    if (reduce) return;
    void svg.getBoundingClientRect();
    svg.querySelectorAll("[data-len]").forEach(function (el) { el.style.strokeDashoffset = "0"; });
  }

  /* Timing for the hero certificate: slow, layered. */
  function tune(sel, dur, delay, step) {
    document.querySelectorAll(sel).forEach(function (s) {
      s.style.setProperty("--dur", dur + "s");
      s.style.setProperty("--delay", delay + "s");
      if (step != null) s.style.setProperty("--step", step + "ms");
    });
  }
  tune(".cert .rule", 2.2, 0);
  tune(".cert .corner", 2.0, .35, 30);
  tune(".cart__orn", 2.2, .5, 20);
  tune(".cert .divider", 1.6, 1.2, 20);
  tune(".engr", 1.8, 1.0, 12);
  document.getElementById("engr").style.setProperty("--fill-delay", "2.2s");
  tune(".frame--panel .rule, .frame--dark .rule", 2.0, 0);
  tune(".frame--panel .corner, .frame--dark .corner", 1.8, .3, 30);
  tune(".label__med svg", 1.6, .2, 40);

  if (!reduce) draws.forEach(arm);
  else draws.forEach(function (s) { s.classList.add("armed"); });

  var hero = document.querySelector(".cert");
  var heroBits = Array.prototype.slice.call(hero.querySelectorAll(".draw, [data-fade]"));

  function reveal(el) {
    if (el.classList.contains("draw")) play(el);
    else el.classList.add("is-in");
  }

  requestAnimationFrame(function () {
    requestAnimationFrame(function () { heroBits.forEach(reveal); });
  });

  var rest = Array.prototype.slice.call(document.querySelectorAll(".draw, [data-fade]"))
    .filter(function (el) { return heroBits.indexOf(el) < 0; });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        /* a frame plays as a whole when its panel enters */
        reveal(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -5% 0px" });
    rest.forEach(function (el) { io.observe(el); });
  } else rest.forEach(reveal);

  /* Dip the quill: the nib touches the ink and a ripple spreads. */
  var engr = document.getElementById("engr");
  var quill = engr.querySelector(".eg-quill");
  var dipTimer = 0;
  engr.addEventListener("click", function () {
    if (reduce || !quill.animate) return;
    quill.animate([
      { transform: "rotate(0deg) translate(0, 0)" },
      { transform: "rotate(-3deg) translate(0, -6px)", offset: .35 },
      { transform: "rotate(0deg) translate(0, 3px)", offset: .7 },
      { transform: "rotate(0deg) translate(0, 0)" }
    ], { duration: 1500, easing: "cubic-bezier(.45,.05,.25,1)" });
    clearTimeout(dipTimer);
    engr.classList.remove("is-dip");
    void engr.getBoundingClientRect();
    dipTimer = setTimeout(function () { engr.classList.add("is-dip"); }, 900);
  });
})();
