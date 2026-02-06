"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Search,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ChevronDown,
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

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [search, setSearch] = useState("");

  /* ================= LOAD ================= */

  async function loadSales() {
    setLoading(true);

    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setSales(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadSales();
  }, []);

  /* ================= STATUS UPDATE ================= */

  async function updateStatus(id: string, status: Sale["status"]) {
    await supabase.from("sales").update({ status }).eq("id", id);
    loadSales();
  }

  /* ================= FILTER ================= */

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

  /* ================= TOTALS ================= */

  const total = filteredSales.reduce((s, r) => s + Number(r.total), 0);
  const pendiente = filteredSales
    .filter((s) => s.status === "pendiente")
    .reduce((a, b) => a + Number(b.total), 0);
  const enviado = filteredSales
    .filter((s) => s.status === "enviado")
    .reduce((a, b) => a + Number(b.total), 0);

  /* ================= EXPORT ================= */

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

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Ventas</h1>
        <p className="text-sm opacity-70">Registro de ventas</p>
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
            placeholder="Buscar cliente o producto"
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
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Producto</th>
                <th className="p-3 text-center">Cant.</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-center">Estado</th>
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
                    <div className="relative inline-flex items-center gap-1">
                      <select
                        value={s.status}
                        onChange={(e) =>
                          updateStatus(
                            s.id,
                            e.target.value as Sale["status"]
                          )
                        }
                        className="px-2 py-1 text-xs rounded border bg-transparent"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="enviado">Enviado</option>
                      </select>
                      <ChevronDown size={14} />
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center opacity-60">
                    No hay ventas registradas
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
