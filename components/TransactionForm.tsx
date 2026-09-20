"use client";

import { useState } from "react";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  INVESTMENT_INSTRUMENTS,
  PAYMENT_METHODS,
  isInvestmentCategory,
} from "@/lib/constants";
import { PaymentMethod, Transaction, TransactionType } from "@/lib/types";
import { todayISO } from "@/lib/utils";
import { useLang } from "@/lib/i18n";

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
  const { t } = useLang();
  const [type, setType] = useState<TransactionType>(initial?.type ?? presetType ?? "expense");
  const [amount, setAmount] = useState<string>(initial ? String(initial.amount) : "");
  const [category, setCategory] = useState(initial?.category ?? "Food");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initial?.paymentMethod ?? "Cash"
  );
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [note, setNote] = useState(initial?.note ?? "");
  const [instrument, setInstrument] = useState(initial?.instrument ?? "Gold");

  const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const isInvest = isInvestmentCategory(category);

  // reset kategori saat tipe berubah
  const handleType = (next: TransactionType) => {
    setType(next);
    setCategory(next === "income" ? "Salary" : "Food");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      alert(t("Nominal harus lebih dari 0"));
      return;
    }
    if (!date) {
      alert(t("Tanggal wajib diisi"));
      return;
    }
    onSubmit({
      type,
      amount: Math.round(amt),
      category,
      paymentMethod: type === "expense" ? paymentMethod : undefined,
      instrument: isInvest ? instrument : undefined,
      date,
      note: note.trim(),
    });
  };

  return (
    <form onSubmit={submit}>
      <div className="row" style={{ marginBottom: 12 }}>
        {(["expense", "income"] as TransactionType[]).map((kind) => (
          <button
            key={kind}
            type="button"
            className={`btn ${type === kind ? "primary" : ""}`}
            onClick={() => handleType(kind)}
          >
            {kind === "income" ? t("⬆ Income") : t("⬇ Expense")}
          </button>
        ))}
      </div>

      <div className="form-grid">
        <div>
          <label className="lbl">{t("Nominal (Rp)")}</label>
          <input
            className="input"
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t("cth: 50000")}
            required
          />
        </div>
        <div>
          <label className="lbl">{t("Tanggal")}</label>
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
            {type === "income" ? t("Kategori Income") : t("Kategori Expense")}
          </label>
          <select
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {cats.map((c) => (
              <option key={c} value={c}>
                {t(c)}
              </option>
            ))}
          </select>
        </div>
        {isInvest && (
          <div>
            <label className="lbl">{t("Bentuk Investasi")}</label>
            <select
              className="select"
              value={instrument}
              onChange={(e) => setInstrument(e.target.value)}
            >
              {INVESTMENT_INSTRUMENTS.map((m) => (
                <option key={m} value={m}>
                  {t(m)}
                </option>
              ))}
            </select>
          </div>
        )}
        {type === "expense" && (
          <div>
            <label className="lbl">{t("Metode Pembayaran")}</label>
            <select
              className="select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {t(m)}
                </option>
              ))}
            </select>
          </div>
        )}
        <div style={{ gridColumn: "1 / -1" }}>
          <label className="lbl">{t("Catatan")}</label>
          <input
            className="input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("cth: Makan siang, Gaji September...")}
          />
        </div>
      </div>

      <div className="row" style={{ marginTop: 16, justifyContent: "flex-end" }}>
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>
            {t("Batal")}
          </button>
        )}
        <button type="submit" className="btn primary">
          {initial ? t("Simpan Perubahan") : t("+ Tambah Transaksi")}
        </button>
      </div>
    </form>
  );
}
