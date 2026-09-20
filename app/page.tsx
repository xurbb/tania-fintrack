"use client";

import { useMemo, useState } from "react";
import { useFinance } from "@/lib/store";
import { formatIDR, monthKey, monthLabel } from "@/lib/utils";
import CashflowChart, { MonthlyPoint } from "@/components/CashflowChart";
import TransactionForm from "@/components/TransactionForm";
import { DetailSidePanel, DetailContent, DetailTab } from "@/components/DetailSidePanel";
import { TransactionType } from "@/lib/types";

export default function Dashboard() {
  const { transactions, addTransaction, goals } = useFinance();
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [tab, setTab] = useState<DetailTab>("income");
  const [modalType, setModalType] = useState<TransactionType | null>(null);

  const months = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => monthKey(t.date)))).sort();
  }, [transactions]);

  const filtered = useMemo(
    () =>
      filterMonth === "all"
        ? transactions
        : transactions.filter((t) => monthKey(t.date) === filterMonth),
    [transactions, filterMonth]
  );

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const cashflow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, (cashflow / totalIncome) * 100) : 0;
  const totalSaving = filtered.filter((t) => t.category === "Saving").reduce((s, t) => s + t.amount, 0);
  const totalInvest =
    filtered.filter((t) => t.category === "Invest").reduce((s, t) => s + t.amount, 0) +
    filtered.filter((t) => t.category === "Investasi" || t.category === "Dividen").reduce((s, t) => s + t.amount, 0);

  const monthly: MonthlyPoint[] = useMemo(() => {
    const map = new Map<string, MonthlyPoint>();
    for (const t of transactions) {
      const k = monthKey(t.date);
      if (!map.has(k))
        map.set(k, { key: k, label: monthLabel(k), income: 0, expense: 0, cashflow: 0 });
      const p = map.get(k)!;
      if (t.type === "income") p.income += t.amount;
      else p.expense += t.amount;
      p.cashflow = p.income - p.expense;
    }
    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key)).slice(-8);
  }, [transactions]);

  const summary = { income: totalIncome, expenses: totalExpense, cashflow, saving: totalSaving, investment: totalInvest };
  const periodLabel = filterMonth === "all" ? "Semua periode" : monthLabel(filterMonth);

  return (
    <div>
      {/* HERO */}
      <header className="hero">
        <div className="hero-eyebrow">💙 Financial Tracker &amp; Planner — Tania</div>
        <h1>Halo, Tania! Ini ringkasan keuanganmu.</h1>
        <p>
          Periode aktif: <b style={{ color: "#fff" }}>{periodLabel}</b> •{" "}
          {filtered.length} transaksi • Cash flow{" "}
          <b style={{ color: cashflow >= 0 ? "#9fe0b4" : "#f5b3a6" }}>{formatIDR(cashflow)}</b>
        </p>
        <div className="hero-actions">
          <select className="select" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} aria-label="Filter bulan">
            <option value="all">📅 Semua bulan</option>
            {months.map((m) => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
          <button className="btn sand" onClick={() => setModalType("income")}>＋ Tambah Income</button>
          <button className="btn ghost-light" onClick={() => setModalType("expense")}>＋ Tambah Expense</button>
        </div>
      </header>

      {/* 01 RINGKASAN */}
      <div className="section-head">
        <span className="section-num">01</span>
        <div>
          <h2>Ringkasan {periodLabel}</h2>
          <p>Empat angka kunci: pemasukan, pengeluaran, arus kas bersih, dan alokasi masa depan.</p>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="card kpi k-green">
          <div className="kpi-top">
            <span className="kpi-icon">💰</span>
            <h3>Income</h3>
          </div>
          <div className="big positive">{formatIDR(totalIncome)}</div>
          <div className="sub">{filtered.filter((t) => t.type === "income").length} pos pemasukan</div>
        </div>
        <div className="card kpi k-red">
          <div className="kpi-top">
            <span className="kpi-icon">🧾</span>
            <h3>Expenses</h3>
          </div>
          <div className="big negative">{formatIDR(totalExpense)}</div>
          <div className="sub">{filtered.filter((t) => t.type === "expense").length} pos pengeluaran</div>
        </div>
        <div className="card kpi">
          <div className="kpi-top">
            <span className="kpi-icon">📊</span>
            <h3>Cash Flow</h3>
          </div>
          <div className={`big ${cashflow >= 0 ? "positive" : "negative"}`}>{formatIDR(cashflow)}</div>
          <div className="sub">
            Savings rate <b>{savingsRate.toFixed(1)}%</b> {savingsRate >= 20 ? "· ideal 🎉" : "· target ≥ 20%"}
          </div>
        </div>
        <div className="card kpi k-sand">
          <div className="kpi-top">
            <span className="kpi-icon">🏦</span>
            <h3>Saving + Invest</h3>
          </div>
          <div className="big">{formatIDR(totalSaving + totalInvest)}</div>
          <div className="sub">Saving {formatIDR(totalSaving)} · Invest {formatIDR(totalInvest)}</div>
        </div>
      </div>

      {/* 02 DETAIL */}
      <div className="section-head">
        <span className="section-num">02</span>
        <div>
          <h2>Detail per kategori</h2>
          <p>Pilih tab di panel kiri — setiap tab berisi rincian, grafik, dan tombol tambah pos.</p>
        </div>
      </div>

      <div className="detail-layout">
        <DetailSidePanel
          active={tab}
          onChange={setTab}
          summary={summary}
          onAddIncome={() => setModalType("income")}
          onAddExpense={() => setModalType("expense")}
        />
        <DetailContent
          tab={tab}
          transactions={transactions}
          filtered={filtered}
          monthly={monthly}
          goals={goals}
          onAddIncome={() => setModalType("income")}
          onAddExpense={() => setModalType("expense")}
        />
      </div>

      {/* 03 TREN */}
      <div className="section-head">
        <span className="section-num">03</span>
        <div>
          <h2>Tren cash flow bulanan</h2>
          <p>Perbandingan income vs expense 8 bulan terakhir untuk melihat pola keuanganmu.</p>
        </div>
      </div>

      <div className="card">
        <h3 className="plain">Income vs Expense per bulan</h3>
        <p className="sub" style={{ margin: "2px 0 12px" }}>Bar biru = income, bar merah = expense. Tabel di bawah merangkum net tiap bulan.</p>
        <CashflowChart data={monthly} />
      </div>

      {modalType && (
        <div className="modal-backdrop" onClick={() => setModalType(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{modalType === "income" ? "＋ Tambah Pos Income" : "＋ Tambah Pos Expense"}</h2>
            <p className="modal-sub">
              {modalType === "income"
                ? "Catat Salary, Bonus, Dividen, Gift, atau sumber income lainnya."
                : "Catat pengeluaran beserta metode bayar: Cash, QRIS, atau Transfer."}
            </p>
            <TransactionForm
              presetType={modalType}
              onSubmit={(v) => { addTransaction(v); setModalType(null); }}
              onCancel={() => setModalType(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
