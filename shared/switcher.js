/* Shared style navigator: previous, next, gallery, style name.
   Arrow keys are mirrored for RTL: ArrowRight = previous, ArrowLeft = next.
   Hidden when the page is embedded (gallery previews). */
(function () {
  var list = window.MEDAD_STYLES || [];
  var m = location.pathname.match(/\/styles\/([^\/]+)\/[^\/]*$/);
  if (!m || !list.length) return;
  var i = list.findIndex(function (s) { return s.slug === decodeURIComponent(m[1]); });
  if (i < 0) return;

  var embedded = false;
  try { embedded = window.self !== window.top; } catch (e) { embedded = true; }
  if (embedded) return;

  var prev = list[(i - 1 + list.length) % list.length];
  var next = list[(i + 1) % list.length];
  var cur = list[i];
  var url = function (s) { return "../" + s.slug + "/index.html"; };
  var gallery = "../../index.html#s" + cur.n;

  // In RTL, "previous" sits on the right and points right.
  var arrowPrev = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>';
  var arrowNext = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>';
  var grid = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="2" y="2" width="5" height="5" rx="1.2"/><rect x="9" y="2" width="5" height="5" rx="1.2"/><rect x="2" y="9" width="5" height="5" rx="1.2"/><rect x="9" y="9" width="5" height="5" rx="1.2"/></svg>';

  var nav = document.createElement("nav");
  nav.className = "mdx-nav";
  nav.setAttribute("aria-label", "Style navigator");
  nav.setAttribute("lang", "en");
  nav.innerHTML =
    '<a href="' + url(prev) + '" rel="prev" aria-label="Previous style: ' + prev.name + '">' + arrowPrev + "</a>" +
    '<a href="' + gallery + '" aria-label="Gallery: ' + cur.n + " " + cur.name + '">' + grid +
      '<span class="mdx-nav__name"><span class="mdx-nav__num">' + cur.n + "</span> " + cur.name + "</span></a>" +
    '<a href="' + url(next) + '" rel="next" aria-label="Next style: ' + next.name + '">' + arrowNext + "</a>";

  function mount() { document.body.appendChild(nav); }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);

  document.addEventListener("keydown", function (e) {
    if (e.defaultPrevented || e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName))) return;
    if (e.key === "ArrowRight") location.href = url(prev);
    else if (e.key === "ArrowLeft") location.href = url(next);
    else if (e.key === "Escape") location.href = gallery;
  });
})();
