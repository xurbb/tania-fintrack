"use client";

import { useState } from "react";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants";
import { PaymentMethod, Transaction, TransactionType } from "@/lib/types";
import { todayISO } from "@/lib/utils";

export interface TxFormValue extends Omit<Transaction, "id"> {}

export default function TransactionForm({
  initial,
  presetType,
  onSubmit,
  onCancel,
}: {
  initial?: Transaction;
  presetType?: TransactionType;
  onSubmit: (v: TxFormValue) => void;
  onCancel?: () => void;
}) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? presetType ?? "expense");
  const [amount, setAmount] = useState<string>(initial ? String(initial.amount) : "");
  const [category, setCategory] = useState(initial?.category ?? "Food");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initial?.paymentMethod ?? "Cash"
  );
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [note, setNote] = useState(initial?.note ?? "");

  const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // reset kategori saat tipe berubah
  const handleType = (t: TransactionType) => {
    setType(t);
    setCategory(t === "income" ? "Salary" : "Food");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      alert("Nominal harus lebih dari 0");
      return;
    }
    if (!date) {
      alert("Tanggal wajib diisi");
      return;
    }
    onSubmit({
      type,
      amount: Math.round(amt),
      category,
      paymentMethod: type === "expense" ? paymentMethod : undefined,
      date,
      note: note.trim(),
    });
  };

  return (
    <form onSubmit={submit}>
      <div className="row" style={{ marginBottom: 12 }}>
        {(["expense", "income"] as TransactionType[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`btn ${type === t ? "primary" : ""}`}
            onClick={() => handleType(t)}
          >
            {t === "income" ? "⬆ Income" : "⬇ Expense"}
          </button>
        ))}
      </div>

      <div className="form-grid">
        <div>
          <label className="lbl">Nominal (Rp)</label>
          <input
            className="input"
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="cth: 50000"
            required
          />
        </div>
        <div>
          <label className="lbl">Tanggal</label>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="lbl">
            Kategori {type === "income" ? "Income" : "Expense"}
          </label>
          <select
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {cats.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {type === "expense" && (
          <div>
            <label className="lbl">Metode Pembayaran</label>
            <select
              className="select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}
        <div style={{ gridColumn: "1 / -1" }}>
          <label className="lbl">Catatan</label>
          <input
            className="input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="cth: Makan siang, Gaji September..."
          />
        </div>
      </div>

      <div className="row" style={{ marginTop: 16, justifyContent: "flex-end" }}>
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>
            Batal
          </button>
        )}
        <button type="submit" className="btn primary">
          {initial ? "Simpan Perubahan" : "+ Tambah Transaksi"}
        </button>
      </div>
    </form>
  );
}
