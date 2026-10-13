/* 10 · Neumorphism */
(function () {
  var M = window.MEDAD;
  M.fill();
  document.title = M.text(M.meta.title) + " · Neumorphism";

  var mail = "mailto:" + M.footer.email;
  document.getElementById("mailBtn").href = mail;
  var link = document.getElementById("mailLink");
  link.href = mail;
  link.textContent = M.footer.email;

  var root = document.documentElement;

  /* Engraved scale around the dial: 48 ticks, every sixth one longer. */
  var ticks = document.getElementById("ticks");
  var NS = "http://www.w3.org/2000/svg";
  var COUNT = 48;
  for (var i = 0; i < COUNT; i++) {
    var a = (i / COUNT) * Math.PI * 2;
    var major = i % 6 === 0;
    var r1 = major ? 44.2 : 45.4, r2 = 48.4;
    var sx = Math.sin(a), cy = -Math.cos(a);
    var l = document.createElementNS(NS, "line");
    /* sweep starts at the top and runs toward the left (reading direction in RTL) */
    l.setAttribute("x1", (50 - sx * r1).toFixed(2));
    l.setAttribute("y1", (50 + cy * r1).toFixed(2));
    l.setAttribute("x2", (50 - sx * r2).toFixed(2));
    l.setAttribute("y2", (50 + cy * r2).toFixed(2));
    l.setAttribute("class", major ? "tick tick--major" : "tick");
    l.style.setProperty("--i", i);
    ticks.appendChild(l);
  }

  /* The knob: press travels in while held, toggles on release. */
  var knob = document.getElementById("knob");
  function down() { knob.classList.add("is-down"); }
  function up() { knob.classList.remove("is-down"); }
  knob.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    down();
  });
  ["pointerup", "pointerleave", "pointercancel", "blur"].forEach(function (t) {
    knob.addEventListener(t, up);
  });
  knob.addEventListener("keydown", function (e) {
    if ((e.key === " " || e.key === "Enter") && !e.repeat) down();
  });
  knob.addEventListener("keyup", function (e) {
    if (e.key === " " || e.key === "Enter") up();
  });
  knob.addEventListener("click", function () {
    var on = knob.getAttribute("aria-pressed") !== "true";
    knob.setAttribute("aria-pressed", on ? "true" : "false");
    root.classList.toggle("is-lit", on);
  });

  /* Keys get the same pressed state from the keyboard as from a pointer. */
  document.querySelectorAll(".key").forEach(function (k) {
    k.addEventListener("keydown", function (e) { if (e.key === "Enter") k.classList.add("is-down"); });
    k.addEventListener("keyup", function () { k.classList.remove("is-down"); });
    k.addEventListener("blur", function () { k.classList.remove("is-down"); });
  });

  /* Reveal: rise, then extrude out of the surface. Drop the stagger once settled. */
  var items = document.querySelectorAll("[data-rise]");
  function settle(el) {
    el.classList.add("is-in");
    window.setTimeout(function () { el.style.setProperty("--d", "0s"); }, 1800);
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { settle(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(settle);
  }
})();
