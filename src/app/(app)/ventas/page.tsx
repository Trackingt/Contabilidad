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
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

/* =====================
   TYPES
===================== */

type SaleItem = {
  id: string;
  qty: number;
  unit_price: number;
  products: {
    name: string;
    cost: number;
  }[];
};

type Sale = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  total: number;
  status: "pendiente" | "enviado";
  created_at: string;
  sale_items: SaleItem[];
};

/* =====================
   PAGE
===================== */

export default function VentasPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [openRows, setOpenRows] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  async function loadSales() {
    setLoading(true);

    const { data } = await supabase
      .from("sales")
      .select(`
        id,
        customer_name,
        customer_phone,
        total,
        status,
        created_at,
        sale_items (
          id,
          qty,
          unit_price,
          products (
            name,
            cost
          )
        )
      `)
      .order("created_at", { ascending: false });

    setSales((data as Sale[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadSales();
  }, []);

  /* =====================
     GANANCIA POR VENTA
  ===================== */

  function getProfit(sale: Sale) {
    return sale.sale_items.reduce((sum, i) => {
      const cost = i.products[0]?.cost || 0;
      return sum + (i.unit_price - cost) * i.qty;
    }, 0);
  }

  /* =====================
     UI
  ===================== */

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Ventas</h1>

      <div className="card p-0 overflow-x-auto">
        {loading ? (
          <p className="p-4">Cargando…</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="p-3"></th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Cliente</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-right">Ganancia</th>
                <th className="p-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => {
                const open = openRows.includes(s.id);
                const profit = getProfit(s);

                return (
                  <>
                    <tr key={s.id} className="border-t">
                      <td className="p-3">
                        <button
                          onClick={() =>
                            setOpenRows((prev) =>
                              prev.includes(s.id)
                                ? prev.filter((i) => i !== s.id)
                                : [...prev, s.id]
                            )
                          }
                        >
                          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </td>
                      <td className="p-3">
                        {new Date(s.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">{s.customer_name}</td>
                      <td className="p-3 text-right">Q{s.total.toFixed(2)}</td>
                      <td className="p-3 text-right text-green-600">
                        Q{profit.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">{s.status}</td>
                    </tr>

                    {open && (
                      <tr className="bg-base-200/40">
                        <td colSpan={6} className="p-3">
                          <ul className="space-y-1">
                            {s.sale_items.map((i) => (
                              <li key={i.id}>
                                {i.qty} × {i.products[0]?.name} — Q
                                {(i.qty * i.unit_price).toFixed(2)}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
