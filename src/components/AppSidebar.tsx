"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  BarChart3,
} from "lucide-react";

const items = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/ventas",
    label: "Ventas",
    icon: ShoppingCart,
  },
  {
    href: "/caja",
    label: "Caja",
    icon: Wallet,
  },
  {
    href: "/graficas",
    label: "Gráficas",
    icon: BarChart3,
  },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block w-56 shrink-0 border-r border-[rgb(var(--border))] bg-[rgb(var(--card))]">
      <nav className="p-4 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition
                ${
                  active
                    ? "bg-green-500/15 text-green-400"
                    : "hover:bg-white/5 text-muted"
                }
              `}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
