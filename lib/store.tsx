"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Budget, SavingGoal, Transaction } from "./types";
import { uid } from "./utils";
import { normalizeAll, normalizeTx } from "./taxonomy";
import { isCloudEnabled, supabase } from "./supabase";
import { useAuth } from "./auth";

interface FinanceContextValue {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  clearAll: () => void;
  importData: (tx: Transaction[]) => void;
  budgets: Budget[];
  setBudget: (category: string, limit: number) => void;
  goals: SavingGoal[];
  addGoal: (g: Omit<SavingGoal, "id">) => void;
  updateGoal: (id: string, g: Partial<SavingGoal>) => void;
  deleteGoal: (id: string) => void;
  loading: boolean;
  cloud: boolean;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

const TX_KEY = "ft_transactions_v1";
const BUDGET_KEY = "ft_budgets_v1";
const GOAL_KEY = "ft_goals_v1";

/**
 * Menjadi false otomatis kalau kolom `instrument` / `goal_id` belum ada di
 * database, supaya aplikasi tidak error sebelum migrasi dijalankan.
 */
let instrumentSupported = true;
let goalSupported = true;

function txPayload(t: Omit<Transaction, "id">, userId: string): Record<string, unknown> {
  const row: Record<string, unknown> = { ...txToRow(t, userId) };
  if (instrumentSupported) row.instrument = t.instrument ?? null;
  if (goalSupported) row.goal_id = t.goalId ?? null;
  return row;
}

/* ---------------- Pemetaan baris database <-> tipe aplikasi ---------------- */

interface TxRow {
  id: string;
  type: string;
  amount: number;
  category: string;
  payment_method: string | null;
  instrument?: string | null;
  goal_id?: string | null;
  date: string;
  note: string | null;
}

function rowToTx(r: TxRow): Transaction {
  return normalizeTx({
    id: r.id,
    type: r.type as Transaction["type"],
    amount: Number(r.amount),
    category: r.category,
    paymentMethod: (r.payment_method ?? undefined) as Transaction["paymentMethod"],
    goalId: r.goal_id ?? undefined,
    instrument: r.instrument ?? undefined,
    date: r.date,
    note: r.note ?? "",
  });
}

function txToRow(t: Omit<Transaction, "id">, userId: string) {
  return {
    user_id: userId,
    type: t.type,
    amount: Math.round(t.amount),
    category: t.category,
    payment_method: t.type === "income" ? null : (t.paymentMethod ?? null),
    date: t.date,
    note: t.note ?? "",
  };
}

/* ---------------- Data contoh (hanya untuk mode lokal) ---------------- */

function seedTransactions(): Transaction[] {
  const now = new Date();
  const iso = (offsetMonth: number, day: number) => {
    const d = new Date(now.getFullYear(), now.getMonth() - offsetMonth, day);
    return d.toISOString().slice(0, 10);
  };
  return [
    { id: uid(), type: "income", amount: 8500000, category: "Salary", date: iso(0, 1), note: "Gaji bulanan" },
    { id: uid(), type: "income", amount: 1200000, category: "Bonus", date: iso(0, 5), note: "Bonus proyek" },
    { id: uid(), type: "income", amount: 450000, category: "Dividend", date: iso(0, 8), note: "Dividen saham" },
    { id: uid(), type: "expense", amount: 1500000, category: "Housing", paymentMethod: "Transfer", date: iso(0, 2), note: "Kontrakan" },
    { id: uid(), type: "expense", amount: 650000, category: "Food & Dining", paymentMethod: "QRIS", date: iso(0, 3), note: "Groceries + jajan" },
    { id: uid(), type: "expense", amount: 400000, category: "Transport", paymentMethod: "Cash", date: iso(0, 4), note: "Bensin & parkir" },
    { id: uid(), type: "expense", amount: 350000, category: "Bills & Utilities", paymentMethod: "Transfer", date: iso(0, 5), note: "Listrik + internet" },
    { id: uid(), type: "saving", amount: 750000, category: "Emergency Fund", paymentMethod: "Transfer", date: iso(0, 9), note: "Tabungan dana darurat" },
    { id: uid(), type: "saving", amount: 500000, category: "General Savings", paymentMethod: "Transfer", date: iso(0, 7), note: "Nabung rutin" },
    { id: uid(), type: "investment", amount: 1000000, category: "Stocks", paymentMethod: "Transfer", date: iso(0, 6), note: "Saham rutin" },
    { id: uid(), type: "investment", amount: 800000, category: "Gold", paymentMethod: "Transfer", date: iso(0, 11), note: "Tabungan emas" },
    { id: uid(), type: "expense", amount: 500000, category: "Financial Fees", paymentMethod: "Transfer", date: iso(0, 12), note: "Cicilan" },
    { id: uid(), type: "income", amount: 8000000, category: "Salary", date: iso(1, 1), note: "Gaji bulan lalu" },
    { id: uid(), type: "expense", amount: 1800000, category: "Housing", paymentMethod: "Transfer", date: iso(1, 2), note: "Kontrakan" },
    { id: uid(), type: "expense", amount: 900000, category: "Food & Dining", paymentMethod: "QRIS", date: iso(1, 10), note: "Makan" },
    { id: uid(), type: "saving", amount: 800000, category: "General Savings", paymentMethod: "Transfer", date: iso(1, 12), note: "Nabung rutin" },
    { id: uid(), type: "investment", amount: 1200000, category: "Gold", paymentMethod: "Transfer", date: iso(1, 18), note: "Beli emas" },
    { id: uid(), type: "expense", amount: 300000, category: "Entertainment & Hobbies", paymentMethod: "Cash", date: iso(1, 15), note: "Hobi" },
  ];
}

/* ---------------- Provider ---------------- */

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const cloud = isCloudEnabled;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------- Muat data ---------- */
  const reload = useCallback(async () => {
    if (!supabase || !user) return;
    setLoading(true);

    const baseCols = "id,type,amount,category,payment_method,date,note";
    const optCols =
      `${instrumentSupported ? ",instrument" : ""}${goalSupported ? ",goal_id" : ""}`;
    const first = await supabase
      .from("transactions")
      .select(`${baseCols}${optCols}`)
      .order("date", { ascending: false });

    let rows: TxRow[] | null = (first.data as unknown as TxRow[]) ?? null;

    // Kalau kolom opsional belum ada di database, coba tanpa kolom itu
    // (fitur terkait otomatis nonaktif sampai migrasi dijalankan).
    if (first.error && (instrumentSupported || goalSupported)) {
      const msg = `${first.error.message ?? ""} ${JSON.stringify(first.error)}`;
      if (instrumentSupported && msg.includes("instrument")) instrumentSupported = false;
      if (goalSupported && msg.includes("goal_id")) goalSupported = false;
      const retryCols =
        `${instrumentSupported ? ",instrument" : ""}${goalSupported ? ",goal_id" : ""}`;
      const retry = await supabase
        .from("transactions")
        .select(`${baseCols}${retryCols}`)
        .order("date", { ascending: false });
      rows = (retry.data as unknown as TxRow[]) ?? null;
    }

    const [bRes, gRes] = await Promise.all([
      supabase.from("budgets").select("category,limit"),
      supabase.from("goals").select("id,name,target,saved,deadline").order("created_at", { ascending: false }),
    ]);

    if (rows) setTransactions(rows.map(rowToTx));
    if (bRes.data) setBudgets(bRes.data.map((b) => ({ category: b.category as string, limit: Number(b.limit) })));
    if (gRes.data)
      setGoals(
        gRes.data.map((g) => ({
          id: g.id as string,
          name: g.name as string,
          target: Number(g.target),
          saved: Number(g.saved),
          deadline: (g.deadline as string) ?? "",
        }))
      );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (cloud) {
      if (!user) {
        // belum login: kosongkan, jangan tampilkan data user sebelumnya
        setTransactions([]);
        setBudgets([]);
        setGoals([]);
        setLoading(false);
        return;
      }
      void reload();
      return;
    }

    // ---- mode lokal (localStorage) ----
    try {
      const rawTx = localStorage.getItem(TX_KEY);
      const rawB = localStorage.getItem(BUDGET_KEY);
      const rawG = localStorage.getItem(GOAL_KEY);
      setTransactions(rawTx ? normalizeAll(JSON.parse(rawTx) as Transaction[]) : seedTransactions());
      setBudgets(
        rawB
          ? JSON.parse(rawB)
          : [
              { category: "Food & Dining", limit: 1500000 },
              { category: "Transport", limit: 800000 },
              { category: "Entertainment & Hobbies", limit: 500000 },
            ]
      );
      setGoals(
        rawG
          ? JSON.parse(rawG)
          : [{ id: uid(), name: "Dana Darurat", target: 20000000, saved: 5000000, deadline: new Date().toISOString().slice(0, 10) }]
      );
    } catch {
      setTransactions(seedTransactions());
    }
    setLoading(false);
  }, [cloud, user, reload]);

  /* ---------- Simpan ke localStorage (mode lokal) ---------- */
  useEffect(() => {
    if (cloud || loading) return;
    localStorage.setItem(TX_KEY, JSON.stringify(transactions));
  }, [transactions, cloud, loading]);

  useEffect(() => {
    if (cloud || loading) return;
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
  }, [budgets, cloud, loading]);

  useEffect(() => {
    if (cloud || loading) return;
    localStorage.setItem(GOAL_KEY, JSON.stringify(goals));
  }, [goals, cloud, loading]);

  const gagal = (aksi: string, msg?: string) => {
    alert(`Gagal ${aksi} ke database: ${msg ?? "coba lagi"}. Data dikembalikan ke kondisi terakhir.`);
    void reload();
  };

  // Tulis transaksi dengan fallback: kalau kolom opsional belum ada di
  // database, nonaktifkan lalu ulangi sekali tanpa kolom itu.
  const saveTx = async (
    op: () => PromiseLike<{ error: { message: string } | null }>,
    aksi: string
  ) => {
    let { error } = await op();
    if (error) {
      const msg = error.message ?? "";
      let retried = false;
      if (instrumentSupported && msg.includes("instrument")) {
        instrumentSupported = false;
        retried = true;
      }
      if (goalSupported && msg.includes("goal_id")) {
        goalSupported = false;
        retried = true;
      }
      if (retried) ({ error } = await op());
    }
    if (error) gagal(aksi, error.message);
  };

  const value = useMemo<FinanceContextValue>(
    () => ({
      transactions,
      budgets,
      goals,
      loading,
      cloud,

      addTransaction: (t) => {
        const id = uid();
        const optimistic: Transaction = { ...t, id };
        setTransactions((p) => [optimistic, ...p]);

        const db = supabase;
        if (cloud && user && db) {
          void saveTx(
            () => db.from("transactions").insert({ id, ...txPayload(t, user.id) }),
            "menyimpan transaksi"
          );
        }
      },

      updateTransaction: (id, t) => {
        setTransactions((p) => p.map((x) => (x.id === id ? { ...t, id } : x)));

        const db = supabase;
        if (cloud && user && db) {
          void saveTx(
            () => db.from("transactions").update(txPayload(t, user.id)).eq("id", id),
            "memperbarui transaksi"
          );
        }
      },

      deleteTransaction: (id) => {
        setTransactions((p) => p.filter((x) => x.id !== id));

        if (cloud && supabase) {
          supabase
            .from("transactions")
            .delete()
            .eq("id", id)
            .then(({ error }) => { if (error) gagal("menghapus transaksi", error.message); });
        }
      },

      clearAll: () => {
        setTransactions([]);

        if (cloud && user && supabase) {
          supabase
            .from("transactions")
            .delete()
            .eq("user_id", user.id)
            .then(({ error }) => { if (error) gagal("menghapus semua transaksi", error.message); });
        }
      },

      importData: (tx) => {
        setTransactions(tx);

        const db = supabase;
        if (cloud && user && db) {
          void saveTx(
            () => db.from("transactions").insert(tx.map((x) => ({ id: x.id || uid(), ...txPayload(x, user.id) }))),
            "mengimpor data"
          );
        }
      },

      setBudget: (category, limit) => {
        setBudgets((p) => {
          const ex = p.find((b) => b.category === category);
          if (ex) return p.map((b) => (b.category === category ? { ...b, limit } : b));
          return [...p, { category, limit }];
        });

        if (cloud && user && supabase) {
          supabase
            .from("budgets")
            .upsert({ user_id: user.id, category, limit: Math.round(limit) }, { onConflict: "user_id,category" })
            .then(({ error }) => { if (error) gagal("menyimpan budget", error.message); });
        }
      },

      addGoal: (g) => {
        const id = uid();
        setGoals((p) => [{ ...g, id }, ...p]);

        if (cloud && user && supabase) {
          supabase
            .from("goals")
            .insert({
              id,
              user_id: user.id,
              name: g.name,
              target: Math.round(g.target),
              saved: Math.round(g.saved),
              deadline: g.deadline || null,
            })
            .then(({ error }) => { if (error) gagal("menyimpan goal", error.message); });
        }
      },

      updateGoal: (id, g) => {
        setGoals((p) => p.map((x) => (x.id === id ? { ...x, ...g } : x)));

        if (cloud && user && supabase) {
          const patch: Record<string, unknown> = {};
          if (g.name !== undefined) patch.name = g.name;
          if (g.target !== undefined) patch.target = Math.round(g.target);
          if (g.saved !== undefined) patch.saved = Math.round(g.saved);
          if (g.deadline !== undefined) patch.deadline = g.deadline || null;

          supabase
            .from("goals")
            .update(patch)
            .eq("id", id)
            .then(({ error }) => { if (error) gagal("memperbarui goal", error.message); });
        }
      },

      deleteGoal: (id) => {
        setGoals((p) => p.filter((x) => x.id !== id));

        if (cloud && supabase) {
          supabase
            .from("goals")
            .delete()
            .eq("id", id)
            .then(({ error }) => { if (error) gagal("menghapus goal", error.message); });
        }
      },
    }),
    [transactions, budgets, goals, loading, cloud, user, reload, saveTx]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}
