"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User, Phone, Package, Hash, Wallet, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NuevaVentaPage() {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [productName, setProductName] = useState("");
  const [qty, setQty] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  async function saveSale() {
    if (!customerName || !productName || total <= 0) {
      alert("Completa los datos obligatorios");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("sales").insert({
      customer_name: customerName,
      customer_phone: customerPhone || null,
      product_name: productName,
      qty,
      total,
      status: "pendiente",
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/ventas");
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Nueva venta</h1>
        <p className="text-sm opacity-70">
          Registrar una venta rápidamente
        </p>
      </div>

      {/* FORM */}
      <div className="card p-6 space-y-6">
        {/* CLIENTE */}
        <div className="space-y-3">
          <label className="text-sm opacity-70">Cliente</label>

          <div className="flex items-center gap-2">
            <User size={16} />
            <input
              placeholder="Nombre del cliente"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <Phone size={16} />
            <input
              placeholder="Teléfono (opcional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        {/* PRODUCTO */}
        <div className="space-y-3">
          <label className="text-sm opacity-70">Producto</label>

          <div className="flex items-center gap-2">
            <Package size={16} />
            <input
              placeholder="Nombre del producto"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <Hash size={16} />
            <input
              type="number"
              min={1}
              placeholder="Cantidad"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-32"
            />
          </div>
        </div>

        {/* TOTAL */}
        <div className="space-y-3">
          <label className="text-sm opacity-70">Total</label>

          <div className="flex items-center gap-2">
            <Wallet size={16} />
            <input
              type="number"
              min={0}
              placeholder="Monto total"
              value={total}
              onChange={(e) => setTotal(Number(e.target.value))}
              className="flex-1 text-lg font-semibold"
            />
          </div>
        </div>

        {/* ACTION */}
        <button
          onClick={saveSale}
          disabled={loading}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          <Save size={16} />
          {loading ? "Guardando…" : "Guardar venta"}
        </button>
      </div>
    </div>
  );
}
