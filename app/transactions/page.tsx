"use client";

import { useMemo, useState } from "react";
import { useFinance } from "@/lib/store";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants";
import { Transaction } from "@/lib/types";
import { formatIDR } from "@/lib/utils";
import TransactionForm from "@/components/TransactionForm";

export default function TransactionsPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, clearAll } = useFinance();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const [fType, setFType] = useState("all");
  const [fCat, setFCat] = useState("all");
  const [fPay, setFPay] = useState("all");
  const [fSearch, setFSearch] = useState("");
  const [fMonth, setFMonth] = useState("all");

  const months = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.date.slice(0, 7)))).sort().reverse(),
    [transactions]
  );

  const list = useMemo(() => {
    return transactions
      .filter((t) => (fType === "all" ? true : t.type === fType))
      .filter((t) => (fCat === "all" ? true : t.category === fCat))
      .filter((t) => (fPay === "all" ? true : (t.paymentMethod ?? "") === fPay))
      .filter((t) => (fMonth === "all" ? true : t.date.startsWith(fMonth)))
      .filter((t) =>
        fSearch ? (t.note + t.category).toLowerCase().includes(fSearch.toLowerCase()) : true
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, fType, fCat, fPay, fMonth, fSearch]);

  const sumIn = list.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const sumOut = list.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const exportCSV = () => {
    const header = "id,type,amount,category,paymentMethod,date,note";
    const rows = transactions.map((t) =>
      [t.id, t.type, t.amount, `"${t.category}"`, `"${t.paymentMethod ?? ""}"`, t.date, `"${(t.note ?? "").replace(/"/g, '""')}"`].join(",")
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
        <h1>Semua pemasukan &amp; pengeluaranmu.</h1>
        <p>
          Hasil filter: <b style={{ color: "#9fe0b4" }}>+{formatIDR(sumIn)}</b> income ·{" "}
          <b style={{ color: "#f5b3a6" }}>−{formatIDR(sumOut)}</b> expense • {list.length} dari {transactions.length} transaksi
        </p>
        <div className="hero-actions">
          <button className="btn sand" onClick={() => setShowAdd(true)}>＋ Tambah Transaksi</button>
          <button className="btn ghost-light" onClick={exportCSV}>⬇ Export CSV</button>
          <button className="btn ghost-light" onClick={() => { if (confirm("Hapus semua transaksi?")) clearAll(); }}>🗑 Hapus Semua</button>
        </div>
      </header>

      <div className="section-head">
        <span className="section-num">01</span>
        <div>
          <h2>Filter &amp; pencarian</h2>
          <p>Saring berdasarkan tipe, kategori, metode bayar, bulan, atau kata kunci.</p>
        </div>
      </div>

      <div className="card">
        <div className="filters">
          <input className="input" placeholder="🔍 Cari catatan / kategori..." value={fSearch} onChange={(e) => setFSearch(e.target.value)} />
          <select className="select" value={fType} onChange={(e) => setFType(e.target.value)}>
            <option value="all">Semua tipe</option>
            <option value="income">💰 Income</option>
            <option value="expense">🧾 Expense</option>
          </select>
          <select className="select" value={fCat} onChange={(e) => setFCat(e.target.value)}>
            <option value="all">Semua kategori</option>
            {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES.filter((c) => !(INCOME_CATEGORIES as readonly string[]).includes(c))].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select className="select" value={fPay} onChange={(e) => setFPay(e.target.value)}>
            <option value="all">Semua metode</option>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="select" value={fMonth} onChange={(e) => setFMonth(e.target.value)}>
            <option value="all">Semua bulan</option>
            {months.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <button className="btn sm" onClick={resetFilters}>Reset</button>
        </div>
      </div>

      <div className="section-head">
        <span className="section-num">02</span>
        <div>
          <h2>Daftar transaksi</h2>
          <p>Klik Edit untuk koreksi, Hapus untuk menghapus. Nominal hijau = masuk, merah = keluar.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
          <table className="tbl">
            <thead>
              <tr><th>Tanggal</th><th>Tipe</th><th>Kategori</th><th>Bentuk</th><th>Metode</th><th>Catatan</th><th style={{ textAlign: "right" }}>Nominal</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {list.map((t) => (
                <tr key={t.id}>
                  <td><b>{t.date}</b></td>
                  <td><span className={`pill ${t.type}`}>{t.type === "income" ? "💰 income" : "🧾 expense"}</span></td>
                  <td>{t.category}</td>
                  <td>{t.instrument ? <span className="pill sand">{t.instrument}</span> : <span className="sub">-</span>}</td>
                  <td>{t.type === "expense" ? <span className="pill method">{t.paymentMethod}</span> : <span className="sub">-</span>}</td>
                  <td style={{ whiteSpace: "normal", minWidth: 140 }}>{t.note || <span className="sub">-</span>}</td>
                  <td style={{ textAlign: "right", fontWeight: 800, color: t.type === "income" ? "#1e7a4c" : "#b34434" }}>
                    {t.type === "income" ? "+" : "-"}{formatIDR(t.amount)}
                  </td>
                  <td>
                    <div className="row" style={{ flexWrap: "nowrap" }}>
                      <button className="btn sm" onClick={() => setEditing(t)}>Edit</button>
                      <button className="btn danger sm" onClick={() => { if (confirm("Hapus transaksi ini?")) deleteTransaction(t.id); }}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={8}><div className="empty"><span className="big-emoji">🔍</span>Tidak ada transaksi yang cocok.<br />Ubah filter atau tambah transaksi baru.</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>＋ Tambah Transaksi</h2>
            <p className="modal-sub">Pilih Income atau Expense, lalu lengkapi nominal, kategori, dan tanggal.</p>
            <TransactionForm onSubmit={(v) => { addTransaction(v); setShowAdd(false); }} onCancel={() => setShowAdd(false)} />
          </div>
        </div>
      )}
      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>✏️ Edit Transaksi</h2>
            <p className="modal-sub">Perbarui detail transaksi lalu simpan perubahan.</p>
            <TransactionForm initial={editing} onSubmit={(v) => { updateTransaction(editing.id, v); setEditing(null); }} onCancel={() => setEditing(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
