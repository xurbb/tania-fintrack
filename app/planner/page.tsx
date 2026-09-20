"use client";

import { useMemo, useState } from "react";
import { useFinance } from "@/lib/store";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { formatIDR, monthKey, currentMonthKey, monthLabel } from "@/lib/utils";
import { useLang } from "@/lib/i18n";

export default function PlannerPage() {
  const { transactions, budgets, setBudget, goals, addGoal, updateGoal, deleteGoal } = useFinance();
  const { t, lang } = useLang();
  const [month, setMonth] = useState(currentMonthKey());

  const [gName, setGName] = useState("");
  const [gTarget, setGTarget] = useState("");
  const [gSaved, setGSaved] = useState("");
  const [gDeadline, setGDeadline] = useState("");

  const months = useMemo(
    () => Array.from(new Set(transactions.map((x) => monthKey(x.date)))).sort().reverse(),
    [transactions]
  );

  const spendByCat = useMemo(() => {
    const m = new Map<string, number>();
    transactions
      .filter((x) => x.type === "expense" && monthKey(x.date) === month)
      .forEach((x) => m.set(x.category, (m.get(x.category) ?? 0) + x.amount));
    return m;
  }, [transactions, month]);

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = Array.from(spendByCat.values()).reduce((s, v) => s + v, 0);
  const overCount = budgets.filter((b) => b.limit > 0 && (spendByCat.get(b.category) ?? 0) > b.limit).length;

  return (
    <div>
      <header className="hero">
        <div className="hero-eyebrow">{t("🎯 Planner & Budget")}</div>
        <h1>{t("Rencanakan bulanmu dengan tenang.")}</h1>
        <p>
          {t("Periode {period} • Total budget {budget} • Terpakai {spent}", {
            period: monthLabel(month, lang),
            budget: formatIDR(totalBudget),
            spent: formatIDR(totalSpent),
          })}
          {overCount > 0
            ? <span style={{ color: "#f5b3a6" }}> {t("• {count} kategori over ⚠️", { count: overCount })}</span>
            : <span style={{ color: "#9fe0b4" }}> {t("• semua aman 🎉")}</span>}
        </p>
        <div className="hero-actions">
          <select className="select" value={month} onChange={(e) => setMonth(e.target.value)} aria-label={t("Bulan")}>
            {[currentMonthKey(), ...months.filter((m) => m !== currentMonthKey())].map((m) => (
              <option key={m} value={m}>{monthLabel(m, lang)}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="section-head">
        <span className="section-num">01</span>
        <div>
          <h2>{t("Budget bulanan per kategori")}</h2>
          <p>{t("Atur limit tiap kategori expense. Klik di luar kolom nominal untuk menyimpan otomatis.")}</p>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-3">
          <div className="stat-mini"><div className="k">{t("Total budget")}</div><div className="v">{formatIDR(totalBudget)}</div></div>
          <div className="stat-mini"><div className="k">{t("Terpakai")}</div><div className="v">{formatIDR(totalSpent)}</div></div>
          <div className="stat-mini"><div className="k">{t("Sisa")}</div><div className="v" style={{ color: totalBudget - totalSpent >= 0 ? "#1e7a4c" : "#b34434" }}>{formatIDR(totalBudget - totalSpent)}</div></div>
        </div>
        <div className="grid grid-2 mt">
          {EXPENSE_CATEGORIES.map((cat) => {
            const b = budgets.find((x) => x.category === cat);
            const spent = spendByCat.get(cat) ?? 0;
            const limit = b?.limit ?? 0;
            const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
            const over = limit > 0 && spent > limit;
            return (
              <div key={cat} className="stat-mini">
                <div className="space-between">
                  <b style={{ fontSize: 14 }}>{t(cat)}</b>
                  {over ? <span className="pill bad">{t("Over!")}</span> : limit > 0 ? <span className="pill ok">{t("Aman")}</span> : <span className="pill sand">{t("Belum diatur")}</span>}
                </div>
                <div className="sub" style={{ margin: "2px 0 6px" }}>{formatIDR(spent)} / {formatIDR(limit)}</div>
                <div className={`progress ${over ? "over" : ""}`} style={{ marginBottom: 8 }}>
                  <div style={{ width: `${pct}%` }} />
                </div>
                <input
                  className="input"
                  type="number"
                  min={0}
                  placeholder={t("Atur limit (Rp)")}
                  defaultValue={limit || ""}
                  key={`${cat}-${limit}`}
                  onBlur={(e) => {
                    const v = Number(e.target.value);
                    if (!isNaN(v) && v >= 0) setBudget(cat, Math.round(v));
                  }}
                  style={{ maxWidth: 200 }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="section-head">
        <span className="section-num">02</span>
        <div>
          <h2>{t("Target saving & investasi")}</h2>
          <p>{t("Pantau progres Dana Darurat, DP Rumah, Liburan, dan goal lainnya.")}</p>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-2">
          {goals.map((g) => {
            const pct = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0;
            const done = g.saved >= g.target && g.target > 0;
            const viaTx = transactions
              .filter((x) => x.type === "saving" && x.goalId === g.id)
              .reduce((s, x) => s + x.amount, 0);
            return (
              <div key={g.id} className="stat-mini">
                <div className="space-between">
                  <b>🎯 {g.name}</b>
                  <button className="btn danger sm" onClick={() => { if (confirm(t("Hapus goal ini?"))) deleteGoal(g.id); }}>{t("Hapus")}</button>
                </div>
                <div className="sub">{t("Target")} {formatIDR(g.target)} • {t("Deadline")} {g.deadline || "-"}</div>
                <div className="progress green" style={{ margin: "8px 0" }}><div style={{ width: `${pct}%` }} /></div>
                <div className="space-between" style={{ fontSize: 13 }}>
                  <span>{t("Terkumpul")} <b>{formatIDR(g.saved)}</b> ({pct.toFixed(0)}%)</span>
                  <span>{done ? <span className="pill ok">{t("Tercapai 🎉")}</span> : <span className="sub">{t("Sisa")} {formatIDR(Math.max(0, g.target - g.saved))}</span>}</span>
                </div>
                {viaTx > 0 && (
                  <div className="sub" style={{ marginTop: 4 }}>
                    {t("Setoran tercatat via Saving: {amount}", { amount: formatIDR(viaTx) })}
                  </div>
                )}
                <div className="row mt">
                  <input className="input" type="number" min={0} placeholder={t("+ Tambah tabungan (Rp)")} id={`add-${g.id}`} style={{ maxWidth: 190 }} />
                  <button
                    className="btn primary sm"
                    onClick={() => {
                      const el = document.getElementById(`add-${g.id}`) as HTMLInputElement;
                      const v = Number(el?.value);
                      if (v > 0) { updateGoal(g.id, { saved: g.saved + Math.round(v) }); el.value = ""; }
                      else alert(t("Masukkan nominal yang valid"));
                    }}
                  >
                    {t("＋ Nabung")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {goals.length === 0 && (
          <div className="empty"><span className="big-emoji">🎯</span>{t("Belum ada goal.")}<br />{t("Tambah goal pertamamu di bawah.")}</div>
        )}

        <div className="mt" style={{ borderTop: "1px dashed var(--border)", paddingTop: 16 }}>
          <h4 style={{ margin: "0 0 4px", fontSize: 15 }}>{t("＋ Tambah Goal Baru")}</h4>
          <p className="sub" style={{ margin: "0 0 12px" }}>{t("Contoh: Dana Darurat 20 juta, Liburan Jepang 15 juta.")}</p>
          <div className="form-grid">
            <div><label className="lbl">{t("Nama goal")}</label><input className="input" value={gName} onChange={(e) => setGName(e.target.value)} placeholder={t("Dana Darurat")} /></div>
            <div><label className="lbl">{t("Deadline")}</label><input className="input" type="date" value={gDeadline} onChange={(e) => setGDeadline(e.target.value)} /></div>
            <div><label className="lbl">{t("Target (Rp)")}</label><input className="input" type="number" min={0} value={gTarget} onChange={(e) => setGTarget(e.target.value)} placeholder="20000000" /></div>
            <div><label className="lbl">{t("Sudah terkumpul (Rp)")}</label><input className="input" type="number" min={0} value={gSaved} onChange={(e) => setGSaved(e.target.value)} placeholder="0" /></div>
          </div>
          <button
            className="btn primary mt"
            onClick={() => {
              if (!gName || !gTarget) { alert(t("Nama dan target wajib diisi")); return; }
              addGoal({ name: gName, target: Number(gTarget), saved: Number(gSaved) || 0, deadline: gDeadline });
              setGName(""); setGTarget(""); setGSaved(""); setGDeadline("");
            }}
          >
            {t("＋ Tambah Goal")}
          </button>
        </div>

        <div className="insight-box mt">
          <b>{t("💡 Rumus 50/30/20:")}</b>
          <div className="sub" style={{ marginTop: 4 }}>
            {t("50% kebutuhan (Housing, Food, Transport, Utilities) • 30% keinginan (Hobby, Entertainment, Shopping, Family) • 20% masa depan (Saving, Invest). Cash flow positif = income > expense.")}
          </div>
        </div>
      </div>
    </div>
  );
}
