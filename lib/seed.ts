import type { InventoryState, Product, StockMovement, Supplier } from "./types";

/** SSR-safe starting point — the real seed is loaded on the client after mount. */
export const EMPTY_INVENTORY: InventoryState = {
  products: [],
  suppliers: [],
  movements: [],
};

const SUPPLIERS: Supplier[] = [
  {
    id: "sup-abc",
    name: "ABC Trading Co.",
    contact: "sales@abctrading.ph",
    leadTimeDays: 3,
  },
  {
    id: "sup-metro",
    name: "Metro Office Supply",
    contact: "orders@metrooffice.ph",
    leadTimeDays: 2,
  },
  {
    id: "sup-tech",
    name: "TechSource Inc.",
    contact: "support@techsource.ph",
    leadTimeDays: 5,
  },
  {
    id: "sup-clean",
    name: "CleanCorp Distribution",
    contact: "hello@cleancorp.ph",
    leadTimeDays: 4,
  },
  {
    id: "sup-prime",
    name: "Prime Furniture Depot",
    contact: "sales@primefurniture.ph",
    leadTimeDays: 10,
  },
];

type SeedProduct = Omit<Product, "id" | "createdAt">;

const PRODUCTS: SeedProduct[] = [
  // Office supplies
  {
    name: "Bond paper A4",
    sku: "SK-1042",
    category: "Office supplies",
    icon: "paper",
    stock: 320,
    reorderLevel: 50,
    unitPrice: 285,
    supplierId: "sup-abc",
  },
  {
    name: "Ballpoint pen box",
    sku: "SK-1533",
    category: "Office supplies",
    icon: "pen",
    stock: 140,
    reorderLevel: 40,
    unitPrice: 168.5,
    supplierId: "sup-metro",
  },
  {
    name: "Whiteboard marker",
    sku: "SK-1751",
    category: "Office supplies",
    icon: "pen",
    stock: 5,
    reorderLevel: 10,
    unitPrice: 92,
    supplierId: "sup-metro",
  },
  {
    name: "Sticky notes 3x3",
    sku: "SK-1188",
    category: "Office supplies",
    icon: "paper",
    stock: 8,
    reorderLevel: 20,
    unitPrice: 74.25,
    supplierId: "sup-abc",
  },
  {
    name: "Stapler heavy duty",
    sku: "SK-1290",
    category: "Office supplies",
    icon: "box",
    stock: 64,
    reorderLevel: 15,
    unitPrice: 349,
    supplierId: "sup-metro",
  },

  // Electronics
  {
    name: "Printer ink black",
    sku: "SK-2117",
    category: "Electronics",
    icon: "ink",
    stock: 3,
    reorderLevel: 15,
    unitPrice: 1250,
    supplierId: "sup-tech",
  },
  {
    name: "USB flash drive 32GB",
    sku: "SK-0876",
    category: "Electronics",
    icon: "usb",
    stock: 0,
    reorderLevel: 10,
    unitPrice: 399,
    supplierId: "sup-tech",
  },
  {
    name: "HDMI cable 2m",
    sku: "SK-2244",
    category: "Electronics",
    icon: "usb",
    stock: 88,
    reorderLevel: 25,
    unitPrice: 249,
    supplierId: "sup-tech",
  },
  {
    name: "Wireless mouse",
    sku: "SK-2301",
    category: "Electronics",
    icon: "usb",
    stock: 42,
    reorderLevel: 20,
    unitPrice: 649,
    supplierId: "sup-tech",
  },

  // Cleaning supplies
  {
    name: "Multi-surface cleaner 1L",
    sku: "SK-3105",
    category: "Cleaning supplies",
    icon: "box",
    stock: 120,
    reorderLevel: 30,
    unitPrice: 179,
    supplierId: "sup-clean",
  },
  {
    name: "Trash bag roll L",
    sku: "SK-3140",
    category: "Cleaning supplies",
    icon: "box",
    stock: 26,
    reorderLevel: 40,
    unitPrice: 129,
    supplierId: "sup-clean",
  },
  {
    name: "Hand soap refill 500ml",
    sku: "SK-3222",
    category: "Cleaning supplies",
    icon: "box",
    stock: 74,
    reorderLevel: 25,
    unitPrice: 145,
    supplierId: "sup-clean",
  },

  // Furniture
  {
    name: "Ergonomic office chair",
    sku: "SK-4402",
    category: "Furniture",
    icon: "box",
    stock: 18,
    reorderLevel: 6,
    unitPrice: 5899,
    supplierId: "sup-prime",
  },
  {
    name: "Steel filing cabinet",
    sku: "SK-4415",
    category: "Furniture",
    icon: "box",
    stock: 7,
    reorderLevel: 4,
    unitPrice: 9450,
    supplierId: "sup-prime",
  },
];

interface MovementDraft {
  sku: string;
  type: "in" | "out";
  quantity: number;
  reference: string;
  counterparty: string;
  user: string;
  daysAgo: number;
  hour: number;
  minute: number;
}

/** Ordered oldest → newest so running balances can be replayed. */
const MOVEMENT_DRAFTS: MovementDraft[] = [
  {
    sku: "SK-1042",
    type: "out",
    quantity: 60,
    reference: "ISS-0081",
    counterparty: "Internal issue",
    user: "M. Santos",
    daysAgo: 6,
    hour: 8,
    minute: 30,
  },
  {
    sku: "SK-1042",
    type: "in",
    quantity: 200,
    reference: "INV-0021",
    counterparty: "ABC Trading Co.",
    user: "J. dela Cruz",
    daysAgo: 5,
    hour: 9,
    minute: 15,
  },
  {
    sku: "SK-0876",
    type: "out",
    quantity: 15,
    reference: "ISS-0087",
    counterparty: "Internal issue",
    user: "M. Santos",
    daysAgo: 5,
    hour: 14,
    minute: 40,
  },
  {
    sku: "SK-2117",
    type: "out",
    quantity: 6,
    reference: "ISS-0088",
    counterparty: "Internal issue",
    user: "Admin",
    daysAgo: 4,
    hour: 10,
    minute: 5,
  },
  {
    sku: "SK-3105",
    type: "in",
    quantity: 60,
    reference: "INV-0022",
    counterparty: "CleanCorp Distribution",
    user: "J. dela Cruz",
    daysAgo: 4,
    hour: 11,
    minute: 30,
  },
  {
    sku: "SK-2301",
    type: "out",
    quantity: 8,
    reference: "SLS-0410",
    counterparty: "Sale",
    user: "M. Santos",
    daysAgo: 3,
    hour: 15,
    minute: 20,
  },
  {
    sku: "SK-2244",
    type: "in",
    quantity: 40,
    reference: "INV-0023",
    counterparty: "TechSource Inc.",
    user: "Admin",
    daysAgo: 3,
    hour: 16,
    minute: 45,
  },
  {
    sku: "SK-3140",
    type: "out",
    quantity: 24,
    reference: "ISS-0089",
    counterparty: "Internal issue",
    user: "R. Lim",
    daysAgo: 2,
    hour: 8,
    minute: 55,
  },
  {
    sku: "SK-1188",
    type: "out",
    quantity: 12,
    reference: "ISS-0090",
    counterparty: "Internal issue",
    user: "R. Lim",
    daysAgo: 1,
    hour: 13,
    minute: 10,
  },
  {
    sku: "SK-1290",
    type: "in",
    quantity: 24,
    reference: "INV-0024",
    counterparty: "Metro Office Supply",
    user: "J. dela Cruz",
    daysAgo: 0,
    hour: 8,
    minute: 25,
  },
  {
    sku: "SK-2117",
    type: "out",
    quantity: 2,
    reference: "SLS-0411",
    counterparty: "Sale",
    user: "M. Santos",
    daysAgo: 0,
    hour: 9,
    minute: 5,
  },
  {
    sku: "SK-2244",
    type: "out",
    quantity: 4,
    reference: "SLS-0412",
    counterparty: "Sale",
    user: "M. Santos",
    daysAgo: 0,
    hour: 11,
    minute: 40,
  },
];

function timestamp(daysAgo: number, hour: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

/**
 * Builds the demo dataset, anchored to today so "today" figures are live.
 * Each movement's `balanceAfter` is replayed backwards from the product's
 * current stock, so the audit trail is internally consistent.
 */
export function createSeedInventory(): InventoryState {
  const products: Product[] = PRODUCTS.map((product, index) => ({
    ...product,
    id: `prd-${product.sku.slice(3)}`,
    createdAt: timestamp(140 - index * 3, 9, 0),
  }));

  const productBySku = new Map(
    products.map((product) => [product.sku, product]),
  );

  const movements: StockMovement[] = MOVEMENT_DRAFTS.map((draft, index) => {
    const product = productBySku.get(draft.sku);
    if (!product) {
      throw new Error(`Seed movement references unknown SKU ${draft.sku}`);
    }

    const laterSignedTotal = MOVEMENT_DRAFTS.slice(index + 1)
      .filter((later) => later.sku === draft.sku)
      .reduce(
        (total, later) =>
          total + (later.type === "in" ? later.quantity : -later.quantity),
        0,
      );

    return {
      id: `mov-${(1000 + index).toString()}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: draft.type,
      quantity: draft.quantity,
      reference: draft.reference,
      counterparty: draft.counterparty,
      user: draft.user,
      createdAt: timestamp(draft.daysAgo, draft.hour, draft.minute),
      balanceAfter: product.stock - laterSignedTotal,
    };
  });

  return { products, suppliers: SUPPLIERS, movements };
}
