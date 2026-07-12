"use client";

export default function InstallationPage() {
  return (
    <main className="min-h-screen bg-[#f4ead7] px-4 py-8 text-[#1e1b18]">
      <section className="mx-auto max-w-3xl rounded-[2rem] bg-[#fff8ec] p-6 shadow-sm ring-1 ring-[#e5d3b3] md:p-8">
        <a href="/" className="font-black text-[#c1121f]">← Retour accueil</a>
        <p className="mt-6 font-black text-[#c1121f]">Application Marbnb</p>
        <h1 className="mt-2 text-4xl font-black">Installer Marbnb sur Android et iPhone</h1>
        <p className="mt-4 leading-7 text-[#7a6446]">
          Cette version transforme le site en application installable. Le site reste le même : quand vous modifiez le site ou l’admin, l’application se met à jour automatiquement.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-5 ring-1 ring-[#e5d3b3]">
            <h2 className="text-xl font-black">Android</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[#5f4b32]">
              <li>Ouvrir Marbnb dans Chrome.</li>
              <li>Appuyer sur le bouton “Installer” si le message apparaît.</li>
              <li>Sinon : menu ⋮ puis “Ajouter à l’écran d’accueil”.</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-[#e5d3b3]">
            <h2 className="text-xl font-black">iPhone</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[#5f4b32]">
              <li>Ouvrir Marbnb dans Safari.</li>
              <li>Appuyer sur le bouton Partager.</li>
              <li>Choisir “Ajouter à l’écran d’accueil”.</li>
              <li>Valider avec le nom “Marbnb”.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-white p-5 ring-1 ring-[#e5d3b3]">
          <h2 className="text-xl font-black">Modifier le site</h2>
          <p className="mt-2 text-[#7a6446]">Les modifications restent centralisées sur le site web. Pour modifier les logements, réservations et demandes, utilisez l’espace Admin.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="/admin-dashboard" className="rounded-full bg-[#c1121f] px-5 py-3 text-sm font-black text-white">Ouvrir Admin</a>
            <a href="/resultats" className="rounded-full bg-[#3F7D3B] px-5 py-3 text-sm font-black text-white">Explorer</a>
          </div>
        </div>
      </section>
    </main>
  );
}
