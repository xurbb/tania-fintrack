import { PaymentMethod } from "./types";

export const INCOME_CATEGORIES = [
  "Salary",
  "Bonus",
  "Dividen",
  "Gift",
  "Freelance",
  "Usaha",
  "Investasi",
  "Lainnya",
] as const;

export const EXPENSE_CATEGORIES = [
  "Debt",
  "Transport",
  "Invest",
  "Saving",
  "Food",
  "Housing",
  "Family",
  "Hobby",
  "Health",
  "Education",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Lainnya",
] as const;

export const PAYMENT_METHODS: PaymentMethod[] = [
  "Cash",
  "QRIS",
  "Transfer",
  "E-Wallet",
  "Kartu Kredit",
];

// Bentuk / instrumen investasi
export const INVESTMENT_INSTRUMENTS = [
  "Gold",
  "Stock",
  "Foreign Currency",
  "Bonds",
  "Mutual Fund",
  "Crypto",
  "Time Deposit",
  "Property",
  "P2P Lending",
  "Lainnya",
] as const;

// Kategori yang dianggap sebagai investasi
export const INVESTMENT_CATEGORIES = ["Invest", "Investasi", "Dividen"];

export function isInvestmentCategory(category: string): boolean {
  return INVESTMENT_CATEGORIES.includes(category);
}

export const INSTRUMENT_COLORS: Record<string, string> = {
  Gold: "#c9a96a",
  Stock: "#1e5aa8",
  "Foreign Currency": "#2f7d62",
  Bonds: "#163a6b",
  "Mutual Fund": "#4a86d4",
  Crypto: "#8a5cf6",
  "Time Deposit": "#7a9cc6",
  Property: "#a5814f",
  "P2P Lending": "#3b82c4",
  Lainnya: "#b8ab8e",
};

export function colorForInstrument(name: string): string {
  return INSTRUMENT_COLORS[name] ?? "#b8ab8e";
}

// Palet biru + beige untuk Tania
export const CATEGORY_COLORS: Record<string, string> = {
  Salary: "#1e5aa8",
  Bonus: "#4a86d4",
  Dividen: "#163a6b",
  Gift: "#c9a96a",
  Freelance: "#2f7d62",
  Usaha: "#3b82c4",
  Investasi: "#0f2a4f",
  Debt: "#b34434",
  Transport: "#7a9cc6",
  Invest: "#163a6b",
  Saving: "#2f7d62",
  Food: "#c9a96a",
  Housing: "#1e5aa8",
  Family: "#a5814f",
  Hobby: "#8aa8d8",
  Health: "#4a9d7c",
  Education: "#3b5f8a",
  Utilities: "#8a94a6",
  Entertainment: "#d9c7a7",
  Shopping: "#9c6b4f",
  Lainnya: "#b8ab8e",
};

export function colorForCategory(cat: string): string {
  if (CATEGORY_COLORS[cat]) return CATEGORY_COLORS[cat];
  let h = 0;
  for (let i = 0; i < cat.length; i++) h = (h * 31 + cat.charCodeAt(i)) % 360;
  return `hsl(${h}, 45%, 45%)`;
}
