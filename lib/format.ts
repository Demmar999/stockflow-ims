const PESO = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const PESO_COMPACT = new Intl.NumberFormat("en-PH", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const DATE_SHORT = new Intl.DateTimeFormat("en-PH", {
  month: "short",
  day: "numeric",
});

const TIME_SHORT = new Intl.DateTimeFormat("en-PH", {
  hour: "numeric",
  minute: "2-digit",
});

const NUMBER = new Intl.NumberFormat("en-PH");

export function formatPeso(value: number): string {
  return PESO.format(Number.isFinite(value) ? value : 0);
}

/** Compact peso for stat cards, e.g. ₱2.4M. */
export function formatPesoCompact(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "₱0";
  if (Math.abs(value) < 1000) return formatPeso(value);
  return `₱${PESO_COMPACT.format(value)}`;
}

export function formatNumber(value: number): string {
  return NUMBER.format(Number.isFinite(value) ? value : 0);
}

export function formatQuantity(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value)}`;
}

/** "Today" / "Yesterday" / "Jul 19" relative to the given clock. */
export function formatDayLabel(iso: string, now: Date = new Date()): string {
  const day = startOfDay(new Date(iso));
  const today = startOfDay(now);
  const diffDays = Math.round((today.getTime() - day.getTime()) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return DATE_SHORT.format(new Date(iso));
}

/** "Jul 19, 2:40 PM" — used in the audit log tooltips. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return `${DATE_SHORT.format(date)}, ${TIME_SHORT.format(date)}`;
}

export function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function toDateInputValue(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
