"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Search,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Sale = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  product_name: string;
  qty: number;
  total: number;
  status: "pendiente" | "enviado";
  created_at: string;
};

type StatusFilter = "all" | "pendiente" | "enviado";
type DateFilter = "all" | "today" | "month";

export default function VentasPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [search, setSearch] = useState("");

  async function loadSales() {
    setLoading(true);
    const { data } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false });
    setSales(data || []);
    setLoading(false);
  }

  async function toggleStatus(id: string, current: Sale["status"]) {
    const next = current === "pendiente" ? "enviado" : "pendiente";
    await supabase.from("sales").update({ status: next }).eq("id", id);
    loadSales();
  }

  useEffect(() => {
    loadSales();
  }, []);

  /* ======================
     FILTRADO
     ====================== */

  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;

      const d = new Date(s.created_at);
      if (dateFilter === "today" && d.toDateString() !== now.toDateString())
        return false;
      if (
        dateFilter === "month" &&
        (d.getMonth() !== now.getMonth() ||
          d.getFullYear() !== now.getFullYear())
      )
        return false;

      const q = search.toLowerCase();
      if (!q) return true;

      return (
        s.customer_name.toLowerCase().includes(q) ||
        (s.customer_phone || "").toLowerCase().includes(q) ||
        s.product_name.toLowerCase().includes(q)
      );
    });
  }, [sales, statusFilter, dateFilter, search]);

  /* ======================
     TOTALES
     ====================== */

  const total = filteredSales.reduce((s, r) => s + Number(r.total), 0);
  const pendiente = filteredSales
    .filter((s) => s.status === "pendiente")
    .reduce((a, b) => a + Number(b.total), 0);
  const enviado = filteredSales
    .filter((s) => s.status === "enviado")
    .reduce((a, b) => a + Number(b.total), 0);

  /* ======================
     EXPORTAR
     ====================== */

  function exportToExcel() {
    const rows = filteredSales.map((s) => ({
      Fecha: new Date(s.created_at).toLocaleDateString(),
      Cliente: s.customer_name,
      Telefono: s.customer_phone || "",
      Producto: s.product_name,
      Cantidad: s.qty,
      Total_Q: s.total,
      Estado: s.status,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventas");
    XLSX.writeFile(
      wb,
      `ventas-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  }

  /* ======================
     RENDER
     ====================== */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Ventas</h1>
        <p className="text-sm opacity-70">
          Libro diario con filtros y exportación
        </p>
      </div>

      {/* FILTROS */}
      <div className="card p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="flex items-center gap-2">
          <Filter size={16} />
          <select
            className="w-full"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as StatusFilter)
            }
          >
            <option value="all">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="enviado">Enviado</option>
          </select>
        </div>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as DateFilter)}
        >
          <option value="all">Todas las fechas</option>
          <option value="today">Hoy</option>
          <option value="month">Este mes</option>
        </select>

        <div className="md:col-span-2 flex items-center gap-2">
          <Search size={16} />
          <input
            className="w-full"
            placeholder="Buscar cliente, producto o teléfono"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-sm opacity-70">Total</p>
          <p className="text-xl font-semibold">Q{total}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm opacity-70 flex items-center gap-1">
            <Clock size={14} /> Pendiente
          </p>
          <p className="text-xl font-semibold text-yellow-500">
            Q{pendiente}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm opacity-70 flex items-center gap-1">
            <CheckCircle2 size={14} /> Enviado
          </p>
          <p className="text-xl font-semibold text-green-500">
            Q{enviado}
          </p>
        </div>
      </div>

      {/* EXPORT */}
      <div className="flex justify-end">
        <button
          onClick={exportToExcel}
          className="btn btn-primary flex items-center gap-2"
        >
          <FileSpreadsheet size={16} />
          Exportar a Excel
        </button>
      </div>

      {/* TABLA */}
      <div className="card p-0 overflow-x-auto">
        {loading ? (
          <p className="p-4">Cargando…</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-3">Fecha</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Producto</th>
                <th className="p-3 text-center">Cant.</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-center">Estado</th>
                <th className="p-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">{s.customer_name}</td>
                  <td className="p-3">{s.product_name}</td>
                  <td className="p-3 text-center">{s.qty}</td>
                  <td className="p-3 text-right font-medium">
                    Q{s.total}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        s.status === "enviado"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleStatus(s.id, s.status)}
                      className="btn"
                    >
                      Cambiar
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center opacity-60">
                    No hay resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
