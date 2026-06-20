const fs = require('fs');
const path = require('path');

const root = process.cwd();
const envPath = path.join(root, '.env.local');
const libDir = path.join(root, 'lib');
const clientPath = path.join(libDir, 'supabaseClient.ts');

function clean(v) {
  return (v || '').trim().replace(/^['"]|['"]$/g, '');
}

function parseEnv(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [key, ...rest] = trimmed.split('=');
    out[key.trim()] = clean(rest.join('='));
  }
  return out;
}

if (!fs.existsSync(envPath)) {
  console.error('ERREUR: .env.local introuvable dans ' + root);
  console.error('Crée .env.local avec NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const envText = fs.readFileSync(envPath, 'utf8');
const env = parseEnv(envText);
let url = clean(env.NEXT_PUBLIC_SUPABASE_URL);
let anon = clean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

let ok = true;
try {
  const u = new URL(url);
  if (!['https:', 'http:'].includes(u.protocol) || !u.hostname.includes('supabase.co')) ok = false;
} catch { ok = false; }

if (!ok) {
  console.error('ERREUR: NEXT_PUBLIC_SUPABASE_URL invalide ou absente. Valeur trouvée: ' + (url || '(vide)'));
  console.error('Exemple attendu: NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co');
  process.exit(1);
}

if (!anon || anon.length < 20) {
  console.error('ERREUR: NEXT_PUBLIC_SUPABASE_ANON_KEY absente ou trop courte.');
  console.error('Colle la clé Publishable/anon depuis Supabase.');
  process.exit(1);
}

// Réécrit .env.local proprement pour enlever mauvaises clés/espaces/guillemets.
const normalized = `NEXT_PUBLIC_SUPABASE_URL=${url}\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${anon}\n`;
fs.writeFileSync(envPath + '.bak-supabase-env', envText, 'utf8');
fs.writeFileSync(envPath, normalized, 'utf8');

fs.mkdirSync(libDir, { recursive: true });
const clientCode = `import { createClient } from '@supabase/supabase-js'\n\nconst supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL\nconst supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY\n\nif (!supabaseUrl || !supabaseUrl.startsWith('http')) {\n  throw new Error('NEXT_PUBLIC_SUPABASE_URL invalide dans .env.local')\n}\n\nif (!supabaseKey) {\n  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY manquant dans .env.local')\n}\n\nexport const supabase = createClient(supabaseUrl, supabaseKey)\n`;
if (fs.existsSync(clientPath)) fs.writeFileSync(clientPath + '.bak-env-fix', fs.readFileSync(clientPath, 'utf8'), 'utf8');
fs.writeFileSync(clientPath, clientCode, 'utf8');

console.log('OK: .env.local normalisé.');
console.log('OK: lib/supabaseClient.ts corrigé.');
console.log('URL Supabase détectée: ' + url);
console.log('Clé détectée: ' + anon.slice(0, 18) + '...');
console.log('IMPORTANT: arrête npm run dev avec Ctrl+C puis relance npm run dev.');
