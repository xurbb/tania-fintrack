"use client";

import { useMemo, useState } from "react";
import { useFinance } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { displayName, useLang } from "@/lib/i18n";
import { formatIDR, monthKey, monthLabel } from "@/lib/utils";
import CashflowChart, { MonthlyPoint } from "@/components/CashflowChart";
import TransactionForm from "@/components/TransactionForm";
import { DetailSidePanel, DetailContent, DetailTab } from "@/components/DetailSidePanel";
import { TransactionType } from "@/lib/types";

export default function Dashboard() {
  const { transactions, addTransaction, goals } = useFinance();
  const { user } = useAuth();
  const { t, lang } = useLang();
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [tab, setTab] = useState<DetailTab>("income");
  const [modalType, setModalType] = useState<TransactionType | null>(null);

  const name = displayName(user);

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
        map.set(k, { key: k, label: monthLabel(k, lang), income: 0, expense: 0, cashflow: 0 });
      const p = map.get(k)!;
      if (t.type === "income") p.income += t.amount;
      else p.expense += t.amount;
      p.cashflow = p.income - p.expense;
    }
    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key)).slice(-8);
  }, [transactions, lang]);

  const summary = { income: totalIncome, expenses: totalExpense, cashflow, saving: totalSaving, investment: totalInvest };
  const periodLabel = filterMonth === "all" ? t("Semua periode") : monthLabel(filterMonth, lang);

  return (
    <div>
      {/* HERO */}
      <header className="hero">
        <div className="hero-eyebrow">💙 Your Personal FinTrack</div>
        <h1>
          {name
            ? t("Halo {name}! Ini ringkasan keuanganmu.", { name })
            : t("Halo! Ini ringkasan keuanganmu.")}
        </h1>
        <p>
          {t("Periode aktif: {period} • {count} transaksi • Cash flow {cashflow}", {
            period: periodLabel,
            count: filtered.length,
            cashflow: formatIDR(cashflow),
          })}
        </p>
        <div className="hero-actions">
          <select className="select" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} aria-label={t("Semua bulan")}>
            <option value="all">📅 {t("Semua bulan")}</option>
            {months.map((m) => (
              <option key={m} value={m}>{monthLabel(m, lang)}</option>
            ))}
          </select>
          <button className="btn sand" onClick={() => setModalType("income")}>{t("＋ Tambah Income")}</button>
          <button className="btn ghost-light" onClick={() => setModalType("expense")}>{t("＋ Tambah Expense")}</button>
        </div>
      </header>

      {/* 01 RINGKASAN */}
      <div className="section-head">
        <span className="section-num">01</span>
        <div>
          <h2>{t("Ringkasan {period}", { period: periodLabel })}</h2>
          <p>{t("Empat angka kunci: pemasukan, pengeluaran, arus kas bersih, dan alokasi masa depan.")}</p>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="card kpi k-green">
          <div className="kpi-top">
            <span className="kpi-icon">💰</span>
            <h3>{t("Income")}</h3>
          </div>
          <div className="big positive">{formatIDR(totalIncome)}</div>
          <div className="sub">{t("{count} pos pemasukan", { count: filtered.filter((t) => t.type === "income").length })}</div>
        </div>
        <div className="card kpi k-red">
          <div className="kpi-top">
            <span className="kpi-icon">🧾</span>
            <h3>{t("Expenses")}</h3>
          </div>
          <div className="big negative">{formatIDR(totalExpense)}</div>
          <div className="sub">{t("{count} pos pengeluaran", { count: filtered.filter((t) => t.type === "expense").length })}</div>
        </div>
        <div className="card kpi">
          <div className="kpi-top">
            <span className="kpi-icon">📊</span>
            <h3>{t("Cash Flow")}</h3>
          </div>
          <div className={`big ${cashflow >= 0 ? "positive" : "negative"}`}>{formatIDR(cashflow)}</div>
          <div className="sub">
            {t("Savings rate")} <b>{savingsRate.toFixed(1)}%</b> {savingsRate >= 20 ? t("· ideal 🎉") : t("· target ≥ 20%")}
          </div>
        </div>
        <div className="card kpi k-sand">
          <div className="kpi-top">
            <span className="kpi-icon">🏦</span>
            <h3>{t("Saving")} + {t("Investment")}</h3>
          </div>
          <div className="big">{formatIDR(totalSaving + totalInvest)}</div>
          <div className="sub">{t("Saving {saving} · Invest {invest}", { saving: formatIDR(totalSaving), invest: formatIDR(totalInvest) })}</div>
        </div>
      </div>

      {/* 02 DETAIL */}
      <div className="section-head">
        <span className="section-num">02</span>
        <div>
          <h2>{t("Detail per kategori")}</h2>
          <p>{t("Pilih tab di panel kiri — setiap tab berisi rincian, grafik, dan tombol tambah pos.")}</p>
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
          <h2>{t("Tren cash flow bulanan")}</h2>
          <p>{t("Perbandingan income vs expense 8 bulan terakhir untuk melihat pola keuanganmu.")}</p>
        </div>
      </div>

      <div className="card">
        <h3 className="plain">{t("Income vs Expense per bulan")}</h3>
        <p className="sub" style={{ margin: "2px 0 12px" }}>{t("Bar biru = income, bar merah = expense. Tabel di bawah merangkum net tiap bulan.")}</p>
        <CashflowChart data={monthly} />
      </div>

      {modalType && (
        <div className="modal-backdrop" onClick={() => setModalType(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{modalType === "income" ? t("＋ Tambah Pos Income") : t("＋ Tambah Pos Expense")}</h2>
            <p className="modal-sub">
              {modalType === "income"
                ? t("Catat Salary, Bonus, Dividen, Gift, atau sumber income lainnya.")
                : t("Catat pengeluaran beserta metode bayar: Cash, QRIS, atau Transfer.")}
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
