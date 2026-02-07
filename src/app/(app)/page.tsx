"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  Wallet,
  Plus,
  List,
  BarChart3,
  Boxes,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

/* ======================
   TYPES
====================== */

type Sale = {
  total: number;
  status: "pendiente" | "enviado";
  created_at: string;
  sale_items: {
    qty: number;
    unit_price: number;
    products: {
      cost: number;
    }[];
  }[];
};

type Expense = {
  amount: number;
  expense_date: string;
};

/* ======================
   PAGE
====================== */

export default function DashboardPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + "-01";

  /* ======================
     LOAD DATA
  ====================== */

  async function loadData() {
    setLoading(true);

    const { data: salesData } = await supabase
      .from("sales")
      .select(`
        total,
        status,
        created_at,
        sale_items (
          qty,
          unit_price,
          products (
            cost
          )
        )
      `);

    const { data: expensesData } = await supabase
      .from("expenses")
      .select("amount, expense_date");

    setSales(salesData || []);
    setExpenses(expensesData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  /* ======================
     CALCULOS
  ====================== */

  const ventasHoy = useMemo(
    () =>
      sales
        .filter((s) => s.created_at.startsWith(today))
        .reduce((sum, s) => sum + s.total, 0),
    [sales]
  );

  const ventasMes = useMemo(
    () =>
      sales
        .filter((s) => s.created_at.startsWith(today.slice(0, 7)))
        .reduce((sum, s) => sum + s.total, 0),
    [sales]
  );

  const pendiente = useMemo(
    () =>
      sales
        .filter((s) => s.status === "pendiente")
        .reduce((sum, s) => sum + s.total, 0),
    [sales]
  );

  const enviado = useMemo(
    () =>
      sales
        .filter((s) => s.status === "enviado")
        .reduce((sum, s) => sum + s.total, 0),
    [sales]
  );

  const costoHoy = useMemo(
    () =>
      sales
        .filter((s) => s.created_at.startsWith(today))
        .flatMap((s) => s.sale_items)
        .reduce((sum, i) => {
          const cost = i.products[0]?.cost || 0;
          return sum + cost * i.qty;
        }, 0),
    [sales]
  );

  const gastosHoy = useMemo(
    () =>
      expenses
        .filter((e) => e.expense_date === today)
        .reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const gananciaHoy = ventasHoy - costoHoy - gastosHoy;

  /* ======================
     UI
  ====================== */

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      {/* HEADER */}
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted">
          Resumen general del negocio
        </p>
      </header>

      {/* MÉTRICAS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Metric
          label="Ventas hoy"
          value={`Q${ventasHoy}`}
          icon={<TrendingUp size={18} />}
          accent
        />
        <Metric
          label="Ventas del mes"
          value={`Q${ventasMes}`}
          icon={<Calendar size={18} />}
        />
        <Metric
          label="Pendiente"
          value={`Q${pendiente}`}
          icon={<Clock size={18} />}
        />
        <Metric
          label="Enviado"
          value={`Q${enviado}`}
          icon={<CheckCircle size={18} />}
        />
        <Metric
          label="Ganancia hoy"
          value={`Q${gananciaHoy}`}
          icon={<Wallet size={18} />}
        />
      </section>

      {/* ACCIONES */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium text-muted uppercase tracking-wider">
          Gestión
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Action
            href="/ventas/nueva"
            icon={<Plus size={18} />}
            label="Nueva venta"
            primary
          />
          <Action
            href="/inventario"
            icon={<Boxes size={18} />}
            label="Inventario de productos"
          />
          <Action
            href="/ventas"
            icon={<List size={18} />}
            label="Libro diario"
          />
          <Action
            href="/caja"
            icon={<Wallet size={18} />}
            label="Caja diaria"
          />
          <Action
            href="/graficas"
            icon={<BarChart3 size={18} />}
            label="Gráficas"
          />
        </div>
      </section>

      {loading && (
        <p className="text-sm opacity-60">Cargando datos…</p>
      )}
    </main>
  );
}

/* ======================
   COMPONENTES
====================== */

function Metric({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-muted text-sm">
        {icon}
        <span>{label}</span>
      </div>

      <div
        className={`text-3xl font-semibold tracking-tight ${
          accent ? "text-green-400" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Action({
  href,
  icon,
  label,
  primary,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group card p-5 flex items-center gap-4 transition
        hover:-translate-y-[1px] hover:shadow-md
        ${primary ? "border-green-500/30" : ""}
      `}
    >
      <div
        className={`h-9 w-9 rounded-md flex items-center justify-center
          ${
            primary
              ? "bg-green-500/20 text-green-400"
              : "bg-white/5 text-muted"
          }
        `}
      >
        {icon}
      </div>

      <span className="font-medium">{label}</span>
    </Link>
  );
}
