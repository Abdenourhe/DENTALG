"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createTestimonial } from "@/lib/actions/testimonials";
import { Testimonial } from "@prisma/client";
import { Star, Send, CheckCircle2, Clock } from "lucide-react";

interface TestimonialFormProps {
  defaultName: string;
  defaultRole: string;
  existingTestimonials: Testimonial[];
}

export default function TestimonialForm({
  defaultName,
  defaultRole,
  existingTestimonials,
}: TestimonialFormProps) {
  const [testimonials, setTestimonials] = useState(existingTestimonials);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setErrors({});
    setSuccess(false);

    const data = {
      authorName: formData.get("authorName"),
      authorRole: formData.get("authorRole"),
      city: formData.get("city"),
      quote: formData.get("quote"),
      rating,
    };
    const res = await createTestimonial(data);
    setPending(false);

    if (!res.ok) {
      setErrors(res.errors);
      return;
    }

    setTestimonials((prev) => [res.testimonial, ...prev]);
    setSuccess(true);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="text-base font-semibold">
            Laisser un témoignage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Note
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5"
                    aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        value <= (hoverRating || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                name="authorName"
                label="Votre nom"
                defaultValue={defaultName}
                error={errors.authorName?.[0]}
                disabled={pending}
              />
              <Input
                name="authorRole"
                label="Votre rôle"
                defaultValue={defaultRole}
                error={errors.authorRole?.[0]}
                disabled={pending}
              />
            </div>

            <Input
              name="city"
              label="Ville (optionnel)"
              placeholder="Ex : Alger, Oran..."
              error={errors.city?.[0]}
              disabled={pending}
            />

            <TextArea
              name="quote"
              label="Votre témoignage"
              placeholder="Décrivez votre expérience avec DENTALG..."
              rows={4}
              error={errors.quote?.[0]}
              disabled={pending}
            />

            {errors.global && (
              <p className="text-sm text-red-600">{errors.global[0]}</p>
            )}

            {success && (
              <p className="flex items-center gap-1.5 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Merci ! Votre témoignage a été envoyé et sera visible après
                validation.
              </p>
            )}

            <Button type="submit" disabled={pending} className="gap-2">
              <Send className="h-4 w-4" />
              Envoyer mon témoignage
            </Button>
          </form>
        </CardContent>
      </Card>

      {testimonials.length > 0 && (
        <Card>
          <CardHeader className="border-b px-6 py-4">
            <CardTitle className="text-base font-semibold">
              Mes témoignages envoyés
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="flex items-start justify-between gap-4 px-6 py-4"
              >
                <div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="mt-1.5 text-sm text-slate-600">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                {t.isPublished ? (
                  <Badge variant="success" className="shrink-0">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Publié
                  </Badge>
                ) : (
                  <Badge variant="warning" className="shrink-0">
                    <Clock className="mr-1 h-3 w-3" />
                    En attente
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
