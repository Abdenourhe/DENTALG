"use client";

import { motion, Variants, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

/* ─── Stagger container ─── */
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}

export function StaggerContainer({
  children,
  className = "",
  stagger = 0.08,
  delay = 0,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Fade + slide up item ─── */
const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

interface FadeUpProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  children: ReactNode;
}

export function FadeUp({ children, className = "", ...rest }: FadeUpProps) {
  return (
    <motion.div variants={fadeUpVariants} className={className} {...rest}>
      {children}
    </motion.div>
  );
}

/* ─── Fade in ─── */
const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35 } },
};

interface FadeInProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  children: ReactNode;
}

export function FadeIn({ children, className = "", ...rest }: FadeInProps) {
  return (
    <motion.div variants={fadeVariants} className={className} {...rest}>
      {children}
    </motion.div>
  );
}

/* ─── Scale in (cards, modals) ─── */
const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

interface ScaleInProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  children: ReactNode;
}

export function ScaleIn({ children, className = "", ...rest }: ScaleInProps) {
  return (
    <motion.div variants={scaleVariants} className={className} {...rest}>
      {children}
    </motion.div>
  );
}

/* ─── Page wrapper with fade ─── */
interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Hover lift card wrapper ─── */
interface HoverLiftProps {
  children: ReactNode;
  className?: string;
}

export function HoverLift({ children, className = "" }: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated counter ─── */
interface AnimatedCounterProps {
  value: number;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({
  value,
  className = "",
  duration = 1,
}: AnimatedCounterProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={value}
        transition={{ duration: 0.3 }}
      >
        {value}
      </motion.span>
    </motion.span>
  );
}
