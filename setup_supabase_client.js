const fs = require('fs');
const path = require('path');

const root = process.cwd();
const libDir = path.join(root, 'lib');
const supabaseClientPath = path.join(libDir, 'supabaseClient.ts');
const envPath = path.join(root, '.env.local');

fs.mkdirSync(libDir, { recursive: true });

const clientCode = `import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL est manquant dans .env.local')
}

if (!supabaseKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY est manquant dans .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
`;

fs.writeFileSync(supabaseClientPath, clientCode, 'utf8');

if (!fs.existsSync(envPath)) {
  const envExample = `NEXT_PUBLIC_SUPABASE_URL=COLLE_ICI_TON_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=COLLE_ICI_TA_PUBLISHABLE_KEY
`;
  fs.writeFileSync(envPath, envExample, 'utf8');
  console.log('OK: .env.local modèle créé. Remplace les valeurs COLLE_ICI...');
} else {
  console.log('OK: .env.local existe déjà, je ne l’ai pas modifié.');
}

console.log('OK: lib/supabaseClient.ts créé.');
console.log('Prochaine étape: colle tes vraies clés Supabase dans .env.local puis relance npm run dev.');
