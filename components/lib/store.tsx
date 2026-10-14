"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Product = {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  quantity: number;
  reorderLevel: number;
};
export type Category = { id: string; name: string };

type Data = { products: Product[]; categories: Category[] };
type Store = Data & {
  addProduct: (p: Omit<Product, "id">) => void;
  updateQuantity: (id: string, delta: number) => void;
};

const Ctx = createContext<Store | null>(null);
export function useInventory() {
  const v = useContext(Ctx);
  if (!v)
    throw new Error("useInventory must be used inside <InventoryProvider>");
  return v;
}

const KEY = "stockflow-ims";
const uid = () => Math.random().toString(36).slice(2, 9);

const seed: Data = {
  categories: [
    { id: "c1", name: "Office supplies" },
    { id: "c2", name: "Electronics" },
  ],
  products: [
    {
      id: "p1",
      sku: "SK-1042",
      name: "Bond paper A4",
      categoryId: "c1",
      quantity: 320,
      reorderLevel: 50,
    },
    {
      id: "p2",
      sku: "SK-2117",
      name: "Printer ink black",
      categoryId: "c2",
      quantity: 3,
      reorderLevel: 15,
    },
  ],
};

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(seed);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setData(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data));
  }, [data]);

  function addProduct(p: Omit<Product, "id">) {
    setData((d) => ({ ...d, products: [{ ...p, id: uid() }, ...d.products] }));
  }

  function updateQuantity(id: string, delta: number) {
    setData((d) => ({
      ...d,
      products: d.products.map((p) =>
        p.id === id ? { ...p, quantity: p.quantity + delta } : p,
      ),
    }));
  }

  return (
    <Ctx.Provider value={{ ...data, addProduct, updateQuantity }}>
      {children}
    </Ctx.Provider>
  );
}
