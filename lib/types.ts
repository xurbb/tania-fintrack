export type TransactionType = "income" | "expense";

export type PaymentMethod = "Cash" | "QRIS" | "Transfer" | "E-Wallet" | "Kartu Kredit";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  paymentMethod?: PaymentMethod; // hanya untuk expense
  instrument?: string; // hanya untuk kategori investasi (Gold, Stock, dst)
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
