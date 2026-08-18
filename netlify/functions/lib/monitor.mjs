// netlify/functions/lib/monitor.mjs — версія 2
// Зміни: двоступеневий фільтр, ширші стоп-слова, браузерні заголовки,
// виправлена адреса ФДМУ, менший поріг довжини заголовка.

export const SOURCES = [
  { id: 'hsc',     name: 'ГСЦ МВС',              type: 'rss',  url: 'https://hsc.gov.ua/category/novini/feed/' },
  { id: 'customs', name: 'Держмитслужба',        type: 'html', url: 'https://customs.gov.ua/news' },
  { id: 'tax',     name: 'ДПС',                  type: 'html', url: 'https://tax.gov.ua/media-tsentr/novini/' },
  { id: 'kmu',     name: 'Кабмін (акти)',        type: 'html', url: 'https://www.kmu.gov.ua/npas' },
  { id: 'spfu',    name: 'ФДМУ',                 type: 'html', url: 'https://www.spfu.gov.ua/ua/news/press-news.html' },
  { id: 'rada',    name: 'Нове в законодавстві', type: 'html', url: 'https://zakon.rada.gov.ua/laws/main/new' },
];

// ── РІВЕНЬ 1: однозначні слова, спрацьовують самі по собі ──

export const STRONG_AUTO = [
  'акциз', 'розмитн', 'митне оформленн', 'митна деклараці', 'електромобіл', 'електрокар',
  'транспортн засоб', 'автомобіл', 'номерн знак', 'свідоцтво про реєстрац',
  'пенсійн збір', 'договір купівлі-продажу', 'експертн огляд', 'eur.1',
  'утилізаційн', 'оцінка майна', 'оцінки майна', 'оцінку майна',
  'оцінка транспортн', 'оцінки транспортн', 'оціночн діяльн', 'оціночної діяльн',
  'товарознавч', 'сертифікат відповідн', 'ввезення на митну територію',
  'технічний контроль', 'посвідчення водія', 'сервісн центр мвс',
];

export const STRONG_TAX = [
  'пдфо', 'військовий збір', 'військового збору', 'єдиний податок', 'єдиного податку',
  'єсв', 'єдиного внеску', 'фоп', 'податков накладн', 'рро', 'прро',
  'податкова деклараці', 'податкової деклараці', 'податковий кодекс', 'податкового кодексу',
  'мінімальн заробітн плат', 'прожитков мінімум',
];

// ── РІВЕНЬ 2: багатозначні слова. Потрібен ще й контекст ──

export const WEAK = [
  'оцінк', 'мито', 'пільг', 'реєстрац', 'перереєстрац', 'зняття з обліку',
  'деклараці', 'ставк', 'преференц', 'вартісн поріг', 'імпорт', 'ввезенн', 'вивезенн',
];

export const CONTEXT = [
  'авто', 'транспортн', 'митн', 'майна', 'майно', 'податк', 'збір', 'збору',
  'оцінювач', 'водій', 'кузов', 'двигун', 'причеп', 'мотоцикл', 'вантажівк',
];

// Контекст, який означає «це податкова тема, не автомобільна»
const TAX_CONTEXT = ['податк', 'збір', 'збору', 'деклараці', 'фоп', 'єсв'];

// ── СТОП-СЛОВА: якщо є — новина відкидається завжди ──

export const STOPWORDS = [
  // адміністративний шум
  'вакансі', 'безбар', 'конкурс на зайняття', 'закупівл', 'нагородж', 'привітан',
  'флешмоб', 'екзаменаційн', 'правила дорожнього руху', 'соціальн мереж',
  'день народжен', 'меморандум про співпрац', 'робоча зустріч', 'вебінар',
  // не наша галузь
  'ефективності діяльності', 'ефективност діяльност', 'антикорупц', 'назк', 'набу',
  'склад комісії', 'комісії з проведення', 'секретаріат', 'аудиту) ефективності',
  'приватизац', 'аукціон', 'оренди державного майна', 'оренда державного майна',
  'земельн банк', 'прозорро',
  // не наш бік процесу
  'експорт транспортних засобів', 'вітчизняного виробництва',
];

// ── Допоміжне ──

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

// Заголовки, максимально схожі на справжній браузер — проти 403
async function grab(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Chromium";v="126", "Not:A-Brand";v="24"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"macOS"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

// ── Парсери ──

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
    if (!title || !link) continue;
    const pub = pickTag(raw, 'pubDate');
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
    if (title.length < 12 || title.length > 300) continue;
    let abs;
    try {
      abs = new URL(m[1], base).href;
    } catch { continue; }
    if (new URL(abs).hostname !== base.hostname) continue;
    if (seen.has(abs)) continue;
    seen.add(abs);
    out.push({ title, url: abs, published_at: null });
  }
  return out;
}

// ── Двоступеневий фільтр ──

function classify(title) {
  const t = title.toLowerCase();
  if (STOPWORDS.some((w) => t.includes(w))) return null;

  const sa = STRONG_AUTO.filter((w) => t.includes(w));
  const st = STRONG_TAX.filter((w) => t.includes(w));

  if (sa.length || st.length) {
    return {
      category: sa.length >= st.length ? 'auto' : 'tax',
      matched: [...new Set([...sa, ...st])],
    };
  }

  // Нічого однозначного — пробуємо пару «багатозначне слово + контекст»
  const weak = WEAK.filter((w) => t.includes(w));
  if (!weak.length) return null;
  const ctx = CONTEXT.filter((w) => t.includes(w));
  if (!ctx.length) return null;

  const isTax = TAX_CONTEXT.some((w) => t.includes(w));
  return {
    category: isTax ? 'tax' : 'auto',
    matched: [...new Set([...weak, ...ctx])],
  };
}

// ── Запис у Supabase ──

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

// ── Головна ──

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
