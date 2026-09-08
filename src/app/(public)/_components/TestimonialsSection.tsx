import { listPublicTestimonials } from "@/lib/actions/testimonials";
import TestimonialsMarquee from "./TestimonialsMarquee";

export default async function TestimonialsSection() {
  const testimonials = await listPublicTestimonials();

  if (testimonials.length === 0) return null;

  return (
    <section className="w-full overflow-hidden py-20">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Ce que disent les cabinets qui nous utilisent
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
          Des praticiens et des équipes qui ont simplifié leur gestion
          quotidienne avec DENTALG.
        </p>
      </div>

      <div className="mt-12">
        <TestimonialsMarquee testimonials={testimonials} />
      </div>
    </section>
  );
}
