const fs = require('fs');
const path = require('path');

const root = process.cwd();
const libDir = path.join(root, 'lib');
const clientPath = path.join(libDir, 'supabaseClient.ts');
const envPath = path.join(root, '.env.local');

fs.mkdirSync(libDir, { recursive: true });

// Client Supabase sécurisé pour le build Next/Vercel.
// Si l'URL env est absente/mal formée, le build ne casse pas, mais Supabase affichera une erreur côté app.
const clientCode = `import { createClient } from '@supabase/supabase-js'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function isValidSupabaseUrl(value: string) {
  try {
    const url = new URL(value)
    return (url.protocol === 'https:' || url.protocol === 'http:') && url.hostname.includes('supabase.co')
  } catch {
    return false
  }
}

const supabaseUrl = isValidSupabaseUrl(rawUrl)
  ? rawUrl
  : 'https://placeholder.supabase.co'

const supabaseKey = rawKey && rawKey.length > 10
  ? rawKey
  : 'placeholder-key'

export const supabaseConfigOk = isValidSupabaseUrl(rawUrl) && rawKey.length > 10

export const supabase = createClient(supabaseUrl, supabaseKey)
`;

if (fs.existsSync(clientPath)) {
  fs.writeFileSync(clientPath + '.bak-safe-build', fs.readFileSync(clientPath, 'utf8'), 'utf8');
}
fs.writeFileSync(clientPath, clientCode, 'utf8');

console.log('OK: lib/supabaseClient.ts rendu compatible avec le build.');
console.log('Backup créé si fichier existait: lib/supabaseClient.ts.bak-safe-build');

// Diagnostic .env.local sans afficher la clé complète.
if (!fs.existsSync(envPath)) {
  console.warn('ATTENTION: .env.local introuvable. Crée-le avec NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.');
} else {
  const env = fs.readFileSync(envPath, 'utf8');
  const lines = env.split(/\r?\n/).filter(Boolean);
  const urlLine = lines.find(l => l.trim().startsWith('NEXT_PUBLIC_SUPABASE_URL='));
  const keyLine = lines.find(l => l.trim().startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY='));

  if (!urlLine) {
    console.warn('ATTENTION: NEXT_PUBLIC_SUPABASE_URL manque dans .env.local');
  } else {
    const value = urlLine.split('=').slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    try {
      const u = new URL(value);
      if ((u.protocol === 'http:' || u.protocol === 'https:') && u.hostname.includes('supabase.co')) {
        console.log('OK: NEXT_PUBLIC_SUPABASE_URL semble valide:', value);
      } else {
        console.warn('ATTENTION: NEXT_PUBLIC_SUPABASE_URL semble invalide:', value);
      }
    } catch {
      console.warn('ATTENTION: NEXT_PUBLIC_SUPABASE_URL est mal formée:', value);
      console.warn('Elle doit ressembler à: https://xxxxx.supabase.co');
    }
  }

  if (!keyLine) {
    console.warn('ATTENTION: NEXT_PUBLIC_SUPABASE_ANON_KEY manque dans .env.local');
  } else {
    const value = keyLine.split('=').slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    if (value.length > 10) {
      console.log('OK: NEXT_PUBLIC_SUPABASE_ANON_KEY présente:', value.slice(0, 16) + '...');
    } else {
      console.warn('ATTENTION: NEXT_PUBLIC_SUPABASE_ANON_KEY semble vide ou trop courte.');
    }
  }
}

console.log('Maintenant lance: npm run build');
