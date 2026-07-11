const http = require('http');

const BASE = process.env.MARBNB_URL || 'http://localhost:3000';

const routes = [
  '/',
  '/resultats',
  '/compte',
  '/hote',
  '/installation',
  '/admin-login',
  '/admin-dashboard',
  '/admin-reservations',
  '/admin-utilisateurs',
  '/favoris',
  '/reservation-confirmation',
  '/logement/1'
];

function checkRoute(route) {
  return new Promise((resolve) => {
    const url = new URL(route, BASE);
    const lib = url.protocol === 'https:' ? require('https') : require('http');
    const req = lib.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk.toString());
      res.on('end', () => {
        const lower = data.toLowerCase();
        const hasHtml = lower.includes('<html') || lower.includes('<!doctype');
        const hasNextError = lower.includes('application error') || lower.includes('this page could not be found') || lower.includes('runtime error') || lower.includes('hydration');
        resolve({ route, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 && hasHtml && !hasNextError, bytes: data.length, hasNextError });
      });
    });
    req.on('error', (err) => resolve({ route, status: 'ERROR', ok: false, bytes: 0, error: err.message }));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ route, status: 'TIMEOUT', ok: false, bytes: 0, error: 'Timeout 8s' });
    });
  });
}

async function main() {
  console.log('Audit Marbnb');
  console.log('URL testée:', BASE);
  console.log('----------------------------------------');

  const results = [];
  for (const route of routes) {
    const res = await checkRoute(route);
    results.push(res);
    const icon = res.ok ? '✅' : '❌';
    console.log(`${icon} ${route.padEnd(28)} status=${String(res.status).padEnd(7)} bytes=${res.bytes}${res.error ? ' error=' + res.error : ''}${res.hasNextError ? ' NEXT_ERROR' : ''}`);
  }

  console.log('----------------------------------------');
  const failed = results.filter(r => !r.ok);
  if (failed.length === 0) {
    console.log('✅ Toutes les pages principales répondent correctement.');
  } else {
    console.log(`❌ ${failed.length} page(s) à vérifier:`);
    for (const f of failed) console.log(`- ${f.route} : ${f.status} ${f.error || ''}`);
    process.exitCode = 1;
  }
}

main();
