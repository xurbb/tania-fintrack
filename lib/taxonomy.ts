import { Transaction, TransactionType } from "./types";
import { CATEGORIES_BY_TYPE } from "./constants";

/**
 * Taksonomi baru (4 tipe). Data lama (2 tipe) dipetakan otomatis lewat
 * normalizeTx() supaya riwayat tidak hilang dan grafik tetap konsisten.
 */

interface LegacyMapping {
  type: TransactionType;
  category: string;
}

const LEGACY_INCOME: Record<string, string> = {
  Salary: "Salary",
  Bonus: "Bonus",
  Usaha: "Business",
  Freelance: "Business",
  Dividen: "Dividend",
  Investasi: "Dividend", // return investasi model lama -> Dividend
  Gift: "Gift",
  Lainnya: "Other",
};

const LEGACY_EXPENSE: Record<string, string> = {
  Food: "Food & Dining",
  Transport: "Transport",
  Housing: "Housing",
  Utilities: "Bills & Utilities",
  Health: "Health",
  Shopping: "Shopping & Personal",
  Entertainment: "Entertainment & Hobbies",
  Hobby: "Entertainment & Hobbies",
  Education: "Education",
  Family: "Family & Gifts",
  Debt: "Financial Fees",
  Saving: "__SAVING__", // ditangani khusus -> saving / General Savings
  Invest: "__INVEST__", // ditangani khusus -> investment + instrument
  Lainnya: "Others",
};

const LEGACY_INSTRUMENT_TO_CATEGORY: Record<string, string> = {
  Gold: "Gold",
  Stock: "Stocks",
  Stocks: "Stocks",
  Bonds: "Bonds",
  "Time Deposit": "Deposits",
  Deposits: "Deposits",
  "Mutual Fund": "Other",
  Crypto: "Other",
  Property: "Other",
  "P2P Lending": "Other",
  "Foreign Currency": "Other",
};

function mapLegacy(rawType: string, rawCategory: string, instrument?: string): LegacyMapping {
  if (rawType === "income") {
    return { type: "income", category: LEGACY_INCOME[rawCategory] ?? "Other" };
  }
  if (rawType === "saving") {
    // sudah format baru (mis. data tertulis setelah update, type eksplisit)
    return { type: "saving", category: rawCategory };
  }
  if (rawType === "investment") {
    return { type: "investment", category: rawCategory };
  }
  // rawType === "expense" (atau tak dikenal) -> petakan kategori lama
  const mapped = LEGACY_EXPENSE[rawCategory];
  if (mapped === "__SAVING__") return { type: "saving", category: "General Savings" };
  if (mapped === "__INVEST__") {
    return {
      type: "investment",
      category: instrument ? (LEGACY_INSTRUMENT_TO_CATEGORY[instrument] ?? "Other") : "Other",
    };
  }
  if (mapped) return { type: "expense", category: mapped };
  return { type: "expense", category: "Others" };
}

/**
 * Normalisasi satu transaksi ke taksonomi baru.
 * - Data baru (type valid + kategori resmi tipenya) dilewatkan apa adanya.
 * - Data lama dipetakan; field asli tidak diubah di database.
 */
export function normalizeTx(t: Transaction): Transaction {
  const validType =
    t.type === "income" || t.type === "expense" || t.type === "saving" || t.type === "investment";
  if (validType && (CATEGORIES_BY_TYPE[t.type] as readonly string[]).includes(t.category)) {
    return t;
  }
  const mapped = mapLegacy(t.type, t.category, t.instrument);
  if (mapped.type === t.type && mapped.category === t.category) return t;
  return { ...t, type: mapped.type, category: mapped.category };
}

export function normalizeAll(list: Transaction[]): Transaction[] {
  return list.map(normalizeTx);
}

/* ---------- Agregasi per 4 tipe ---------- */

export interface TypeTotals {
  income: number;
  expense: number;
  saving: number;
  investment: number;
  /** Sisa belum dialokasikan = income − expense − saving − investment */
  remaining: number;
  /** Porsi masa depan = (saving + investment) / income */
  futureRate: number;
}

export function totalsByType(list: Transaction[]): TypeTotals {
  let income = 0, expense = 0, saving = 0, investment = 0;
  for (const t of list) {
    if (t.type === "income") income += t.amount;
    else if (t.type === "expense") expense += t.amount;
    else if (t.type === "saving") saving += t.amount;
    else if (t.type === "investment") investment += t.amount;
  }
  const remaining = income - expense - saving - investment;
  const futureRate = income > 0 ? Math.max(0, ((saving + investment) / income) * 100) : 0;
  return { income, expense, saving, investment, remaining, futureRate };
}

export function groupByCategory(list: Transaction[]) {
  const m = new Map<string, number>();
  list.forEach((t) => m.set(t.category, (m.get(t.category) ?? 0) + t.amount));
  return Array.from(m.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
