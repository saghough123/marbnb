const fs = require('fs');
const path = require('path');

const root = process.cwd();
const testDir = path.join(root, 'app', 'test-supabase');
const testPage = path.join(testDir, 'page.tsx');

if (fs.existsSync(testPage)) {
  fs.rmSync(testDir, { recursive: true, force: true });
  console.log('OK: page de test Supabase supprimée: app/test-supabase');
} else {
  console.log('Info: app/test-supabase/page.tsx n’existe pas ou a déjà été supprimée.');
}

// Vérification rapide du .env.local sans afficher les secrets
const envPath = path.join(root, '.env.local');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  const urlLine = env.split(/\r?\n/).find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL='));
  const keyLine = env.split(/\r?\n/).find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY='));
  if (!urlLine) console.warn('ATTENTION: NEXT_PUBLIC_SUPABASE_URL manque dans .env.local');
  if (!keyLine) console.warn('ATTENTION: NEXT_PUBLIC_SUPABASE_ANON_KEY manque dans .env.local');
  if (urlLine) {
    const value = urlLine.split('=').slice(1).join('=').trim();
    if (!value.startsWith('https://') || !value.includes('.supabase.co')) {
      console.warn('ATTENTION: NEXT_PUBLIC_SUPABASE_URL semble invalide. Elle doit ressembler à https://xxxxx.supabase.co');
    } else {
      console.log('OK: NEXT_PUBLIC_SUPABASE_URL semble valide.');
    }
  }
  if (keyLine) {
    const value = keyLine.split('=').slice(1).join('=').trim();
    if (!value.startsWith('sb_publishable_') && !value.startsWith('eyJ')) {
      console.warn('ATTENTION: NEXT_PUBLIC_SUPABASE_ANON_KEY semble inhabituelle. Vérifie la clé publishable/anon de Supabase.');
    } else {
      console.log('OK: NEXT_PUBLIC_SUPABASE_ANON_KEY présente.');
    }
  }
}

console.log('Maintenant lance: npm run build');
