"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User, Phone, Package, Hash, Save, Search, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  price: number;
};

export default function NuevaVentaPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [qty, setQty] = useState(1);
  const [dtfCost, setDtfCost] = useState(0);

  const [loading, setLoading] = useState(false);

  /* ================= LOAD PRODUCTS ================= */
  async function loadProducts(q = "") {
    let query = supabase
      .from("products")
      .select("id, name, sku, stock, price")
      .order("name");

    if (q.trim()) {
      query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
    }

    const { data } = await query;
    setProducts((data as Product[]) || []);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadProducts(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  /* ================= SAVE SALE ================= */
  async function saveSale() {
    if (!customerName || !productId || qty <= 0) {
      alert("Completa los datos obligatorios");
      return;
    }

    setLoading(true);

    const { error } = await supabase.rpc("create_sale", {
      p_customer_name: customerName,
      p_customer_phone: customerPhone || null,
      p_product_id: productId,
      p_qty: qty,
      p_dtf_cost: dtfCost,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/ventas");
  }

  const selectedProduct = products.find((p) => p.id === productId);

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-24">
      <h1 className="text-2xl font-semibold">Nueva venta</h1>

      <div className="card p-6 space-y-6">
        {/* ================= CLIENTE ================= */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Cliente</label>

          <div className="flex gap-2 items-center">
            <User size={16} />
            <input
              className="input input-bordered w-full"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nombre del cliente"
            />
          </div>

          <div className="flex gap-2 items-center">
            <Phone size={16} />
            <input
              className="input input-bordered w-full"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Teléfono (opcional)"
            />
          </div>
        </div>

        {/* ================= PRODUCTO ================= */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Producto</label>

          {/* Buscador */}
          <div className="flex gap-2 items-center">
            <Search size={16} />
            <input
              className="input input-bordered w-full"
              placeholder="Buscar por nombre o código"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Selector */}
          <div className="flex gap-2 items-center">
            <Package size={16} />
            <select
              className="select select-bordered w-full"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Seleccionar producto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                  {p.name}
                  {p.sku ? ` · ${p.sku}` : ""}
                  {` (Stock: ${p.stock})`}
                </option>
              ))}
            </select>
          </div>

          {/* Cantidad */}
          <div className="flex gap-2 items-center">
            <Hash size={16} />
            <input
              type="number"
              min={1}
              className="input input-bordered w-full"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
          </div>

          {/* Info producto */}
          {selectedProduct && (
            <div className="text-sm opacity-70">
              Precio unitario: Q{selectedProduct.price.toFixed(2)} ·
              Disponible: {selectedProduct.stock}
            </div>
          )}
        </div>

        {/* ================= DTF ================= */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Costo DTF</label>
          <div className="flex gap-2 items-center">
            <DollarSign size={16} />
            <input
              type="number"
              min={0}
              step="0.01"
              className="input input-bordered w-full"
              value={dtfCost}
              onChange={(e) => setDtfCost(Number(e.target.value))}
              placeholder="Q0.00"
            />
          </div>
          <div className="text-xs opacity-60">
            Este costo se descuenta automáticamente de la ganancia
          </div>
        </div>

        {/* ================= SAVE ================= */}
        <button
          onClick={saveSale}
          disabled={loading}
          className="btn btn-primary w-full flex justify-center gap-2"
        >
          <Save size={16} />
          {loading ? "Guardando..." : "Guardar venta"}
        </button>
      </div>
    </div>
  );
}
