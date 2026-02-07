"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  CalendarDays,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

/* =====================
   TYPES
===================== */

type Sale = {
  total: number;
};

type Expense = {
  id: string;
  description: string;
  amount: number;
};

/* =====================
   PAGE
===================== */

export default function CajaPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState(0);

  /* =====================
     LOAD DATA
  ===================== */

  async function loadData() {
    const { data: salesData } = await supabase
      .from("sales")
      .select("total")
      .gte("created_at", `${date}T00:00:00`)
      .lte("created_at", `${date}T23:59:59`);

    const { data: expensesData } = await supabase
      .from("expenses")
      .select("*")
      .eq("expense_date", date)
      .order("created_at", { ascending: false });

    setSales(salesData || []);
    setExpenses(expensesData || []);
  }

  useEffect(() => {
    loadData();
  }, [date]);

  /* =====================
     CALCULOS
  ===================== */

  const ingresos = useMemo(
    () => sales.reduce((s, r) => s + Number(r.total), 0),
    [sales]
  );

  const gastos = useMemo(
    () => expenses.reduce((s, r) => s + Number(r.amount), 0),
    [expenses]
  );

  const ganancia = ingresos - gastos;

  /* =====================
     ACTIONS
  ===================== */

  async function addExpense() {
    if (!desc || amount <= 0) {
      alert("Ingresa descripción y monto válido");
      return;
    }

    await supabase.from("expenses").insert({
      description: desc,
      amount,
      expense_date: date,
    });

    setDesc("");
    setAmount(0);
    loadData();
  }

  async function deleteExpense(id: string) {
    const ok = confirm("¿Eliminar este gasto?");
    if (!ok) return;

    await supabase.from("expenses").delete().eq("id", id);
    loadData();
  }

  /* =====================
     UI
  ===================== */

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Caja diaria</h1>
        <p className="text-sm opacity-70">
          Control de ingresos, gastos y ganancia
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
            Q{ingresos.toFixed(2)}
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} />
            <span className="text-sm opacity-70">Gastos</span>
          </div>
          <p className="text-2xl font-semibold text-red-500">
            Q{gastos.toFixed(2)}
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={16} />
            <span className="text-sm opacity-70">Ganancia</span>
          </div>
          <p
            className={`text-2xl font-semibold ${
              ganancia >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            Q{ganancia.toFixed(2)}
          </p>
        </div>
      </div>

      {/* NUEVO GASTO */}
      <div className="card p-5 space-y-4">
        <h2 className="font-medium flex items-center gap-2">
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
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <button onClick={addExpense} className="btn btn-primary">
            Agregar
          </button>
        </div>
      </div>

      {/* LISTA GASTOS */}
      <div className="card p-0 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="p-3 text-left">Descripción</th>
              <th className="p-3 text-right">Monto</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-3">{e.description}</td>
                <td className="p-3 text-right text-red-500">
                  Q{e.amount.toFixed(2)}
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => deleteExpense(e.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Eliminar gasto"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {expenses.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="p-6 text-center opacity-60"
                >
                  No hay gastos este día
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
