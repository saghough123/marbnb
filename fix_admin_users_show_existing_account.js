const fs = require('fs');
const path = require('path');
const root = process.cwd();
function backup(file, suffix){ if(fs.existsSync(file)) fs.writeFileSync(file+suffix, fs.readFileSync(file,'utf8'),'utf8'); }

// 1) Corriger /compte : sauvegarder automatiquement le compte local existant dans profiles
const comptePath = path.join(root,'app','compte','page.tsx');
if (fs.existsSync(comptePath)) {
  backup(comptePath,'.bak-sync-local-profile');
  let code = fs.readFileSync(comptePath,'utf8');
  const before = code;

  if (!code.includes('async function upsertProfile')) {
    code = code.replace('export default function ComptePage() {', `async function upsertProfile(account: any) {
  if (!account?.id && !account?.email) return;
  const id = account.id || crypto.randomUUID();
  const clean = {
    id,
    nom: account.nom || account.name || "",
    email: account.email || "",
    telephone: account.telephone || account.phone || "",
    role: account.role || "locataire",
  };
  localStorage.setItem("marbnb_account", JSON.stringify(clean));
  await supabase.from("profiles").upsert(clean);
}

export default function ComptePage() {`);
  }

  // Dans useEffect existant, après setRole ajouter sync local -> profiles
  if (!code.includes('MARBNB_SYNC_LOCAL_ACCOUNT_ON_LOAD')) {
    code = code.replace(
      'setRole(account.role || "locataire");',
      'setRole(account.role || "locataire");\n        // MARBNB_SYNC_LOCAL_ACCOUNT_ON_LOAD\n        upsertProfile(account).catch(() => undefined);'
    );
  }

  // Après chaque localStorage.setItem(account), forcer upsert si absent
  if (!code.includes('MARBNB_UPSERT_PROFILE_AFTER_SIGNUP')) {
    code = code.replace(
      'window.dispatchEvent(new Event("mbnb:account-changed"));\n      setMessage("Compte créé ✅',
      'window.dispatchEvent(new Event("mbnb:account-changed"));\n      // MARBNB_UPSERT_PROFILE_AFTER_SIGNUP\n      await upsertProfile(account);\n      setMessage("Compte créé ✅'
    );
    code = code.replace(
      'window.dispatchEvent(new Event("mbnb:account-changed"));\n    setMessage("Connexion réussie ✅");',
      'window.dispatchEvent(new Event("mbnb:account-changed"));\n    await upsertProfile(account);\n    setMessage("Connexion réussie ✅");'
    );
  }

  if (code !== before) { fs.writeFileSync(comptePath,code,'utf8'); console.log('OK: /compte synchronise le compte local vers profiles.'); }
}

// 2) Corriger /admin-utilisateurs : afficher aussi le compte connecté en local si profiles est vide ou si SQL pas encore lancé
const adminUsersPath = path.join(root,'app','admin-utilisateurs','page.tsx');
if (fs.existsSync(adminUsersPath)) {
  backup(adminUsersPath,'.bak-show-local-account');
  let code = fs.readFileSync(adminUsersPath,'utf8');
  const before = code;

  if (!code.includes('function getLocalAccountProfile')) {
    code = code.replace('type Profile = {', `function getLocalAccountProfile(): any | null {
  try {
    const raw = localStorage.getItem("marbnb_account") || localStorage.getItem("mbnb_account");
    if (!raw) return null;
    const a = JSON.parse(raw);
    return {
      id: a.id || a.email || "local-account",
      nom: a.nom || a.name || "",
      email: a.email || "",
      telephone: a.telephone || a.phone || "",
      role: a.role || "locataire",
      created_at: a.created_at || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

type Profile = {`);
  }

  // Remplacer le comportement en cas d'erreur ou data vide par merge avec local
  code = code.replace(
    'setProfiles([]);\n    } else {\n      setProfiles(data || []);\n    }',
    `const local = getLocalAccountProfile();
      setProfiles(local ? [local] : []);
    } else {
      const local = getLocalAccountProfile();
      const rows = data || [];
      const exists = local && rows.some((p: any) => String(p.email || "") === String(local.email || ""));
      setProfiles(local && !exists ? [local, ...rows] : rows);
    }`
  );

  // Ajouter un bouton sync dans la page
  if (!code.includes('async function synchroniserCompteLocal')) {
    code = code.replace('async function charger() {', `async function synchroniserCompteLocal() {
    const local = getLocalAccountProfile();
    if (!local) {
      setMessage("Aucun compte local trouvé sur ce navigateur.");
      return;
    }
    const { error } = await supabase.from("profiles").upsert(local);
    if (error) {
      setMessage("Impossible de synchroniser le compte local : " + error.message + " — vérifie le SQL profiles.");
      setProfiles([local]);
      return;
    }
    setMessage("Compte local synchronisé ✅");
    charger();
  }

  async function charger() {`);
  }

  if (!code.includes('Synchroniser mon compte')) {
    code = code.replace(
      '<button onClick={charger} className="rounded-full bg-[#0f2f22] px-5 py-2 text-sm font-black text-white">Actualiser</button>',
      '<div className="flex flex-wrap gap-2"><button onClick={synchroniserCompteLocal} className="rounded-full bg-[#c1121f] px-5 py-2 text-sm font-black text-white">Synchroniser mon compte</button><button onClick={charger} className="rounded-full bg-[#0f2f22] px-5 py-2 text-sm font-black text-white">Actualiser</button></div>'
    );
  }

  if (code !== before) { fs.writeFileSync(adminUsersPath,code,'utf8'); console.log('OK: /admin-utilisateurs affiche/synchronise le compte local.'); }
}

// 3) SQL plus tolérant pour profiles
const sql = `-- Marbnb : profils comptes locataires/hôtes
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  nom text,
  email text unique,
  telephone text,
  role text default 'locataire',
  created_at timestamptz default now()
);

alter table profiles enable row level security;

DROP POLICY IF EXISTS "profiles_insert_public" ON profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
DROP POLICY IF EXISTS "profiles_update_public" ON profiles;

CREATE POLICY "profiles_insert_public" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_public" ON profiles FOR UPDATE USING (true) WITH CHECK (true);
`;
fs.writeFileSync(path.join(root,'supabase_profiles_accounts_v2.sql'), sql, 'utf8');
console.log('OK: SQL v2 créé: supabase_profiles_accounts_v2.sql');

console.log('\nTerminé ✅');
console.log('1) Lance supabase_profiles_accounts_v2.sql dans Supabase SQL Editor');
console.log('2) npm run build');
console.log('3) Va sur /admin-utilisateurs puis clique Synchroniser mon compte si besoin');
