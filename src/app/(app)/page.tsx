"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Clock,
  CheckCircle,
  Wallet,
  Plus,
  List,
  BarChart3,
  Boxes,
  Truck,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

/* ======================
   TYPES
====================== */

type SaleItem = {
  qty: number;
  unit_cost: number;
};

type Sale = {
  total: number;
  status: "pendiente" | "enviado";
  created_at: string;
  sale_items: SaleItem[];
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
  const [period, setPeriod] = useState<"day" | "month">("day");

  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);

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
          unit_cost
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
     FILTRO POR PERIODO
  ====================== */

  const salesPeriodo = useMemo(() => {
    return sales.filter((s) =>
      period === "day"
        ? s.created_at.startsWith(today)
        : s.created_at.startsWith(month)
    );
  }, [sales, period, today, month]);

  /* ======================
     CALCULOS CONTABLES
  ====================== */

  const totalVentas = useMemo(
    () => salesPeriodo.reduce((sum, s) => sum + s.total, 0),
    [salesPeriodo]
  );

  const pendiente = useMemo(
    () =>
      salesPeriodo
        .filter((s) => s.status === "pendiente")
        .reduce((sum, s) => sum + s.total, 0),
    [salesPeriodo]
  );

  const enviado = useMemo(
    () =>
      salesPeriodo
        .filter((s) => s.status === "enviado")
        .reduce((sum, s) => sum + s.total, 0),
    [salesPeriodo]
  );

  // 🔥 COSTO REAL (desde sale_items.unit_cost)
  const costoPeriodo = useMemo(
    () =>
      salesPeriodo
        .flatMap((s) => s.sale_items)
        .reduce((sum, i) => sum + i.unit_cost * i.qty, 0),
    [salesPeriodo]
  );

  const gastosPeriodo = useMemo(
    () =>
      expenses
        .filter((e) =>
          period === "day"
            ? e.expense_date === today
            : e.expense_date.startsWith(month)
        )
        .reduce((sum, e) => sum + e.amount, 0),
    [expenses, period, today, month]
  );

  // ✅ GANANCIA REAL
  const gananciaPeriodo = totalVentas - costoPeriodo - gastosPeriodo;

  /* ======================
     UI
  ====================== */

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      {/* HEADER */}
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted">Resumen general del negocio</p>
      </header>

      {/* SELECTOR PERIODO */}
      <div className="flex gap-2">
        <button
          onClick={() => setPeriod("day")}
          className={`px-4 py-1 rounded-md text-sm ${
            period === "day"
              ? "bg-green-500/20 text-green-400"
              : "bg-white/5 text-muted"
          }`}
        >
          Diario
        </button>
        <button
          onClick={() => setPeriod("month")}
          className={`px-4 py-1 rounded-md text-sm ${
            period === "month"
              ? "bg-green-500/20 text-green-400"
              : "bg-white/5 text-muted"
          }`}
        >
          Mensual
        </button>
      </div>

      {/* MÉTRICAS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Metric
          label={period === "day" ? "Ventas hoy" : "Ventas del mes"}
          value={`Q${totalVentas.toFixed(2)}`}
          icon={<TrendingUp size={18} />}
          accent
        />
        <Metric
          label="Pendiente"
          value={`Q${pendiente.toFixed(2)}`}
          icon={<Clock size={18} />}
        />
        <Metric
          label="Enviado"
          value={`Q${enviado.toFixed(2)}`}
          icon={<CheckCircle size={18} />}
        />
        <Metric
          label={period === "day" ? "Ganancia hoy" : "Ganancia del mes"}
          value={`Q${gananciaPeriodo.toFixed(2)}`}
          icon={<Wallet size={18} />}
        />
      </section>

      {/* ACCIONES */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium text-muted uppercase tracking-wider">
          Gestión
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Action href="/ventas/nueva" icon={<Plus size={18} />} label="Nueva venta" primary />
          <Action href="/inventario" icon={<Boxes size={18} />} label="Inventario" />
          <Action href="/ventas" icon={<List size={18} />} label="Libro diario" />
          <Action href="/caja" icon={<Wallet size={18} />} label="Caja diaria" />
          <Action href="/graficas" icon={<BarChart3 size={18} />} label="Gráficas" />
          <Action
            href="https://trackingt.github.io/order-tracking/admin.html"
            icon={<Truck size={18} />}
            label="Seguimiento pedidos"
          />
        </div>
      </section>

      {loading && <p className="text-sm opacity-60">Cargando datos…</p>}
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
      <div className={`text-3xl font-semibold ${accent ? "text-green-400" : ""}`}>
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
  const isExternal = href.startsWith("http");

  const baseClass =
    "group card p-5 flex items-center gap-4 transition hover:-translate-y-px hover:shadow-md";

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={baseClass}>
        <div className="h-9 w-9 rounded-md flex items-center justify-center bg-white/5 text-muted">
          {icon}
        </div>
        <span className="font-medium">{label}</span>
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={`${baseClass} ${primary ? "border-green-500/30" : ""}`}
    >
      <div
        className={`h-9 w-9 rounded-md flex items-center justify-center ${
          primary
            ? "bg-green-500/20 text-green-400"
            : "bg-white/5 text-muted"
        }`}
      >
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
