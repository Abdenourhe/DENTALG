import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { listMyTestimonials } from "@/lib/actions/testimonials";
import TestimonialForm from "./TestimonialForm";
import { MessageSquareQuote } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Gérant(e) de cabinet",
  DENTIST: "Chirurgien(ne)-dentiste",
  ASSISTANT: "Assistant(e) dentaire",
  SECRETARY: "Secrétaire médicale",
};

export default async function TestimonialsSettingsPage() {
  const session = await auth();
  if (!session?.user?.clinicId) notFound();

  const myTestimonials = await listMyTestimonials();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
          <MessageSquareQuote className="h-6 w-6 text-slate-500" />
          Mon témoignage
        </h1>
        <p className="mt-1 text-slate-500">
          Partagez votre expérience avec DENTALG. Un membre de l&apos;équipe
          plateforme valide chaque témoignage avant sa mise en ligne sur la page
          d&apos;accueil.
        </p>
      </div>

      <TestimonialForm
        defaultName={session.user.name ?? ""}
        defaultRole={ROLE_LABELS[session.user.role] ?? ""}
        existingTestimonials={myTestimonials}
      />
    </div>
  );
}
