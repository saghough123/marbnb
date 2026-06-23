const fs = require('fs');
const path = require('path');

const root = process.cwd();
function backup(file, suffix) {
  if (fs.existsSync(file)) fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8');
}

function addDaysPatch(code) {
  if (!code.includes('function addDaysISO(')) {
    code = code.replace(
      'function todayISO() {',
      `function addDaysISO(dateISO: string, days: number) {
  const d = new Date(dateISO || todayISO());
  if (Number.isNaN(d.getTime())) return todayISO();
  d.setDate(d.getDate() + days);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function todayISO() {`
    );
  }
  return code;
}

// 1) Date de sortie automatique J+1 sur la page détail logement
const detailPath = path.join(root, 'app', 'logement', '[id]', 'page.tsx');
if (fs.existsSync(detailPath)) {
  backup(detailPath, '.bak-date-j1-admin-users');
  let code = fs.readFileSync(detailPath, 'utf8');
  const before = code;

  code = addDaysPatch(code);

  code = code.replace(
    'const [depart, setDepart] = useState(search.get("depart") || todayISO());',
    'const [depart, setDepart] = useState(search.get("depart") || addDaysISO(search.get("arrivee") || todayISO(), 1));'
  );

  if (!code.includes('MARBNB_AUTO_DEPART_J1')) {
    code = code.replace(
      'const [saving, setSaving] = useState(false);',
      `const [saving, setSaving] = useState(false);

  // MARBNB_AUTO_DEPART_J1 : séjour minimum d’une nuit
  useEffect(() => {
    const start = new Date(arrivee).getTime();
    const end = new Date(depart).getTime();
    if (!Number.isNaN(start) && (Number.isNaN(end) || end <= start)) {
      setDepart(addDaysISO(arrivee, 1));
    }
  }, [arrivee]);`
    );
  }

  if (code !== before) {
    fs.writeFileSync(detailPath, code, 'utf8');
    console.log('OK: date départ automatique J+1 corrigée dans /logement/[id].');
  }
}

// 2) Date de sortie automatique J+1 aussi sur /resultats
const resultatsPath = path.join(root, 'app', 'resultats', 'page.tsx');
if (fs.existsSync(resultatsPath)) {
  backup(resultatsPath, '.bak-date-j1-admin-users');
  let code = fs.readFileSync(resultatsPath, 'utf8');
  const before = code;

  code = addDaysPatch(code);
  code = code.replace(
    'const [depart, setDepart] = useState(todayISO());',
    'const [depart, setDepart] = useState(addDaysISO(todayISO(), 1));'
  );
  code = code.replace(
    'const [depart, setDepart] = useState(search.get("depart") || todayISO());',
    'const [depart, setDepart] = useState(search.get("depart") || addDaysISO(search.get("arrivee") || todayISO(), 1));'
  );

  if (!code.includes('MARBNB_RESULTATS_AUTO_DEPART_J1')) {
    code = code.replace(
      'const [message, setMessage] = useState("");',
      `const [message, setMessage] = useState("");

  // MARBNB_RESULTATS_AUTO_DEPART_J1 : séjour minimum d’une nuit
  useEffect(() => {
    const start = new Date(arrivee).getTime();
    const end = new Date(depart).getTime();
    if (!Number.isNaN(start) && (Number.isNaN(end) || end <= start)) {
      setDepart(addDaysISO(arrivee, 1));
    }
  }, [arrivee]);`
    );
  }

  if (code !== before) {
    fs.writeFileSync(resultatsPath, code, 'utf8');
    console.log('OK: date départ automatique J+1 corrigée dans /resultats.');
  }
}

// 3) Corriger invalid uuid NaN dans admin-réservations
const adminResPath = path.join(root, 'app', 'admin-reservations', 'page.tsx');
if (fs.existsSync(adminResPath)) {
  backup(adminResPath, '.bak-fix-uuid-nan');
  let code = fs.readFileSync(adminResPath, 'utf8');
  const before = code;

  code = code.replace('async function changerStatut(id: number, statut: string)', 'async function changerStatut(id: string | number, statut: string)');
  code = code.replace('async function supprimerReservation(id: number)', 'async function supprimerReservation(id: string | number)');
  code = code.replace('const id = Number(r.id);', 'const id = String(r.id);');
  code = code.replace('key={id}', 'key={String(id)}');

  // Si des anciennes conversions restent
  code = code.replace(/Number\(r\.id\)/g, 'String(r.id)');

  if (code !== before) {
    fs.writeFileSync(adminResPath, code, 'utf8');
    console.log('OK: admin-réservations corrigé pour id UUID / plus de NaN.');
  }
}

// 4) Créer/modifier une table profiles via SQL pour visualiser comptes locataires/hôtes
const sql = `-- Marbnb : profils comptes locataires/hôtes
-- A lancer dans Supabase -> SQL Editor -> New query -> Run

create table if not exists profiles (
  id uuid primary key,
  nom text,
  email text,
  telephone text,
  role text check (role in ('locataire', 'hote', 'admin')) default 'locataire',
  created_at timestamptz default now()
);

alter table profiles enable row level security;

DROP POLICY IF EXISTS "profiles_insert_public" ON profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
DROP POLICY IF EXISTS "profiles_update_public" ON profiles;

CREATE POLICY "profiles_insert_public"
ON profiles FOR INSERT
WITH CHECK (true);

CREATE POLICY "profiles_select_public"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "profiles_update_public"
ON profiles FOR UPDATE
USING (true)
WITH CHECK (true);
`;
fs.writeFileSync(path.join(root, 'supabase_profiles_accounts.sql'), sql, 'utf8');
console.log('OK: SQL créé: supabase_profiles_accounts.sql');

// 5) Patch /compte pour enregistrer les comptes dans profiles
const comptePath = path.join(root, 'app', 'compte', 'page.tsx');
if (fs.existsSync(comptePath)) {
  backup(comptePath, '.bak-profiles-upsert');
  let code = fs.readFileSync(comptePath, 'utf8');
  const before = code;

  if (!code.includes('async function upsertProfile')) {
    code = code.replace(
      'export default function ComptePage() {',
      `async function upsertProfile(account: any) {
  if (!account?.id) return;
  await supabase.from("profiles").upsert({
    id: account.id,
    nom: account.nom || "",
    email: account.email || "",
    telephone: account.telephone || "",
    role: account.role || "locataire",
  });
}

export default function ComptePage() {`
    );
  }

  // Après création compte
  if (!code.includes('await upsertProfile(account);')) {
    code = code.replace(
      'localStorage.setItem("marbnb_account", JSON.stringify(account));',
      'localStorage.setItem("marbnb_account", JSON.stringify(account));\n      await upsertProfile(account);'
    );
    code = code.replace(
      'localStorage.setItem("mbnb_account", JSON.stringify(account));',
      'localStorage.setItem("marbnb_account", JSON.stringify(account));\n      await upsertProfile(account);'
    );
  }

  if (code !== before) {
    fs.writeFileSync(comptePath, code, 'utf8');
    console.log('OK: /compte enregistre maintenant les profils dans Supabase profiles.');
  }
}

// 6) Créer page admin-utilisateurs pour visualiser hôtes et locataires
const adminUsersDir = path.join(root, 'app', 'admin-utilisateurs');
fs.mkdirSync(adminUsersDir, { recursive: true });
const adminUsersPath = path.join(adminUsersDir, 'page.tsx');
backup(adminUsersPath, '.bak-admin-users');
const adminUsersPage = `"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  id: string;
  nom: string | null;
  email: string | null;
  telephone: string | null;
  role: string | null;
  created_at: string | null;
};

export default function AdminUtilisateursPage() {
  const [autorise, setAutorise] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filtre, setFiltre] = useState("Tous");

  useEffect(() => {
    const ok = localStorage.getItem("marbnb_admin_ok") === "true" || localStorage.getItem("mbnb_admin_ok") === "true";
    if (!ok) {
      window.location.href = "/admin-login";
      return;
    }
    setAutorise(true);
    charger();
  }, []);

  async function charger() {
    setLoading(true);
    setMessage("");
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) {
      setMessage("Erreur chargement utilisateurs : " + error.message + " — vérifie que le SQL profiles a bien été lancé.");
      setProfiles([]);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  }

  const visibles = useMemo(() => {
    if (filtre === "Tous") return profiles;
    return profiles.filter((p) => String(p.role || "").toLowerCase() === filtre.toLowerCase());
  }, [profiles, filtre]);

  const hotes = profiles.filter((p) => p.role === "hote").length;
  const locataires = profiles.filter((p) => p.role === "locataire").length;

  if (!autorise) return <main className="min-h-screen bg-[#f4ead7] p-8 font-black">Vérification accès admin...</main>;

  return (
    <main className="min-h-screen bg-[#f4ead7] px-4 py-8 text-[#1e1b18]">
      <section className="mx-auto max-w-7xl rounded-[2rem] bg-[#fff8ec] p-6 shadow-sm ring-1 ring-[#e5d3b3]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a href="/admin-dashboard" className="font-black text-[#c1121f]">← Dashboard</a>
          <button onClick={charger} className="rounded-full bg-[#0f2f22] px-5 py-2 text-sm font-black text-white">Actualiser</button>
        </div>

        <p className="mt-6 font-black text-[#c1121f]">Admin Marbnb</p>
        <h1 className="mt-2 text-4xl font-black">Utilisateurs</h1>
        <p className="mt-3 text-[#7a6446]">Visualiser les comptes locataires et hôtes créés.</p>

        {message && <p className="mt-5 rounded-2xl bg-amber-50 p-4 font-bold text-amber-700">{message}</p>}
        {loading && <p className="mt-6 font-bold">Chargement...</p>}

        {!loading && (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-white p-5 ring-1 ring-[#e5d3b3]"><p className="text-xs font-black text-[#7a3d14]">Total</p><p className="mt-2 text-3xl font-black">{profiles.length}</p></div>
              <div className="rounded-3xl bg-white p-5 ring-1 ring-[#e5d3b3]"><p className="text-xs font-black text-[#7a3d14]">Hôtes</p><p className="mt-2 text-3xl font-black">{hotes}</p></div>
              <div className="rounded-3xl bg-white p-5 ring-1 ring-[#e5d3b3]"><p className="text-xs font-black text-[#7a3d14]">Locataires</p><p className="mt-2 text-3xl font-black">{locataires}</p></div>
            </div>

            <div className="mt-5 rounded-3xl bg-white p-5 ring-1 ring-[#e5d3b3]">
              <label className="text-xs font-black text-[#7a3d14]">Filtrer</label>
              <select value={filtre} onChange={(e) => setFiltre(e.target.value)} className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 outline-none md:w-72">
                <option>Tous</option>
                <option>locataire</option>
                <option>hote</option>
                <option>admin</option>
              </select>
            </div>

            <div className="mt-6 overflow-x-auto rounded-[2rem] bg-white p-5 ring-1 ring-[#e5d3b3]">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b text-[#7a6446]"><th className="py-3">Nom</th><th>Email</th><th>Téléphone</th><th>Rôle</th><th>Création</th></tr>
                </thead>
                <tbody>
                  {visibles.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-3 font-bold">{p.nom || "-"}</td>
                      <td>{p.email || "-"}</td>
                      <td>{p.telephone || "-"}</td>
                      <td><span className="rounded-full bg-[#f4ead7] px-3 py-1 text-xs font-black text-[#7a3d14]">{p.role || "-"}</span></td>
                      <td>{p.created_at ? new Date(p.created_at).toLocaleDateString("fr-FR") : "-"}</td>
                    </tr>
                  ))}
                  {visibles.length === 0 && <tr><td colSpan={5} className="py-8 text-center font-bold text-[#7a6446]">Aucun utilisateur pour ce filtre.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
`;
fs.writeFileSync(adminUsersPath, adminUsersPage, 'utf8');
console.log('OK: page /admin-utilisateurs créée.');

// 7) Ajouter lien Utilisateurs dans dashboard/admin header si possible
const dashboardPath = path.join(root, 'app', 'admin-dashboard', 'page.tsx');
if (fs.existsSync(dashboardPath)) {
  backup(dashboardPath, '.bak-link-users');
  let dash = fs.readFileSync(dashboardPath, 'utf8');
  if (!dash.includes('/admin-utilisateurs')) {
    dash = dash.replace(
      '<a href="/admin-reservations"',
      '<a href="/admin-utilisateurs" className="rounded-full bg-[#c1121f] px-5 py-2 text-sm font-black text-white">Utilisateurs</a><a href="/admin-reservations"'
    );
    fs.writeFileSync(dashboardPath, dash, 'utf8');
    console.log('OK: lien Utilisateurs ajouté au dashboard.');
  }
}

console.log('\nTerminé ✅');
console.log('1) Lance le SQL: supabase_profiles_accounts.sql dans Supabase SQL Editor');
console.log('2) Relance: npm run build');
