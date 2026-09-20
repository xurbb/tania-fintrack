"use client";

import { useMemo, useState } from "react";
import { useFinance } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { displayName, useLang } from "@/lib/i18n";
import { totalsByType } from "@/lib/taxonomy";
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
    return Array.from(new Set(transactions.map((x) => monthKey(x.date)))).sort();
  }, [transactions]);

  const filtered = useMemo(
    () =>
      filterMonth === "all"
        ? transactions
        : transactions.filter((x) => monthKey(x.date) === filterMonth),
    [transactions, filterMonth]
  );

  const totals = totalsByType(filtered);

  const monthly: MonthlyPoint[] = useMemo(() => {
    const map = new Map<string, MonthlyPoint>();
    for (const x of transactions) {
      const k = monthKey(x.date);
      if (!map.has(k))
        map.set(k, { key: k, label: monthLabel(k, lang), income: 0, expense: 0, saving: 0, investment: 0 });
      const p = map.get(k)!;
      if (x.type === "income") p.income += x.amount;
      else if (x.type === "expense") p.expense += x.amount;
      else if (x.type === "saving") p.saving += x.amount;
      else if (x.type === "investment") p.investment += x.amount;
    }
    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key)).slice(-8);
  }, [transactions, lang]);

  const summary = {
    income: totals.income,
    expenses: totals.expense,
    cashflow: totals.remaining,
    saving: totals.saving,
    investment: totals.investment,
  };
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
        <p className="hero-meta">
          {t("Periode aktif: {period} • {count} transaksi • Sisa {cashflow}", {
            period: periodLabel,
            count: filtered.length,
            cashflow: formatIDR(totals.remaining),
          })}
        </p>
        <div className="hero-actions">
          <select className="select" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} aria-label={t("Semua bulan")}>
            <option value="all">📅 {t("Semua bulan")}</option>
            {months.map((m) => (
              <option key={m} value={m}>{monthLabel(m, lang)}</option>
            ))}
          </select>
          <div className="hero-add-row">
            <button className="btn sand hero-add" onClick={() => setModalType("income")}>💰 {t("Income")}</button>
            <button className="btn sand hero-add" onClick={() => setModalType("expense")}>💸 {t("Expense")}</button>
            <button className="btn sand hero-add" onClick={() => setModalType("saving")}>🏦 {t("Saving")}</button>
            <button className="btn sand hero-add" onClick={() => setModalType("investment")}>📈 {t("Investment")}</button>
          </div>
        </div>
      </header>

      {/* 01 RINGKASAN */}
      <div className="section-head">
        <span className="section-num">01</span>
        <div>
          <h2>{t("Ringkasan {period}", { period: periodLabel })}</h2>
          <p>{t("Empat pos keuanganmu plus sisa yang belum dialokasikan.")}</p>
        </div>
      </div>

      <div className="grid grid-5">
        <div className="card kpi k-green">
          <div className="kpi-top">
            <span className="kpi-icon">💰</span>
            <h3>{t("Income")}</h3>
          </div>
          <div className="big positive">{formatIDR(totals.income)}</div>
          <div className="sub">{t("{count} transaksi", { count: filtered.filter((x) => x.type === "income").length })}</div>
        </div>
        <div className="card kpi k-red">
          <div className="kpi-top">
            <span className="kpi-icon">💸</span>
            <h3>{t("Expense")}</h3>
          </div>
          <div className="big negative">{formatIDR(totals.expense)}</div>
          <div className="sub">{t("{count} transaksi", { count: filtered.filter((x) => x.type === "expense").length })}</div>
        </div>
        <div className="card kpi k-sand">
          <div className="kpi-top">
            <span className="kpi-icon">🏦</span>
            <h3>{t("Saving")}</h3>
          </div>
          <div className="big">{formatIDR(totals.saving)}</div>
          <div className="sub">{t("{count} transaksi", { count: filtered.filter((x) => x.type === "saving").length })}</div>
        </div>
        <div className="card kpi">
          <div className="kpi-top">
            <span className="kpi-icon">📈</span>
            <h3>{t("Investment")}</h3>
          </div>
          <div className="big">{formatIDR(totals.investment)}</div>
          <div className="sub">{t("{count} transaksi", { count: filtered.filter((x) => x.type === "investment").length })}</div>
        </div>
        <div className="card kpi">
          <div className="kpi-top">
            <span className="kpi-icon">📊</span>
            <h3>{t("Sisa")}</h3>
          </div>
          <div className={`big ${totals.remaining >= 0 ? "positive" : "negative"}`}>{formatIDR(totals.remaining)}</div>
          <div className="sub">
            {t("Masa depan")} <b>{totals.futureRate.toFixed(1)}%</b>
          </div>
        </div>
      </div>

      {/* 02 DETAIL */}
      <div className="section-head">
        <span className="section-num">02</span>
        <div>
          <h2>{t("Detail per pos")}</h2>
          <p>{t("Pilih tab di panel kiri — setiap tab berisi rincian, grafik, dan tombol tambah pos.")}</p>
        </div>
      </div>

      <div className="detail-layout">
        <DetailSidePanel
          active={tab}
          onChange={setTab}
          summary={summary}
          onAdd={(type) => setModalType(type)}
        />
        <DetailContent
          tab={tab}
          transactions={transactions}
          filtered={filtered}
          monthly={monthly}
          goals={goals}
          onAdd={(type) => setModalType(type)}
        />
      </div>

      {/* 03 TREN */}
      <div className="section-head">
        <span className="section-num">03</span>
        <div>
          <h2>{t("Tren cash flow bulanan")}</h2>
          <p>{t("Income versus total alokasi (expense + saving + investment) 8 bulan terakhir.")}</p>
        </div>
      </div>

      <div className="card">
        <h3 className="plain">{t("Income vs alokasi per bulan")}</h3>
        <p className="sub" style={{ margin: "2px 0 12px" }}>{t("Bar biru = income, bar tumpuk = expense + saving + investment.")}</p>
        <CashflowChart data={monthly} />
      </div>

      {modalType && (
        <div className="modal-backdrop" onClick={() => setModalType(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{t("＋ Tambah {label}", { label: t(modalType === "income" ? "Income" : modalType === "expense" ? "Expense" : modalType === "saving" ? "Saving" : "Investment") })}</h2>
            <p className="modal-sub">
              {modalType === "income" && t("Catat Salary, Bonus, Business, Dividend, Gift, atau income lainnya.")}
              {modalType === "expense" && t("Catat pengeluaran beserta metode bayar: Cash, QRIS, atau Transfer.")}
              {modalType === "saving" && t("Sisihkan ke General Savings, Emergency Fund, atau Goal dari Planner.")}
              {modalType === "investment" && t("Tanam ke Gold, Stocks, Bonds, Deposits, atau lainnya.")}
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
