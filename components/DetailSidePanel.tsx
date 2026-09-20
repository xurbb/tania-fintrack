"use client";

import { Transaction } from "@/lib/types";
import { formatIDR } from "@/lib/utils";
import { colorForCategory } from "@/lib/constants";
import CategoryChart from "@/components/CategoryChart";

export type DetailTab = "income" | "expenses" | "cashflow" | "saving" | "investment";

export const DETAIL_TABS: {
  id: DetailTab;
  label: string;
  sub: string;
  icon: string;
}[] = [
  { id: "income", label: "Income", sub: "Pemasukan", icon: "💰" },
  { id: "expenses", label: "Expenses", sub: "Pengeluaran", icon: "🧾" },
  { id: "cashflow", label: "Cash Flow", sub: "Arus kas", icon: "📊" },
  { id: "saving", label: "Saving", sub: "Tabungan", icon: "🏦" },
  { id: "investment", label: "Investment", sub: "Investasi", icon: "📈" },
];

function shortIDR(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} jt`;
  if (Math.abs(n) >= 1_000) return `Rp ${Math.round(n / 1_000)} rb`;
  return formatIDR(n);
}

interface Props {
  active: DetailTab;
  onChange: (t: DetailTab) => void;
  summary: Record<DetailTab, number>;
  onAddIncome: () => void;
  onAddExpense: () => void;
}

export function DetailSidePanel({ active, onChange, summary, onAddIncome, onAddExpense }: Props) {
  return (
    <aside className="side-panel">
      <h4>☰ Detail Keuangan</h4>
      {DETAIL_TABS.map((t) => (
        <button
          key={t.id}
          className={`side-tab ${active === t.id ? "active" : ""}`}
          onClick={() => onChange(t.id)}
        >
          <span className="side-ico">{t.icon}</span>
          <span className="lbl">{t.label}<small>{t.sub}</small></span>
          <span className="amt">{shortIDR(summary[t.id])}</span>
        </button>
      ))}
      <div className="side-hint">
        Setiap tab menampilkan statistik, grafik, dan transaksi terkait — plus tombol tambah pos.
      </div>
      <div className="row" style={{ padding: "4px 4px 2px" }}>
        <button className="btn sand sm" style={{ flex: 1, justifyContent: "center" }} onClick={onAddIncome}>＋ Income</button>
        <button className="btn primary sm" style={{ flex: 1, justifyContent: "center" }} onClick={onAddExpense}>＋ Expense</button>
      </div>
    </aside>
  );
}

function Stat({ k, v, s }: { k: string; v: string; s?: string }) {
  return (
    <div className="stat-mini">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
      {s && <div className="s">{s}</div>}
    </div>
  );
}

function PanelHead({ icon, title, desc, action }: { icon: string; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="space-between" style={{ marginBottom: 4 }}>
      <div>
        <h3 className="plain" style={{ fontSize: 17 }}>{icon} {title}</h3>
        <div className="sub">{desc}</div>
      </div>
      {action}
    </div>
  );
}

export function DetailContent({
  tab,
  filtered,
  monthly,
  goals,
  onAddIncome,
  onAddExpense,
}: {
  tab: DetailTab;
  transactions: Transaction[];
  filtered: Transaction[];
  monthly: { key: string; label: string; income: number; expense: number; cashflow: number }[];
  goals: { id: string; name: string; target: number; saved: number; deadline: string }[];
  onAddIncome: () => void;
  onAddExpense: () => void;
}) {
  const incomes = filtered.filter((t) => t.type === "income");
  const expenses = filtered.filter((t) => t.type === "expense");
  const totalIn = incomes.reduce((s, t) => s + t.amount, 0);
  const totalOut = expenses.reduce((s, t) => s + t.amount, 0);
  const net = totalIn - totalOut;

  const group = (list: Transaction[]) => {
    const m = new Map<string, number>();
    list.forEach((t) => m.set(t.category, (m.get(t.category) ?? 0) + t.amount));
    return Array.from(m.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  if (tab === "income") {
    const byCat = group(incomes);
    const top = byCat[0];
    return (
      <div className="card">
        <PanelHead
          icon="💰" title="Income Tania" desc={`${incomes.length} pos pemasukan pada periode ini`}
          action={<button className="btn sand sm" onClick={onAddIncome}>＋ Tambah Income</button>}
        />
        <div className="grid grid-3 mt">
          <Stat k="Total income" v={formatIDR(totalIn)} s={`${incomes.length} transaksi`} />
          <Stat k="Rata-rata / pos" v={formatIDR(incomes.length ? Math.round(totalIn / incomes.length) : 0)} s="Per transaksi" />
          <Stat k="Sumber terbesar" v={top ? top.name : "-"} s={top ? formatIDR(top.value) : "Belum ada data"} />
        </div>
        <div className="grid grid-2 mt">
          <div>
            <b style={{ fontSize: 13 }}>Komposisi sumber income</b>
            <CategoryChart data={byCat} />
          </div>
          <div>
            <b style={{ fontSize: 13 }}>Rincian per kategori</b>
            <div className="mt">
              {byCat.map((c) => (
                <div className="cat-row" key={c.name}>
                  <div className="space-between" style={{ fontSize: 13 }}>
                    <span><span className="pill income">{c.name}</span></span><b>{formatIDR(c.value)}</b>
                  </div>
                  <div className="progress green" style={{ marginTop: 6 }}>
                    <div style={{ width: `${totalIn ? (c.value / totalIn) * 100 : 0}%` }} />
                  </div>
                  <div className="sub">{totalIn ? ((c.value / totalIn) * 100).toFixed(1) : "0"}% dari total income</div>
                </div>
              ))}
              {byCat.length === 0 && (
                <div className="empty"><span className="big-emoji">💸</span>Belum ada income.<br />Tambah pos Salary / Bonus / Dividen / Gift.</div>
              )}
            </div>
          </div>
        </div>
        <h4 style={{ margin: "14px 0 8px", fontSize: 14 }}>Transaksi income terbaru</h4>
        <div className="table-wrap"><table className="tbl">
          <thead><tr><th>Tanggal</th><th>Kategori</th><th>Catatan</th><th style={{ textAlign: "right" }}>Nominal</th></tr></thead>
          <tbody>{incomes.slice(0, 5).map((t) => (
            <tr key={t.id}><td>{t.date}</td><td>{t.category}</td><td>{t.note || <span className="sub">-</span>}</td><td style={{ textAlign: "right" }} className="positive"><b>+{formatIDR(t.amount)}</b></td></tr>
          ))}{incomes.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center" }} className="sub">Kosong</td></tr>}</tbody>
        </table></div>
      </div>
    );
  }

  if (tab === "expenses") {
    const byCat = group(expenses);
    const pay = new Map<string, number>();
    expenses.forEach((t) => pay.set(t.paymentMethod ?? "Cash", (pay.get(t.paymentMethod ?? "Cash") ?? 0) + t.amount));
    const payArr = Array.from(pay.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    return (
      <div className="card">
        <PanelHead
          icon="🧾" title="Expenses Tania" desc={`${expenses.length} pos pengeluaran pada periode ini`}
          action={<button className="btn primary sm" onClick={onAddExpense}>＋ Tambah Expense</button>}
        />
        <div className="grid grid-3 mt">
          <Stat k="Total expense" v={formatIDR(totalOut)} s={`${expenses.length} transaksi`} />
          <Stat k="Metode favorit" v={payArr[0]?.name ?? "-"} s={payArr[0] ? formatIDR(payArr[0].value) : "Belum ada data"} />
          <Stat k="Kategori terbesar" v={byCat[0]?.name ?? "-"} s={byCat[0] ? formatIDR(byCat[0].value) : "Belum ada data"} />
        </div>
        <div className="grid grid-2 mt">
          <div>
            <b style={{ fontSize: 13 }}>Komposisi pengeluaran</b>
            <CategoryChart data={byCat} />
            <b style={{ fontSize: 13 }}>Top kategori</b>
            <div className="mt">
              {byCat.slice(0, 5).map((c) => (
                <div key={c.name} className="space-between cat-row" style={{ fontSize: 13 }}>
                  <span><span className="dot" style={{ background: colorForCategory(c.name) }} />{c.name}</span>
                  <b>{formatIDR(c.value)}</b>
                </div>
              ))}
            </div>
          </div>
          <div>
            <b style={{ fontSize: 13 }}>Per metode pembayaran</b>
            <div className="mt">
              {payArr.map((p) => (
                <div key={p.name} style={{ marginBottom: 12 }}>
                  <div className="space-between" style={{ fontSize: 13 }}>
                    <span className="pill method">{p.name}</span><b>{formatIDR(p.value)}</b>
                  </div>
                  <div className="progress" style={{ marginTop: 6 }}>
                    <div style={{ width: `${totalOut ? (p.value / totalOut) * 100 : 0}%` }} />
                  </div>
                  <div className="sub">{totalOut ? ((p.value / totalOut) * 100).toFixed(1) : "0"}% dari total expense</div>
                </div>
              ))}
              {payArr.length === 0 && <p className="sub">Belum ada expense.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "cashflow") {
    const rate = totalIn > 0 ? Math.max(0, (net / totalIn) * 100) : 0;
    const good = net >= 0;
    return (
      <div className="card">
        <PanelHead icon="📊" title="Cash Flow Tania" desc="Selisih income dan expense — penentu kesehatan keuangan" />
        <div className="grid grid-3 mt">
          <Stat k="Income" v={formatIDR(totalIn)} s="Total masuk" />
          <Stat k="Expense" v={formatIDR(totalOut)} s="Total keluar" />
          <Stat k="Net cash flow" v={formatIDR(net)} s={`Savings rate ${rate.toFixed(1)}%`} />
        </div>
        <div className={`insight-box ${good ? "good" : "bad"} mt`}>
          {good
            ? `✅ Surplus ${formatIDR(net)}. Bagus, Tania! Sisihkan minimal 20% ke Saving & Investasi sebelum belanja keinginan.`
            : `⚠️ Defisit ${formatIDR(Math.abs(net))}. Coba pangkas 10–15% dari Hobby, Entertainment, atau Shopping bulan ini.`}
        </div>
        <h4 style={{ margin: "14px 0 8px", fontSize: 14 }}>Rincian bulanan</h4>
        <div className="table-wrap"><table className="tbl">
          <thead><tr><th>Bulan</th><th>Income</th><th>Expense</th><th>Net</th><th>Status</th></tr></thead>
          <tbody>{monthly.map((m) => (
            <tr key={m.key}>
              <td><b>{m.label}</b></td>
              <td className="positive">{formatIDR(m.income)}</td>
              <td className="negative">{formatIDR(m.expense)}</td>
              <td style={{ fontWeight: 800, color: m.cashflow >= 0 ? "#1e7a4c" : "#b34434" }}>{formatIDR(m.cashflow)}</td>
              <td>{m.cashflow >= 0 ? <span className="pill ok">Surplus</span> : <span className="pill bad">Defisit</span>}</td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>
    );
  }

  if (tab === "saving") {
    const savingTx = filtered.filter((t) => t.type === "expense" && t.category === "Saving");
    const totalSaving = savingTx.reduce((s, t) => s + t.amount, 0);
    const pctIncome = totalIn ? (totalSaving / totalIn) * 100 : 0;
    return (
      <div className="card">
        <PanelHead
          icon="🏦" title="Saving Tania" desc="Dana yang disisihkan + progres tiap goal"
          action={<button className="btn primary sm" onClick={onAddExpense}>＋ Tambah Saving</button>}
        />
        <div className="grid grid-2 mt">
          <Stat k="Total saving" v={formatIDR(totalSaving)} s={`${savingTx.length} pos kategori Saving`} />
          <Stat k="Porsi dari income" v={`${pctIncome.toFixed(1)}%`} s={pctIncome >= 20 ? "Sudah ideal 🎉" : "Target ideal ≥ 20%"} />
        </div>
        <h4 style={{ margin: "14px 0 8px", fontSize: 14 }}>Goals Tania</h4>
        {goals.map((g) => {
          const pct = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0;
          return (
            <div key={g.id} className="stat-mini" style={{ marginBottom: 10 }}>
              <div className="space-between"><b>{g.name}</b><span className="sub">{formatIDR(g.saved)} / {formatIDR(g.target)}</span></div>
              <div className="progress green" style={{ margin: "8px 0" }}><div style={{ width: `${pct}%` }} /></div>
              <div className="sub">{pct.toFixed(0)}% tercapai • Deadline {g.deadline || "-"} • Sisa {formatIDR(Math.max(0, g.target - g.saved))}</div>
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="empty"><span className="big-emoji">🏦</span>Belum ada saving goal.<br />Buat di halaman Planner.</div>
        )}
      </div>
    );
  }

  const investOut = filtered.filter((t) => t.type === "expense" && t.category === "Invest").reduce((s, t) => s + t.amount, 0);
  const investIn = filtered.filter((t) => t.type === "income" && (t.category === "Investasi" || t.category === "Dividen")).reduce((s, t) => s + t.amount, 0);
  const investTx = filtered.filter((t) => t.category === "Invest" || t.category === "Investasi" || t.category === "Dividen");
  return (
    <div className="card">
      <PanelHead
        icon="📈" title="Investment Tania" desc="Modal yang ditanam vs return yang kembali"
        action={<button className="btn primary sm" onClick={onAddExpense}>＋ Tambah Investasi</button>}
      />
      <div className="grid grid-3 mt">
        <Stat k="Modal (keluar)" v={formatIDR(investOut)} s="Kategori Invest" />
        <Stat k="Return (masuk)" v={formatIDR(investIn)} s="Investasi + Dividen" />
        <Stat k="Net investasi" v={formatIDR(investIn - investOut)} s="Return − Modal" />
      </div>
      <div className="insight-box mt">
        💡 Strategi Tania: alokasikan 10–20% income ke Invest di awal bulan (<i>pay yourself first</i>), konsisten tiap gajian.
      </div>
      <h4 style={{ margin: "14px 0 8px", fontSize: 14 }}>Transaksi investasi</h4>
      <div className="table-wrap"><table className="tbl">
        <thead><tr><th>Tanggal</th><th>Tipe</th><th>Kategori</th><th>Catatan</th><th style={{ textAlign: "right" }}>Nominal</th></tr></thead>
        <tbody>{investTx.slice(0, 8).map((t) => (
          <tr key={t.id}><td>{t.date}</td><td><span className={`pill ${t.type}`}>{t.type}</span></td><td>{t.category}</td><td>{t.note || <span className="sub">-</span>}</td>
          <td style={{ textAlign: "right" }}><b>{formatIDR(t.amount)}</b></td></tr>
        ))}{investTx.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center" }} className="sub">Belum ada pos investasi.</td></tr>}</tbody>
      </table></div>
    </div>
  );
}
