/* ============================================================================
   BROKSERVISAVTO — спільні виправлення для всіх сторінок кластера.

   ПІДКЛЮЧЕННЯ, дві правки на кожній сторінці:

   1) ВИДАЛИТИ з <head> рядок, який підключає gtag.js:
        script async src="https://www.googletagmanager.com/gtag/js?id=AW-18171698074"
      (блок нижче з dataLayer і gtag('config',...) НЕ чіпати — він потрібен)

   2) ДОДАТИ перед закриттям body:
        script src="/site-fixes.js"

   Що робить:
   · вантажить gtag.js після першої взаємодії або через 2,5 с
   · обгортає контент у <main> — орієнтир для скрінрідерів і ШІ-агентів
   · додає honeypot і перевірку часу заповнення проти ботів
   · Enter у полі відправляє форму (зараз не працює — <form> немає)
   · ставить type="button" кнопкам, щоб не було випадкових сабмітів
   · підкреслює посилання в тексті та у футері
   · видимий фокус з клавіатури
   ============================================================================ */
(function () {
  "use strict";

  /* ---------- 1. Відкладене завантаження gtag.js ---------------------------- */
  var GADS_ID = "AW-18171698074";

  (function () {
    var loaded = false;
    function loadGtag() {
      if (loaded) return;
      loaded = true;
      var s = document.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + GADS_ID;
      document.head.appendChild(s);
    }
    window.__loadGtag = loadGtag;
    ["pointerdown", "touchstart", "keydown", "scroll", "mousemove"].forEach(function (ev) {
      window.addEventListener(ev, loadGtag, { once: true, passive: true });
    });
    setTimeout(loadGtag, 2500);
  })();

  /* ---------- 2. Стилі: підкреслення посилань і фокус ------------------------ */
  function injectStyles() {
    if (document.getElementById("bsa-fix-style")) return;
    var st = document.createElement("style");
    st.id = "bsa-fix-style";
    st.textContent =
      /* посилання в тексті мають відрізнятись не лише кольором */
      "p a:not(.btn), li a:not(.btn), .answer a, td a:not(.btn), .author-box a{text-decoration:underline}" +
      "footer a{text-decoration:underline}" +
      "a:focus-visible,button:focus-visible,summary:focus-visible,input:focus-visible,textarea:focus-visible" +
      "{outline:3px solid #8FBBF5;outline-offset:3px;border-radius:6px}" +
      /* honeypot: невидимий для людей, доступний ботам */
      ".bsa-hp{position:absolute!important;left:-9999px!important;width:1px!important;" +
      "height:1px!important;overflow:hidden!important}";
    document.head.appendChild(st);
  }

  /* ---------- 3. <main> навколо контенту ------------------------------------- */
  function wrapMain() {
    if (document.querySelector("main")) return;
    var header = document.querySelector("body > header");
    var footer = document.querySelector("body > footer");
    if (!header) return;

    var main = document.createElement("main");
    var node = header.nextSibling;
    var moved = [];
    while (node && node !== footer) {
      moved.push(node);
      node = node.nextSibling;
    }
    if (!moved.length) return;
    header.parentNode.insertBefore(main, moved[0]);
    moved.forEach(function (n) { main.appendChild(n); });
  }

  /* ---------- 4. Форми: honeypot, час, type, Enter --------------------------- */
  var openedAt = Date.now();

  function upgradeForm() {
    var name = document.getElementById("lead-name");
    var phone = document.getElementById("lead-phone");
    if (!name || !phone) return;

    /* honeypot поруч з полями */
    if (!document.getElementById("lead-website")) {
      var wrap = document.createElement("div");
      wrap.className = "bsa-hp";
      wrap.setAttribute("aria-hidden", "true");
      wrap.innerHTML =
        '<label for="lead-website">Не заповнюйте це поле</label>' +
        '<input id="lead-website" type="text" name="website" tabindex="-1" autocomplete="off">';
      name.parentNode.insertBefore(wrap, name);
    }

    /* кнопки: type="button", щоб не було непередбачених сабмітів */
    document.querySelectorAll(".form-box button").forEach(function (b) {
      if (!b.getAttribute("type")) b.setAttribute("type", "button");
    });

    /* Enter у текстовому полі відправляє заявку */
    ["lead-name", "lead-phone", "lead-email"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          if (typeof window.sendLead === "function") window.sendLead();
        }
      });
    });

    /* статус-повідомлення озвучується скрінрідером */
    var status = document.getElementById("lead-status");
    if (status && !status.getAttribute("role")) status.setAttribute("role", "status");
  }

  /* ---------- 5. Обгортка sendLead: бот-фільтр і трекінг --------------------- */
  function wrapSendLead() {
    if (typeof window.sendLead !== "function" || window.__bsaWrapped) return;
    window.__bsaWrapped = true;

    var original = window.sendLead;
    window.sendLead = function () {
      var hp = document.getElementById("lead-website");
      var status = document.getElementById("lead-status");

      /* Honeypot заповнений або форма відправлена швидше за 2 с — це бот.
         Показуємо «успіх», але нічого не надсилаємо: бот не дізнається, що його відсіяли. */
      if ((hp && hp.value.trim() !== "") || Date.now() - openedAt < 2000) {
        if (status) {
          status.textContent = "Заявку надіслано! Зателефонуємо протягом 15 хвилин.";
          status.style.color = "#1B7A36";
        }
        return;
      }

      if (window.__loadGtag) window.__loadGtag();
      return original.apply(this, arguments);
    };
  }

  function init() {
    injectStyles();
    wrapMain();
    upgradeForm();
    wrapSendLead();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
