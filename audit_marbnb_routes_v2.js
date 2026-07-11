const http = require('http');
const https = require('https');

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
    const lib = url.protocol === 'https:' ? https : http;

    const req = lib.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk.toString());
      res.on('end', () => {
        const lower = data.toLowerCase();
        const hasHtml = lower.includes('<html') || lower.includes('<!doctype');

        // On évite les faux positifs de Next dev.
        // Le premier audit considérait "NEXT_ERROR" même quand la page chargeait en 200.
        const realErrorSignals = [
          'application error: a client-side exception has occurred',
          '500 internal server error',
          'error: failed to fetch',
          'uncaught runtime error',
          'this page could not be found',
          'not-found boundary',
          'digest:'
        ];

        const hasRealError = realErrorSignals.some((sig) => lower.includes(sig));
        const ok = res.statusCode >= 200 && res.statusCode < 400 && hasHtml && !hasRealError;

        resolve({
          route,
          status: res.statusCode,
          ok,
          bytes: data.length,
          hasHtml,
          hasRealError
        });
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
  console.log('Audit Marbnb v2');
  console.log('URL testee:', BASE);
  console.log('----------------------------------------');

  const results = [];
  for (const route of routes) {
    const res = await checkRoute(route);
    results.push(res);
    const icon = res.ok ? 'OK ' : 'ERR';
    const details = res.error ? ` error=${res.error}` : res.hasRealError ? ' REAL_ERROR' : '';
    console.log(`${icon} ${route.padEnd(28)} status=${String(res.status).padEnd(7)} bytes=${res.bytes}${details}`);
  }

  console.log('----------------------------------------');
  const failed = results.filter(r => !r.ok);

  const notFound = results.filter(r => r.status === 404);
  if (notFound.length > 0) {
    console.log('Pages absentes / facultatives en 404:');
    for (const r of notFound) console.log('- ' + r.route);
  }

  if (failed.length === 0) {
    console.log('OK Toutes les pages principales repondent correctement.');
  } else {
    console.log(`${failed.length} page(s) a verifier:`);
    for (const f of failed) console.log(`- ${f.route} : ${f.status} ${f.error || ''}`);
    process.exitCode = 1;
  }
}

main();
