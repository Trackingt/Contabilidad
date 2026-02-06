"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  CalendarDays,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Sale = {
  total: number;
  created_at: string;
};

type Expense = {
  id: string;
  description: string;
  amount: number;
  expense_date: string;
};

export default function CajaPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(true);

  /* ======================
     DATA
     ====================== */

  async function loadData() {
    setLoading(true);

    const { data: salesData } = await supabase
      .from("sales")
      .select("total, created_at")
      .gte("created_at", `${date}T00:00:00`)
      .lte("created_at", `${date}T23:59:59`);

    const { data: expensesData } = await supabase
      .from("expenses")
      .select("*")
      .eq("expense_date", date)
      .order("created_at", { ascending: false });

    setSales(salesData || []);
    setExpenses(expensesData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [date]);

  /* ======================
     CALCULOS
     ====================== */

  const ingresos = useMemo(
    () => sales.reduce((s, r) => s + Number(r.total), 0),
    [sales]
  );

  const gastos = useMemo(
    () => expenses.reduce((s, r) => s + Number(r.amount), 0),
    [expenses]
  );

  const ganancia = ingresos - gastos;

  /* ======================
     NUEVO GASTO
     ====================== */

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState(0);

  async function addExpense() {
    if (!desc || amount <= 0) return;

    await supabase.from("expenses").insert({
      description: desc,
      amount,
      expense_date: date,
    });

    setDesc("");
    setAmount(0);
    loadData();
  }

  /* ======================
     RENDER
     ====================== */

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Caja diaria</h1>
        <p className="text-sm opacity-70">
          Control de ingresos y gastos por día
        </p>
      </div>

      {/* FECHA */}
      <div className="card p-4 flex items-center gap-3 w-fit">
        <CalendarDays size={18} />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* RESUMEN */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} />
            <span className="text-sm opacity-70">Ingresos</span>
          </div>
          <p className="text-2xl font-semibold text-green-500">
            Q{ingresos}
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} />
            <span className="text-sm opacity-70">Gastos</span>
          </div>
          <p className="text-2xl font-semibold text-red-500">
            Q{gastos}
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={16} />
            <span className="text-sm opacity-70">Ganancia</span>
          </div>
          <p
            className={`text-2xl font-semibold ${
              ganancia >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            Q{ganancia}
          </p>
        </div>
      </div>

      {/* NUEVO GASTO */}
      <div className="card p-5">
        <h2 className="font-medium mb-3 flex items-center gap-2">
          <Plus size={16} /> Registrar gasto
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            placeholder="Descripción"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <input
            type="number"
            placeholder="Monto"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <button
            onClick={addExpense}
            className="btn btn-primary"
          >
            Agregar
          </button>
        </div>
      </div>

      {/* LISTA GASTOS */}
      <div className="card p-0 overflow-x-auto">
        {loading ? (
          <p className="p-4">Cargando…</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="p-3 text-left">Descripción</th>
                <th className="p-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-3">{e.description}</td>
                  <td className="p-3 text-right text-red-500">
                    Q{e.amount}
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="p-6 text-center opacity-60"
                  >
                    No hay gastos este día
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
