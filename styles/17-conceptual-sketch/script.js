/* 17 · Conceptual Sketch: the page draws itself.
   Every outline, underline, loop, arrow and illustration is a hand-jittered
   SVG path generated here, then drawn stroke by stroke (stroke-dashoffset).
   Hovering re-rolls the jitter so the pencil lines "boil" for a moment. */
(function () {
  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Conceptual Sketch";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  /* Hero headline: whole words only, so Arabic joining stays intact.
     The third word gets the marker swipe behind it. */
  var words = M.hero.headlineKashida.split(" ");
  document.getElementById("heroTitle").innerHTML = words.map(function (w, i) {
    var h = M.html(w);
    return i === 2 ? '<span class="hl">' + h + "</span>" : h;
  }).join(" ");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var inFrame = false;
  try { inFrame = window.self !== window.top; } catch (e) { inFrame = true; }
  var NS = "http://www.w3.org/2000/svg";

  /* ------------------------------------------------------------------
     Pencil geometry
     ------------------------------------------------------------------ */
  function R(a, b) { return a + Math.random() * (b - a); }
  function f(n) { return Math.round(n * 10) / 10; }

  /* A single pencil stroke: slight overshoot, a bow, wobbly control points. */
  function line(x1, y1, x2, y2, r) {
    var dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    var ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
    var ov = Math.min(7, len * 0.04) * r;
    var os = R(-0.3, 1) * ov, oe = R(-0.3, 1) * ov;
    var sx = x1 - ux * os + nx * R(-1, 1) * r, sy = y1 - uy * os + ny * R(-1, 1) * r;
    var ex = x2 + ux * oe + nx * R(-1, 1) * r, ey = y2 + uy * oe + ny * R(-1, 1) * r;
    var bow = R(-1, 1) * Math.min(len * 0.012, 5) * r;
    var a = R(0.25, 0.4), b = R(0.6, 0.75);
    var c1x = sx + (ex - sx) * a + nx * (bow + R(-0.6, 0.6) * r), c1y = sy + (ey - sy) * a + ny * (bow + R(-0.6, 0.6) * r);
    var c2x = sx + (ex - sx) * b + nx * (bow + R(-0.6, 0.6) * r), c2y = sy + (ey - sy) * b + ny * (bow + R(-0.6, 0.6) * r);
    return "M" + f(sx) + " " + f(sy) + "C" + f(c1x) + " " + f(c1y) + " " + f(c2x) + " " + f(c2y) + " " + f(ex) + " " + f(ey);
  }

  /* Catmull-Rom through points, as cubic Beziers. */
  function curve(pts, closed) {
    var p = pts.slice();
    if (closed) p = [pts[pts.length - 1]].concat(pts, [pts[0], pts[1]]);
    else p = [pts[0]].concat(pts, [pts[pts.length - 1]]);
    var d = "M" + f(p[1][0]) + " " + f(p[1][1]);
    for (var i = 1; i < p.length - 2; i++) {
      var p0 = p[i - 1], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2];
      d += "C" + f(p1[0] + (p2[0] - p0[0]) / 6) + " " + f(p1[1] + (p2[1] - p0[1]) / 6) + " " +
        f(p2[0] - (p3[0] - p1[0]) / 6) + " " + f(p2[1] - (p3[1] - p1[1]) / 6) + " " + f(p2[0]) + " " + f(p2[1]);
    }
    return d;
  }
  function wob(pts, r) { return pts.map(function (q) { return [q[0] + R(-1, 1) * r, q[1] + R(-1, 1) * r]; }); }

  /* Rectangle as four separate strokes, started top right (RTL hand). */
  function box(x, y, w, h, r) {
    return [line(x + w, y, x, y, r), line(x, y, x, y + h, r), line(x, y + h, x + w, y + h, r), line(x + w, y + h, x + w, y, r)];
  }

  /* Loose loop (superellipse) that overshoots its own start, like a pen circling. */
  function loop(cx, cy, a, b, n, r) {
    var pts = [], N = 44, t0 = R(-1.1, -0.6), turn = Math.PI * 2 + R(0.28, 0.5), ph = R(0, 6.28);
    for (var i = 0; i <= N; i++) {
      var t = i / N, th = t0 - turn * t;
      var c = Math.cos(th), s = Math.sin(th);
      var k = 1 + (Math.sin(th * 2 + ph) * 0.018 + (t - 0.5) * 0.05) * r;
      pts.push([cx + a * k * Math.sign(c) * Math.pow(Math.abs(c), 2 / n), cy + b * k * Math.sign(s) * Math.pow(Math.abs(s), 2 / n)]);
    }
    return curve(pts, false);
  }

  /* Wavy pencil line from x1 to x2 (RTL: x1 is usually the right end). */
  function wave(x1, x2, y, amp, r) {
    var pts = [], n = Math.max(4, Math.round(Math.abs(x2 - x1) / 46)), ph = R(0, 6.28);
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      pts.push([x1 + (x2 - x1) * t + R(-1, 1) * r, y + Math.sin(t * 7 + ph) * amp + R(-0.6, 0.6) * r + t * R(-1, 2) * r]);
    }
    return curve(pts, false);
  }

  function head(x, y, ang, size, r) {
    var a1 = ang + Math.PI - R(0.42, 0.55), a2 = ang + Math.PI + R(0.42, 0.55);
    return [line(x, y, x + Math.cos(a1) * size, y + Math.sin(a1) * size, r * 0.4),
            line(x, y, x + Math.cos(a2) * size, y + Math.sin(a2) * size, r * 0.4)];
  }

  /* Parallel hatch lines across a rect at an angle. */
  function hatch(x, y, w, h, ang, gap, r) {
    var out = [], cx = x + w / 2, cy = y + h / 2, L = Math.hypot(w, h) / 2 + 4;
    var ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux;
    for (var o = -L; o <= L; o += gap) {
      var px = cx + nx * o, py = cy + ny * o;
      out.push(line(px - ux * L, py - uy * L, px + ux * L, py + uy * L, r));
    }
    return out;
  }

  /* A quill: vane outline, spine, a few barbs. Tip at (tx,ty), pointing back along ang. */
  function quill(tx, ty, ang, L, W, r) {
    var ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux;
    function P(u, v) { return [tx + ux * u + nx * v, ty + uy * u + ny * v]; }
    var top = [], bot = [], N = 10, s0 = L * 0.18;
    for (var i = 0; i <= N; i++) {
      var t = i / N, u = s0 + (L - s0) * t, wv = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.08)), 0.75);
      top.push(P(u, W * wv * 1.0));
      bot.push(P(u, -W * wv * 0.62));
    }
    var vane = top.concat(bot.reverse());
    var barbs = [];
    [0.38, 0.55, 0.72].forEach(function (t) {
      var a = P(s0 + (L - s0) * t, 0), b = P(s0 + (L - s0) * (t + 0.12), W * 0.82);
      barbs.push(line(a[0], a[1], b[0], b[1], r * 0.5));
    });
    var nibA = P(0, 0), nibB = P(s0, W * 0.22), nibC = P(s0, -W * 0.18);
    return {
      vane: curve(wob(vane, r * 0.6), true),
      spine: line(nibA[0], nibA[1], P(L + 10, 0)[0], P(L + 10, 0)[1], r * 0.5),
      nib: "M" + f(nibB[0]) + " " + f(nibB[1]) + "L" + f(nibA[0]) + " " + f(nibA[1]) + "L" + f(nibC[0]) + " " + f(nibC[1]),
      barbs: barbs
    };
  }

  /* Irregular marker blob (filled) over a rect. */
  function blob(x, y, w, h, r) {
    return curve(wob([[x + w, y + 2], [x + w * 0.5, y - 1], [x, y + 3], [x - 2, y + h * 0.5], [x + 2, y + h],
      [x + w * 0.5, y + h + 1], [x + w + 1, y + h - 2], [x + w + 2, y + h * 0.5]], r), true);
  }

  /* ------------------------------------------------------------------
     Stroke lists. Each item: {d, c: ink|green|soft|fill, w, t, o}
     ------------------------------------------------------------------ */
  var INK = "var(--pencil)", GREEN = "var(--marker)";
  function S(d, c, w, t, o) { return { d: d, c: c, w: w, t: t, o: o }; }
  function many(list, c, w, t, o) { return list.map(function (d) { return S(d, c, w, t, o); }); }

  var SKETCH = {
    box: function (w, h, el) {
      var big = w > 260, r = big ? 1.5 : 0.8;
      var out = many(box(0, 0, w, h, r), INK, big ? 1.7 : 1.5, big ? 0.34 : 0.18);
      var b2 = box(0, 0, w, h, r * 1.8);
      out.push(S(b2[0], INK, 1, 0.2, 0.42), S(b2[3], INK, 1, 0.16, 0.42));
      if (el.hasAttribute("data-sk-marks")) {
        [[w + 18, -18], [-18, -18], [-18, h + 18], [w + 18, h + 18]].forEach(function (p) {
          out.push(S(line(p[0] - 8, p[1], p[0] + 8, p[1], 0.4), GREEN, 1.6, 0.08));
          out.push(S(line(p[0], p[1] - 8, p[0], p[1] + 8, 0.4), GREEN, 1.6, 0.08));
        });
      }
      return out;
    },
    under: function (w, h, el) {
      var pb = parseFloat(getComputedStyle(el).paddingBottom) || 10;
      var y = h - pb * 0.42;
      return [S(wave(w + 4, -4, y, 1.4, 0.8), GREEN, w < 140 ? 2.2 : 3, 0.5)];
    },
    under2: function (w, h, el) {
      var pb = parseFloat(getComputedStyle(el).paddingBottom) || 10;
      var y = h - pb * 0.55;
      return [S(wave(w + 6, -6, y, 1.6, 1), GREEN, 3.2, 0.55), S(wave(w * 0.94, w * 0.22, y + 9, 1.2, 1), GREEN, 2.4, 0.4)];
    },
    loop: function (w, h) {
      return [S(loop(w / 2, h / 2, w / 2 * 1.03, h / 2 * 1.06, 4.2, 1), GREEN, 3, 0.9)];
    }
  };

  var DRAWING = {
    browser: function () {
      var o = [];
      o = o.concat(many(box(60, 20, 460, 350, 2.2), INK, 2.4, 0.26));
      o.push(S(line(520, 66, 60, 66, 1.6), INK, 1.8, 0.2));
      [496, 474, 452].forEach(function (x) { o.push(S(loop(x, 43, 7, 7, 2, 0.5), INK, 1.6, 0.08)); });
      o = o.concat(many(box(150, 34, 250, 18, 0.8), INK, 1.3, 0.08, 0.7));
      o.push({ img: "../../shared/logo/medad-mark-ink.png", x: 172, y: 96, w: 216, h: 71.4 });
      o.push(S(loop(280, 131, 152, 60, 2.6, 1.6), GREEN, 3.2, 0.5));
      o.push(S(wave(488, 296, 228, 1.2, 1), INK, 1.8, 0.16, 0.8));
      o.push(S(wave(488, 320, 256, 1.2, 1), INK, 1.8, 0.14, 0.8));
      o.push(S(wave(488, 356, 284, 1.2, 1), INK, 1.8, 0.12, 0.8));
      o = o.concat(many(box(92, 210, 160, 124, 1.4), INK, 1.8, 0.12));
      o.push(S(line(92, 210, 252, 334, 1.2), INK, 1.2, 0.12, 0.5), S(line(252, 210, 92, 334, 1.2), INK, 1.2, 0.12, 0.5));
      o.push({ fill: blob(352, 308, 136, 36, 2), c: "var(--swipe)" });
      o = o.concat(many(box(350, 306, 140, 40, 1), INK, 1.8, 0.1));
      var q = quill(206, 371, Math.atan2(96, -176), 200, 26, 1.6);
      o.push({ fill: q.vane, c: "var(--green-100)" });
      o.push(S(q.vane, INK, 2, 0.4), S(q.spine, INK, 1.8, 0.2), S(q.nib, INK, 1.8, 0.08));
      o = o.concat(many(q.barbs, INK, 1.2, 0.06, 0.6));
      o.push(S(wave(214, 268, 380, 2.4, 1), GREEN, 3, 0.22));
      return o;
    },
    web: function () {
      var o = many(box(10, 10, 120, 80, 1), INK, 1.8, 0.14);
      o.push(S(line(130, 30, 10, 30, 0.8), INK, 1.5, 0.1));
      [118, 107, 96].forEach(function (x) { o.push(S(loop(x, 20, 3.2, 3.2, 2, 0.3), INK, 1.4, 0.05)); });
      o.push({ fill: blob(22, 44, 30, 32, 1.2), c: "var(--swipe)" });
      o = o.concat(many(box(22, 44, 30, 32, 0.6), INK, 1.4, 0.06));
      o.push(S(wave(118, 66, 50, 0.6, 0.5), INK, 1.5, 0.1, 0.8), S(wave(118, 74, 62, 0.6, 0.5), INK, 1.5, 0.1, 0.8), S(wave(118, 86, 74, 0.6, 0.5), GREEN, 2.2, 0.1));
      return o;
    },
    system: function () {
      var o = many(box(10, 10, 120, 80, 1), INK, 1.8, 0.14);
      o.push(S(line(118, 76, 22, 76, 0.7), INK, 1.5, 0.1));
      o.push({ fill: blob(32, 26, 16, 50, 1), c: "var(--swipe)" });
      [[96, 54, 22], [74, 42, 34], [52, 32, 44], [30, 24, 52]].forEach(function (b, i) {
        o = o.concat(many(box(b[0], b[1], 14, b[2], 0.5), i === 3 ? GREEN : INK, i === 3 ? 2 : 1.5, 0.05));
      });
      o.push(S(curve(wob([[112, 46], [92, 36], [72, 28], [52, 22], [34, 14]], 1), false), GREEN, 1.8, 0.16, 0.9));
      return o;
    },
    live: function () {
      var o = [];
      var cup = curve(wob([[44, 14], [96, 14], [94, 32], [84, 49], [70, 55], [56, 49], [46, 32]], 0.8), true);
      o.push({ fill: cup, c: "var(--swipe)" });
      o.push(S(cup, INK, 1.8, 0.3));
      o.push(S(curve(wob([[46, 20], [30, 22], [34, 36], [50, 40]], 0.6), false), INK, 1.5, 0.08));
      o.push(S(curve(wob([[94, 20], [110, 22], [106, 36], [90, 40]], 0.6), false), INK, 1.5, 0.08));
      o.push(S(line(70, 56, 70, 72, 0.5), INK, 1.8, 0.06));
      o = o.concat(many(box(50, 72, 40, 14, 0.6), INK, 1.6, 0.05));
      o.push(S(line(18, 12, 28, 20, 0.4), GREEN, 2, 0.05), S(line(14, 34, 26, 34, 0.4), GREEN, 2, 0.05));
      o.push(S(line(122, 12, 112, 20, 0.4), GREEN, 2, 0.05), S(line(126, 34, 114, 34, 0.4), GREEN, 2, 0.05));
      return o;
    },
    well: function () {
      var o = [];
      var jarPts = [[96, 66], [144, 66], [146, 84], [184, 110], [196, 160], [182, 204], [120, 214], [58, 204], [44, 160], [56, 110], [94, 84]];
      var jar = curve(wob(jarPts, 1), true);
      o.push({ clip: curve(jarPts, true) });
      o = o.concat(many(hatch(126, 92, 80, 130, -0.85, 9, 0.6), INK, 1.1, 0.04, 0.45).map(function (s) { s.clipped = true; return s; }));
      o = o.concat(many(hatch(150, 110, 60, 110, 0.75, 11, 0.6), INK, 1, 0.04, 0.35).map(function (s) { s.clipped = true; return s; }));
      o.push(S(jar, INK, 2.2, 0.5));
      o = o.concat(many(box(88, 52, 64, 14, 0.8), INK, 2, 0.08));
      var q = quill(116, 58, Math.atan2(-56, 86), 150, 20, 1.2);
      o.push({ fill: q.vane, c: "var(--green-100)" });
      o.push(S(q.vane, INK, 1.8, 0.35), S(q.spine, INK, 1.6, 0.14));
      o = o.concat(many(q.barbs, INK, 1.1, 0.05, 0.6));
      o.push(S(wave(214, 26, 222, 1.4, 1), GREEN, 2.6, 0.3));
      o.push({ fill: curve([[34, 166], [42, 184], [38, 196], [30, 196], [26, 184]], true), c: GREEN });
      return o;
    },
    rule: function () {
      return [S(wave(1000, 0, 11, 1.4, 1), INK, 1.6, 0.8, 0.8), S(wave(1000, 620, 17, 1, 1), GREEN, 2.4, 0.5)];
    }
  };

  /* ------------------------------------------------------------------
     Painter: turns stroke lists into paths with staggered timings.
     ------------------------------------------------------------------ */
  var clipN = 0;
  function paint(svg, list, base) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var t = base || 0, clipId = null, clipG = null;
    list.forEach(function (s, i) {
      var el;
      if (s.clip) {
        clipId = svg.getAttribute("data-clip") || ("skc" + (++clipN));
        svg.setAttribute("data-clip", clipId);
        var defs = document.createElementNS(NS, "defs"), cp = document.createElementNS(NS, "clipPath"), cpp = document.createElementNS(NS, "path");
        cp.setAttribute("id", clipId); cpp.setAttribute("d", s.clip);
        cp.appendChild(cpp); defs.appendChild(cp); svg.appendChild(defs);
        clipG = document.createElementNS(NS, "g"); clipG.setAttribute("clip-path", "url(#" + clipId + ")");
        svg.appendChild(clipG);
        return;
      }
      if (s.img) {
        el = document.createElementNS(NS, "image");
        el.setAttribute("href", s.img);
        el.setAttribute("x", s.x); el.setAttribute("y", s.y); el.setAttribute("width", s.w); el.setAttribute("height", s.h);
        el.setAttribute("class", "fl");
        el.style.transitionDelay = (reduce ? 0.1 : t).toFixed(2) + "s";
        svg.appendChild(el);
        return;
      }
      el = document.createElementNS(NS, "path");
      if (s.fill) {
        el.setAttribute("d", s.fill);
        el.setAttribute("class", "fl");
        el.style.fill = s.c; el.style.stroke = "none";
        el.style.transitionDelay = (reduce ? 0.1 : t).toFixed(2) + "s";
        svg.appendChild(el);
        return;
      }
      el.setAttribute("d", s.d);
      el.setAttribute("pathLength", "1");
      el.setAttribute("class", "st");
      el.style.stroke = s.c;
      el.style.strokeWidth = s.w;
      if (s.o) el.style.strokeOpacity = s.o;
      el.style.transitionDuration = s.t.toFixed(2) + "s";
      el.style.transitionDelay = (reduce ? Math.min(0.4, i * 0.02) : t).toFixed(2) + "s";
      t += s.t * 0.82;
      (s.clipped && clipG ? clipG : svg).appendChild(el);
    });
  }

  /* ------------------------------------------------------------------
     Element sketches ([data-sketch]) and illustrations (.draw)
     ------------------------------------------------------------------ */
  var sketched = Array.prototype.slice.call(document.querySelectorAll("[data-sketch]"));
  var drawings = Array.prototype.slice.call(document.querySelectorAll(".draw"));

  sketched.forEach(function (el) {
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "sk");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    el.insertBefore(svg, el.firstChild);
    el._sk = svg;
    el._base = el.parentElement.closest("[data-sketch]") ? 0.75 : 0;
  });

  function renderSketch(el) {
    var w = el.offsetWidth, h = el.offsetHeight;
    if (!w || !h) return;
    paint(el._sk, SKETCH[el.getAttribute("data-sketch")](w, h, el), el._base);
  }
  function renderDrawing(svg) {
    var fn = DRAWING[svg.getAttribute("data-draw")];
    if (fn) paint(svg, fn(), svg.closest("[data-sketch]") ? 0.55 : 0);
  }

  /* ---- Arrows between ideas (page level) ---- */
  var main = document.getElementById("top");
  var links = document.getElementById("links");
  var pillars = document.querySelectorAll(".pillar");
  var pairs = [
    ["heroCard", "heroSketch"], ["heroSketch", "aboutCard"],
    ["aboutCard", pillars[0]], [pillars[0], pillars[1]], [pillars[1], pillars[2]], [pillars[2], "closingCard"]
  ].map(function (p) {
    return p.map(function (x) { return typeof x === "string" ? document.getElementById(x) : x; });
  });
  var arrowDrawn = [];

  function rel(el, m) {
    var r = el.getBoundingClientRect();
    return { l: r.left - m.left, t: r.top - m.top, r: r.right - m.left, b: r.bottom - m.top, w: r.width, h: r.height };
  }

  function arrowStrokes(A, B, i) {
    var g = 18, sx, sy, ex, ey, cx, cy;
    var side = B.t < A.b - 24 && B.b > A.t + 24;
    if (side) {
      var toLeft = B.r <= A.l + 4;
      sx = toLeft ? A.l - g : A.r + g;
      ex = toLeft ? B.r + g : B.l - g;
      sy = A.t + Math.min(A.h * 0.3, 150);
      ey = B.t + Math.min(B.h * 0.3, 150);
      cx = (sx + ex) / 2; cy = Math.min(sy, ey) - R(26, 40);
    } else {
      var lo = Math.max(A.l, B.l), hi = Math.min(A.r, B.r), x;
      x = lo < hi ? lo + (hi - lo) * (i % 2 ? 0.7 : 0.3) : (A.l + A.r) / 2;
      var gap = B.t - A.b;
      if (gap < 48) return [];
      var bend = (i % 2 ? -1 : 1) * Math.min(46, gap * 0.4);
      sx = x + bend * 0.5; sy = A.b + g;
      ex = x - bend * 0.5; ey = B.t - g;
      cx = x + bend * 1.2; cy = (sy + ey) / 2;
    }
    cx += R(-4, 4); cy += R(-4, 4);
    var shaft = "M" + f(sx) + " " + f(sy) + "Q" + f(cx) + " " + f(cy) + " " + f(ex) + " " + f(ey);
    var ang = Math.atan2(ey - cy, ex - cx);
    var c = i === 0 ? GREEN : INK, w = i === 0 ? 3 : 1.8;
    return [S(shaft, c, w, 0.5)].concat(many(head(ex, ey, ang, 14, 1), c, w, 0.12));
  }

  function renderLinks() {
    var m = main.getBoundingClientRect();
    while (links.firstChild) links.removeChild(links.firstChild);
    pairs.forEach(function (p, i) {
      var g = document.createElementNS(NS, "g");
      g.setAttribute("class", "arrow" + (arrowDrawn[i] ? " is-drawn" : ""));
      links.appendChild(g);
      var list = arrowStrokes(rel(p[0], m), rel(p[1], m), i);
      if (list.length) paint(g, list, 0.15);
      p.g = g;
    });
  }

  function renderAll() {
    sketched.forEach(renderSketch);
    drawings.forEach(renderDrawing);
    renderLinks();
  }
  renderAll();

  /* ---- Draw on scroll ---- */
  function draw(el) {
    el.getBoundingClientRect(); /* flush the undrawn state first */
    el.classList.add("is-drawn");
  }
  var targets = sketched.concat(drawings.filter(function (d) { return !d.closest("[data-sketch]"); }));
  targets = targets.concat(drawings.filter(function (d) { return d.closest("[data-sketch]"); }));

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        if (e.target._pair != null) {
          arrowDrawn[e.target._pair] = true;
          var pg = pairs[e.target._pair].g;
          if (pg) draw(pg);
        } else {
          draw(e.target);
        }
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { io.observe(el); });
    /* Each arrow draws when its destination comes into view, via a sentinel. */
    pairs.forEach(function (p, i) {
      var s = document.createElement("span");
      s.setAttribute("aria-hidden", "true");
      s.style.cssText = "position:absolute;inset-inline-start:50%;inset-block-start:0;width:1px;height:1px;pointer-events:none";
      s._pair = i;
      p[1].appendChild(s);
      io.observe(s);
    });
  } else {
    targets.forEach(draw);
    pairs.forEach(function (p, i) { arrowDrawn[i] = true; if (p.g) draw(p.g); });
  }

  /* ---- Re-render on resize and once fonts settle ---- */
  var lastW = window.innerWidth, rt = 0;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if (Math.abs(window.innerWidth - lastW) < 2) return;
      lastW = window.innerWidth;
      sketched.forEach(renderSketch);
      renderLinks();
    }, 160);
  });
  var lt = 0;
  function relayout() { sketched.forEach(renderSketch); renderLinks(); }
  function relayoutSoon() { clearTimeout(lt); lt = setTimeout(relayout, 120); }

  /* Fonts change every box size: wait for the real faces (capped at 1.5s), then relayout. */
  if (document.fonts && document.fonts.load) {
    var faces = ['400 1em "Thmanyah Sans"', '700 1em "Thmanyah Sans"', '900 1em "Thmanyah Sans"',
      '700 1em "Thmanyah Serif Display"', '900 1em "Thmanyah Serif Display"'];
    var cap = new Promise(function (res) { setTimeout(res, 1500); });
    Promise.race([Promise.all(faces.map(function (q) { return document.fonts.load(q, "مداد"); })), cap])
      .then(relayout, relayout);
    if (document.fonts.addEventListener) document.fonts.addEventListener("loadingdone", relayoutSoon);
  }

  /* Late reflow of the content (images, fonts, wrapping) also relayouts. */
  if ("ResizeObserver" in window) {
    var lastSize = "";
    new ResizeObserver(function () {
      var r = main.getBoundingClientRect(), k = Math.round(r.width) + "x" + Math.round(r.height);
      if (k === lastSize) return;
      lastSize = k;
      relayoutSoon();
    }).observe(main);
  }

  /* ---- Hover: the pencil lines re-roll (boil) for a beat ---- */
  function boil(el) {
    if (el._boiling || !el.classList.contains("is-drawn")) return;
    el._boiling = true;
    var n = 0;
    (function step() {
      if (el._sk) renderSketch(el);
      if (el.classList.contains("draw")) renderDrawing(el);
      Array.prototype.forEach.call(el.querySelectorAll(".draw"), function (d) {
        if (d.classList.contains("is-drawn")) renderDrawing(d);
      });
      if (++n < 3) setTimeout(step, 70);
      else el._boiling = false;
    })();
  }
  if (!reduce) {
    sketched.filter(function (el) { return el.hasAttribute("data-sk-hover"); }).forEach(function (el) {
      el.addEventListener("pointerenter", function (e) { if (e.pointerType !== "touch") boil(el); });
      el.addEventListener("focusin", function () { boil(el); });
    });
    var hs = document.querySelector("#heroSketch .draw");
    document.getElementById("heroSketch").addEventListener("pointerenter", function (e) {
      if (e.pointerType !== "touch") boil(hs);
    });
  }

  /* ------------------------------------------------------------------
     Quill trail: a thin green ink line that follows the pointer and dries.
     Only runs while there is ink to fade; off in iframes and for touch.
     ------------------------------------------------------------------ */
  var canvas = document.getElementById("trail");
  var fine = window.matchMedia("(pointer: fine)").matches;
  if (reduce || inFrame || !fine || !canvas.getContext) { canvas.remove(); return; }
  var ctx = canvas.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1);
  var pts = [], raf = 0, LIFE = 650;
  function size() {
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  window.addEventListener("resize", size);
  function frame() {
    raf = 0;
    var now = performance.now();
    while (pts.length && now - pts[0].t > LIFE) pts.shift();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (document.hidden || pts.length < 2) { if (pts.length) raf = requestAnimationFrame(frame); return; }
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], age = 1 - (now - b.t) / LIFE;
      ctx.strokeStyle = "rgba(26, 138, 125," + (age * 0.55).toFixed(3) + ")";
      ctx.lineWidth = 0.6 + age * 2.2;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    raf = requestAnimationFrame(frame);
  }
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    if (pts.length > 60) pts.shift();
    if (!raf) raf = requestAnimationFrame(frame);
  }, { passive: true });
  window.addEventListener("scroll", function () {
    if (!pts.length) return;
    pts.length = 0;
    if (!raf) raf = requestAnimationFrame(frame);
  }, { passive: true });
})();
