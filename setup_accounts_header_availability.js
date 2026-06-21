const fs = require('fs');
const path = require('path');
const root = process.cwd();
function backup(file, suffix) { if (fs.existsSync(file)) fs.writeFileSync(file + suffix, fs.readFileSync(file, 'utf8'), 'utf8'); }

const componentsDir = path.join(root, 'components');
fs.mkdirSync(componentsDir, { recursive: true });
const headerPath = path.join(componentsDir, 'MbnbHeader.tsx');
backup(headerPath, '.bak-account-header');
fs.writeFileSync(headerPath, "\"use client\";\n\nimport { useEffect, useState } from \"react\";\nimport { usePathname } from \"next/navigation\";\n\ntype Account = { email?: string; nom?: string; role?: string };\n\nfunction getAccount(): Account | null {\n  if (typeof window === \"undefined\") return null;\n  try { const raw = localStorage.getItem(\"mbnb_account\"); return raw ? JSON.parse(raw) : null; } catch { return null; }\n}\n\nexport default function MbnbHeader() {\n  const pathname = usePathname();\n  const [account, setAccount] = useState<Account | null>(null);\n\n  useEffect(() => {\n    const refresh = () => setAccount(getAccount());\n    refresh();\n    window.addEventListener(\"storage\", refresh);\n    window.addEventListener(\"mbnb:account-changed\", refresh);\n    return () => { window.removeEventListener(\"storage\", refresh); window.removeEventListener(\"mbnb:account-changed\", refresh); };\n  }, []);\n\n  if (pathname?.startsWith(\"/admin-login\")) return null;\n\n  function logout() {\n    localStorage.removeItem(\"mbnb_account\");\n    window.dispatchEvent(new Event(\"mbnb:account-changed\"));\n    window.location.href = \"/\";\n  }\n\n  return (\n    <header className=\"sticky top-0 z-50 border-b border-[#e5d3b3] bg-[#fff8ec]/95 shadow-sm backdrop-blur-xl\">\n      <div className=\"mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3\">\n        <a href=\"/\" className=\"flex items-center gap-3\">\n          <span className=\"grid h-11 w-11 place-items-center rounded-2xl bg-[#c1121f] text-xl font-black text-white shadow-sm\">M</span>\n          <span className=\"leading-tight\">\n            <span className=\"block text-2xl font-black tracking-tight text-[#0f2f22]\">Mbnb</span>\n            <span className=\"hidden text-xs font-bold text-[#7a6446] sm:block\">Séjours authentiques au Maroc</span>\n          </span>\n        </a>\n        <nav className=\"hidden items-center gap-2 md:flex\">\n          <a href=\"/resultats\" className=\"rounded-full px-4 py-2 text-sm font-black text-[#0f2f22] hover:bg-[#f4ead7]\">Explorer</a>\n          <a href=\"/favoris\" className=\"rounded-full px-4 py-2 text-sm font-black text-[#0f2f22] hover:bg-[#f4ead7]\">Favoris</a>\n          <a href=\"/hote\" className=\"rounded-full px-4 py-2 text-sm font-black text-[#0f2f22] hover:bg-[#f4ead7]\">Devenir hôte</a>\n        </nav>\n        <div className=\"flex items-center gap-2\">\n          {account ? (\n            <>\n              <a href=\"/compte\" className=\"hidden rounded-full bg-white px-4 py-2 text-sm font-black text-[#7a3d14] ring-1 ring-[#e5d3b3] sm:inline-flex\">{account.nom || account.email || \"Mon compte\"}</a>\n              <button onClick={logout} className=\"rounded-full bg-[#0f2f22] px-4 py-2 text-sm font-black text-white\">Sortir</button>\n            </>\n          ) : <a href=\"/compte\" className=\"rounded-full bg-[#0f2f22] px-5 py-2 text-sm font-black text-white\">Connexion</a>}\n        </div>\n      </div>\n    </header>\n  );\n}\n", 'utf8');
console.log('OK: Header Mbnb créé.');

const compteDir = path.join(root, 'app', 'compte');
fs.mkdirSync(compteDir, { recursive: true });
const comptePath = path.join(compteDir, 'page.tsx');
backup(comptePath, '.bak-account-page');
fs.writeFileSync(comptePath, "\"use client\";\n\nimport { useEffect, useState } from \"react\";\nimport { supabase } from \"@/lib/supabaseClient\";\n\ntype Mode = \"connexion\" | \"creation\";\ntype Role = \"locataire\" | \"hote\";\n\nexport default function ComptePage() {\n  const [mode, setMode] = useState<Mode>(\"connexion\");\n  const [role, setRole] = useState<Role>(\"locataire\");\n  const [nom, setNom] = useState(\"\");\n  const [email, setEmail] = useState(\"\");\n  const [telephone, setTelephone] = useState(\"\");\n  const [password, setPassword] = useState(\"\");\n  const [loading, setLoading] = useState(false);\n  const [message, setMessage] = useState(\"\");\n\n  useEffect(() => {\n    try {\n      const raw = localStorage.getItem(\"mbnb_account\");\n      if (raw) {\n        const account = JSON.parse(raw);\n        setNom(account.nom || \"\");\n        setEmail(account.email || \"\");\n        setTelephone(account.telephone || \"\");\n        setRole(account.role || \"locataire\");\n      }\n    } catch {}\n  }, []);\n\n  async function submit(e: React.FormEvent) {\n    e.preventDefault();\n    setMessage(\"\");\n    if (!email.trim() || !password.trim()) { setMessage(\"Merci de renseigner votre email et votre mot de passe.\"); return; }\n    if (mode === \"creation\" && !nom.trim()) { setMessage(\"Merci de renseigner votre nom complet.\"); return; }\n    setLoading(true);\n\n    if (mode === \"creation\") {\n      const { data, error } = await supabase.auth.signUp({\n        email: email.trim(),\n        password,\n        options: { data: { nom: nom.trim(), telephone: telephone.trim(), role } },\n      });\n      setLoading(false);\n      if (error) { setMessage(\"Erreur création compte : \" + error.message); return; }\n      const account = { id: data.user?.id, nom: nom.trim(), email: email.trim(), telephone: telephone.trim(), role };\n      localStorage.setItem(\"mbnb_account\", JSON.stringify(account));\n      window.dispatchEvent(new Event(\"mbnb:account-changed\"));\n      setMessage(\"Compte créé ✅ Vous pouvez maintenant utiliser Mbnb avec votre profil.\");\n      return;\n    }\n\n    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });\n    setLoading(false);\n    if (error) { setMessage(\"Erreur connexion : \" + error.message); return; }\n    const user = data.user;\n    const account = {\n      id: user?.id,\n      nom: user?.user_metadata?.nom || nom.trim(),\n      email: user?.email || email.trim(),\n      telephone: user?.user_metadata?.telephone || telephone.trim(),\n      role: user?.user_metadata?.role || role,\n    };\n    localStorage.setItem(\"mbnb_account\", JSON.stringify(account));\n    window.dispatchEvent(new Event(\"mbnb:account-changed\"));\n    setMessage(\"Connexion réussie ✅\");\n  }\n\n  function logout() {\n    supabase.auth.signOut();\n    localStorage.removeItem(\"mbnb_account\");\n    window.dispatchEvent(new Event(\"mbnb:account-changed\"));\n    setMessage(\"Déconnexion effectuée.\");\n  }\n\n  return (\n    <main className=\"min-h-screen bg-[#f4ead7] px-4 py-8 text-[#1e1b18]\">\n      <section className=\"mx-auto max-w-3xl rounded-[2rem] bg-[#fff8ec] p-6 shadow-sm ring-1 ring-[#e5d3b3] md:p-8\">\n        <p className=\"font-black text-[#c1121f]\">Compte Mbnb</p>\n        <h1 className=\"mt-2 text-4xl font-black\">Créer ou accéder à mon compte</h1>\n        <p className=\"mt-3 text-[#7a6446]\">Choisissez un profil locataire ou hôte pour utiliser les services Mbnb.</p>\n        <div className=\"mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-[#f4ead7] p-2\">\n          <button onClick={() => setMode(\"connexion\")} className={`rounded-xl px-4 py-3 font-black ${mode === \"connexion\" ? \"bg-[#0f2f22] text-white\" : \"text-[#7a3d14]\"}`}>Connexion</button>\n          <button onClick={() => setMode(\"creation\")} className={`rounded-xl px-4 py-3 font-black ${mode === \"creation\" ? \"bg-[#0f2f22] text-white\" : \"text-[#7a3d14]\"}`}>Créer un compte</button>\n        </div>\n        <form onSubmit={submit} className=\"mt-6 grid gap-4\">\n          {mode === \"creation\" && (<>\n            <div>\n              <label className=\"text-xs font-black text-[#7a3d14]\">Type de compte</label>\n              <div className=\"mt-2 grid grid-cols-2 gap-3\">\n                <button type=\"button\" onClick={() => setRole(\"locataire\")} className={`rounded-2xl border px-4 py-3 font-black ${role === \"locataire\" ? \"border-[#0f2f22] bg-green-50\" : \"bg-white\"}`}>Locataire</button>\n                <button type=\"button\" onClick={() => setRole(\"hote\")} className={`rounded-2xl border px-4 py-3 font-black ${role === \"hote\" ? \"border-[#0f2f22] bg-green-50\" : \"bg-white\"}`}>Hôte</button>\n              </div>\n            </div>\n            <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder=\"Nom complet\" className=\"rounded-2xl border bg-white px-4 py-3 outline-none\" />\n            <input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder=\"Téléphone\" className=\"rounded-2xl border bg-white px-4 py-3 outline-none\" />\n          </>)}\n          <input value={email} onChange={(e) => setEmail(e.target.value)} type=\"email\" placeholder=\"Email\" className=\"rounded-2xl border bg-white px-4 py-3 outline-none\" />\n          <input value={password} onChange={(e) => setPassword(e.target.value)} type=\"password\" placeholder=\"Mot de passe\" className=\"rounded-2xl border bg-white px-4 py-3 outline-none\" />\n          <button disabled={loading} className=\"rounded-2xl bg-[#c1121f] px-6 py-4 font-black text-white disabled:opacity-60\">{loading ? \"Traitement...\" : mode === \"creation\" ? \"Créer mon compte\" : \"Me connecter\"}</button>\n        </form>\n        {message && <p className=\"mt-5 rounded-2xl bg-green-50 p-4 font-bold text-green-800\">{message}</p>}\n        <div className=\"mt-6 flex flex-wrap gap-3\">\n          <a href=\"/resultats\" className=\"rounded-full bg-[#0f2f22] px-5 py-3 text-sm font-black text-white\">Explorer</a>\n          <a href=\"/hote\" className=\"rounded-full bg-white px-5 py-3 text-sm font-black text-[#7a3d14] ring-1 ring-[#e5d3b3]\">Devenir hôte</a>\n          <button onClick={logout} type=\"button\" className=\"rounded-full bg-red-700 px-5 py-3 text-sm font-black text-white\">Déconnexion</button>\n        </div>\n      </section>\n    </main>\n  );\n}\n", 'utf8');
console.log('OK: page /compte créée.');

const layoutPath = path.join(root, 'app', 'layout.tsx');
if (fs.existsSync(layoutPath)) {
  backup(layoutPath, '.bak-account-header');
  let layout = fs.readFileSync(layoutPath, 'utf8');
  const before = layout;
  layout = layout.replace(/title:\s*["'`]Create Next App["'`]/g, 'title: "Mbnb"');
  layout = layout.replace(/description:\s*["'`]Generated by create next app["'`]/g, 'description: "Mbnb - Séjours authentiques au Maroc"');
  if (!layout.includes('@/components/MbnbHeader')) {
    layout = 'import MbnbHeader from "@/components/MbnbHeader";\n' + layout;
  }
  if (!layout.includes('<MbnbHeader />')) {
    layout = layout.replace('{children}', '<MbnbHeader />\n        {children}');
  }
  if (layout !== before) { fs.writeFileSync(layoutPath, layout, 'utf8'); console.log('OK: title/header du layout mis à jour.'); }
}

const detailPath = path.join(root, 'app', 'logement', '[id]', 'page.tsx');
if (fs.existsSync(detailPath)) {
  backup(detailPath, '.bak-availability');
  let detail = fs.readFileSync(detailPath, 'utf8');
  const before = detail;
  if (!detail.includes('disponibiliteVerifiee')) {
    detail = detail.replace('const [saving, setSaving] = useState(false);', 'const [saving, setSaving] = useState(false);\n  const [checkingDisponibilite, setCheckingDisponibilite] = useState(false);\n  const [disponibiliteVerifiee, setDisponibiliteVerifiee] = useState(false);');
  }
  if (!detail.includes('reset disponibilité')) {
    detail = detail.replace('useEffect(() => {\n    async function charger()', 'useEffect(() => {\n    // reset disponibilité\n    setDisponibiliteVerifiee(false);\n  }, [arrivee, depart, voyageurs]);\n\n  useEffect(() => {\n    async function charger()');
  }
  if (!detail.includes('async function verifierDisponibilite()')) {
    const fn = `
  async function verifierDisponibilite() {
    if (!logement) return;
    setMessage("");
    setCheckingDisponibilite(true);
    const { data, error } = await supabase.from("reservations").select("*").eq("logement_id", logement.id);
    setCheckingDisponibilite(false);
    if (error) { setMessage("Impossible de vérifier les disponibilités : " + error.message); return; }
    const start = new Date(arrivee).getTime();
    const end = new Date(depart).getTime();
    const conflit = (data || []).some((r: any) => {
      const statut = String(r.statut || r.status || "").toLowerCase();
      if (statut.includes("annul")) return false;
      const rStart = new Date(r.arrivee || r.date_arrivee || r.checkin || r.check_in || "").getTime();
      const rEnd = new Date(r.depart || r.date_depart || r.checkout || r.check_out || "").getTime();
      if (Number.isNaN(rStart) || Number.isNaN(rEnd)) return false;
      return start < rEnd && end > rStart;
    });
    if (conflit) { setDisponibiliteVerifiee(false); setMessage("Ce logement n’est pas disponible sur ces dates. Essayez une autre période."); return; }
    setDisponibiliteVerifiee(true);
    setMessage("Disponible ✅ Vous pouvez confirmer la réservation.");
  }
`;
    detail = detail.replace('  async function reserver() {', fn + '\n  async function reserver() {');
  }
  if (!detail.includes('Veuillez d’abord vérifier les disponibilités')) {
    detail = detail.replace('if (!clientNom.trim() || !clientTelephone.trim()) {', 'if (!disponibiliteVerifiee) {\n      setMessage("Veuillez d’abord vérifier les disponibilités avant de confirmer.");\n      return;\n    }\n\n    if (!clientNom.trim() || !clientTelephone.trim()) {');
  }
  const oldOneLine = '<button onClick={reserver} disabled={saving} className="mt-5 w-full rounded-2xl bg-[#c1121f] px-6 py-4 font-black text-white disabled:opacity-60">{saving ? "Enregistrement..." : "Confirmer la réservation"}</button>';
  const newTwoButtons = '<button onClick={verifierDisponibilite} disabled={checkingDisponibilite} className="mt-5 w-full rounded-2xl bg-[#0f2f22] px-6 py-4 font-black text-white disabled:opacity-60">{checkingDisponibilite ? "Vérification..." : disponibiliteVerifiee ? "Disponibilité vérifiée ✅" : "Vérifier les disponibilités"}</button>\n            <button onClick={reserver} disabled={saving || !disponibiliteVerifiee} className="mt-3 w-full rounded-2xl bg-[#c1121f] px-6 py-4 font-black text-white disabled:opacity-50">{saving ? "Enregistrement..." : "Confirmer la réservation"}</button>';
  detail = detail.replace(oldOneLine, newTwoButtons);
  if (detail !== before) { fs.writeFileSync(detailPath, detail, 'utf8'); console.log('OK: vérification disponibilités ajoutée.'); }
}
console.log('\nTerminé ✅ Important: active Supabase Auth si création/connexion email ne fonctionne pas.');
console.log('Lance: npm run build');
