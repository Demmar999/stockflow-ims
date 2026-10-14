export type ProductIcon = "paper" | "ink" | "usb" | "pen" | "box";

/** Stock health derived from a product's quantity against its reorder level. */
export type StockLevel = "out" | "below" | "near" | "healthy";

export type MovementType = "in" | "out";

export const STOCK_OUT_PURPOSES = [
  "Internal issue",
  "Sale",
  "Damaged",
  "Return",
] as const;

export type StockOutPurpose = (typeof STOCK_OUT_PURPOSES)[number];

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  leadTimeDays: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  icon: ProductIcon;
  stock: number;
  reorderLevel: number;
  unitPrice: number;
  supplierId: string | null;
  createdAt: string;
}

export type ProductInput = Omit<Product, "id" | "createdAt">;

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: MovementType;
  quantity: number;
  reference: string;
  /** Supplier name for stock-in, purpose for stock-out. */
  counterparty: string;
  user: string;
  createdAt: string;
  balanceAfter: number;
}

export interface MovementInput {
  productId: string;
  quantity: number;
  reference: string;
  counterparty: string;
  user: string;
}

export interface InventoryState {
  products: Product[];
  suppliers: Supplier[];
  movements: StockMovement[];
}

export type MutationResult = { ok: true } | { ok: false; error: string };
