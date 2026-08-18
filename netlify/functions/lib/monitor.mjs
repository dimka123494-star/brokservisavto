// netlify/functions/lib/monitor.mjs — версія 3
// Нове: автоматичний обхід 403 через читальний проксі r.jina.ai,
// відсів навігаційних посилань і назв постійних розділів.

export const SOURCES = [
  { id: 'hsc',     name: 'ГСЦ МВС',              type: 'rss',  url: 'https://hsc.gov.ua/category/novini/feed/' },
  { id: 'customs', name: 'Держмитслужба',        type: 'html', url: 'https://customs.gov.ua/news' },
  { id: 'tax',     name: 'ДПС',                  type: 'html', url: 'https://tax.gov.ua/media-tsentr/novini/' },
  { id: 'kmu',     name: 'Кабмін (акти)',        type: 'html', url: 'https://www.kmu.gov.ua/npas' },
  { id: 'spfu',    name: 'ФДМУ',                 type: 'html', url: 'https://www.spfu.gov.ua/ua/news/press-news.html' },
  { id: 'rada',    name: 'Нове в законодавстві', type: 'html', url: 'https://zakon.rada.gov.ua/laws/main/new' },
];

// ── Слова-тригери ──

export const STRONG_AUTO = [
  'акциз', 'розмитн', 'митне оформленн', 'митна деклараці', 'електромобіл', 'електрокар',
  'транспортн засоб', 'автомобіл', 'номерн знак', 'свідоцтво про реєстрац',
  'пенсійн збір', 'договір купівлі-продажу', 'експертн огляд', 'eur.1',
  'утилізаційн', 'оцінка майна', 'оцінки майна', 'оцінку майна',
  'оцінка транспортн', 'оцінки транспортн', 'методик оцінк',
  'товарознавч', 'сертифікат відповідн', 'ввезення на митну територію',
  'технічний контроль', 'посвідчення водія', 'сервісн центр мвс',
  'кваліфікаційн свідоцтв', 'оцінювач',
];

export const STRONG_TAX = [
  'пдфо', 'військовий збір', 'військового збору', 'єдиний податок', 'єдиного податку',
  'єсв', 'єдиного внеску', 'фоп', 'податков накладн', 'рро', 'прро',
  'податкова деклараці', 'податкової деклараці', 'податковий кодекс', 'податкового кодексу',
  'мінімальн заробітн плат', 'прожитков мінімум',
];

export const WEAK = [
  'оцінк', 'мито', 'пільг', 'реєстрац', 'перереєстрац', 'зняття з обліку',
  'деклараці', 'ставк', 'преференц', 'вартісн поріг', 'імпорт', 'ввезенн', 'вивезенн',
];

export const CONTEXT = [
  'авто', 'транспортн', 'митн', 'майна', 'майно', 'податк', 'збір', 'збору',
  'оцінювач', 'водій', 'кузов', 'двигун', 'причеп', 'мотоцикл', 'вантажівк',
];

const TAX_CONTEXT = ['податк', 'збір', 'збору', 'деклараці', 'фоп', 'єсв'];

export const STOPWORDS = [
  // адміністративний шум
  'вакансі', 'безбар', 'конкурс на зайняття', 'закупівл', 'нагородж', 'привітан',
  'флешмоб', 'екзаменаційн', 'правила дорожнього руху', 'соціальн мереж',
  'день народжен', 'меморандум', 'робоча зустріч', 'вебінар',
  // не наша галузь
  'ефективності діяльності', 'ефективност діяльност', 'антикорупц', 'назк', 'набу',
  'склад комісії', 'комісії з проведення', 'секретаріат',
  'приватизац', 'аукціон', 'оренди державного майна', 'оренда державного майна',
  'земельн банк', 'прозорро',
  // назви постійних розділів, а не новини
  'розділ державного реєстру', 'рішення про видачу сертифікат',
  'рішення про відкликання', 'рішення про анулювання', 'листи про відкликання',
  'інформаційні листи', 'накази про включення', 'яким зупинено доступ',
  'діяльність суб', 'перелік суб',
  // не наш бік процесу
  'експорт транспортних засобів', 'вітчизняного виробництва',
];

// ── Посилання, які точно не є новиною ──

const URL_DENY = [
  '/category/', '/tag/', '/page/', '/author/', '/documents/', '/content/',
  '/regions/', '/about', '/contact', '/faq', '/search', '/rss', '/feed',
  '.pdf', '.doc', '.xls', '.zip', '.rar', '.jpg', '.png',
];

function looksLikeArticle(url) {
  const low = url.toLowerCase();
  if (URL_DENY.some((d) => low.includes(d))) return false;
  // У справжніх публікацій в адресі майже завжди є дата або числовий ідентифікатор
  return /\d{3,}/.test(low);
}

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

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'uk-UA,uk;q=0.9,en;q=0.8',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Upgrade-Insecure-Requests': '1',
};

// Пряме звернення
async function grabDirect(url) {
  const res = await fetch(url, { headers: BROWSER_HEADERS, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

// Обхід через читальний проксі — повертає сторінку у вигляді markdown
async function grabViaReader(url) {
  const res = await fetch(`https://r.jina.ai/${url}`, {
    headers: { 'User-Agent': BROWSER_HEADERS['User-Agent'], 'Accept': 'text/plain' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Проксі HTTP ${res.status}`);
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
    if (title.length < 15 || title.length > 300) continue;
    let abs;
    try { abs = new URL(m[1], base).href; } catch { continue; }
    if (new URL(abs).hostname !== base.hostname) continue;
    if (!looksLikeArticle(abs)) continue;
    if (seen.has(abs)) continue;
    seen.add(abs);
    out.push({ title, url: abs, published_at: null });
  }
  return out;
}

// Проксі віддає markdown: [заголовок](адреса)
function parseMarkdown(text, baseUrl) {
  const out = [];
  const seen = new Set();
  const host = new URL(baseUrl).hostname;
  const re = /\[([^\]\n]{15,300})\]\((https?:\/\/[^\s)]+)\)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const title = decode(m[1]);
    const url = m[2];
    let h;
    try { h = new URL(url).hostname; } catch { continue; }
    if (h !== host) continue;
    if (!looksLikeArticle(url)) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    out.push({ title, url, published_at: null });
  }
  return out;
}

// ── Фільтр ──

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

  const weak = WEAK.filter((w) => t.includes(w));
  if (!weak.length) return null;
  const ctx = CONTEXT.filter((w) => t.includes(w));
  if (!ctx.length) return null;

  return {
    category: TAX_CONTEXT.some((w) => t.includes(w)) ? 'tax' : 'auto',
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
    const note = { source: src.name };
    let items = [];

    try {
      const body = await grabDirect(src.url);
      items = src.type === 'rss' ? parseRss(body) : parseHtml(body, src.url);
      note.спосіб = 'прямо';
    } catch (e) {
      // Сайт відмовив — пробуємо через читальний проксі
      try {
        const body = await grabViaReader(src.url);
        items = parseMarkdown(body, src.url);
        note.спосіб = 'через проксі';
      } catch (e2) {
        note.помилка = `${e.message} → ${e2.message}`;
        report.push(note);
        continue;
      }
    }

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

    note.знайдено = items.length;
    note.підійшло = hits;
    report.push(note);
  }

  let saved = 0;
  try {
    saved = await saveRows(all);
  } catch (e) {
    report.push({ source: 'Supabase', помилка: String(e.message || e) });
  }

  return { час: new Date().toISOString(), нових_записів: saved, джерела: report };
}
