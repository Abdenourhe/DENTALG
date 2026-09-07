import { ShieldCheck, Lock, MapPin, HeadphonesIcon } from "lucide-react";

const items = [
  { icon: MapPin, label: "Hébergé et conçu en Algérie" },
  { icon: Lock, label: "Données patients chiffrées" },
  { icon: ShieldCheck, label: "Accès cloisonné par cabinet" },
  { icon: HeadphonesIcon, label: "Support réactif en français" },
];

export default function TrustBar() {
  return (
    <div className="border-b border-slate-200 bg-white py-6">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 sm:grid-cols-4">
        {items.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm"
          >
            <Icon className="h-4 w-4 shrink-0 text-primary" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
