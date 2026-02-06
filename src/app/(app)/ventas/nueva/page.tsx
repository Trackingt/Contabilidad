"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  User,
  Phone,
  Package,
  Hash,
  Save,
  Search,
  DollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* =====================
   TYPES
===================== */

type Product = {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  price: number;
};

/* =====================
   PAGE
===================== */

export default function NuevaVentaPage() {
  const router = useRouter();

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [openProducts, setOpenProducts] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [qty, setQty] = useState(1);
  const [dtfCost, setDtfCost] = useState(0);

  const [loading, setLoading] = useState(false);

  /* ================= LOAD PRODUCTS ================= */

  async function loadProducts(q = "") {
    let query = supabase
      .from("products")
      .select("id,name,sku,stock,price")
      .eq("active", true)
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

  /* ================= CLOSE DROPDOWN ON OUTSIDE CLICK ================= */

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenProducts(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  /* ================= UI ================= */

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

          {/* Selector buscable */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex gap-2 items-center">
              <Package size={16} />
              <input
                className="input input-bordered w-full"
                placeholder="Buscar y seleccionar producto"
                value={
                  selectedProduct
                    ? `${selectedProduct.name}${
                        selectedProduct.sku
                          ? " · " + selectedProduct.sku
                          : ""
                      }`
                    : search
                }
                onChange={(e) => {
                  setSearch(e.target.value);
                  setProductId("");
                  setOpenProducts(true);
                }}
                onFocus={() => setOpenProducts(true)}
              />
            </div>

            {openProducts && (
              <div className="absolute z-20 mt-1 w-full bg-base-100 border rounded-xl shadow max-h-60 overflow-auto">
                {products.length === 0 && (
                  <div className="p-3 text-sm opacity-60">
                    No hay productos
                  </div>
                )}

                {products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    disabled={p.stock <= 0}
                    onClick={() => {
                      setProductId(p.id);
                      setOpenProducts(false);
                      setSearch("");
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-base-200 ${
                      p.stock <= 0
                        ? "opacity-40 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <div className="font-medium">
                      {p.name}
                      {p.sku ? ` · ${p.sku}` : ""}
                    </div>
                    <div className="text-xs opacity-60">
                      Stock: {p.stock} · Precio: Q{p.price.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            )}
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
