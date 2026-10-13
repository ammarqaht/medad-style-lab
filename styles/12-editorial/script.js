/* 12 · Editorial Design */
(function () {
  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Editorial Design";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  /* Drop cap: the first word of the article (the brand word) set large.
     A whole word keeps the Arabic joining intact. */
  document.querySelectorAll("[data-dropcap]").forEach(function (p) {
    var first = p.firstElementChild;
    if (first && p.firstChild === first) first.classList.add("dropcap");
  });

  /* ---- Line splitting ----
     Words stay whole (and the brand word stays one unit), so joining is never
     broken. Units are measured, grouped by line, and wrapped in .ln blocks. */
  var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-lines]"));
  blocks.forEach(function (el) { el._src = el.innerHTML; });

  function split(el) {
    el.innerHTML = el._src;
    var units = [];
    var keep = []; // floated drop cap stays outside the lines
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var parts = node.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function (t) {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(" ")); return; }
          var s = document.createElement("span");
          s.className = "w";
          s.textContent = t;
          frag.appendChild(s);
          units.push(s);
        });
        el.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        if (node.classList.contains("dropcap")) keep.push(node);
        else units.push(node);
      }
    });
    if (!units.length) return;

    var lines = [], cur = null, lastTop = null, lastLeft = null;
    units.forEach(function (u) {
      var r = u.getBoundingClientRect();
      if (cur === null || Math.abs(r.top - lastTop) > 4 || r.left > lastLeft + 4) {
        cur = []; lines.push(cur);
      }
      cur.push(u);
      lastTop = r.top; lastLeft = r.left;
    });

    el.textContent = "";
    keep.forEach(function (k) { el.appendChild(k); });
    lines.forEach(function (ws, i) {
      var ln = document.createElement("span");
      ln.className = "ln";
      ln.style.setProperty("--i", i);
      ws.forEach(function (w, j) {
        if (j) ln.appendChild(document.createTextNode(" "));
        ln.appendChild(w);
      });
      el.appendChild(ln);
      el.appendChild(document.createTextNode(" "));
    });
  }

  function splitAll() { blocks.forEach(split); }

  var lastW = window.innerWidth;
  /* fonts.ready can resolve before any face starts loading: request the real faces explicitly. */
  function brandFonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var faces = ['300 20px "Thmanyah Sans"', '400 20px "Thmanyah Sans"', '700 20px "Thmanyah Sans"', '900 40px "Thmanyah Serif Display"', '700 40px "Thmanyah Serif Display"'];
    return Promise.race([
      Promise.all(faces.map(function (f) { return document.fonts.load(f, "مداد"); })),
      new Promise(function (r) { setTimeout(r, 1500); })
    ]).catch(function () {});
  }

  brandFonts().then(function () {
    splitAll();
    start();
  });

  var rt = 0;
  /* A late font swap changes word widths: regroup the lines. */
  if (document.fonts) document.fonts.addEventListener("loadingdone", function () { clearTimeout(rt); rt = setTimeout(splitAll, 60); });
  window.addEventListener("resize", function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    clearTimeout(rt);
    rt = setTimeout(splitAll, 160);
  });

  /* ---- Reveals ---- */
  function start() {
    var cover = document.querySelector(".cover");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { cover.classList.add("is-in"); });
    });

    var targets = document.querySelectorAll(".page:not(.cover) [data-lines], .page:not(.cover) [data-reveal]");
    var pages = document.querySelectorAll(".page:not(.cover)");

    // cover copy waits a beat for the masthead rule
    var coverEls = document.querySelectorAll(".cover [data-lines], .cover [data-reveal]");
    coverEls.forEach(function (el, i) {
      el.style.setProperty("--d", (380 + i * 260) + "ms");
    });
    requestAnimationFrame(function () {
      coverEls.forEach(function (el) { el.classList.add("is-in"); });
    });

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (t) { t.classList.add("is-in"); });
      pages.forEach(function (p) { p.classList.add("is-turned"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -12% 0px" });
    targets.forEach(function (t) { io.observe(t); });

    var pio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-turned");
        pio.unobserve(e.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
    pages.forEach(function (p) { pio.observe(p); });
  }
})();
