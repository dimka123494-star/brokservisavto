// netlify/functions/lib/monitor.mjs
// Спільна логіка. Цей файл НЕ є окремою функцією — лежить у підпапці lib/.

// ---------- ДЖЕРЕЛА ----------
// type: 'rss'  — стандартна RSS-стрічка
// type: 'html' — сторінка списку, збираємо всі посилання
// Якщо джерело не працює — воно просто нічого не поверне,
// а в результаті ручного запуску буде видно помилку.

export const SOURCES = [
  { id: 'hsc',     name: 'ГСЦ МВС',              type: 'rss',  url: 'https://hsc.gov.ua/category/novini/feed/' },
  { id: 'customs', name: 'Держмитслужба',        type: 'html', url: 'https://customs.gov.ua/news' },
  { id: 'tax',     name: 'ДПС',                  type: 'html', url: 'https://tax.gov.ua/media-tsentr/novini/' },
  { id: 'kmu',     name: 'Кабмін (акти)',        type: 'html', url: 'https://www.kmu.gov.ua/npas' },
  { id: 'spfu',    name: 'ФДМУ',                 type: 'html', url: 'https://www.spfu.gov.ua/ua/news.html' },
  { id: 'rada',    name: 'Нове в законодавстві', type: 'html', url: 'https://zakon.rada.gov.ua/laws/main/new' },
];

// ---------- СЛОВА-ТРИГЕРИ ----------
// Тільки в нижньому регістрі, без закінчень — щоб ловило всі форми.

export const KEYWORDS_AUTO = [
  'акциз', 'розмитн', 'мито', 'митн', 'електромобіл', 'електрокар',
  'ввезен', 'імпорт авто', 'транспортн засоб', 'реєстрац тз',
  'перереєстрац', 'зняття з обліку', 'номерн знак', 'свідоцтво про реєстрац',
  'пенсійн збір', 'договір купівлі-продажу', 'оцінк', 'оціночн',
  'експертн огляд', 'сертифікат відповідн', 'eur.1', 'преференц',
  'утилізаційн', 'вартісн поріг', 'пільг на авто', 'ставк акциз',
];

export const KEYWORDS_TAX = [
  'пдфо', 'військов збір', 'єдиний податок', 'єсв', 'фоп',
  'податков накладн', 'рро', 'прро', 'декларац', 'ставк податк',
  'звітн період', 'мінімальн заробітн плат', 'прожитков мінімум',
];

// ---------- СЛОВА-ВИКЛЮЧЕННЯ ----------
// Якщо є в заголовку — новина ігнорується навіть за збігу.

export const STOPWORDS = [
  'вакансі', 'безбар', 'конкурс на зайняття', 'закупівл', 'нагородж',
  'привітан', 'флешмоб', 'екзаменаційн квитк', 'правила дорожнього руху',
  'соціальн мереж', 'день народжен', 'експорт транспортних засобів',
];

// ---------- ДОПОМІЖНЕ ----------

const ENTITIES = {
  '&amp;': '&', '&quot;': '"', '&apos;': "'", '&#039;': "'", '&#39;': "'",
  '&lt;': '<', '&gt;': '>', '&nbsp;': ' ', '&laquo;': '«', '&raquo;': '»',
  '&ndash;': '–', '&mdash;': '—', '&rsquo;': '’', '&#8217;': '’',
};

function decode(s) {
  return String(s || '')
    .replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTags(s) {
  return decode(String(s || '').replace(/<[^>]*>/g, ' '));
}

function pickTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  if (!m) return '';
  return decode(m[1].replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, ''));
}

async function grab(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; NewsMonitor/1.0)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'uk-UA,uk;q=0.9',
    },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

// ---------- ПАРСЕРИ ----------

function parseRss(xml) {
  const out = [];
  const blocks = xml.split(/<item[\s>]/i).slice(1);
  for (const raw of blocks) {
    const title = pickTag(raw, 'title');
    let link = pickTag(raw, 'link');
    if (!link) {
      const g = raw.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
      link = g ? decode(g[1]) : '';
    }
    const pub = pickTag(raw, 'pubDate');
    if (!title || !link) continue;
    let published = null;
    const d = new Date(pub);
    if (pub && !isNaN(d)) published = d.toISOString().slice(0, 10);
    out.push({ title, url: link, published_at: published });
  }
  return out;
}

function parseHtml(html, baseUrl) {
  const out = [];
  const seen = new Set();
  const base = new URL(baseUrl);
  const re = /<a\s[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const title = stripTags(m[2]);
    if (title.length < 25 || title.length > 300) continue;
    let abs;
    try {
      abs = new URL(m[1], base).href;
    } catch {
      continue;
    }
    if (new URL(abs).hostname !== base.hostname) continue;
    if (seen.has(abs)) continue;
    seen.add(abs);
    out.push({ title, url: abs, published_at: null });
  }
  return out;
}

// ---------- ФІЛЬТР ----------

function classify(title) {
  const t = title.toLowerCase();
  if (STOPWORDS.some((w) => t.includes(w))) return null;

  const auto = KEYWORDS_AUTO.filter((w) => t.includes(w));
  const tax = KEYWORDS_TAX.filter((w) => t.includes(w));
  if (!auto.length && !tax.length) return null;

  return {
    category: auto.length >= tax.length ? 'auto' : 'tax',
    matched: [...new Set([...auto, ...tax])],
  };
}

// ---------- ЗАПИС У SUPABASE ----------

async function saveRows(rows) {
  if (!rows.length) return 0;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Немає SUPABASE_URL або SUPABASE_SERVICE_ROLE_KEY');

  const res = await fetch(`${url}/rest/v1/news_monitor`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=ignore-duplicates,return=representation',
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  const saved = await res.json();
  return Array.isArray(saved) ? saved.length : 0;
}

// ---------- ГОЛОВНА ФУНКЦІЯ ----------

export async function runMonitor() {
  const report = [];
  const all = [];
  const seenUrls = new Set();

  for (const src of SOURCES) {
    try {
      const body = await grab(src.url);
      const items = src.type === 'rss' ? parseRss(body) : parseHtml(body, src.url);

      let hits = 0;
      for (const item of items) {
        const cls = classify(item.title);
        if (!cls) continue;
        if (seenUrls.has(item.url)) continue;
        seenUrls.add(item.url);
        hits++;
        all.push({
          title: item.title.slice(0, 500),
          url: item.url,
          source: src.name,
          source_id: src.id,
          category: cls.category,
          matched: cls.matched,
          published_at: item.published_at,
        });
      }

      report.push({ source: src.name, знайдено: items.length, підійшло: hits });
    } catch (e) {
      report.push({ source: src.name, помилка: String(e.message || e) });
    }
  }

  let saved = 0;
  try {
    saved = await saveRows(all);
  } catch (e) {
    report.push({ source: 'Supabase', помилка: String(e.message || e) });
  }

  return { час: new Date().toISOString(), нових_записів: saved, джерела: report };
}
