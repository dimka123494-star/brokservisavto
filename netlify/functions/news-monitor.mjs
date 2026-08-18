// netlify/functions/news-monitor.mjs
// Запускається автоматично щодня о 06:00 UTC (09:00 за Києвом влітку).

import { runMonitor } from './lib/monitor.mjs';

export default async () => {
  const result = await runMonitor();
  console.log('news-monitor:', JSON.stringify(result, null, 2));
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const config = {
  schedule: '0 6 * * *',
};
