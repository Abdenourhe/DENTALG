"use client";

import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`rounded-xl border border-slate-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className = "" }: CardProps) {
  return (
    <div
      className={`flex items-center justify-between px-5 py-4 border-b border-slate-100 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }: CardProps) {
  return (
    <h3
      className={`text-base font-semibold tracking-tight text-slate-900 ${className}`}
    >
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "" }: CardProps) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}
