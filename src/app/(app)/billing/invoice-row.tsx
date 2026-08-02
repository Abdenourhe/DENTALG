"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export function InvoiceRow({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <tr
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (
          target.closest("a") ||
          target.closest("button") ||
          target.closest("input") ||
          target.closest("select") ||
          target.closest("form")
        ) {
          return;
        }
        router.push(`/billing/${id}`);
      }}
      className="cursor-pointer hover:bg-slate-50"
    >
      {children}
    </tr>
  );
}
