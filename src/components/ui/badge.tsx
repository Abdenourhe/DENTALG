"use client";

import React from "react";
import { motion } from "framer-motion";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  pulse?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-primary-50 text-primary-700 ring-primary-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
};

export function Badge({
  children,
  variant = "default",
  className = "",
  pulse = false,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${variants[variant]} ${className}`}
    >
      {pulse && (
        <motion.span
          className={`h-1.5 w-1.5 rounded-full ${
            variant === "danger"
              ? "bg-red-500"
              : variant === "warning"
                ? "bg-amber-500"
                : variant === "success"
                  ? "bg-emerald-500"
                  : "bg-primary-500"
          }`}
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {children}
    </span>
  );
}
