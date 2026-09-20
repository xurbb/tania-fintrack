export function formatIDR(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function uid(): string {
  // UUID asli supaya cocok dengan kolom uuid di Supabase
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function monthKey(dateStr: string): string {
  // dateStr: yyyy-mm-dd -> yyyy-mm
  return dateStr.slice(0, 7);
}

export function monthLabel(key: string): string {
  // key: yyyy-mm -> "Jan 2025" id
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
}

export function todayISO(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function currentMonthKey(): string {
  return new Date().toISOString().slice(0, 7);
}
