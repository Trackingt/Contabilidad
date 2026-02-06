"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  cost: number;
  price: number;
};

export default function InventarioPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  async function load() {
    setLoading(true);

    let query = supabase
      .from("products")
      .select("id,name,sku,stock,cost,price")
      .order("created_at", { ascending: false });

    if (q.trim()) {
      query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
    }

    const { data, error } = await query;
    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setItems((data as Product[]) || []);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="p-4 pb-24">
      {/* BUSCADOR */}
      <div className="mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o código..."
          className="input input-bordered w-full"
        />
      </div>

      {loading && (
        <div className="text-sm opacity-70">Cargando...</div>
      )}

      {/* LISTA */}
      <div className="space-y-3">
        {items.map((p) => (
          <div key={p.id} className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  {p.sku && (
                    <div className="text-xs opacity-70">
                      Código: {p.sku}
                    </div>
                  )}
                </div>

                <span
                  className={`badge ${
                    p.stock <= 0
                      ? "badge-error"
                      : "badge-success"
                  }`}
                >
                  {p.stock <= 0
                    ? "No disponible"
                    : `${p.stock} disponibles`}
                </span>
              </div>

              <div className="mt-2 text-sm">
                <div>Precio: Q{Number(p.price).toFixed(2)}</div>
                <div className="opacity-70">
                  Costo: Q{Number(p.cost).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BOTÓN CREAR */}
      <button
        className="btn btn-primary fixed left-4 right-4 bottom-5"
        onClick={() => setOpenCreate(true)}
      >
        Crear producto
      </button>

      {openCreate && (
        <CreateProductModal
          onClose={() => setOpenCreate(false)}
          onCreated={() => {
            setOpenCreate(false);
            load();
          }}
        />
      )}
    </div>
  );
}

/* ================= MODAL CREAR ================= */

function CreateProductModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");

  // 🔑 CLAVE: numéricos inician VACÍOS
  const [stock, setStock] = useState<number | "">("");
  const [cost, setCost] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");

  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) {
      alert("Nombre requerido");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("products").insert({
      name: name.trim(),
      sku: sku.trim() ? sku.trim() : null,
      stock: Number(stock || 0),
      cost: Number(cost || 0),
      price: Number(price || 0),
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    onCreated();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-base-100 w-full sm:max-w-md rounded-2xl p-4">
        <div className="font-semibold text-lg mb-3">
          Crear producto
        </div>

        <div className="space-y-2">
          <input
            className="input input-bordered w-full"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="input input-bordered w-full"
            placeholder="Código de producto (SKU)"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />

          <input
            className="input input-bordered w-full"
            type="number"
            inputMode="numeric"
            placeholder="Stock"
            value={stock}
            onChange={(e) =>
              setStock(
                e.target.value === ""
                  ? ""
                  : Number(e.target.value)
              )
            }
          />

          <input
            className="input input-bordered w-full"
            type="number"
            inputMode="decimal"
            placeholder="Costo"
            value={cost}
            onChange={(e) =>
              setCost(
                e.target.value === ""
                  ? ""
                  : Number(e.target.value)
              )
            }
          />

          <input
            className="input input-bordered w-full"
            type="number"
            inputMode="decimal"
            placeholder="Precio"
            value={price}
            onChange={(e) =>
              setPrice(
                e.target.value === ""
                  ? ""
                  : Number(e.target.value)
              )
            }
          />
        </div>

        <div className="flex gap-2 mt-4">
          <button
            className="btn btn-ghost w-1/2"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className="btn btn-primary w-1/2"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
