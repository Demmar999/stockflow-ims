import type {
  InventoryState,
  MovementInput,
  MovementType,
  MutationResult,
  Product,
  ProductInput,
  StockMovement,
} from "./types";

let idCounter = 0;

export function createId(prefix: string): string {
  idCounter += 1;
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  return `${prefix}_${stamp}${idCounter.toString(36)}${random}`;
}

export function normalizeSku(sku: string): string {
  return sku.trim().toUpperCase();
}

/** Returns an error message, or null when the input is acceptable. */
export function validateProductInput(
  input: ProductInput,
  products: Product[],
  ignoreProductId?: string,
): string | null {
  if (!input.name.trim()) return "Product name is required.";
  if (!input.sku.trim()) return "SKU is required.";
  if (!input.category.trim()) return "Category is required.";
  if (!Number.isFinite(input.stock) || input.stock < 0) {
    return "Stock must be zero or more.";
  }
  if (!Number.isFinite(input.reorderLevel) || input.reorderLevel < 0) {
    return "Reorder level must be zero or more.";
  }
  if (!Number.isFinite(input.unitPrice) || input.unitPrice < 0) {
    return "Unit price must be zero or more.";
  }

  const sku = normalizeSku(input.sku);
  const clash = products.some(
    (product) =>
      product.id !== ignoreProductId && normalizeSku(product.sku) === sku,
  );
  if (clash) return `SKU ${sku} is already used by another product.`;

  return null;
}

export function cleanProductInput(input: ProductInput): ProductInput {
  return {
    ...input,
    name: input.name.trim(),
    sku: normalizeSku(input.sku),
    category: input.category.trim(),
    stock: Math.trunc(input.stock),
    reorderLevel: Math.trunc(input.reorderLevel),
    unitPrice: Number(input.unitPrice.toFixed(2)),
  };
}

export function addProductToState(
  state: InventoryState,
  input: ProductInput,
): { state: InventoryState; result: MutationResult } {
  const error = validateProductInput(input, state.products);
  if (error) return { state, result: { ok: false, error } };

  const product: Product = {
    ...cleanProductInput(input),
    id: createId("prd"),
    createdAt: new Date().toISOString(),
  };

  return {
    state: { ...state, products: [product, ...state.products] },
    result: { ok: true },
  };
}

export function updateProductInState(
  state: InventoryState,
  productId: string,
  input: ProductInput,
): { state: InventoryState; result: MutationResult } {
  const error = validateProductInput(input, state.products, productId);
  if (error) return { state, result: { ok: false, error } };

  const products = state.products.map((product) =>
    product.id === productId
      ? { ...product, ...cleanProductInput(input) }
      : product,
  );

  return { state: { ...state, products }, result: { ok: true } };
}

export function removeProductFromState(
  state: InventoryState,
  productId: string,
): { state: InventoryState; result: MutationResult } {
  const exists = state.products.some((product) => product.id === productId);
  if (!exists) {
    return { state, result: { ok: false, error: "Product no longer exists." } };
  }

  return {
    state: {
      ...state,
      products: state.products.filter((product) => product.id !== productId),
    },
    result: { ok: true },
  };
}

export function recordMovementInState(
  state: InventoryState,
  type: MovementType,
  input: MovementInput,
): { state: InventoryState; result: MutationResult; movement?: StockMovement } {
  const product = state.products.find((item) => item.id === input.productId);
  if (!product) {
    return { state, result: { ok: false, error: "Select a product." } };
  }

  const quantity = Math.trunc(input.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return {
      state,
      result: { ok: false, error: "Quantity must be at least 1." },
    };
  }
  if (!input.counterparty.trim()) {
    return {
      state,
      result: {
        ok: false,
        error: type === "in" ? "Select a supplier." : "Select a purpose.",
      },
    };
  }
  if (type === "out" && quantity > product.stock) {
    return {
      state,
      result: {
        ok: false,
        error: `Only ${product.stock} ${product.stock === 1 ? "unit" : "units"} of ${product.name} in stock.`,
      },
    };
  }

  const balanceAfter =
    type === "in" ? product.stock + quantity : product.stock - quantity;

  const movement: StockMovement = {
    id: createId("mov"),
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    type,
    quantity,
    reference: input.reference.trim() || "—",
    counterparty: input.counterparty.trim(),
    user: input.user,
    createdAt: new Date().toISOString(),
    balanceAfter,
  };

  return {
    state: {
      ...state,
      products: state.products.map((item) =>
        item.id === product.id ? { ...item, stock: balanceAfter } : item,
      ),
      movements: [...state.movements, movement],
    },
    result: { ok: true },
    movement,
  };
}
