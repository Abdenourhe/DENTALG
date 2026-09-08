"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

type PublicTestimonial = {
  id: string;
  authorName: string;
  authorRole: string;
  city: string | null;
  quote: string;
  rating: number;
};

interface TestimonialsMarqueeProps {
  testimonials: PublicTestimonial[];
}

function TestimonialCard({ t }: { t: PublicTestimonial }) {
  return (
    <div className="flex w-[320px] shrink-0 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:w-[360px]">
      <Quote className="h-6 w-6 text-primary-300" />
      <div className="mt-3 flex gap-0.5">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary">
          {t.authorName
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">
            {t.authorName}
          </div>
          <div className="text-xs text-slate-500">
            {t.authorRole}
            {t.city ? ` · ${t.city}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsMarquee({
  testimonials,
}: TestimonialsMarqueeProps) {
  const [paused, setPaused] = useState(false);

  // Peu de témoignages : grille statique, pas besoin de défilement.
  if (testimonials.length <= 3) {
    return (
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <TestimonialCard key={t.id} t={t} />
        ))}
      </div>
    );
  }

  // Beaucoup de témoignages : bandeau qui glisse en continu vers la gauche.
  const loop = [...testimonials, ...testimonials];
  const duration = testimonials.length * 6;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
      <motion.div
        className="flex gap-6"
        animate={paused ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
        style={{ width: "max-content" }}
      >
        {loop.map((t, i) => (
          <TestimonialCard key={`${t.id}-${i}`} t={t} />
        ))}
      </motion.div>
    </div>
  );
}
