/* ============================================================
   Medad Style Lab: all Arabic copy lives here.
   Pages read window.MEDAD; nothing is hardcoded in pages.

   {مداد} is the brand word token. Render it with:
     MEDAD.html(str)  ->  <span class="brand-word" role="img" aria-label="مداد">مـــــداد</span>
     MEDAD.text(str)  ->  مـــــداد (plain, for <title> and aria labels)
   Fields ending in "Kashida" are optional elongated variants of display
   words (max two tatweels, after a connecting letter). Toggle per style.
   ============================================================ */
(function () {
  var BRAND = "مـــــداد"; // fixed brand rule: five tatweels, display font 900. Identical to the logo.
  var TOKEN = /\{مداد\}/g;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  window.MEDAD = {
    brand: BRAND,
    brandPlain: "مداد",

    meta: {
      title: "{مداد}",
      description: "{مداد} تصمّم المواقع والأنظمة والتجارب التفاعلية وتبنيها بعناية."
    },

    nav: {
      cta: "تواصل معنا"
    },

    hero: {
      headline: "نكتب أفكارك منصات تعمل",
      headlineKashida: "نكتب أفكارك منصات تعـمل",
      line: "نصمّم المواقع والأنظمة الرقمية ونبنيها، للجهات التي تريد أن ترى عملها واضحاً ومنظماً.",
      cta: "ابدأ مشروعك"
    },

    about: {
      title: "الحبر الذي تكتب به الأفكار",
      text: "{مداد} في اللغة هو الحبر. ومن هنا بدأنا: نصغي إلى فكرتك جيداً، ثم نكتبها موقعاً أو نظاماً يُستخدم كل يوم، ونبقى معك بعد الإطلاق."
    },

    pillars: [
      {
        title: "مواقع تُعرّف بك",
        text: "واجهة تقول من أنت في ثوانٍ، وتعمل بسلاسة على كل شاشة."
      },
      {
        title: "أنظمة تدير عملك",
        text: "منصات مخصّصة للمتابعة والتقارير والصلاحيات، تُبنى على طريقة عملك لا العكس."
      },
      {
        title: "تجارب تجمع الناس",
        text: "مسابقات وألعاب تفاعلية حيّة تحوّل القاعة إلى لحظة لا تُنسى."
      }
    ],

    closing: {
      headline: "لديك فكرة؟ لنكتبها معا.",
      headlineKashida: "لديك فكرة؟ لنكتـبها معا.",
      cta: "تواصل معنا"
    },

    footer: {
      line: "حلول تقنية تُكتب بعناية.",
      email: "hello@medaad.tech",
      copyright: "© 2026 {مداد}"
    },

    gallery: {
      title: "اثنان وعشرون أسلوباً",
      line: "تصفّحها كلها، ثم اختر الهوية التي تشبه {مداد}."
    },

    /* Turn {مداد} into the brand span; everything else is escaped. */
    html: function (str) {
      return escapeHtml(str).replace(TOKEN,
        '<span class="brand-word" role="img" aria-label="مداد">' + BRAND + "</span>");
    },
    /* Plain text with the brand word, for <title>, aria-label, alt. */
    text: function (str) {
      return String(str).replace(TOKEN, BRAND);
    },
    /* Fill every [data-copy="path.to.field"] in a root (default: document). */
    fill: function (root) {
      var self = this;
      (root || document).querySelectorAll("[data-copy]").forEach(function (el) {
        var v = el.getAttribute("data-copy").split(".").reduce(function (o, k) {
          return o == null ? o : o[k];
        }, self);
        if (typeof v === "string") el.innerHTML = self.html(v);
        else console.warn("MEDAD: no copy at", el.getAttribute("data-copy"));
      });
    }
  };
})();
