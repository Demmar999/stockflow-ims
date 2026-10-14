"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addProductToState,
  recordMovementInState,
  removeProductFromState,
  updateProductInState,
} from "./inventoryMutations";
import { EMPTY_INVENTORY, createSeedInventory } from "./seed";
import type {
  InventoryState,
  MovementInput,
  MutationResult,
  Product,
  ProductInput,
  StockMovement,
  Supplier,
} from "./types";

export const INVENTORY_STORAGE_KEY = "stockflow.inventory.v1";

/** Signed-in operator recorded against every stock movement. */
export const CURRENT_USER = "J. dela Cruz";

export interface InventoryContextValue {
  products: Product[];
  suppliers: Supplier[];
  movements: StockMovement[];
  /** False until persisted state has been restored on the client. */
  isReady: boolean;
  addProduct: (input: ProductInput) => MutationResult;
  updateProduct: (productId: string, input: ProductInput) => MutationResult;
  deleteProduct: (productId: string) => MutationResult;
  recordStockIn: (input: MovementInput) => MutationResult;
  recordStockOut: (input: MovementInput) => MutationResult;
  resetDemoData: () => void;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

function isInventoryState(value: unknown): value is InventoryState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<InventoryState>;
  return (
    Array.isArray(candidate.products) &&
    Array.isArray(candidate.suppliers) &&
    Array.isArray(candidate.movements)
  );
}

/** Reads persisted state, falling back to a freshly seeded catalogue. */
export function loadInventory(): InventoryState {
  if (typeof window === "undefined") return EMPTY_INVENTORY;

  try {
    const raw = window.localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) return createSeedInventory();

    const parsed: unknown = JSON.parse(raw);
    if (!isInventoryState(parsed)) return createSeedInventory();
    if (parsed.products.length === 0) return createSeedInventory();

    return parsed;
  } catch {
    return createSeedInventory();
  }
}

function persistInventory(state: InventoryState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* Storage full or unavailable — the in-memory state remains authoritative. */
  }
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  // Both server and first client render use the same empty state, so hydration
  // is stable; the stored catalogue is swapped in immediately after mount.
  const [state, setState] = useState<InventoryState>(EMPTY_INVENTORY);
  const [isReady, setIsReady] = useState(false);
  const stateRef = useRef(state);

  useEffect(() => {
    const restored = loadInventory();
    stateRef.current = restored;
    setState(restored);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    stateRef.current = state;
    persistInventory(state);
  }, [state, isReady]);

  const commit = useCallback(
    (
      mutate: (current: InventoryState) => {
        state: InventoryState;
        result: MutationResult;
      },
    ): MutationResult => {
      const outcome = mutate(stateRef.current);
      if (outcome.result.ok && outcome.state !== stateRef.current) {
        stateRef.current = outcome.state;
        setState(outcome.state);
      }
      return outcome.result;
    },
    [],
  );

  const value = useMemo<InventoryContextValue>(
    () => ({
      products: state.products,
      suppliers: state.suppliers,
      movements: state.movements,
      isReady,
      addProduct: (input) =>
        commit((current) => addProductToState(current, input)),
      updateProduct: (productId, input) =>
        commit((current) => updateProductInState(current, productId, input)),
      deleteProduct: (productId) =>
        commit((current) => removeProductFromState(current, productId)),
      recordStockIn: (input) =>
        commit((current) => recordMovementInState(current, "in", input)),
      recordStockOut: (input) =>
        commit((current) => recordMovementInState(current, "out", input)),
      resetDemoData: () => {
        const seeded = createSeedInventory();
        stateRef.current = seeded;
        setState(seeded);
        persistInventory(seeded);
      },
    }),
    [state, isReady, commit],
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory(): InventoryContextValue {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an <InventoryProvider>");
  }
  return context;
}
