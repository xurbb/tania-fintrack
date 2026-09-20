"use client";

import { useMemo, useState } from "react";
import { useFinance } from "@/lib/store";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { formatIDR, monthKey, currentMonthKey, monthLabel } from "@/lib/utils";

export default function PlannerPage() {
  const { transactions, budgets, setBudget, goals, addGoal, updateGoal, deleteGoal } = useFinance();
  const [month, setMonth] = useState(currentMonthKey());

  const [gName, setGName] = useState("");
  const [gTarget, setGTarget] = useState("");
  const [gSaved, setGSaved] = useState("");
  const [gDeadline, setGDeadline] = useState("");

  const months = useMemo(
    () => Array.from(new Set(transactions.map((t) => monthKey(t.date)))).sort().reverse(),
    [transactions]
  );

  const spendByCat = useMemo(() => {
    const m = new Map<string, number>();
    transactions
      .filter((t) => t.type === "expense" && monthKey(t.date) === month)
      .forEach((t) => m.set(t.category, (m.get(t.category) ?? 0) + t.amount));
    return m;
  }, [transactions, month]);

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = Array.from(spendByCat.values()).reduce((s, v) => s + v, 0);
  const overCount = budgets.filter((b) => b.limit > 0 && (spendByCat.get(b.category) ?? 0) > b.limit).length;

  return (
    <div>
      <header className="hero">
        <div className="hero-eyebrow">🎯 Planner &amp; Budget — Tania</div>
        <h1>Rencanakan bulanmu dengan tenang.</h1>
        <p>
          Periode <b style={{ color: "#fff" }}>{monthLabel(month)}</b> • Total budget{" "}
          <b style={{ color: "#fff" }}>{formatIDR(totalBudget)}</b> • Terpakai {formatIDR(totalSpent)}
          {overCount > 0 ? <span style={{ color: "#f5b3a6" }}> • {overCount} kategori over ⚠️</span> : <span style={{ color: "#9fe0b4" }}> • semua aman 🎉</span>}
        </p>
        <div className="hero-actions">
          <select className="select" value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Bulan periode">
            {[currentMonthKey(), ...months.filter((m) => m !== currentMonthKey())].map((m) => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="section-head">
        <span className="section-num">01</span>
        <div>
          <h2>Budget bulanan per kategori</h2>
          <p>Atur limit tiap kategori expense. Klik di luar kolom nominal untuk menyimpan otomatis.</p>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-3">
          <div className="stat-mini"><div className="k">Total budget</div><div className="v">{formatIDR(totalBudget)}</div></div>
          <div className="stat-mini"><div className="k">Terpakai</div><div className="v">{formatIDR(totalSpent)}</div></div>
          <div className="stat-mini"><div className="k">Sisa</div><div className="v" style={{ color: totalBudget - totalSpent >= 0 ? "#1e7a4c" : "#b34434" }}>{formatIDR(totalBudget - totalSpent)}</div></div>
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
                  <b style={{ fontSize: 14 }}>{cat}</b>
                  {over ? <span className="pill bad">Over!</span> : limit > 0 ? <span className="pill ok">Aman</span> : <span className="pill sand">Belum diatur</span>}
                </div>
                <div className="sub" style={{ margin: "2px 0 6px" }}>{formatIDR(spent)} / {formatIDR(limit)}</div>
                <div className={`progress ${over ? "over" : ""}`} style={{ marginBottom: 8 }}>
                  <div style={{ width: `${pct}%` }} />
                </div>
                <input
                  className="input"
                  type="number"
                  min={0}
                  placeholder="Atur limit (Rp)"
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
          <h2>Target saving &amp; investasi</h2>
          <p>Pantau progres Dana Darurat, DP Rumah, Liburan, dan goal lainnya.</p>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-2">
          {goals.map((g) => {
            const pct = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0;
            const done = g.saved >= g.target && g.target > 0;
            return (
              <div key={g.id} className="stat-mini">
                <div className="space-between">
                  <b>🎯 {g.name}</b>
                  <button className="btn danger sm" onClick={() => { if (confirm("Hapus goal ini?")) deleteGoal(g.id); }}>Hapus</button>
                </div>
                <div className="sub">Target {formatIDR(g.target)} • Deadline {g.deadline || "-"}</div>
                <div className="progress green" style={{ margin: "8px 0" }}><div style={{ width: `${pct}%` }} /></div>
                <div className="space-between" style={{ fontSize: 13 }}>
                  <span>Terkumpul <b>{formatIDR(g.saved)}</b> ({pct.toFixed(0)}%)</span>
                  <span>{done ? <span className="pill ok">Tercapai 🎉</span> : <span className="sub">Sisa {formatIDR(Math.max(0, g.target - g.saved))}</span>}</span>
                </div>
                <div className="row mt">
                  <input className="input" type="number" min={0} placeholder="+ Tambah tabungan (Rp)" id={`add-${g.id}`} style={{ maxWidth: 190 }} />
                  <button
                    className="btn primary sm"
                    onClick={() => {
                      const el = document.getElementById(`add-${g.id}`) as HTMLInputElement;
                      const v = Number(el?.value);
                      if (v > 0) { updateGoal(g.id, { saved: g.saved + Math.round(v) }); el.value = ""; }
                      else alert("Masukkan nominal yang valid");
                    }}
                  >
                    ＋ Nabung
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {goals.length === 0 && (
          <div className="empty"><span className="big-emoji">🎯</span>Belum ada goal.<br />Tambah goal pertamamu di bawah.</div>
        )}

        <div className="mt" style={{ borderTop: "1px dashed var(--border)", paddingTop: 16 }}>
          <h4 style={{ margin: "0 0 4px", fontSize: 15 }}>＋ Tambah Goal Baru</h4>
          <p className="sub" style={{ margin: "0 0 12px" }}>Contoh: Dana Darurat 20 juta, Liburan Jepang 15 juta.</p>
          <div className="form-grid">
            <div><label className="lbl">Nama goal</label><input className="input" value={gName} onChange={(e) => setGName(e.target.value)} placeholder="Dana Darurat" /></div>
            <div><label className="lbl">Deadline</label><input className="input" type="date" value={gDeadline} onChange={(e) => setGDeadline(e.target.value)} /></div>
            <div><label className="lbl">Target (Rp)</label><input className="input" type="number" min={0} value={gTarget} onChange={(e) => setGTarget(e.target.value)} placeholder="20000000" /></div>
            <div><label className="lbl">Sudah terkumpul (Rp)</label><input className="input" type="number" min={0} value={gSaved} onChange={(e) => setGSaved(e.target.value)} placeholder="0" /></div>
          </div>
          <button
            className="btn primary mt"
            onClick={() => {
              if (!gName || !gTarget) { alert("Nama dan target wajib diisi"); return; }
              addGoal({ name: gName, target: Number(gTarget), saved: Number(gSaved) || 0, deadline: gDeadline });
              setGName(""); setGTarget(""); setGSaved(""); setGDeadline("");
            }}
          >
            ＋ Tambah Goal
          </button>
        </div>

        <div className="insight-box mt">
          <b>💡 Rumus 50/30/20 untuk Tania:</b>
          <div className="sub" style={{ marginTop: 4 }}>
            50% kebutuhan (Housing, Food, Transport, Utilities) • 30% keinginan (Hobby, Entertainment, Shopping, Family) •
            20% masa depan (Saving, Invest). Cash flow positif = income &gt; expense.
          </div>
        </div>
      </div>
    </div>
  );
}
