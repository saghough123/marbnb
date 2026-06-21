const fs = require('fs');
const path = require('path');

const root = process.cwd();
const dashboardPath = path.join(root, 'app', 'admin-dashboard', 'page.tsx');

if (!fs.existsSync(dashboardPath)) {
  console.error('ERREUR: app/admin-dashboard/page.tsx introuvable.');
  process.exit(1);
}

let code = fs.readFileSync(dashboardPath, 'utf8');
const before = code;

// Correction: ta table reservations n'a pas de colonne created_at.
// On supprime donc le .order("created_at") pour éviter l'erreur Supabase.
code = code.replace(
  'supabase.from("reservations").select("*").order("created_at", { ascending: false }),',
  'supabase.from("reservations").select("*"),'
);
code = code.replace(
  'supabase.from("reservations").select("*").order("created_at", { ascending: false })',
  'supabase.from("reservations").select("*")'
);

// Tri côté navigateur, compatible même si created_at n'existe pas.
if (!code.includes('function getDateValue(row: Reservation)')) {
  code = code.replace(
    'function getNumber(row: Reservation, keys: string[], fallback = 0) {',
    `function getDateValue(row: Reservation) {
  const value = row?.created_at || row?.date_creation || row?.createdAt || row?.date || row?.arrivee || "";
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function getNumber(row: Reservation, keys: string[], fallback = 0) {`
  );
}

code = code.replace(
  'setReservations(reservationsRes.data || []);',
  'setReservations([...(reservationsRes.data || [])].sort((a, b) => getDateValue(b) - getDateValue(a)));'
);

// Optionnel: si message précédent affiché, il disparaîtra après Actualiser.
if (code !== before) {
  fs.writeFileSync(dashboardPath + '.bak-no-created-at', before, 'utf8');
  fs.writeFileSync(dashboardPath, code, 'utf8');
  console.log('OK: dashboard corrigé. Plus de dépendance à reservations.created_at.');
  console.log('Backup: app/admin-dashboard/page.tsx.bak-no-created-at');
} else {
  console.log('Aucune modification détectée. Le dashboard était peut-être déjà corrigé.');
}
console.log('Lance maintenant: npm run build');
