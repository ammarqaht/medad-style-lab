/* 04 · Scrapbook */
(function () {
  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Scrapbook";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Cut headlines: every word goes on its own paper strip.
     Text is split on spaces only, so Arabic joining inside a word stays intact,
     and the brand word span is kept whole as one strip. */
  document.querySelectorAll("[data-cut]").forEach(function (el) {
    var tokens = [];
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/\s+/).forEach(function (w) { if (w) tokens.push(document.createTextNode(w)); });
      } else if (n.nodeType === 1) {
        tokens.push(n);
      }
    });
    el.textContent = "";
    tokens.forEach(function (t, i) {
      var w = document.createElement("span");
      w.className = "w";
      w.style.setProperty("--i", i);
      var inner = document.createElement("span");
      inner.className = "w__in";
      inner.appendChild(t);
      w.appendChild(inner);
      if (i) el.appendChild(document.createTextNode(" "));
      el.appendChild(w);
    });
  });

  /* Drop in and settle as each piece enters the viewport. */
  var drops = document.querySelectorAll("[data-drop], [data-cut]");
  function place(el) { el.classList.add("is-in"); }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { place(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -4% 0px" });
    drops.forEach(function (el) { io.observe(el); });
  } else {
    drops.forEach(place);
  }

  /* The rubber stamp: press it to stamp a fresh impression (new ink grain). */
  var stamp = document.getElementById("stamp");
  var seeds = document.querySelectorAll("#ink .seed");
  var card = stamp.closest(".lift");
  var sheet = stamp.closest(".paper");
  stamp.addEventListener("click", function () {
    if (card.getAttribute("data-moved") === "1") return;
    seeds.forEach(function (s) { s.setAttribute("seed", String(1 + Math.floor(Math.random() * 400))); });
    if (reduce) return;
    stamp.classList.remove("is-pressing");
    sheet.classList.remove("is-thud");
    void stamp.offsetWidth;
    stamp.classList.add("is-pressing");
    sheet.classList.add("is-thud");
  });
  stamp.addEventListener("animationend", function () { stamp.classList.remove("is-pressing"); });
  sheet.addEventListener("animationend", function (e) { if (e.target === sheet) sheet.classList.remove("is-thud"); });

  /* Rearrange the collage with a mouse: pick a scrap up, move it, set it down.
     Touch keeps normal scrolling. */
  if (reduce) return;
  document.documentElement.classList.add("has-drag");
  var top = 10;
  document.querySelectorAll("[data-drag]").forEach(function (el) {
    var sx = 0, sy = 0, ox = 0, oy = 0, dx = 0, dy = 0, active = false, moved = false;
    var piece = el.closest(".piece");
    el.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch" || e.button !== 0) return;
      if (e.target.closest("button, a")) return; /* keep the stamp and links clickable */
      active = true; moved = false;
      sx = e.clientX; sy = e.clientY; ox = dx; oy = dy;
      el.setAttribute("data-moved", "0");
      piece.style.zIndex = ++top;
    });
    el.addEventListener("pointermove", function (e) {
      if (!active) return;
      var mx = e.clientX - sx, my = e.clientY - sy;
      if (!moved && Math.abs(mx) + Math.abs(my) < 5) return;
      if (!moved) { moved = true; el.classList.add("is-lifted"); el.setAttribute("data-moved", "1"); el.setPointerCapture(e.pointerId); }
      e.preventDefault();
      dx = ox + mx; dy = oy + my;
      el.style.transform = "translate(" + dx + "px," + dy + "px) rotate(2deg) scale(1.03)";
    });
    function drop() {
      if (!active) return;
      active = false;
      el.classList.remove("is-lifted");
      el.style.transform = "translate(" + dx + "px," + dy + "px)";
      if (moved) setTimeout(function () { el.setAttribute("data-moved", "0"); }, 0);
    }
    el.addEventListener("pointerup", drop);
    el.addEventListener("pointercancel", drop);
  });
})();
