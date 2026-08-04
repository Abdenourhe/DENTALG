"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, Variants } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CreditCard,
  Stethoscope,
  Briefcase,
  LogOut,
  UserCog,
  FlaskConical,
  FileText,
  Settings,
  Megaphone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FeatureKey } from "@/lib/features";

const allNavItems = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    feature: null as FeatureKey | null,
  },
  {
    href: "/patients",
    label: "Patients",
    icon: Users,
    feature: null as FeatureKey | null,
  },
  {
    href: "/appointments",
    label: "Rendez-vous",
    icon: CalendarDays,
    feature: null as FeatureKey | null,
  },
  {
    href: "/procedures",
    label: "Actes",
    icon: Stethoscope,
    feature: null as FeatureKey | null,
  },
  {
    href: "/billing",
    label: "Facturation",
    icon: CreditCard,
    feature: "INVOICING" as FeatureKey,
  },
  {
    href: "/prescriptions",
    label: "Ordonnances",
    icon: FileText,
    feature: "PRESCRIPTIONS" as FeatureKey,
  },
  {
    href: "/lab",
    label: "Labo",
    icon: FlaskConical,
    feature: "LAB_ORDERS" as FeatureKey,
  },
  {
    href: "/carrieres",
    label: "Carrière",
    icon: Briefcase,
    feature: "JOB_OFFERS" as FeatureKey,
  },
  {
    href: "/messages",
    label: "Messages",
    icon: Megaphone,
    feature: null as FeatureKey | null,
  },
  {
    href: "/users",
    label: "Utilisateurs",
    icon: UserCog,
    feature: null as FeatureKey | null,
  },
  {
    href: "/settings/features",
    label: "Fonctionnalités",
    icon: Settings,
    feature: null as FeatureKey | null,
    ownerOnly: true,
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [enabledFeatures, setEnabledFeatures] = useState<FeatureKey[]>([]);
  const role = session?.user?.role;
  const isOwner = role === "OWNER";

  useEffect(() => {
    if (session?.user?.clinicId) {
      fetch("/api/clinic/features")
        .then((r) => r.json())
        .then((data) => {
          if (data.ok) setEnabledFeatures(data.features);
        });
    }
  }, [session?.user?.clinicId]);

  const navItems = allNavItems.filter((item) => {
    if (item.ownerOnly && !isOwner) return false;
    if (item.feature && !enabledFeatures.includes(item.feature)) return false;
    return true;
  });

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200/80 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-slate-200/80 px-4">
        <Link href="/dashboard" className="flex items-center justify-center">
          <img
            src="/logo.svg"
            alt="DENTALG"
            className="h-10 w-auto object-contain transition-transform duration-300 hover:scale-105"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5">
        <motion.ul
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-1"
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <motion.li key={item.href} variants={itemVariants}>
                <Link
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary-50 text-primary-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}

                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${
                      isActive
                        ? "text-primary"
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-200/80 p-3">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-red-50"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          Déconnexion
        </motion.button>
      </div>
    </aside>
  );
}
