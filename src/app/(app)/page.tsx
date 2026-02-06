import Link from "next/link";
import { Boxes } from "lucide-react";
import {
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  Wallet,
  Plus,
  List,
  BarChart3,
} from "lucide-react";

export default function DashboardPage() {
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
          value="Q24"
          icon={<TrendingUp size={18} />}
          accent
        />
        <Metric
          label="Ventas del mes"
          value="Q24"
          icon={<Calendar size={18} />}
        />
        <Metric
          label="Pendiente"
          value="Q0"
          icon={<Clock size={18} />}
        />
        <Metric
          label="Enviado"
          value="Q24"
          icon={<CheckCircle size={18} />}
        />
        <Metric
          label="Ganancia hoy"
          value="Q24"
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
