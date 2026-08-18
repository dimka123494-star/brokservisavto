// netlify/functions/news-monitor-run.mjs
// Ручний запуск для перевірки:
//   https://твійсайт/.netlify/functions/news-monitor-run?token=ТВІЙ_ТОКЕН
// Токен задається змінною середовища MONITOR_TOKEN.

import { runMonitor } from './lib/monitor.mjs';

export default async (req) => {
  const token = new URL(req.url).searchParams.get('token');
  const expected = process.env.MONITOR_TOKEN;

  if (!expected) {
    return new Response('Не задано MONITOR_TOKEN у змінних середовища Netlify', { status: 500 });
  }
  if (token !== expected) {
    return new Response('Невірний токен', { status: 401 });
  }

  const result = await runMonitor();
  return new Response(JSON.stringify(result, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
