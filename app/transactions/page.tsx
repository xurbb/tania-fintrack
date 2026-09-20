"use client";

import { useMemo, useState } from "react";
import { useFinance } from "@/lib/store";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants";
import { Transaction } from "@/lib/types";
import { formatIDR } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import TransactionForm from "@/components/TransactionForm";

export default function TransactionsPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, clearAll } = useFinance();
  const { t } = useLang();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const [fType, setFType] = useState("all");
  const [fCat, setFCat] = useState("all");
  const [fPay, setFPay] = useState("all");
  const [fSearch, setFSearch] = useState("");
  const [fMonth, setFMonth] = useState("all");

  const months = useMemo(
    () => Array.from(new Set(transactions.map((x) => x.date.slice(0, 7)))).sort().reverse(),
    [transactions]
  );

  const list = useMemo(() => {
    return transactions
      .filter((x) => (fType === "all" ? true : x.type === fType))
      .filter((x) => (fCat === "all" ? true : x.category === fCat))
      .filter((x) => (fPay === "all" ? true : (x.paymentMethod ?? "") === fPay))
      .filter((x) => (fMonth === "all" ? true : x.date.startsWith(fMonth)))
      .filter((x) =>
        fSearch ? (x.note + x.category).toLowerCase().includes(fSearch.toLowerCase()) : true
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, fType, fCat, fPay, fMonth, fSearch]);

  const sumIn = list.filter((x) => x.type === "income").reduce((s, x) => s + x.amount, 0);
  const sumOut = list.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0);

  const exportCSV = () => {
    const header = "id,type,amount,category,paymentMethod,date,note";
    const rows = transactions.map((x) =>
      [x.id, x.type, x.amount, `"${x.category}"`, `"${x.paymentMethod ?? ""}"`, x.date, `"${(x.note ?? "").replace(/"/g, '""')}"`].join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => { setFType("all"); setFCat("all"); setFPay("all"); setFMonth("all"); setFSearch(""); };

  return (
    <div>
      <header className="hero">
        <div className="hero-eyebrow">🧾 Transaction</div>
        <h1>{t("Semua pemasukan & pengeluaranmu.")}</h1>
        <p>
          {t("Hasil filter: {income} income · {expense} expense • {shown} dari {total} transaksi", {
            income: `+${formatIDR(sumIn)}`,
            expense: `−${formatIDR(sumOut)}`,
            shown: list.length,
            total: transactions.length,
          })}
        </p>
        <div className="hero-actions">
          <button className="btn sand" onClick={() => setShowAdd(true)}>{t("＋ Tambah Transaksi")}</button>
          <button className="btn ghost-light" onClick={exportCSV}>{t("⬇ Export CSV")}</button>
          <button className="btn ghost-light" onClick={() => { if (confirm(t("Hapus semua transaksi?"))) clearAll(); }}>{t("🗑 Hapus Semua")}</button>
        </div>
      </header>

      <div className="section-head">
        <span className="section-num">01</span>
        <div>
          <h2>{t("Filter & pencarian")}</h2>
          <p>{t("Saring berdasarkan tipe, kategori, metode bayar, bulan, atau kata kunci.")}</p>
        </div>
      </div>

      <div className="card">
        <div className="filters">
          <input className="input" placeholder={t("🔍 Cari catatan / kategori...")} value={fSearch} onChange={(e) => setFSearch(e.target.value)} />
          <select className="select" value={fType} onChange={(e) => setFType(e.target.value)}>
            <option value="all">{t("Semua tipe")}</option>
            <option value="income">{t("💰 Income")}</option>
            <option value="expense">{t("🧾 Expense")}</option>
          </select>
          <select className="select" value={fCat} onChange={(e) => setFCat(e.target.value)}>
            <option value="all">{t("Semua kategori")}</option>
            {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES.filter((c) => !(INCOME_CATEGORIES as readonly string[]).includes(c))].map((c) => (
              <option key={c} value={c}>{t(c)}</option>
            ))}
          </select>
          <select className="select" value={fPay} onChange={(e) => setFPay(e.target.value)}>
            <option value="all">{t("Semua metode")}</option>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{t(m)}</option>)}
          </select>
          <select className="select" value={fMonth} onChange={(e) => setFMonth(e.target.value)}>
            <option value="all">{t("Semua bulan")}</option>
            {months.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <button className="btn sm" onClick={resetFilters}>{t("Reset")}</button>
        </div>
      </div>

      <div className="section-head">
        <span className="section-num">02</span>
        <div>
          <h2>{t("Daftar transaksi")}</h2>
          <p>{t("Klik Edit untuk koreksi, Hapus untuk menghapus. Nominal hijau = masuk, merah = keluar.")}</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
          <table className="tbl">
            <thead>
              <tr><th>{t("Tanggal")}</th><th>{t("Tipe")}</th><th>{t("Kategori")}</th><th>{t("Bentuk")}</th><th>{t("Metode")}</th><th>{t("Catatan")}</th><th style={{ textAlign: "right" }}>{t("Nominal")}</th><th>{t("Aksi")}</th></tr>
            </thead>
            <tbody>
              {list.map((x) => (
                <tr key={x.id}>
                  <td><b>{x.date}</b></td>
                  <td><span className={`pill ${x.type}`}>{x.type === "income" ? `💰 ${t("Income")}` : `🧾 ${t("Expense")}`}</span></td>
                  <td>{t(x.category)}</td>
                  <td>{x.instrument ? <span className="pill sand">{t(x.instrument)}</span> : <span className="sub">-</span>}</td>
                  <td>{x.type === "expense" ? <span className="pill method">{t(x.paymentMethod ?? "Cash")}</span> : <span className="sub">-</span>}</td>
                  <td style={{ whiteSpace: "normal", minWidth: 140 }}>{x.note || <span className="sub">-</span>}</td>
                  <td style={{ textAlign: "right", fontWeight: 800, color: x.type === "income" ? "#1e7a4c" : "#b34434" }}>
                    {x.type === "income" ? "+" : "-"}{formatIDR(x.amount)}
                  </td>
                  <td>
                    <div className="row" style={{ flexWrap: "nowrap" }}>
                      <button className="btn sm" onClick={() => setEditing(x)}>{t("Edit")}</button>
                      <button className="btn danger sm" onClick={() => { if (confirm(t("Hapus transaksi ini?"))) deleteTransaction(x.id); }}>{t("Hapus")}</button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={8}><div className="empty"><span className="big-emoji">🔍</span>{t("Tidak ada transaksi yang cocok. Ubah filter atau tambah transaksi baru.")}</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{t("＋ Tambah Transaksi")}</h2>
            <p className="modal-sub">{t("Pilih Income atau Expense, lalu lengkapi nominal, kategori, dan tanggal.")}</p>
            <TransactionForm onSubmit={(v) => { addTransaction(v); setShowAdd(false); }} onCancel={() => setShowAdd(false)} />
          </div>
        </div>
      )}
      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{t("✏️ Edit Transaksi")}</h2>
            <p className="modal-sub">{t("Perbarui detail transaksi lalu simpan perubahan.")}</p>
            <TransactionForm initial={editing} onSubmit={(v) => { updateTransaction(editing.id, v); setEditing(null); }} onCancel={() => setEditing(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
