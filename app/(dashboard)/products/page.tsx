// File: app/(dashboard)/products/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInventory } from "@/lib/store";
import {
  CATALOG_LABEL,
  CATALOG_TONE,
  DEFAULT_PRODUCT_QUERY,
  filterProducts,
  findSupplier,
  getStockLevel,
  uniqueCategories,
  type LevelFilter,
  type ProductQuery,
  type ProductSort,
} from "@/lib/selectors";
import { formatNumber, formatPeso } from "@/lib/format";
import type { Product, ProductIcon, ProductInput } from "@/lib/types";
import {
  IconArrowDown,
  IconArrowUp,
  IconEdit,
  IconPlus,
  IconTrash,
  IconX,
  PRODUCT_ICON_MAP,
} from "@/components/ims-icons";
import Modal from "@/components/ims-modal";

type FormState = {
  name: string;
  sku: string;
  category: string;
  icon: ProductIcon;
  stock: string;
  reorderLevel: string;
  unitPrice: string;
  supplierId: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  sku: "",
  category: "",
  icon: "box",
  stock: "0",
  reorderLevel: "10",
  unitPrice: "0",
  supplierId: "",
};

const ICON_OPTIONS: ProductIcon[] = ["paper", "ink", "usb", "pen", "box"];

function toForm(p: Product): FormState {
  return {
    name: p.name,
    sku: p.sku,
    category: p.category,
    icon: p.icon,
    stock: String(p.stock),
    reorderLevel: String(p.reorderLevel),
    unitPrice: String(p.unitPrice),
    supplierId: p.supplierId ?? "",
  };
}

function ProductsInner() {
  const {
    products,
    suppliers,
    isReady,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useInventory();
  const params = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState<ProductQuery>(DEFAULT_PRODUCT_QUERY);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Deep links: /products?category=Electronics and /products?add=1
  useEffect(() => {
    const cat = params.get("category");
    if (cat) setQuery((q) => ({ ...q, category: cat }));
    const q = params.get("q"); // from the top search bar, Transactions, etc.
    if (q !== null) setQuery((prev) => ({ ...prev, search: q }));
    if (params.get("add") === "1") {
      setEditingId(null);
      setForm(EMPTY_FORM);
      setError("");
      setModalOpen(true);
    }
  }, [params]);

  if (!isReady) return <p className="page-sub">Loading…</p>;

  const categories = uniqueCategories(products);
  const rows = filterProducts(products, query);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }
  function openEdit(p: Product) {
    setEditingId(p.id);
    setForm(toForm(p));
    setError("");
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setError("");
  }
  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input: ProductInput = {
      name: form.name,
      sku: form.sku,
      category: form.category,
      icon: form.icon,
      stock: Number(form.stock),
      reorderLevel: Number(form.reorderLevel),
      unitPrice: Number(form.unitPrice),
      supplierId: form.supplierId || null,
    };
    const result = editingId
      ? updateProduct(editingId, input)
      : addProduct(input);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotice(
      editingId
        ? `Updated ${input.name.trim()}.`
        : `Added ${input.name.trim()}.`,
    );
    closeModal();
  }

  function handleDelete(p: Product) {
    if (!window.confirm(`Delete "${p.name}"? Its transaction history is kept.`))
      return;
    const result = deleteProduct(p.id);
    setNotice(result.ok ? `Deleted ${p.name}.` : result.error);
  }

  return (
    <>
      <p className="page-title">Products</p>
      <p className="page-sub">Manage your product catalog</p>

      {notice && (
        <div className="banner success">
          {notice}
          <button
            className="icon-btn"
            style={{ marginLeft: "auto", border: "none", background: "none" }}
            onClick={() => setNotice("")}
            aria-label="Dismiss"
          >
            <IconX size={14} />
          </button>
        </div>
      )}

      <div className="card">
        <div className="row-between" style={{ marginBottom: 14 }}>
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              margin: 0,
              fontFamily: "var(--font-display)",
            }}
          >
            All products ({rows.length})
          </p>
          <button className="primary" onClick={openAdd}>
            <IconPlus size={15} /> Add product
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Search by name or SKU"
            style={{ flex: 1, minWidth: 180 }}
            value={query.search}
            onChange={(e) => setQuery({ ...query, search: e.target.value })}
          />
          <select
            value={query.category}
            onChange={(e) => setQuery({ ...query, category: e.target.value })}
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={query.level}
            onChange={(e) =>
              setQuery({ ...query, level: e.target.value as LevelFilter })
            }
          >
            <option value="all">All statuses</option>
            <option value="healthy">{CATALOG_LABEL.healthy}</option>
            <option value="near">{CATALOG_LABEL.near}</option>
            <option value="below">{CATALOG_LABEL.below}</option>
            <option value="out">{CATALOG_LABEL.out}</option>
          </select>
          <select
            value={query.sort}
            onChange={(e) =>
              setQuery({ ...query, sort: e.target.value as ProductSort })
            }
          >
            <option value="name">Sort: Name</option>
            <option value="stock-asc">Sort: Stock (low → high)</option>
            <option value="stock-desc">Sort: Stock (high → low)</option>
            <option value="value-desc">Sort: Value</option>
          </select>
        </div>

        {rows.length === 0 ? (
          <div className="empty">No products match your filters.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Supplier</th>
                <th className="right">Price</th>
                <th className="right">Stock</th>
                <th className="right">Status</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const level = getStockLevel(p);
                const Icon = PRODUCT_ICON_MAP[p.icon];
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="p-cell">
                        <div className="p-avatar">
                          <Icon size={16} />
                        </div>
                        <div>
                          {p.name}
                          <span className="p-sku">{p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td>
                      {findSupplier(suppliers, p.supplierId)?.name ?? "—"}
                    </td>
                    <td className="right num">{formatPeso(p.unitPrice)}</td>
                    <td className="right num">{formatNumber(p.stock)}</td>
                    <td className="right">
                      <span className={`dot-status ${CATALOG_TONE[level]}`}>
                        {CATALOG_LABEL[level]}
                      </span>
                    </td>
                    <td className="right">
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button
                          className="icon-btn"
                          title="Stock in"
                          onClick={() =>
                            router.push(`/stock-in?productId=${p.id}`)
                          }
                          aria-label={`Stock in ${p.name}`}
                        >
                          <IconArrowDown size={14} />
                        </button>
                        <button
                          className="icon-btn"
                          title="Stock out"
                          onClick={() =>
                            router.push(`/stock-out?productId=${p.id}`)
                          }
                          aria-label={`Stock out ${p.name}`}
                        >
                          <IconArrowUp size={14} />
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => openEdit(p)}
                          aria-label={`Edit ${p.name}`}
                        >
                          <IconEdit size={14} />
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => handleDelete(p)}
                          aria-label={`Delete ${p.name}`}
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <Modal
          title={editingId ? "Edit product" : "Add product"}
          onClose={closeModal}
          footer={
            <>
              <button type="button" className="btn-ghost" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" form="product-form" className="primary">
                {editingId ? "Save changes" : "Add product"}
              </button>
            </>
          }
        >
          <form id="product-form" onSubmit={handleSubmit}>
            {error && <div className="banner error">{error}</div>}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <div style={{ gridColumn: "span 2" }}>
                <p className="field-label">Product name</p>
                <input
                  style={{ width: "100%" }}
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="e.g. Bond paper A4"
                  required
                />
              </div>
              <div>
                <p className="field-label">SKU</p>
                <input
                  style={{ width: "100%" }}
                  value={form.sku}
                  onChange={(e) => setField("sku", e.target.value)}
                  placeholder="SK-1042"
                  required
                />
              </div>
              <div>
                <p className="field-label">Category</p>
                <input
                  style={{ width: "100%" }}
                  list="category-options"
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                  placeholder="Pick or type new"
                  required
                />
                <datalist id="category-options">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div>
                <p className="field-label">Supplier</p>
                <select
                  style={{ width: "100%" }}
                  value={form.supplierId}
                  onChange={(e) => setField("supplierId", e.target.value)}
                >
                  <option value="">None</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="field-label">Icon</p>
                <select
                  style={{ width: "100%" }}
                  value={form.icon}
                  onChange={(e) =>
                    setField("icon", e.target.value as ProductIcon)
                  }
                >
                  {ICON_OPTIONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="field-label">Stock</p>
                <input
                  style={{ width: "100%" }}
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setField("stock", e.target.value)}
                />
              </div>
              <div>
                <p className="field-label">Reorder level</p>
                <input
                  style={{ width: "100%" }}
                  type="number"
                  min="0"
                  value={form.reorderLevel}
                  onChange={(e) => setField("reorderLevel", e.target.value)}
                />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <p className="field-label">Unit price (₱)</p>
                <input
                  style={{ width: "100%" }}
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.unitPrice}
                  onChange={(e) => setField("unitPrice", e.target.value)}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="page-sub">Loading…</p>}>
      <ProductsInner />
    </Suspense>
  );
}
