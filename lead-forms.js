/* ============================================================================
   BROKSERVISAVTO — форми заявки під кожну послугу (один файл на всі сторінки)
   Сторінка визначається автоматично за URL.
   Підключення на КОЖНІЙ сторінці одним рядком перед </body>:
       <script src="/lead-forms.js" defer></script>
   ↓↓↓  ВПИШИ СВОЇ КЛЮЧІ SUPABASE ТУТ  ↓↓↓
   ============================================================================ */
(function () {
  const CONFIG = {
    SUPABASE_URL: "https://rhduokjaawmorcyiuviy.supabase.co/rest/v1/",        // <-- сюди Project URL, напр. https://abcdxyz.supabase.co
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoZHVva2phYXdtb3JjeWl1dml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NDE1NDgsImV4cCI6MjA5NjQxNzU0OH0.usjLWtdJW0OJt8dgUfCnkVljKN6kpG7vJ907Y_XWieg",   // <-- сюди anon public key
    TELEGRAM: "https://t.me/Dimakrykun95",
    PHONE: "+380981722342",
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

  const css = `
  @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');
  .bsa{--acc:#3b82f6;font-family:'Hanken Grotesk',system-ui,sans-serif}
  .bsa *{box-sizing:border-box}
  .bsa-card{max-width:560px;margin:0 auto;background:linear-gradient(180deg,#141b2b,#0e1320);border:1px solid #1f2940;border-radius:22px;padding:30px 28px;color:#e7ecf5;box-shadow:0 30px 80px #00000055}
  .bsa-eyebrow{font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#5e7fb8}
  .bsa-title{font-family:'Archivo';font-weight:800;font-size:27px;line-height:1.15;margin:8px 0 6px;color:#fff}
  .bsa-sub{color:#9fb0cc;font-size:14px;margin-bottom:22px}
  .bsa-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .bsa-f{display:flex;flex-direction:column;gap:6px}
  .bsa-f.full{grid-column:1/-1}
  .bsa-f label{font-size:12.5px;font-weight:600;color:#9fb0cc}
  .bsa-f label .req{color:#f87171}
  .bsa-f input,.bsa-f select,.bsa-f textarea{width:100%;background:#0c1220;border:1px solid #25314c;border-radius:12px;padding:13px 14px;color:#fff;font-size:14.5px;font-family:inherit;outline:none;transition:.15s}
  .bsa-f input::placeholder{color:#5b6985}
  .bsa-f input:focus,.bsa-f select:focus,.bsa-f textarea:focus{border-color:var(--acc);box-shadow:0 0 0 3px #3b82f633}
  .bsa-f textarea{resize:vertical;min-height:62px}
  .bsa-f.hidden{display:none}
  .bsa-btn{width:100%;border:none;cursor:pointer;border-radius:13px;padding:15px;margin-top:14px;font-family:'Archivo';font-weight:700;font-size:15.5px;color:#fff;background:linear-gradient(135deg,#3b82f6,#1d4ed8);box-shadow:0 10px 26px #1d4ed855;transition:.15s}
  .bsa-btn:hover{filter:brightness(1.07);transform:translateY(-1px)}
  .bsa-btn:disabled{opacity:.6;cursor:default;transform:none}
  .bsa-alt{text-align:center;margin-top:16px;font-size:13px;color:#8294b3}
  .bsa-alt a{color:#7aa6ff;font-weight:600;text-decoration:none}
  .bsa-note{font-size:11.5px;color:#5b6985;text-align:center;margin-top:14px}
  .bsa-err{background:#3a1620;border:1px solid #7f1d2e;color:#fda4af;border-radius:10px;padding:10px 12px;font-size:13px;margin-bottom:14px;display:none}
  .bsa-ok{text-align:center;padding:12px 0}
  .bsa-ok .ic{width:70px;height:70px;border-radius:50%;margin:0 auto 18px;display:grid;place-items:center;background:radial-gradient(circle at 30% 30%,#22c55e,#15803d);box-shadow:0 12px 30px #16a34a55}
  .bsa-ok .ic svg{width:34px;height:34px;stroke:#fff;stroke-width:3;fill:none}
  .bsa-ok h3{font-family:'Archivo';font-size:23px;color:#fff;margin:0 0 8px}
  .bsa-ok p{color:#9fb0cc;font-size:14px;margin:0 0 20px}
  .bsa-ghost{display:inline-block;border:1px solid #2c3a5a;border-radius:11px;padding:11px 20px;color:#cdd9ef;font-weight:600;text-decoration:none;font-size:14px}
  .bsa-fab{position:fixed;right:20px;bottom:20px;z-index:9998;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;border:none;border-radius:50px;padding:15px 22px;font-family:'Archivo';font-weight:700;font-size:15px;cursor:pointer;box-shadow:0 14px 34px #1d4ed866;display:flex;align-items:center;gap:9px}
  .bsa-overlay{position:fixed;inset:0;background:#06080fcc;backdrop-filter:blur(6px);display:none;z-index:9999;align-items:flex-start;justify-content:center;overflow-y:auto;padding:24px 16px}
  .bsa-overlay.open{display:flex}
  .bsa-overlay .bsa-card{margin-top:24px;position:relative}
  .bsa-x{position:absolute;top:16px;right:16px;width:36px;height:36px;border-radius:10px;border:none;cursor:pointer;background:#1a2236;color:#9fb0cc;font-size:20px;line-height:1}
  @media(max-width:520px){.bsa-grid{grid-template-columns:1fr}.bsa-title{font-size:23px}}
  `;
  const style = document.createElement("style"); style.textContent = css; document.head.appendChild(style);

  function fieldHTML(f) {
    const id = f.id ? `data-id="${f.id}"` : "";
    const watch = f.id ? `data-watch="1"` : "";
    const hide = f.hideWhen ? `data-hidewhen="${f.hideWhen}"` : "";
    const tgt = f.col ? `data-col="${f.col}"` : `data-note="${f.note}"`;
    const num = f.num ? `data-num="1" inputmode="numeric"` : "";
    let control;
    if (f.sel) control = `<select ${tgt} ${id} ${watch}><option value="">— оберіть —</option>${f.sel.map(o => `<option>${o}</option>`).join("")}</select>`;
    else control = `<input ${tgt} ${num} placeholder="${f.ph || ""}">`;
    return `<div class="bsa-f" ${hide}><label>${f.label}</label>${control}</div>`;
  }

  const serviceSelect = P.service ? "" : `<div class="bsa-f full"><label>Послуга</label><select data-service>${ALL_SERVICES.map(s => `<option>${s}</option>`).join("")}</select></div>`;
  const extraFields = P.fields.map(fieldHTML).join("");

  const formHTML = `
  <div class="bsa"><div class="bsa-card" data-card>
    <div class="bsa-eyebrow">${P.eyebrow}</div>
    <div class="bsa-title">${P.title}</div>
    <div class="bsa-sub">${P.sub}</div>
    <div class="bsa-err" data-err></div>
    <div data-form>
      <div class="bsa-grid">
        <div class="bsa-f"><label>Ім'я <span class="req">*</span></label><input data-col="name" placeholder="Ваше ім'я"></div>
        <div class="bsa-f"><label>Телефон <span class="req">*</span></label><input data-col="phone" placeholder="+380…"></div>
        ${serviceSelect}${extraFields}
      </div>
      <div class="bsa-f full" style="margin-top:12px"><label>Коментар</label><textarea data-col="notes" placeholder="Коротко опишіть запит…"></textarea></div>
      <button class="bsa-btn" data-submit>${P.cta}</button>
      <div class="bsa-alt">Або одразу — <a href="${CONFIG.TELEGRAM}" target="_blank" rel="noopener">написати в Telegram</a></div>
      <div class="bsa-note">Надсилаючи заявку, ви погоджуєтесь на обробку контактних даних.</div>
    </div>
    <div class="bsa-ok" data-ok style="display:none">
      <div class="ic"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>
      <h3>Заявку прийнято!</h3><p>Ми зв'яжемось із вами найближчим часом.</p>
      <a class="bsa-ghost" href="${CONFIG.TELEGRAM}" target="_blank" rel="noopener">Написати в Telegram</a>
    </div>
  </div></div>`;

  function mount() {
    const root = document.getElementById("bsa-lead-root");
    if (root) root.innerHTML = formHTML;
    const fab = document.createElement("button");
    fab.className = "bsa-fab"; fab.innerHTML = P.fab;
    const overlay = document.createElement("div");
    overlay.className = "bsa-overlay";
    overlay.innerHTML = formHTML.replace('<div class="bsa-card" data-card>', '<div class="bsa-card" data-card><button class="bsa-x" data-close>×</button>');
    document.body.appendChild(fab); document.body.appendChild(overlay);
    fab.onclick = () => overlay.classList.add("open");
    overlay.addEventListener("click", (e) => { if (e.target === overlay || e.target.hasAttribute("data-close")) overlay.classList.remove("open"); });
    if (root) wire(root.querySelector(".bsa"));
    wire(overlay.querySelector(".bsa"));
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
    btn.addEventListener("click", async () => {
      errBox.style.display = "none";
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
      if (!lead.name || !lead.phone) { errBox.textContent = "Будь ласка, вкажіть ім'я та телефон."; errBox.style.display = "block"; return; }
      btn.disabled = true; const lbl = btn.textContent; btn.textContent = "Надсилаємо…";
      const ok = await sendLead(lead);
      btn.disabled = false; btn.textContent = lbl;
      if (ok) { scope.querySelector("[data-form]").style.display = "none"; scope.querySelector("[data-ok]").style.display = "block"; }
      else { errBox.innerHTML = `Не вдалося надіслати автоматично. Напишіть у <a href="${CONFIG.TELEGRAM}" target="_blank" style="color:#7aa6ff">Telegram</a> або ${CONFIG.PHONE}.`; errBox.style.display = "block"; }
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
