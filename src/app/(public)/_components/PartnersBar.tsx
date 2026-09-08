// ⚠️ Contenu d'exemple — remplacer par de vrais cabinets clients (avec leur
// accord) avant mise en production. Idéalement passer par une requête DB
// sur les cabinets ayant opté pour l'affichage public (champ à créer).
const placeholderPartners = [
  "Cabinet Ibn Sina",
  "Clinique Dentaire El Djazair",
  "Cabinet Dr. Amrani",
  "Centre Dentaire Essalem",
  "Cabinet Sourire Plus",
];

export default function PartnersBar() {
  return (
    <div className="border-b border-slate-200 bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
          Ils nous font confiance
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {placeholderPartners.map((name) => (
            <span
              key={name}
              className="text-base font-semibold text-slate-400 grayscale transition-colors hover:text-slate-600"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
