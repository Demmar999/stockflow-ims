import { isSameDay, startOfDay } from "./format";
import type {
  MovementType,
  Product,
  StockLevel,
  StockMovement,
  Supplier,
} from "./types";

/** A product within 1.5x its reorder level is approaching the threshold. */
export const NEAR_REORDER_FACTOR = 1.5;

/** Catalogue wording, used on the products page. */
export const CATALOG_LABEL: Record<StockLevel, string> = {
  out: "Out of stock",
  below: "Low stock",
  near: "Near reorder",
  healthy: "In stock",
};

export const CATALOG_TONE: Record<StockLevel, string> = {
  out: "dot-red",
  below: "dot-amber",
  near: "dot-amber",
  healthy: "dot-green",
};

/** Monitoring wording, used against explicit reorder thresholds. */
export const MONITOR_LABEL: Record<StockLevel, string> = {
  out: "Out of stock",
  below: "Below reorder",
  near: "Near reorder",
  healthy: "Healthy",
};

export const MONITOR_TONE: Record<StockLevel, string> = {
  out: "dot-red",
  below: "dot-red",
  near: "dot-amber",
  healthy: "dot-green",
};

export const ALERT_LEVELS: StockLevel[] = ["out", "below"];

export function getStockLevel(
  product: Pick<Product, "stock" | "reorderLevel">,
): StockLevel {
  if (product.stock <= 0) return "out";
  if (product.reorderLevel > 0 && product.stock <= product.reorderLevel) {
    return "below";
  }
  if (
    product.reorderLevel > 0 &&
    product.stock <= product.reorderLevel * NEAR_REORDER_FACTOR
  ) {
    return "near";
  }
  return "healthy";
}

export function isAlertLevel(level: StockLevel): boolean {
  return ALERT_LEVELS.includes(level);
}

export function productValue(product: Product): number {
  return product.stock * product.unitPrice;
}

export function findProduct(
  products: Product[],
  productId: string,
): Product | undefined {
  return products.find((product) => product.id === productId);
}

export function findSupplier(
  suppliers: Supplier[],
  supplierId: string | null,
): Supplier | undefined {
  if (!supplierId) return undefined;
  return suppliers.find((supplier) => supplier.id === supplierId);
}

export function uniqueCategories(products: Product[]): string[] {
  return Array.from(new Set(products.map((product) => product.category))).sort(
    (a, b) => a.localeCompare(b),
  );
}

export type LevelFilter = StockLevel | "all";
export type ProductSort = "name" | "stock-asc" | "stock-desc" | "value-desc";

export interface ProductQuery {
  search: string;
  category: string | "all";
  level: LevelFilter;
  sort: ProductSort;
}

export const DEFAULT_PRODUCT_QUERY: ProductQuery = {
  search: "",
  category: "all",
  level: "all",
  sort: "name",
};

export function filterProducts(
  products: Product[],
  query: ProductQuery,
): Product[] {
  const needle = query.search.trim().toLowerCase();

  const matched = products.filter((product) => {
    if (query.category !== "all" && product.category !== query.category) {
      return false;
    }
    if (query.level !== "all" && getStockLevel(product) !== query.level) {
      return false;
    }
    if (!needle) return true;
    return (
      product.name.toLowerCase().includes(needle) ||
      product.sku.toLowerCase().includes(needle)
    );
  });

  return sortProducts(matched, query.sort);
}

export function sortProducts(
  products: Product[],
  sort: ProductSort,
): Product[] {
  const copy = [...products];

  switch (sort) {
    case "stock-asc":
      return copy.sort((a, b) => a.stock - b.stock);
    case "stock-desc":
      return copy.sort((a, b) => b.stock - a.stock);
    case "value-desc":
      return copy.sort((a, b) => productValue(b) - productValue(a));
    default:
      return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
}
/** Products at or below their reorder level, most urgent first. */
export function lowStockProducts(products: Product[]): Product[] {
  return products
    .filter((product) => isAlertLevel(getStockLevel(product)))
    .sort((a, b) => stockRatio(a) - stockRatio(b));
}

function stockRatio(product: Product): number {
  if (product.reorderLevel <= 0) return product.stock <= 0 ? 0 : 1;
  return product.stock / product.reorderLevel;
}

export interface CategorySummary {
  name: string;
  productCount: number;
  units: number;
  value: number;
  share: number;
}

export function categorySummaries(products: Product[]): CategorySummary[] {
  const totalUnits = products.reduce((sum, product) => sum + product.stock, 0);
  const grouped = new Map<string, CategorySummary>();

  for (const product of products) {
    const current = grouped.get(product.category) ?? {
      name: product.category,
      productCount: 0,
      units: 0,
      value: 0,
      share: 0,
    };
    current.productCount += 1;
    current.units += product.stock;
    current.value += productValue(product);
    grouped.set(product.category, current);
  }

  return Array.from(grouped.values())
    .map((summary) => ({
      ...summary,
      share:
        totalUnits > 0 ? Math.round((summary.units / totalUnits) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

export interface SupplierSummary {
  supplier: Supplier;
  productCount: number;
  lowStockCount: number;
  value: number;
}

export function supplierSummaries(
  suppliers: Supplier[],
  products: Product[],
): SupplierSummary[] {
  return suppliers
    .map((supplier) => {
      const owned = products.filter(
        (product) => product.supplierId === supplier.id,
      );
      return {
        supplier,
        productCount: owned.length,
        lowStockCount: owned.filter((product) =>
          isAlertLevel(getStockLevel(product)),
        ).length,
        value: owned.reduce((sum, product) => sum + productValue(product), 0),
      };
    })
    .sort((a, b) => b.productCount - a.productCount);
}

export interface InventoryStats {
  productCount: number;
  totalUnits: number;
  stockValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  movementsToday: number;
  unitsInToday: number;
  unitsOutToday: number;
  categoryCount: number;
}

export function inventoryStats(
  products: Product[],
  movements: StockMovement[],
  now: Date = new Date(),
): InventoryStats {
  const levels = products.map((product) => getStockLevel(product));
  const today = movements.filter((movement) =>
    isSameDay(new Date(movement.createdAt), now),
  );

  return {
    productCount: products.length,
    totalUnits: products.reduce((sum, product) => sum + product.stock, 0),
    stockValue: products.reduce(
      (sum, product) => sum + productValue(product),
      0,
    ),
    lowStockCount: levels.filter(isAlertLevel).length,
    outOfStockCount: levels.filter((level) => level === "out").length,
    movementsToday: today.length,
    unitsInToday: sumUnits(today, "in"),
    unitsOutToday: sumUnits(today, "out"),
    categoryCount: uniqueCategories(products).length,
  };
}

function sumUnits(movements: StockMovement[], type: MovementType): number {
  return movements
    .filter((movement) => movement.type === type)
    .reduce((sum, movement) => sum + movement.quantity, 0);
}

/** Stock in / stock out per day for the trailing window, oldest first. */
export interface DailyMovement {
  date: Date;
  label: string;
  inUnits: number;
  outUnits: number;
  inPercent: number;
  outPercent: number;
}

export function dailyMovements(
  movements: StockMovement[],
  days = 7,
  now: Date = new Date(),
): DailyMovement[] {
  const buckets: DailyMovement[] = [];
  const labelFormat = new Intl.DateTimeFormat("en-PH", { weekday: "short" });

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = startOfDay(now);
    date.setDate(date.getDate() - offset);
    buckets.push({
      date,
      label: labelFormat.format(date),
      inUnits: 0,
      outUnits: 0,
      inPercent: 0,
      outPercent: 0,
    });
  }

  for (const movement of movements) {
    const day = startOfDay(new Date(movement.createdAt)).getTime();
    const bucket = buckets.find((item) => item.date.getTime() === day);
    if (!bucket) continue;
    if (movement.type === "in") bucket.inUnits += movement.quantity;
    else bucket.outUnits += movement.quantity;
  }

  const peak = Math.max(
    1,
    ...buckets.map((bucket) => Math.max(bucket.inUnits, bucket.outUnits)),
  );

  return buckets.map((bucket) => ({
    ...bucket,
    inPercent: Math.round((bucket.inUnits / peak) * 100),
    outPercent: Math.round((bucket.outUnits / peak) * 100),
  }));
}

export interface MovementQuery {
  search: string;
  type: MovementType | "all";
  date: string;
}

export const DEFAULT_MOVEMENT_QUERY: MovementQuery = {
  search: "",
  type: "all",
  date: "",
};

export function filterMovements(
  movements: StockMovement[],
  query: MovementQuery,
): StockMovement[] {
  const needle = query.search.trim().toLowerCase();

  return sortMovementsDesc(movements).filter((movement) => {
    if (query.type !== "all" && movement.type !== query.type) return false;
    if (query.date && !movement.createdAt.startsWith(query.date)) return false;
    if (!needle) return true;
    return (
      movement.productName.toLowerCase().includes(needle) ||
      movement.sku.toLowerCase().includes(needle) ||
      movement.reference.toLowerCase().includes(needle)
    );
  });
}

export function sortMovementsDesc(movements: StockMovement[]): StockMovement[] {
  return [...movements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function movementTone(type: MovementType): string {
  return type === "in" ? "dot-blue" : "dot-red";
}

export function movementLabel(type: MovementType): string {
  return type === "in" ? "Stock in" : "Stock out";
}
