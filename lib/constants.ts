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
