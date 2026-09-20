import { PaymentMethod, TransactionType } from "./types";

export const INCOME_CATEGORIES = [
  "Salary",
  "Bonus",
  "Business",
  "Dividend",
  "Gift",
  "Other",
] as const;

export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Housing",
  "Bills & Utilities",
  "Health",
  "Shopping & Personal",
  "Entertainment & Hobbies",
  "Education",
  "Family & Gifts",
  "Financial Fees",
  "Others",
] as const;

export const SAVING_CATEGORIES = [
  "General Savings",
  "Emergency Fund",
  "Goals",
] as const;

export const INVESTMENT_CATEGORIES = [
  "Gold",
  "Stocks",
  "Bonds",
  "Deposits",
  "Other",
] as const;

export const CATEGORIES_BY_TYPE: Record<TransactionType, readonly string[]> = {
  income: INCOME_CATEGORIES,
  expense: EXPENSE_CATEGORIES,
  saving: SAVING_CATEGORIES,
  investment: INVESTMENT_CATEGORIES,
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  "Cash",
  "QRIS",
  "Transfer",
  "E-Wallet",
  "Kartu Kredit",
];

/** Tipe yang mengeluarkan uang (butuh metode pembayaran). */
export const OUTGOING_TYPES: TransactionType[] = ["expense", "saving", "investment"];

export const TYPE_META: Record<
  TransactionType,
  { label: string; icon: string; color: string; bg: string }
> = {
  income: { label: "Income", icon: "💰", color: "#1e7a4c", bg: "#ddf0e3" },
  expense: { label: "Expense", icon: "💸", color: "#b34434", bg: "#f6ddd5" },
  saving: { label: "Saving", icon: "🏦", color: "#2f7d62", bg: "#d8ecdc" },
  investment: { label: "Investment", icon: "📈", color: "#1e5aa8", bg: "#dbe7f7" },
};

// Palet biru + beige
export const CATEGORY_COLORS: Record<string, string> = {
  // Income
  Salary: "#1e5aa8",
  Bonus: "#4a86d4",
  Business: "#3b82c4",
  Dividend: "#163a6b",
  Gift: "#c9a96a",
  Other: "#b8ab8e",
  // Expense
  "Food & Dining": "#c9a96a",
  Transport: "#7a9cc6",
  Housing: "#1e5aa8",
  "Bills & Utilities": "#8a94a6",
  Health: "#4a9d7c",
  "Shopping & Personal": "#9c6b4f",
  "Entertainment & Hobbies": "#d9c7a7",
  Education: "#3b5f8a",
  "Family & Gifts": "#a5814f",
  "Financial Fees": "#b34434",
  Others: "#b8ab8e",
  // Saving
  "General Savings": "#2f7d62",
  "Emergency Fund": "#1e7a4c",
  Goals: "#4a86d4",
  // Investment
  Gold: "#c9a96a",
  Stocks: "#1e5aa8",
  Bonds: "#163a6b",
  Deposits: "#7a9cc6",
  // Legacy (tetap didukung untuk data lama)
  "Usaha": "#3b82c4",
  "Dividen": "#163a6b",
  "Investasi": "#0f2a4f",
  "Invest": "#163a6b",
  "Saving": "#2f7d62",
  "Food": "#c9a96a",
  "Utilities": "#8a94a6",
  "Shopping": "#9c6b4f",
  "Entertainment": "#d9c7a7",
  "Hobby": "#8aa8d8",
  "Family": "#a5814f",
  "Debt": "#b34434",
  "Freelance": "#2f7d62",
  "Lainnya": "#b8ab8e",
  "Mutual Fund": "#4a86d4",
  "Crypto": "#8a5cf6",
  "Time Deposit": "#7a9cc6",
  "Property": "#a5814f",
  "P2P Lending": "#3b82c4",
  "Foreign Currency": "#2f7d62",
};

export function colorForCategory(cat: string): string {
  if (CATEGORY_COLORS[cat]) return CATEGORY_COLORS[cat];
  let h = 0;
  for (let i = 0; i < cat.length; i++) h = (h * 31 + cat.charCodeAt(i)) % 360;
  return `hsl(${h}, 45%, 45%)`;
}
