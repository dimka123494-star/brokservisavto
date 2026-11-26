/* ============================================================================
   BROKSERVISAVTO — блок «Перевірте авто перед купівлею».
   Поле «номер або VIN» → відкриває перевірку на forwardcarua.com (НомерОК):
   безкоштовна довідка МВС, повний звіт, детальна перевірка, історія за кордоном.
   Підключення: <div data-check-auto data-src="dogovir" data-title="…" data-text="…"></div>
                <script src="/check-widget.js" defer></script>
   data-variant="band" — широка смуга для головної; без нього — картка.
   ============================================================================ */
(function () {
  "use strict";
  var BASE = "https://forwardcarua.com/perevirka-avto";

  var css =
    ".bsa-ck{background:#fff;border:1px solid rgba(0,0,0,.12);border-radius:14px;padding:22px 24px;margin:24px 0;font-family:'Manrope',system-ui,sans-serif;color:#111827;text-align:left}" +
    ".bsa-ck.band{max-width:1100px;margin:0 auto;border-radius:16px;box-shadow:0 6px 24px rgba(10,15,30,.06)}" +
    ".bsa-ck h3{margin:0 0 6px;font-size:1.15rem;font-weight:800;line-height:1.3;color:#0a0f1e}" +
    ".bsa-ck p{margin:0 0 14px;font-size:.93rem;color:#4b5563;line-height:1.55}" +
    ".bsa-ck form{display:flex;gap:10px;flex-wrap:wrap}" +
    ".bsa-ck input{flex:1 1 240px;min-width:0;border:1.5px solid rgba(0,0,0,.18);border-radius:10px;padding:13px 14px;font:600 16px/1.2 ui-monospace,'JetBrains Mono',monospace;letter-spacing:.04em;text-transform:uppercase;color:#111827;background:#fff}" +
    ".bsa-ck input:focus{outline:none;border-color:#1a6ab0;box-shadow:0 0 0 3px rgba(26,106,176,.15)}" +
    ".bsa-ck input::placeholder{text-transform:none;letter-spacing:0;font-family:'Manrope',system-ui,sans-serif;font-weight:500;color:#6b7280}" +
    ".bsa-ck button{border:0;border-radius:10px;padding:13px 22px;background:#1a6ab0;color:#fff;font:700 15px/1.2 'Manrope',system-ui,sans-serif;cursor:pointer;white-space:nowrap}" +
    ".bsa-ck button:hover{background:#14568f}" +
    ".bsa-ck ul{display:flex;flex-wrap:wrap;gap:6px 16px;margin:12px 0 0;padding:0;list-style:none;font-size:.85rem;color:#4b5563}" +
    ".bsa-ck li:before{content:'✓ ';color:#15803d;font-weight:700}" +
    ".bsa-ck .bsa-ck-err{color:#b91c1c;font-size:.85rem;margin:8px 0 0;display:none}" +
    ".bsa-ck small{display:block;margin-top:10px;font-size:.78rem;color:#6b7280}";

  function norm(v) { return String(v || "").toUpperCase().replace(/[\s\-"'.]/g, ""); }
  function valid(v) {
    if (/^[A-HJ-NPR-Z0-9]{17}$/.test(v)) return true;                      // VIN
    return /^[0-9A-ZА-ЯІЇЄ]{4,10}$/.test(v) && /\d/.test(v);              // номерний знак
  }

  function build(el) {
    var src = el.getAttribute("data-src") || "site";
    var title = el.getAttribute("data-title") || "Перевірте авто перед купівлею";
    var text = el.getAttribute("data-text") || "Введіть номер або VIN — покажемо історію реєстрацій МВС, кількість власників, ввезення з-за кордону та чи не в розшуку. Коротка довідка безкоштовно.";
    var box = document.createElement("div");
    box.className = "bsa-ck" + (el.getAttribute("data-variant") === "band" ? " band" : "");
    box.innerHTML =
      "<h3></h3><p></p>" +
      '<form novalidate><label style="position:absolute;left:-9999px" for="ck-' + src + '">Номер або VIN</label>' +
      '<input id="ck-' + src + '" name="q" autocomplete="off" inputmode="text" placeholder="АА1234ВВ або VIN — 17 символів" maxlength="20">' +
      '<button type="submit">Перевірити авто</button></form>' +
      '<div class="bsa-ck-err" role="alert">Введіть номерний знак (АА1234ВВ) або VIN із 17 символів</div>' +
      "<ul><li>Історія МВС з 2013 року</li><li>Розшук</li><li>Розшифровка VIN</li><li>Історія за кордоном</li></ul>" +
      "<small>Перевірка відкриється на forwardcarua.com — сервісі НомерОК нашої компанії ТОВ «ФОРВАРД КАР ЮА».</small>";
    box.querySelector("h3").textContent = title;
    box.querySelector("p").textContent = text;
    var form = box.querySelector("form"), inp = box.querySelector("input"), err = box.querySelector(".bsa-ck-err");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = norm(inp.value);
      if (!valid(q)) { err.style.display = "block"; inp.focus(); return; }
      err.style.display = "none";
      var url = BASE + "?q=" + encodeURIComponent(q) + "&utm_source=brokservisavto&utm_medium=widget&utm_campaign=" + encodeURIComponent(src);
      try { if (typeof gtag === "function") gtag("event", "check_auto_click", { source: src }); } catch (x) {}
      var w = window.open(url, "_blank", "noopener");
      if (!w) location.href = url;
    });
    el.replaceWith(box);
  }

  function init() {
    var els = document.querySelectorAll("[data-check-auto]");
    if (!els.length) return;
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    for (var i = 0; i < els.length; i++) build(els[i]);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
