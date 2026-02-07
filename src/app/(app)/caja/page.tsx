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

type Sale = {
  total: number;
};

type Expense = {
  id: string;
  description: string;
  amount: number;
};

export default function CajaPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  async function loadData() {
    const { data: salesData } = await supabase
      .from("sales")
      .select("total")
      .gte("created_at", `${date}T00:00:00`)
      .lte("created_at", `${date}T23:59:59`);

    const { data: expensesData } = await supabase
      .from("expenses")
      .select("*")
      .eq("expense_date", date);

    setSales(salesData || []);
    setExpenses(expensesData || []);
  }

  useEffect(() => {
    loadData();
  }, [date]);

  const ingresos = useMemo(
    () => sales.reduce((s, r) => s + r.total, 0),
    [sales]
  );

  const gastos = useMemo(
    () => expenses.reduce((s, r) => s + r.amount, 0),
    [expenses]
  );

  const ganancia = ingresos - gastos;

  async function addExpense(desc: string, amount: number) {
    await supabase.from("expenses").insert({
      description: desc,
      amount,
      expense_date: date,
    });
    loadData();
  }

  async function deleteExpense(id: string) {
    await supabase.from("expenses").delete().eq("id", id);
    loadData();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Caja diaria</h1>

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <div className="grid grid-cols-3 gap-4">
        <div>Ingresos: Q{ingresos}</div>
        <div>Gastos: Q{gastos}</div>
        <div>Ganancia: Q{ganancia}</div>
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Monto</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id}>
              <td>{e.description}</td>
              <td>Q{e.amount}</td>
              <td>
                <button onClick={() => deleteExpense(e.id)}>
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
