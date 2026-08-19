/* ============================================================================
   BROKSERVISAVTO — форми заявки під кожну послугу (один файл на всі сторінки)
   Сторінка визначається автоматично за URL.
   Підключення на КОЖНІЙ сторінці одним рядком перед </body>:
       <script src="/lead-forms.js" defer></script>

   ВАЖЛИВО: цей файл НЕ завантажує зовнішні шрифти. Використовує Manrope
   і Bebas Neue, які вже підключені в <head> сторінки.
   ============================================================================ */
(function () {
  const CONFIG = {
    SUPABASE_URL: "https://rhduokjaawmorcyiuviy.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoZHVva2phYXdtb3JjeWl1dml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NDE1NDgsImV4cCI6MjA5NjQxNzU0OH0.usjLWtdJW0OJt8dgUfCnkVljKN6kpG7vJ907Y_XWieg",
    TELEGRAM: "https://t.me/Dimakrykun95",
    PHONE: "+380981722342",
    // Мітка конверсії Google Ads для відправленої заявки.
    // Створіть у Google Ads конверсію типу "Надсилання форми" і впишіть її мітку,
    // напр. "AW-18171698074/AbC-D_efGh". Порожнє значення = конверсія не надсилається.
    ADS_LEAD_LABEL: "",
  };
  /* ===== далі нічого міняти не треба ===== */

  const PAGES = {
    home: {
      service: null, eyebrow: "Forward Car UA · BROKSERVISAVTO",
      title: "Залиште заявку", sub: "Передзвонимо протягом 15 хвилин і підберемо рішення під ваш бюджет.",
      cta: "Надіслати заявку", fab: "📩 Залишити заявку",
      fields: [
        { col: "car_brand", label: "Марка авто", ph: "Audi" },
        { col: "car_model", label: "Модель", ph: "Q7" },
        { col: "car_year", label: "Рік", num: true, ph: "2021" },
        { col: "car_budget", label: "Бюджет, $", num: true, ph: "25000" },
        { col: "city", label: "Місто", ph: "Київ" },
      ],
    },
    "avto-ssha": {
      service: "Авто зі США", eyebrow: "Copart · IAAI · Manheim",
      title: "Підберемо авто зі США", sub: "Розкажіть, що шукаєте — знайдемо найкращий лот на аукціоні під ваш бюджет.",
      cta: "Підібрати авто", fab: "🚗 Підібрати авто",
      fields: [
        { note: "Категорія", label: "Тип кузова", sel: ["Седан", "Кросовер / SUV", "Електромобіль", "Пікап", "Купе", "Мінівен", "Комерційний"] },
        { col: "car_brand", label: "Бажана марка", ph: "Tesla" },
        { col: "car_model", label: "Модель", ph: "Model Y" },
        { col: "car_year", label: "Рік (від)", num: true, ph: "2020" },
        { col: "car_budget", label: "Бюджет, $", num: true, ph: "25000" },
        { col: "city", label: "Місто", ph: "Київ" },
      ],
    },
    rozmytnennya: {
      service: "Розмитнення", eyebrow: "Офіційне оформлення",
      title: "Розрахуємо розмитнення", sub: "Залиште дані авто — безкоштовно порахуємо акциз, мито (10%) і ПДВ (20%).",
      cta: "Розрахувати вартість", fab: "🧮 Розрахувати розмитнення",
      fields: [
        { note: "Тип авто", label: "Тип авто", id: "rtype", sel: ["Легковий", "Електромобіль", "Позашляховик / SUV", "Комерційний"] },
        { col: "car_year", label: "Рік випуску", num: true, ph: "2019" },
        { note: "Обʼєм двигуна", label: "Обʼєм двигуна, см³", hideWhen: "rtype=Електромобіль", sel: ["до 1000", "1001–1500", "1501–2000", "2001–2500", "2501–3000", "понад 3000"] },
        { col: "car_budget", label: "Вартість авто, $", num: true, ph: "12000" },
        { col: "city", label: "Місто", ph: "Київ" },
      ],
    },
    otsinka: {
      service: "Оцінка / експертиза", eyebrow: "Офіційний звіт оцінювача",
      title: "Замовити оцінку авто", sub: "Офіційний звіт із юридичною силою — для митниці, банку, страхової, суду чи продажу.",
      cta: "Замовити оцінку", fab: "📋 Замовити оцінку",
      fields: [
        { note: "Ціль оцінки", label: "Для чого потрібна оцінка", sel: ["Для митниці", "Для банку", "Для страхової", "Купівля-продаж", "Для суду", "Для нотаріуса"] },
        { col: "car_brand", label: "Марка", ph: "BMW" },
        { col: "car_model", label: "Модель", ph: "X5" },
        { col: "car_year", label: "Рік", num: true, ph: "2018" },
        { col: "city", label: "Місто", ph: "Київ" },
      ],
    },
    dogovir: {
      service: "Договір купівлі-продажу", eyebrow: "Юридичний документ",
      title: "Оформити договір", sub: "Юридично грамотний договір купівлі-продажу — швидко і безпечно для обох сторін.",
      cta: "Оформити договір", fab: "📄 Оформити договір",
      fields: [
        { note: "Тип ТЗ", label: "Тип транспорту", sel: ["Легковий", "Мотоцикл", "Причіп", "Комерційний", "Спецтехніка"] },
        { col: "car_brand", label: "Марка", ph: "Toyota" },
        { col: "car_model", label: "Модель", ph: "Camry" },
        { col: "car_year", label: "Рік", num: true, ph: "2017" },
        { col: "vin", label: "VIN (за наявності)", ph: "JTNB11HK…" },
        { col: "city", label: "Місто", ph: "Київ" },
      ],
    },
  };
  const ALL_SERVICES = ["Підбір авто", "Авто зі США", "Розмитнення", "Оцінка / експертиза", "Договір купівлі-продажу", "Інше"];

  let pageKey = window.BSA_PAGE;
  if (!pageKey) {
    const seg = location.pathname.replace(/\/+$/, "").split("/").pop();
    pageKey = PAGES[seg] ? seg : "home";
  }
  const P = PAGES[pageKey] || PAGES.home;

  /* Шрифти сайту, без жодного зовнішнього запиту */
  const FONT_BODY = "'Manrope',system-ui,-apple-system,'Segoe UI',sans-serif";
  const FONT_DISPLAY = "'Bebas Neue',Impact,'Arial Narrow',sans-serif";

  const css = `
  .bsa{--acc:#3b82f6;font-family:${FONT_BODY}}
  .bsa *{box-sizing:border-box}
  .bsa-card{max-width:560px;margin:0 auto;background:linear-gradient(180deg,#141b2b,#0e1320);border:1px solid #1f2940;border-radius:22px;padding:30px 28px;color:#e7ecf5;box-shadow:0 30px 80px #00000055}
  .bsa-eyebrow{font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#7d9bd0}
  .bsa-title{font-family:${FONT_DISPLAY};font-weight:400;font-size:34px;line-height:1.02;letter-spacing:.5px;margin:10px 0 6px;color:#fff}
  .bsa-sub{color:#a9b9d3;font-size:14px;margin-bottom:22px}
  .bsa-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .bsa-f{display:flex;flex-direction:column;gap:6px}
  .bsa-f.full{grid-column:1/-1}
  .bsa-f label{font-size:12.5px;font-weight:600;color:#a9b9d3}
  .bsa-f label .req{color:#fca5a5}
  .bsa-f input,.bsa-f select,.bsa-f textarea{width:100%;background:#0c1220;border:1px solid #25314c;border-radius:12px;padding:13px 14px;color:#fff;font-size:16px;font-family:inherit;outline:none;transition:.15s}
  .bsa-f input::placeholder{color:#7c8aa6}
  .bsa-f input:focus,.bsa-f select:focus,.bsa-f textarea:focus{border-color:var(--acc);box-shadow:0 0 0 3px #3b82f655}
  .bsa-f input:focus-visible,.bsa-f select:focus-visible,.bsa-f textarea:focus-visible{outline:2px solid #85B7EB;outline-offset:1px}
  .bsa-f textarea{resize:vertical;min-height:62px}
  .bsa-f.hidden{display:none}
  .bsa-btn{width:100%;border:none;cursor:pointer;border-radius:13px;padding:16px;margin-top:14px;font-family:inherit;font-weight:700;font-size:15.5px;color:#fff;background:linear-gradient(135deg,#2563eb,#1a44b8);box-shadow:0 10px 26px #1d4ed855;transition:.15s;min-height:48px}
  .bsa-btn:hover{filter:brightness(1.1);transform:translateY(-1px)}
  .bsa-btn:disabled{opacity:.6;cursor:default;transform:none}
  .bsa-btn:focus-visible,.bsa-fab:focus-visible,.bsa-x:focus-visible{outline:3px solid #85B7EB;outline-offset:3px}
  .bsa-alt{text-align:center;margin-top:16px;font-size:13px;color:#94a6c4}
  .bsa-alt a{color:#93b8ff;font-weight:600;text-decoration:underline}
  .bsa-note{font-size:11.5px;color:#7c8aa6;text-align:center;margin-top:14px}
  /* honeypot: невидимий для людей, доступний ботам. Не display:none — деякі боти це розпізнають */
  .bsa-hp{position:absolute!important;left:-9999px!important;top:auto!important;width:1px!important;height:1px!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important}
  .bsa-err{background:#3a1620;border:1px solid #7f1d2e;color:#fda4af;border-radius:10px;padding:10px 12px;font-size:13px;margin-bottom:14px;display:none}
  .bsa-ok{text-align:center;padding:12px 0}
  .bsa-ok .ic{width:70px;height:70px;border-radius:50%;margin:0 auto 18px;display:grid;place-items:center;background:radial-gradient(circle at 30% 30%,#22c55e,#15803d);box-shadow:0 12px 30px #16a34a55}
  .bsa-ok .ic svg{width:34px;height:34px;stroke:#fff;stroke-width:3;fill:none}
  .bsa-ok h3{font-family:${FONT_DISPLAY};font-weight:400;font-size:30px;letter-spacing:.5px;color:#fff;margin:0 0 8px}
  .bsa-ok p{color:#a9b9d3;font-size:14px;margin:0 0 20px}
  .bsa-ghost{display:inline-block;border:1px solid #2c3a5a;border-radius:11px;padding:12px 20px;color:#dbe4f3;font-weight:600;text-decoration:none;font-size:14px;min-height:44px}
  .bsa-fab{position:fixed;right:20px;bottom:20px;z-index:9998;background:linear-gradient(135deg,#2563eb,#1a44b8);color:#fff;border:none;border-radius:50px;padding:15px 22px;font-family:${FONT_BODY};font-weight:700;font-size:15px;cursor:pointer;box-shadow:0 14px 34px #1d4ed866;display:flex;align-items:center;gap:9px;min-height:48px}
  .bsa-overlay{position:fixed;inset:0;background:#06080fdd;backdrop-filter:blur(6px);display:none;z-index:9999;align-items:flex-start;justify-content:center;overflow-y:auto;padding:24px 16px}
  .bsa-overlay.open{display:flex}
  .bsa-overlay .bsa-card{margin-top:24px;position:relative}
  .bsa-x{position:absolute;top:16px;right:16px;width:40px;height:40px;border-radius:10px;border:none;cursor:pointer;background:#1a2236;color:#c3d0e6;font-size:22px;line-height:1}
  body.bsa-lock{overflow:hidden}
  @media(max-width:520px){.bsa-grid{grid-template-columns:1fr}.bsa-title{font-size:29px}.bsa-fab{right:14px;bottom:14px;padding:14px 18px;font-size:14px}}
  @media (prefers-reduced-motion: reduce){.bsa *{transition:none!important}}
  `;
  const style = document.createElement("style"); style.textContent = css; document.head.appendChild(style);

  function esc(s) { return String(s).replace(/"/g, "&quot;"); }

  function fieldHTML(f) {
    const id = f.id ? `data-id="${f.id}"` : "";
    const watch = f.id ? `data-watch="1"` : "";
    const hide = f.hideWhen ? `data-hidewhen="${f.hideWhen}"` : "";
    const tgt = f.col ? `data-col="${f.col}"` : `data-note="${esc(f.note)}"`;
    const num = f.num ? `data-num="1" inputmode="numeric"` : "";
    const aria = `aria-label="${esc(f.label)}"`;
    let control;
    if (f.sel) control = `<select ${tgt} ${id} ${watch} ${aria}><option value="">— оберіть —</option>${f.sel.map(o => `<option>${o}</option>`).join("")}</select>`;
    else control = `<input ${tgt} ${num} ${aria} placeholder="${esc(f.ph || "")}">`;
    return `<div class="bsa-f" ${hide}><label>${f.label}</label>${control}</div>`;
  }

  const serviceSelect = P.service ? "" : `<div class="bsa-f full"><label>Послуга</label><select data-service aria-label="Послуга">${ALL_SERVICES.map(s => `<option>${s}</option>`).join("")}</select></div>`;
  const extraFields = P.fields.map(fieldHTML).join("");

  const formHTML = `
  <div class="bsa"><div class="bsa-card" data-card>
    <div class="bsa-eyebrow">${P.eyebrow}</div>
    <div class="bsa-title">${P.title}</div>
    <div class="bsa-sub">${P.sub}</div>
    <div class="bsa-err" data-err role="alert"></div>
    <div data-form>
      <div class="bsa-grid">
        <div class="bsa-f"><label>Ім'я <span class="req">*</span></label><input data-col="name" aria-label="Ім'я" autocomplete="name" placeholder="Ваше ім'я"></div>
        <div class="bsa-f"><label>Телефон <span class="req">*</span></label><input data-col="phone" aria-label="Телефон" type="tel" autocomplete="tel" inputmode="tel" placeholder="+380…"></div>
        ${serviceSelect}${extraFields}
      </div>
      <div class="bsa-f full" style="margin-top:12px"><label>Коментар</label><textarea data-col="notes" aria-label="Коментар" placeholder="Коротко опишіть запит…"></textarea></div>
      <button type="button" class="bsa-btn" data-submit>${P.cta}</button>
      <div class="bsa-alt">Або одразу — <a href="${CONFIG.TELEGRAM}" target="_blank" rel="noopener">написати в Telegram</a></div>
      <div class="bsa-note">Надсилаючи заявку, ви погоджуєтесь на обробку контактних даних.</div>
      <div class="bsa-hp" aria-hidden="true"><label>Не заповнюйте це поле</label><input type="text" name="website" data-hp tabindex="-1" autocomplete="off"></div>
    </div>
    <div class="bsa-ok" data-ok style="display:none">
      <div class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></div>
      <h3>Заявку прийнято!</h3><p>Ми зв'яжемось із вами найближчим часом.</p>
      <a class="bsa-ghost" href="${CONFIG.TELEGRAM}" target="_blank" rel="noopener">Написати в Telegram</a>
    </div>
  </div></div>`;

  function mount() {
    const root = document.getElementById("bsa-lead-root");
    if (root) root.innerHTML = formHTML;

    const fab = document.createElement("button");
    fab.type = "button";
    fab.className = "bsa-fab";
    fab.setAttribute("aria-label", P.fab.replace(/^\S+\s*/, "") || "Залишити заявку");
    fab.innerHTML = P.fab;

    const overlay = document.createElement("div");
    overlay.className = "bsa-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", P.title);
    overlay.innerHTML = formHTML.replace('<div class="bsa-card" data-card>', '<div class="bsa-card" data-card><button type="button" class="bsa-x" data-close aria-label="Закрити">×</button>');

    document.body.appendChild(fab);
    document.body.appendChild(overlay);

    function open() {
      overlay.classList.add("open");
      document.body.classList.add("bsa-lock");
      const first = overlay.querySelector("input,select,textarea");
      if (first) setTimeout(() => first.focus(), 40);
    }
    function close() {
      overlay.classList.remove("open");
      document.body.classList.remove("bsa-lock");
      fab.focus();
    }
    fab.addEventListener("click", open);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay || e.target.closest("[data-close]")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("open")) close();
    });

    if (root) wire(root.querySelector(".bsa"));
    wire(overlay.querySelector(".bsa"));
  }

  function trackLead(lead) {
    try {
      if (typeof window.__loadGtag === "function") window.__loadGtag();
      if (typeof window.gtag !== "function") return;
      window.gtag("event", "generate_lead", {
        event_category: "lead",
        event_label: lead.service || "Інше",
        page: pageKey,
      });
      if (CONFIG.ADS_LEAD_LABEL) {
        window.gtag("event", "conversion", { send_to: CONFIG.ADS_LEAD_LABEL });
      }
    } catch (e) { /* трекінг не має ламати відправку заявки */ }
  }

  function wire(scope) {
    const applyHide = () => {
      scope.querySelectorAll("[data-hidewhen]").forEach(box => {
        const [wid, val] = box.getAttribute("data-hidewhen").split("=");
        const watched = scope.querySelector(`[data-id="${wid}"]`);
        const hide = watched && watched.value === val;
        box.classList.toggle("hidden", !!hide);
        if (hide) { const c = box.querySelector("[data-col],[data-note]"); if (c) c.value = ""; }
      });
    };
    scope.querySelectorAll("[data-watch]").forEach(el => el.addEventListener("change", applyHide));
    applyHide();

    const errBox = scope.querySelector("[data-err]");
    const btn = scope.querySelector("[data-submit]");

    const openedAt = Date.now();

    async function submit() {
      errBox.style.display = "none";

      // Honeypot: люди цього поля не бачать, боти заповнюють усе.
      const hp = scope.querySelector("[data-hp]");
      if (hp && hp.value.trim() !== "") {
        // Показуємо "успіх", але нічого не надсилаємо — бот не дізнається, що його відсіяли.
        scope.querySelector("[data-form]").style.display = "none";
        scope.querySelector("[data-ok]").style.display = "block";
        return;
      }
      // Людина не заповнить форму швидше за 2 секунди.
      if (Date.now() - openedAt < 2000) {
        scope.querySelector("[data-form]").style.display = "none";
        scope.querySelector("[data-ok]").style.display = "block";
        return;
      }

      const lead = { source: "Сайт", stage: "Новий лід", client_type: "Фіз. особа", service: P.service || "Інше" };
      const svc = scope.querySelector("[data-service]"); if (svc) lead.service = svc.value;
      const noteLines = [];
      scope.querySelectorAll("[data-col],[data-note]").forEach(el => {
        const box = el.closest(".bsa-f");
        if (box && box.classList.contains("hidden")) return;
        const v = (el.value || "").trim(); if (!v) return;
        if (el.hasAttribute("data-col")) {
          const col = el.getAttribute("data-col");
          if (col === "notes") { noteLines.unshift(v); return; }
          lead[col] = el.hasAttribute("data-num") ? (parseFloat(v) || null) : v;
        } else noteLines.push(`${el.getAttribute("data-note")}: ${v}`);
      });
      lead.notes = noteLines.length ? noteLines.join(" · ") : null;

      if (!lead.name || !lead.phone) {
        errBox.textContent = "Будь ласка, вкажіть ім'я та телефон.";
        errBox.style.display = "block";
        const bad = scope.querySelector(lead.name ? '[data-col="phone"]' : '[data-col="name"]');
        if (bad) bad.focus();
        return;
      }

      btn.disabled = true; const lbl = btn.textContent; btn.textContent = "Надсилаємо…";
      const ok = await sendLead(lead);
      btn.disabled = false; btn.textContent = lbl;

      if (ok) {
        trackLead(lead);
        scope.querySelector("[data-form]").style.display = "none";
        scope.querySelector("[data-ok]").style.display = "block";
      } else {
        errBox.innerHTML = `Не вдалося надіслати автоматично. Напишіть у <a href="${CONFIG.TELEGRAM}" target="_blank" rel="noopener" style="color:#93b8ff">Telegram</a> або ${CONFIG.PHONE}.`;
        errBox.style.display = "block";
      }
    }

    btn.addEventListener("click", submit);
    scope.querySelectorAll("input").forEach(inp => {
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); submit(); }
      });
    });
  }

  async function sendLead(lead) {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
      console.log("[BSA demo] Заявка (Supabase не налаштований):", lead);
      await new Promise(r => setTimeout(r, 600)); return true;
    }
    try {
      const res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": CONFIG.SUPABASE_ANON_KEY, "Authorization": "Bearer " + CONFIG.SUPABASE_ANON_KEY, "Prefer": "return=minimal" },
        body: JSON.stringify(lead),
      });
      return res.ok;
    } catch (e) { console.error("[BSA] send error", e); return false; }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
