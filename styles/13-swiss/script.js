/* 13 · Swiss Design */
(function () {
  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Swiss Design";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hero = document.getElementById("hero");

  /* Headline: whole words (Arabic joining stays intact), broken into two
     balanced lines so the poster reads as a composed block. */
  var title = document.getElementById("heroTitle");
  var words = M.hero.headline.split(/\s+/);
  var cut = Math.ceil(words.length / 2);
  title.innerHTML = words.map(function (w, i) {
    return '<span class="w" style="--d:' + (0.32 + i * 0.09).toFixed(2) + 's">' + M.html(w) + "</span>" +
      (i === cut - 1 ? "<br>" : i < words.length - 1 ? " " : "");
  }).join("");

  /* Hero index 01 02 03: accessible names come from the pillar titles. */
  hero.querySelectorAll(".hero__index a").forEach(function (a, i) {
    var p = M.pillars[i];
    if (p) a.setAttribute("aria-label", M.text(p.title));
  });

  /* Grid lines for every section marked data-lines (the hero has its own ruler). */
  document.querySelectorAll("[data-lines]").forEach(function (sec) {
    var l = document.createElement("div");
    l.className = "lines";
    l.setAttribute("aria-hidden", "true");
    l.innerHTML = new Array(13).join("<i></i>");
    sec.insertBefore(l, sec.firstChild);
  });

  /* Hero ruler lines draw in column by column, from column 1 (right). */
  hero.querySelectorAll(".lines--ruler i").forEach(function (el, i) {
    el.style.setProperty("--d", (i * 0.035).toFixed(3) + "s");
  });
  hero.querySelectorAll("[data-in]").forEach(function (el) {
    var n = +el.getAttribute("data-in");
    el.style.setProperty("--d", (n < 3 ? 0.1 * n : 0.5 + n * 0.07).toFixed(2) + "s");
  });

  /* One column step, used as the slide distance so motion lands on grid lines. */
  var cols = [];
  function measure() {
    cols = Array.prototype.filter.call(hero.querySelectorAll(".lines--ruler i"), function (c) {
      return c.offsetWidth > 0;
    }).map(function (c) { return c.getBoundingClientRect(); });
    if (cols.length > 1) {
      root.style.setProperty("--step", Math.round(cols[0].right - cols[1].right) + "px");
    }
  }
  measure();

  requestAnimationFrame(function () {
    requestAnimationFrame(function () { hero.classList.add("is-in"); });
  });

  /* Scroll reveals: slide one column along the row, linear. */
  var items = document.querySelectorAll("[data-slide], [data-rule]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Signature interaction: the green circle snaps to the column under the
     pointer, sliding along the grid in a straight linear move. */
  var circle = document.getElementById("circle");
  var base = null, offset = 0;
  function rebase() {
    /* Measure with the transition off, or we read a mid-slide position. */
    circle.style.transition = "none";
    circle.style.transform = "";
    offset = 0;
    measure();
    base = circle.getBoundingClientRect();
    void circle.offsetWidth;
    circle.style.transition = "";
  }
  var rt = 0;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { base = null; rebase(); }, 150);
  });

  if (reduce) return;

  hero.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    if (!base) rebase();
    if (!cols.length) return;
    var w = base.width;
    var leftmost = cols[cols.length - 1].left;
    var want = e.clientX + w / 2; /* desired right edge */
    var best = null, bestD = Infinity;
    cols.forEach(function (c) {
      if (c.right - w < leftmost - 1) return; /* circle must stay inside the grid */
      var d = Math.abs(c.right - want);
      if (d < bestD) { bestD = d; best = c; }
    });
    if (!best) return;
    var next = Math.round(best.right - base.right);
    if (next !== offset) {
      offset = next;
      circle.style.transform = "translateX(" + offset + "px)";
    }
  });
  hero.addEventListener("pointerleave", function () {
    offset = 0;
    circle.style.transform = "";
  });
})();
