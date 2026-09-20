"use client";

import { useState } from "react";
import { CATEGORIES_BY_TYPE, PAYMENT_METHODS, OUTGOING_TYPES, TYPE_META } from "@/lib/constants";
import { PaymentMethod, Transaction, TransactionType } from "@/lib/types";
import { todayISO } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { useFinance } from "@/lib/store";

export interface TxFormValue extends Omit<Transaction, "id"> {}

const TYPE_ORDER: TransactionType[] = ["income", "expense", "saving", "investment"];

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
  const { goals } = useFinance();
  const [type, setType] = useState<TransactionType>(initial?.type ?? presetType ?? "expense");
  const [amount, setAmount] = useState<string>(initial ? String(initial.amount) : "");
  const [category, setCategory] = useState(
    initial?.category ?? CATEGORIES_BY_TYPE[initial?.type ?? presetType ?? "expense"][0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initial?.paymentMethod ?? "Transfer"
  );
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [note, setNote] = useState(initial?.note ?? "");
  const [goalId, setGoalId] = useState(initial?.goalId ?? "");

  const cats = CATEGORIES_BY_TYPE[type];
  const isOutgoing = (OUTGOING_TYPES as string[]).includes(type);
  const showGoalPicker = type === "saving" && category === "Goals";

  const handleType = (next: TransactionType) => {
    setType(next);
    setCategory(CATEGORIES_BY_TYPE[next][0]);
    setGoalId("");
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
      paymentMethod: isOutgoing ? paymentMethod : undefined,
      goalId: showGoalPicker && goalId ? goalId : undefined,
      date,
      note: note.trim(),
    });
  };

  return (
    <form onSubmit={submit}>
      <div className="grid grid-2" style={{ marginBottom: 12 }}>
        {TYPE_ORDER.map((kind) => (
          <button
            key={kind}
            type="button"
            className={`btn ${type === kind ? "primary" : ""}`}
            onClick={() => handleType(kind)}
          >
            {TYPE_META[kind].icon} {t(TYPE_META[kind].label)}
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
          <label className="lbl">{t(TYPE_META[type].label)}</label>
          <select
            className="select"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setGoalId(""); }}
          >
            {cats.map((c) => (
              <option key={c} value={c}>
                {t(c)}
              </option>
            ))}
          </select>
        </div>
        {isOutgoing && (
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
        {showGoalPicker && (
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="lbl">{t("Goal Terkait")}</label>
            <select
              className="select"
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
            >
              <option value="">{t("— Tanpa goal khusus —")}</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  🎯 {g.name}
                </option>
              ))}
            </select>
            {goals.length === 0 && (
              <p className="sub" style={{ margin: "6px 0 0" }}>
                {t("Belum ada goal. Buat dulu di halaman Planner.")}
              </p>
            )}
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
