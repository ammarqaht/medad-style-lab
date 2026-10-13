/* 02 · Cybercore */
(function () {
  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Cybercore";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };
  function pad(n, w) { n = String(n); while (n.length < w) n = "0" + n; return n; }

  /* Glitch layers mirror the headline text. */
  var glitches = document.querySelectorAll(".glitch");
  glitches.forEach(function (g) { g.setAttribute("data-text", g.textContent); });
  function liveGlitch(el) { if (!reduce) el.classList.add("is-live"); }

  /* ================================================================
     Boot sequence
     ================================================================ */
  var log = $("log");
  var lines = Array.prototype.slice.call(log.querySelectorAll(".log__l"));
  var caret = document.createElement("i");
  caret.className = "caret";
  var narrow = window.innerWidth < 420;
  var BAR = narrow ? 6 : 10;

  /* Wrap each word (and the brand word as one unit) so Arabic joining stays intact. */
  function wordify(tx) {
    var units = [];
    Array.prototype.slice.call(tx.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        node.nodeValue.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var w = document.createElement("span");
          w.className = "w";
          w.textContent = part;
          frag.appendChild(w);
          units.push(w);
        });
        tx.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        node.classList.add("w");
        units.push(node);
      }
    });
    return units;
  }

  function barHTML(p) {
    var on = Math.round(BAR * p / 100);
    return "<b>" + new Array(on + 1).join("▓") + "</b>" + new Array(BAR - on + 1).join("░") + " " + pad(p, 3) + "%";
  }

  var LOAD = narrow ? 16 : 22;
  var track = $("loadTrack"), pct = $("loadPct");
  function loadAt(p) {
    var on = Math.round(LOAD * p / 100);
    track.textContent = "[" + new Array(on + 1).join("█") + new Array(LOAD - on + 1).join("░") + "]";
    pct.textContent = pad(p, 3) + "%";
  }

  var steps = lines.map(function (li) {
    var ts = document.createElement("span");
    ts.className = "log__ts mono";
    ts.setAttribute("dir", "ltr");
    ts.textContent = "[" + li.getAttribute("data-t") + "]";
    li.insertBefore(ts, li.firstChild);
    var tx = li.querySelector(".log__tx");
    var bar = li.querySelector(".log__bar");
    if (bar) bar.innerHTML = barHTML(0);
    return { li: li, tx: tx, words: tx ? wordify(tx) : [], bar: bar, load: li.classList.contains("log__l--load") };
  });
  loadAt(0);

  var bootLogo = $("bootLogo");
  var reveals = document.querySelectorAll("[data-reveal]");
  var heroTitle = document.querySelector(".hero__title");
  var stage = $("stage");

  var timers = [], done = false;
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }

  function finish() {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    steps.forEach(function (s) {
      s.li.classList.add("is-on");
      s.words.forEach(function (w) { w.classList.add("is-on"); });
      if (s.bar) s.bar.innerHTML = barHTML(100);
    });
    loadAt(100);
    if (caret.parentNode) caret.parentNode.removeChild(caret);
    if (!bootLogo.classList.contains("is-loading")) bootLogo.classList.add("is-loading");
    setTimeout(function () { bootLogo.classList.add("is-loaded"); }, reduce ? 800 : 1300);
    stage.classList.add("is-lock");
    reveals.forEach(function (r, i) { setTimeout(function () { r.classList.add("is-on"); }, (reduce ? 0 : 500) + i * 160); });
    setTimeout(function () { liveGlitch(heroTitle); }, 1400);
  }

  function boot() {
    var t = 380;
    steps.forEach(function (s) {
      at(t, function () { s.li.classList.add("is-on"); if (s.tx) s.tx.appendChild(caret); });
      s.words.forEach(function (w) {
        t += 70 + Math.random() * 50;
        at(t, function () { w.classList.add("is-on"); w.parentNode.insertBefore(caret, w.nextSibling); });
      });
      if (s.bar) {
        for (var p = 10; p <= 100; p += 10) {
          (function (p) { t += 28 + Math.random() * 30; at(t, function () { s.bar.innerHTML = barHTML(p); }); })(p);
        }
      }
      if (s.load) {
        at(t, function () { s.li.appendChild(caret); });
        var p2 = 0;
        while (p2 < 100) {
          p2 = Math.min(100, p2 + 3 + Math.floor(Math.random() * 9));
          (function (v) { t += 22 + Math.random() * 26; at(t, function () { loadAt(v); }); })(p2);
        }
      }
      t += s.bar ? 90 : 170;
    });
    at(t, function () {
      if (caret.parentNode) caret.parentNode.removeChild(caret);
      bootLogo.classList.add("is-loading");
      stage.classList.add("is-lock");
      ping();
    });
    at(t + 1300, function () { bootLogo.classList.add("is-loaded"); });
    reveals.forEach(function (r, i) { at(t + 900 + i * 170, function () { r.classList.add("is-on"); }); });
    at(t + 2400, function () { done = true; liveGlitch(heroTitle); });
  }

  if (reduce) finish();
  else {
    boot();
    /* Skip: click the terminal or press Escape. */
    $("term").addEventListener("click", function (e) { if (!e.target.closest("a")) finish(); });
    /* Capture phase so it runs before the shared navigator, which maps Escape to the gallery. */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !done) { e.preventDefault(); e.stopImmediatePropagation(); finish(); }
    }, true);
  }

  /* ================================================================
     Wireframe sphere (canvas)
     ================================================================ */
  var cv = $("sphere"), ctx = cv.getContext("2d");
  var W = 0, H = 0, DPR = 1;
  var yaw = 0.6, spin = 0.0032, boost = 0, tiltT = 0.42, tilt = 0.42, roll = 0, rollT = 0;
  function size() {
    var r = cv.getBoundingClientRect();
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    draw();
  }
  function proj(x, y, z) {
    /* yaw around Y, then tilt around X, then a little roll */
    var cy = Math.cos(yaw), sy = Math.sin(yaw);
    var x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
    var ct = Math.cos(tilt), st = Math.sin(tilt);
    var y2 = y * ct - z1 * st, z2 = y * st + z1 * ct;
    var cr = Math.cos(roll), sr = Math.sin(roll);
    var x3 = x1 * cr - y2 * sr, y3 = x1 * sr + y2 * cr;
    var R = Math.min(W, H) * 0.34;
    var f = 3.2 / (3.2 - z2 * 0.35);
    return [W / 2 + x3 * R * f, H / 2 + y3 * R * f, z2];
  }
  function stroke(pts) {
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], z = (a[2] + b[2]) / 2;
      if (z > 0) {
        ctx.strokeStyle = "rgba(54, 201, 186," + (0.18 + z * 0.72).toFixed(3) + ")";
        ctx.lineWidth = 1 + z * 0.4;
      } else {
        ctx.strokeStyle = "rgba(26, 138, 125," + (0.12 + (1 + z) * 0.16).toFixed(3) + ")";
        ctx.lineWidth = 0.8;
      }
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
  }
  var SEG = 48;
  function draw() {
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    var i, j, t, pts;
    /* halo */
    var g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) * 0.5);
    g.addColorStop(0, "rgba(26, 138, 125, .16)");
    g.addColorStop(1, "rgba(26, 138, 125, 0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    /* latitudes */
    for (i = -5; i <= 5; i++) {
      var la = i * Math.PI / 12, r = Math.cos(la), y = Math.sin(la);
      pts = [];
      for (j = 0; j <= SEG; j++) { t = j / SEG * Math.PI * 2; pts.push(proj(r * Math.cos(t), y, r * Math.sin(t))); }
      stroke(pts);
    }
    /* meridians */
    for (i = 0; i < 12; i++) {
      var lo = i * Math.PI / 12;
      pts = [];
      for (j = 0; j <= SEG; j++) { t = j / SEG * Math.PI * 2; pts.push(proj(Math.cos(t) * Math.cos(lo), Math.sin(t), Math.cos(t) * Math.sin(lo))); }
      stroke(pts);
    }
    /* orbit ring with a satellite */
    pts = [];
    var oy = 0.28;
    for (j = 0; j <= SEG * 2; j++) {
      t = j / (SEG * 2) * Math.PI * 2;
      pts.push(proj(Math.cos(t) * 1.32, Math.sin(t) * oy, Math.sin(t) * 1.32));
    }
    stroke(pts);
    var st2 = performance.now() / 2600;
    var sat = proj(Math.cos(st2) * 1.32, Math.sin(st2) * oy, Math.sin(st2) * 1.32);
    ctx.fillStyle = sat[2] > 0 ? "#85D6CD" : "#1A8A7D";
    ctx.shadowColor = "rgba(54, 201, 186, .9)"; ctx.shadowBlur = sat[2] > 0 ? 12 : 0;
    ctx.fillRect(sat[0] - 3, sat[1] - 3, 6, 6);
    ctx.shadowBlur = 0;
    /* front vertices */
    ctx.fillStyle = "#BCE6E1";
    for (i = -4; i <= 4; i += 2) {
      for (j = 0; j < 12; j++) {
        var la2 = i * Math.PI / 12, lo2 = j * Math.PI / 6;
        var p = proj(Math.cos(la2) * Math.cos(lo2), Math.sin(la2), Math.cos(la2) * Math.sin(lo2));
        if (p[2] > 0.55) ctx.fillRect(p[0] - 1.5, p[1] - 1.5, 3, 3);
      }
    }
  }

  var visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(stage);
  }
  var readRot = $("readRot");
  var lastRead = 0;
  /* In the gallery the page runs inside a small iframe: draw at ~15fps there. */
  var embedded = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  var lastDraw = 0;
  function frame(now) {
    if (visible && !document.hidden && (!embedded || now - lastDraw > 66)) {
      lastDraw = now;
      boost *= 0.95;
      yaw += spin + boost;
      tilt += (tiltT - tilt) * 0.06;
      roll += (rollT - roll) * 0.06;
      draw();
      if (now - lastRead > 120) {
        lastRead = now;
        var deg = ((yaw * 180 / Math.PI) % 360 + 360) % 360;
        readRot.textContent = "↻ " + pad(deg.toFixed(1), 5) + "°";
      }
    }
    requestAnimationFrame(frame);
  }

  function ping() {
    var p = $("ping");
    p.classList.remove("is-on"); void p.offsetWidth; p.classList.add("is-on");
  }
  stage.addEventListener("click", function () { ping(); boost = reduce ? 0 : 0.09; });

  if ("ResizeObserver" in window) new ResizeObserver(size).observe(cv); else window.addEventListener("resize", size);
  size();
  if (!reduce) requestAnimationFrame(frame);

  /* ================================================================
     HUD readouts: pointer coordinates, timecode, clock, uptime
     ================================================================ */
  var coordA = $("coordA"), coordB = $("coordB"), rulers = document.querySelectorAll(".hud__ruler");
  window.addEventListener("pointermove", function (e) {
    var nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
    coordA.textContent = (24.7136 + ny * 0.02).toFixed(5) + "° · " + (46.6753 + nx * 0.02).toFixed(5) + "°";
    coordB.textContent = (nx >= 0 ? "+" : "") + (nx * 200).toFixed(2) + " / " + (ny >= 0 ? "+" : "") + (ny * 200).toFixed(2);
    rulers.forEach(function (r) { r.style.setProperty("--scan", ((ny + 0.5) * 100).toFixed(1) + "%"); });
    if (!reduce && e.pointerType !== "touch") { tiltT = 0.42 + ny * 0.5; rollT = -nx * 0.25; }
  }, { passive: true });

  var t0 = Date.now(), clock = $("clock"), tc = $("timecode"), up = $("uptime");
  function tick() {
    var d = new Date(), el = Date.now() - t0;
    clock.textContent = pad(d.getHours(), 2) + ":" + pad(d.getMinutes(), 2) + ":" + pad(d.getSeconds(), 2);
    var s = Math.floor(el / 1000);
    tc.textContent = pad(Math.floor(s / 3600), 2) + ":" + pad(Math.floor(s / 60) % 60, 2) + ":" + pad(s % 60, 2) + ":" + pad(Math.floor(el / 40) % 25, 2);
    up.textContent = "▮ " + pad(s, 6);
  }
  tick();
  setInterval(function () { if (!document.hidden) tick(); }, reduce || embedded ? 1000 : 80);

  /* ================================================================
     Data ticker: built only from MEDAD copy, numerals and symbols
     ================================================================ */
  var items = [
    ["173.6", "{مداد}"],
    ["24.71", M.pillars[0].title],
    ["46.67", M.pillars[1].title],
    ["08.90", M.pillars[2].title],
    ["00.31", M.footer.line],
    ["16.60", M.about.title]
  ];
  var tt = $("tickerTrack");
  function buildSet() {
    var set = document.createElement("div");
    set.className = "ticker__set";
    set.innerHTML = items.map(function (it) {
      return '<span class="tk"><span class="mono" dir="ltr">' + it[0] + "</span>" + M.html(it[1]) + '</span><span class="tk__sep">◆</span>';
    }).join("");
    return set;
  }
  var setA = buildSet();
  tt.appendChild(setA);
  var guard = 0;
  while (setA.scrollWidth < Math.max(window.innerWidth, 1600) && guard++ < 6) {
    setA.innerHTML += buildSet().innerHTML;
  }
  tt.appendChild(setA.cloneNode(true));

  /* ================================================================
     ASCII ink drop over a rippling pool
     ================================================================ */
  var ascii = $("ascii");
  var AW = 34, AH = 26, RAMP = " .:;=+*#%@";
  function rprof(y) {
    if (y <= -1 || y >= 1) return 0;
    var t = Math.acos(-y);
    return 0.86 * Math.sin(t) * Math.pow(Math.sin(t / 2), 1.6);
  }
  function asciiFrame(t) {
    var out = "", lx = Math.sin(t * 0.9) * 0.8, lz = 0.62 + Math.cos(t * 0.9) * 0.3, ly = -0.55;
    var ll = Math.sqrt(lx * lx + ly * ly + lz * lz); lx /= ll; ly /= ll; lz /= ll;
    var bob = Math.sin(t * 1.6) * 0.6, dropH = AH * 0.66, top = 1 + bob;
    var rip = (t * 0.55) % 1;
    for (var j = 0; j < AH; j++) {
      var row = "";
      for (var i = 0; i < AW; i++) {
        var x = (i - AW / 2 + 0.5) * 0.6 / (dropH / 2);
        var yy = (j - top) / dropH * 2 - 1;
        var r = rprof(yy), ch = " ";
        if (Math.abs(x) < r) {
          var z = Math.sqrt(r * r - x * x);
          var dr = (rprof(yy + 0.02) - rprof(yy - 0.02)) / 0.04;
          var nx = x, ny = -r * dr, nz = z, nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
          nx /= nl; ny /= nl; nz /= nl;
          var dif = Math.max(0, nx * lx + ny * ly + nz * lz);
          var spec = Math.pow(Math.max(0, 2 * dif * nz - lz), 12);
          var v = Math.min(0.999, 0.1 + dif * 0.75 + spec * 0.6);
          ch = RAMP.charAt(1 + Math.floor(v * (RAMP.length - 1)));
        } else if (j >= AH - 5) {
          var px = (i - AW / 2 + 0.5) / (AW / 2), py = (j - (AH - 3)) / 2.2;
          var d = Math.sqrt(px * px + py * py);
          if (Math.abs(px) < 1) {
            for (var k = 0; k < 3; k++) {
              var rr = ((rip + k / 3) % 1) * 0.98;
              if (Math.abs(d - rr) < 0.06 + rr * 0.04) { ch = rr < 0.35 ? "=" : "~"; break; }
            }
            if (ch === " " && Math.abs(py) < 0.12 && Math.abs(px) < 0.9) ch = ".";
          }
        }
        row += ch;
      }
      out += row + (j < AH - 1 ? "\n" : "");
    }
    ascii.textContent = out;
  }
  asciiFrame(0.6);
  if (!reduce) {
    var asciiOn = false, lastA = 0;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { asciiOn = es[0].isIntersecting; }).observe(ascii);
    } else asciiOn = true;
    (function loopA(now) {
      if (asciiOn && !document.hidden && now - lastA > (embedded ? 200 : 70)) { lastA = now; asciiFrame(now / 1000); }
      requestAnimationFrame(loopA);
    })(0);
  }

  /* ================================================================
     Windows: open on scroll, focus to front, drag by the title bar
     ================================================================ */
  var pops = document.querySelectorAll("[data-pop]");
  function open(el) {
    el.classList.add("is-in");
    var g = el.querySelector(".glitch");
    if (g) setTimeout(function () { liveGlitch(g); }, 700);
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { open(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    pops.forEach(function (el) { io.observe(el); });
  } else pops.forEach(open);

  var wins = document.querySelectorAll("[data-win]"), zTop = 10;
  function front(w) {
    wins.forEach(function (o) { if (o !== w) o.classList.remove("is-front"); });
    w.classList.add("is-front");
    if (w.hasAttribute("data-drag")) w.style.zIndex = ++zTop;
  }
  wins.forEach(function (w) {
    w.addEventListener("pointerdown", function () { front(w); });
    w.addEventListener("focusin", function () { front(w); });
    var bar = w.querySelector(".win__bar");
    if (!reduce) {
      bar.addEventListener("mouseenter", function () {
        if (w.classList.contains("is-dragging")) return;
        w.classList.remove("is-jolt"); void w.offsetWidth; w.classList.add("is-jolt");
        setTimeout(function () { w.classList.remove("is-jolt"); }, 300);
      });
    }
  });

  var desk = $("desk");
  var canDrag = function () { return !reduce && window.innerWidth >= 1000; };
  document.querySelectorAll("[data-drag]").forEach(function (w) {
    var bar = w.querySelector(".win__bar");
    var sx, sy, bx = 0, by = 0, dx = 0, dy = 0, lim;
    bar.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch" || e.button !== 0 || !canDrag()) return;
      e.preventDefault();
      w.classList.remove("is-snap");
      w.classList.add("is-dragging");
      try { bar.setPointerCapture(e.pointerId); } catch (err) {}
      dx = parseFloat(w.style.getPropertyValue("--dx")) || 0;
      dy = parseFloat(w.style.getPropertyValue("--dy")) || 0;
      sx = e.clientX; sy = e.clientY; bx = dx; by = dy;
      var r = w.getBoundingClientRect(), d = desk.getBoundingClientRect();
      lim = {
        l: d.left + 8 - (r.left - dx), r: d.right - 8 - (r.right - dx),
        t: d.top + 8 - (r.top - dy), b: d.bottom - 8 - (r.bottom - dy)
      };
    });
    bar.addEventListener("pointermove", function (e) {
      if (!w.classList.contains("is-dragging")) return;
      dx = Math.max(lim.l, Math.min(lim.r, bx + e.clientX - sx));
      dy = Math.max(lim.t, Math.min(lim.b, by + e.clientY - sy));
      w.style.setProperty("--dx", dx + "px");
      w.style.setProperty("--dy", dy + "px");
    });
    function end() { w.classList.remove("is-dragging"); }
    bar.addEventListener("pointerup", end);
    bar.addEventListener("pointercancel", end);
    bar.addEventListener("dblclick", function () {
      w.classList.add("is-snap");
      dx = dy = 0;
      w.style.setProperty("--dx", "0px");
      w.style.setProperty("--dy", "0px");
    });
  });
  window.addEventListener("resize", function () {
    if (canDrag()) return;
    document.querySelectorAll("[data-drag]").forEach(function (w) {
      w.style.setProperty("--dx", "0px"); w.style.setProperty("--dy", "0px");
    });
  });
})();
