"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function AnimatedCTA() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-primary-900 px-6 py-16 text-center"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-primary-700/40 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
        </div>
        <div className="relative">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Prêt à moderniser votre cabinet ?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-primary-200">
            Rejoignez les cabinets dentaires qui utilisent DENTALG pour gagner
            du temps chaque jour.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary-900 shadow-lg transition-all hover:bg-primary-50"
          >
            Commencer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
