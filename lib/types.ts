export type TransactionType = "income" | "expense" | "saving" | "investment";

export type PaymentMethod = "Cash" | "QRIS" | "Transfer" | "E-Wallet" | "Kartu Kredit";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  paymentMethod?: PaymentMethod; // untuk expense, saving, dan investment
  goalId?: string; // hanya untuk saving kategori "Goals" — terhubung ke SavingGoal
  instrument?: string; // LEGACY: bentuk investasi model lama, dipertahankan agar data lama tetap terbaca
  date: string; // ISO yyyy-mm-dd
  note: string;
}

export interface Budget {
  category: string;
  limit: number;
}

export interface SavingGoal {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline: string;
}
