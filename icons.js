/* ============================================================================
   BROKSERVISAVTO — локальні іконки замість @tabler/icons-webfont з jsDelivr.
   Замінює 796 KiB зовнішнього шрифту на ~5 KiB inline SVG.

   ПІДКЛЮЧЕННЯ на кожній сторінці:
     1) ВИДАЛИТИ рядок:
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@.../tabler-icons.min.css">
     2) ДОДАТИ перед </body>:
        <script src="/icons.js"></script>

   Розмітку <i class="ti ti-phone"></i> міняти НЕ треба — скрипт сам
   перетворює її на <svg class="ico"><use href="#i-phone"/></svg>.
   Іконки успадковують color і font-size батьківського елемента, як і шрифт.
   ============================================================================ */
(function () {
  "use strict";

  /* Набір іконок, що реально використовуються на сайті.
     Шляхи в системі координат 24×24, обведення (stroke), не заливка. */
  var ICONS = {
    "phone": '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    "map-pin": '<path d="M12 11a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5"/><path d="M17.657 16.657 13.414 20.9a2 2 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0"/>',
    "clock": '<path d="M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18"/><path d="M12 7v5l3 3"/>',
    "camera": '<path d="M5 7h2l1.5-2h7L17 7h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2"/><path d="M12 16a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7"/>',
    "tag": '<path d="M8.5 8.5h.01"/><path d="M4 7v3.9a2 2 0 0 0 .59 1.42l7.1 7.09a2 2 0 0 0 2.82 0l4.98-4.98a2 2 0 0 0 0-2.82l-7.09-7.1A2 2 0 0 0 10.98 4H7a3 3 0 0 0-3 3"/>',
    "mail": '<path d="M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2"/><path d="m3 8 9 5 9-5"/>',
    "send": '<path d="M10 14l11-11"/><path d="M21 3l-6.5 18a.55.55 0 0 1-1 0L10 14l-7-3.5a.55.55 0 0 1 0-1z"/>',
    "arrow-left": '<path d="M19 12H5"/><path d="M11 18l-6-6 6-6"/>',
    "arrow-right": '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
    "calculator": '<path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1"/><path d="M8 7h8v3H8z"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 17h.01"/><path d="M12 17h.01"/><path d="M16 17h.01"/>',
    "shield-check": '<path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1-8.5 15a12 12 0 0 1-8.5-15a12 12 0 0 0 8.5-3"/><path d="M9 12l2 2l4-4"/>',
    "world": '<path d="M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18"/><path d="M3.6 9h16.8"/><path d="M3.6 15h16.8"/><path d="M11.5 3a17 17 0 0 0 0 18"/><path d="M12.5 3a17 17 0 0 1 0 18"/>',
    "chart-bar": '<path d="M3 20h18"/><path d="M6 20v-6"/><path d="M12 20V9"/><path d="M18 20V4"/>',
    "file-description": '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2"/><path d="M9 13h6"/><path d="M9 17h4"/>',
    "file-text": '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2"/><path d="M9 9h1"/><path d="M9 13h6"/><path d="M9 17h6"/>',
    "file-certificate": '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M5 8V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2h-4"/><path d="M6 18a2 2 0 1 0 0-4a2 2 0 0 0 0 4"/><path d="M4.5 17.5 3 22l3-1.5L9 22l-1.5-4.5"/>',
    "certificate": '<path d="M12 15a3 3 0 1 0 0-6a3 3 0 0 0 0 6"/><path d="M13 17.5V22l2-1.5 2 1.5v-4.5"/><path d="M10 19H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6"/>',
    "certificate-2": '<path d="M12 15a3 3 0 1 0 0-6a3 3 0 0 0 0 6"/><path d="M13 17.5V22l2-1.5 2 1.5v-4.5"/><path d="M10 19H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6"/><path d="M9 8h2"/>',
    "checklist": '<path d="M9.615 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6"/><path d="M14 19l2 2 4-4"/><path d="M9 8h4"/><path d="M9 12h2"/>',
    "help-circle": '<path d="M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18"/><path d="M12 17h.01"/><path d="M12 13.5a1.5 1.5 0 0 1 1-1.5a2.6 2.6 0 1 0-3-4"/>',
    "id": '<path d="M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2"/><path d="M9 12a2 2 0 1 0 0-4a2 2 0 0 0 0 4"/><path d="M15 8h2"/><path d="M15 12h2"/><path d="M7 16h10"/>',
    "ship": '<path d="M2 20a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2-1a2.4 2.4 0 0 1 2-1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2-1a2.4 2.4 0 0 1 2-1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2-1"/><path d="M4 18l-1-5h18l-2 4"/><path d="M5 13V7h8l4 6"/><path d="M7 7V4h4"/>',
    "truck": '<path d="M7 20a2 2 0 1 0 0-4a2 2 0 0 0 0 4"/><path d="M17 20a2 2 0 1 0 0-4a2 2 0 0 0 0 4"/><path d="M5 18H3V6a1 1 0 0 1 1-1h9v13m-4 0h6m4 0h2v-6h-8m0-5h5l3 5"/>',
    "car-crash": '<path d="M7 19a2 2 0 1 0 0-4a2 2 0 0 0 0 4"/><path d="M17 19a2 2 0 1 0 0-4a2 2 0 0 0 0 4"/><path d="M5 17H4a1 1 0 0 1-1-1v-4l2-5h9l2 5 3 1v3a1 1 0 0 1-1 1h-1m-8 0h6"/><path d="M18 3l-2 3h3l-2 3"/>',
    "bolt": '<path d="M13 3v7h6l-8 11v-7H5z"/>',
    "flag": '<path d="M5 5a5 5 0 0 1 7 0a5 5 0 0 0 7 0v9a5 5 0 0 1-7 0a5 5 0 0 0-7 0z"/><path d="M5 21V5"/>',
    "receipt": '<path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-3.5-2-3.5 2-3.5-2z"/><path d="M9 7h6"/><path d="M9 11h6"/>',
    "receipt-tax": '<path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-3.5-2-3.5 2-3.5-2z"/><path d="M10 8h.01"/><path d="M14 12h.01"/><path d="M14 8l-4 4"/>',
    "building-bank": '<path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v3"/><path d="M12 14v3"/><path d="M16 14v3"/>',
    "credit-card": '<path d="M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2"/><path d="M3 10h18"/><path d="M7 15h.01"/><path d="M11 15h2"/>',
    "heart": '<path d="M12 20l-1.5-1.35C5.4 14.05 2 11 2 7.5A4.5 4.5 0 0 1 6.5 3c1.74 0 3.41.81 4.5 2.09h2C14.09 3.81 15.76 3 17.5 3A4.5 4.5 0 0 1 22 7.5c0 3.5-3.4 6.55-8.5 11.15z"/>',
    "gavel": '<path d="M13 10l7.7 7.7a1 1 0 0 1 0 1.4l-.6.6a1 1 0 0 1-1.4 0L11 12"/><path d="M5.3 10.7 10.7 5.3"/><path d="M7.4 3.2 12.8 8.6"/><path d="M3.2 7.4 8.6 12.8"/><path d="M3 21h9"/>',
    "alert-triangle": '<path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.24 3.96 2.51 17.35A2 2 0 0 0 4.24 20.4h15.52a2 2 0 0 0 1.73-3.05L13.76 3.96a2 2 0 0 0-3.52 0"/>',
    "user-check": '<path d="M9 11a4 4 0 1 0 0-8a4 4 0 0 0 0 8"/><path d="M3 21v-2a4 4 0 0 1 4-4h4"/><path d="M16 19l2 2 4-4"/>',
    "currency-euro": '<path d="M17.2 7A7 7 0 1 0 17.2 17"/><path d="M13 10H4"/><path d="M13 14H4"/>',
    "refresh": '<path d="M20 11A8 8 0 0 0 6.3 6.3L4 8.5"/><path d="M4 5v3.5h3.5"/><path d="M4 13a8 8 0 0 0 13.7 4.7L20 15.5"/><path d="M20 19v-3.5h-3.5"/>',
    "external-link": '<path d="M12 6H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-5"/><path d="M14 4h6v6"/><path d="M20 4 11 13"/>',
    "brand-telegram": '<path d="M15 10l-4 4l6 6l4-16l-18 7l4 2l2 6l3-4"/>',
    "brand-instagram": '<path d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5"/><path d="M12 15a3 3 0 1 0 0-6a3 3 0 0 0 0 6"/><path d="M16.5 7.5v.01"/>',
    "brand-facebook": '<path d="M7 10v4h3v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3V3h-3a5 5 0 0 0-5 5v2z"/>'
  };

  /* Іконка-заглушка, якщо в розмітці зустрівся клас, якого нема в наборі:
     нейтральне коло, щоб верстка не «стрибала» і нічого не зникало. */
  var FALLBACK = '<path d="M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18"/>';

  function injectStyles() {
    if (document.getElementById("bsa-ico-style")) return;
    var st = document.createElement("style");
    st.id = "bsa-ico-style";
    st.textContent =
      ".ico{width:1em;height:1em;display:inline-block;vertical-align:-0.14em;" +
      "flex:0 0 auto;fill:none;stroke:currentColor;stroke-width:1.9;" +
      "stroke-linecap:round;stroke-linejoin:round}" +
      ".bsa-icon-sprite{position:absolute;width:0;height:0;overflow:hidden}";
    document.head.appendChild(st);
  }

  function injectSprite() {
    if (document.getElementById("bsa-icon-sprite")) return;
    var parts = [];
    for (var key in ICONS) {
      if (Object.prototype.hasOwnProperty.call(ICONS, key)) {
        parts.push('<symbol id="i-' + key + '" viewBox="0 0 24 24">' + ICONS[key] + "</symbol>");
      }
    }
    parts.push('<symbol id="i-fallback" viewBox="0 0 24 24">' + FALLBACK + "</symbol>");
    var wrap = document.createElement("div");
    wrap.id = "bsa-icon-sprite";
    wrap.className = "bsa-icon-sprite";
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" focusable="false"><defs>' +
      parts.join("") +
      "</defs></svg>";
    document.body.insertBefore(wrap, document.body.firstChild);
  }

  var SVG_NS = "http://www.w3.org/2000/svg";
  var XLINK_NS = "http://www.w3.org/1999/xlink";

  function makeSvg(name) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "ico");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var use = document.createElementNS(SVG_NS, "use");
    var id = "#i-" + (ICONS[name] ? name : "fallback");
    use.setAttribute("href", id);
    use.setAttributeNS(XLINK_NS, "xlink:href", id); // сумісність зі старішими Safari
    svg.appendChild(use);
    return svg;
  }

  function replaceIcons(root) {
    var nodes = (root || document).querySelectorAll("i.ti");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var name = null;
      var cls = el.className.split(/\s+/);
      for (var j = 0; j < cls.length; j++) {
        if (cls[j].indexOf("ti-") === 0) { name = cls[j].slice(3); break; }
      }
      if (!name) continue;
      var svg = makeSvg(name);
      // переносимо інлайн-стилі, якщо вони були на <i>
      if (el.getAttribute("style")) svg.setAttribute("style", el.getAttribute("style"));
      el.parentNode.replaceChild(svg, el);
    }
  }

  function init() {
    injectStyles();
    injectSprite();
    replaceIcons(document);
    // Іконки в динамічно доданому HTML (результат калькулятора, форми тощо)
    if (typeof MutationObserver === "function") {
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var added = muts[i].addedNodes;
          for (var k = 0; k < added.length; k++) {
            var n = added[k];
            if (n.nodeType !== 1) continue;
            if (n.matches && n.matches("i.ti")) { replaceIcons(n.parentNode); }
            else if (n.querySelector && n.querySelector("i.ti")) { replaceIcons(n); }
          }
        }
      }).observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
