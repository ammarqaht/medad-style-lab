/* 14 · Minimalism */
(function () {
  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Minimalism";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  /* ---------- The stroke ----------
     One broad-nib ink stroke, built in real pixels so its weight stays
     thin and true at every width. The centerline runs right to left;
     a mask path along it is undrawn with a dashoffset, so the ink
     appears in the direction a pen writes Arabic. */
  var svg = document.getElementById("stroke");
  var ink = document.getElementById("strokeInk");
  var pen = document.getElementById("strokePen");

  /* Shape of the stroke, as (u, y): u runs 0 (start, right) to 1 (end, left).
     A soft press, a long settled sweep, and a rising flick at the end. */
  var KEYS = [
    [0.00, 0.40], [0.05, 0.58], [0.16, 0.68], [0.34, 0.64],
    [0.52, 0.57], [0.70, 0.62], [0.86, 0.60], [0.95, 0.44], [1.00, 0.22]
  ];

  function catmull(p0, p1, p2, p3, t) {
    var t2 = t * t, t3 = t2 * t;
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  }
  function smooth(a, b, x) {
    var t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  function build() {
    var W = svg.clientWidth, H = svg.clientHeight;
    if (!W || !H) return;
    var gutter = parseFloat(getComputedStyle(document.querySelector(".hero")).paddingInlineStart) || 32;
    var sr = svg.getBoundingClientRect(), br = document.querySelector(".hero__body").getBoundingClientRect();
    var x0 = Math.min(W - 8, br.right - sr.left); /* starts exactly on the text's start edge */
    var x1 = Math.max(gutter * 0.5, W * 0.04);  /* ends just inside the far edge */
    var maxW = Math.max(2.6, Math.min(5.2, W / 300));
    var pad = maxW;

    /* Sample the centerline */
    var pts = [], N = 260, segs = KEYS.length - 1;
    for (var i = 0; i <= N; i++) {
      var g = (i / N) * segs, k = Math.min(segs - 1, Math.floor(g)), t = g - k;
      var a = KEYS[Math.max(0, k - 1)], b = KEYS[k], c = KEYS[k + 1], d = KEYS[Math.min(segs, k + 2)];
      var u = catmull(a[0], b[0], c[0], d[0], t);
      var y = catmull(a[1], b[1], c[1], d[1], t);
      pts.push([x0 - u * (x0 - x1), pad + y * (H - pad * 2), u]);
    }

    /* Width: broad nib held at about 38 degrees, an entry press, a long
       even pressure with a faint hand tremor, and a taper into a hairline. */
    var nib = 38 * Math.PI / 180;
    var L = [], R = [];
    for (var j = 0; j < pts.length; j++) {
      var p = pts[j], q = pts[Math.min(pts.length - 1, j + 1)], o = pts[Math.max(0, j - 1)];
      var dx = q[0] - o[0], dy = q[1] - o[1], len = Math.hypot(dx, dy) || 1;
      var nx = -dy / len, ny = dx / len;
      var ang = Math.atan2(dy, dx);
      var u2 = p[2];
      var nibF = 0.3 + 0.7 * Math.abs(Math.sin(ang - nib));
      var env = (0.45 + 0.55 * smooth(0, 0.05, u2)) * (1 + 0.25 * Math.exp(-Math.pow((u2 - 0.14) / 0.08, 2))) * (1 - 0.95 * smooth(0.74, 1, u2));
      var hand = 1 + 0.07 * Math.sin(u2 * 19) + 0.04 * Math.sin(u2 * 47 + 1.3);
      var w = Math.max(0.35, maxW * nibF * env * hand) / 2;
      L.push((p[0] + nx * w).toFixed(2) + " " + (p[1] + ny * w).toFixed(2));
      R.push((p[0] - nx * w).toFixed(2) + " " + (p[1] - ny * w).toFixed(2));
    }
    var line = pts.map(function (p) { return p[0].toFixed(2) + " " + p[1].toFixed(2); });

    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    ink.setAttribute("d", "M" + L.join(" L") + " L" + R.reverse().join(" L") + " Z");
    pen.setAttribute("d", "M" + line.join(" L"));
    pen.setAttribute("stroke-width", (maxW * 7).toFixed(1));
  }

  build();
  var rt = 0, lastW = svg.clientWidth;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if (svg.clientWidth !== lastW) { lastW = svg.clientWidth; build(); }
    }, 120);
  }, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);

  /* Start the pen once the shape exists, on the next frame. */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { document.documentElement.classList.add("is-drawn"); });
  });

  /* ---------- Slow fades as each statement arrives ---------- */
  var fades = document.querySelectorAll("[data-fade]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.25, rootMargin: "0px 0px -8% 0px" });
    fades.forEach(function (el) { io.observe(el); });
  } else {
    fades.forEach(function (el) { el.classList.add("is-in"); });
  }
})();
