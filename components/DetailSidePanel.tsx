"use client";

import { Transaction } from "@/lib/types";
import { formatIDR } from "@/lib/utils";
import { colorForCategory, colorForInstrument, INVESTMENT_INSTRUMENTS } from "@/lib/constants";
import { useLang } from "@/lib/i18n";
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
  const { t } = useLang();
  return (
    <aside className="side-panel">
      <h4>{t("☰ Detail Keuangan")}</h4>
      {DETAIL_TABS.map((tab) => (
        <button
          key={tab.id}
          className={`side-tab ${active === tab.id ? "active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="side-ico">{tab.icon}</span>
          <span className="lbl">{tab.label}<small>{t(tab.sub)}</small></span>
          <span className="amt">{shortIDR(summary[tab.id])}</span>
        </button>
      ))}
      <div className="side-hint">
        {t("Setiap tab menampilkan statistik, grafik, dan transaksi terkait — plus tombol tambah pos.")}
      </div>
      <div className="row" style={{ padding: "4px 4px 2px" }}>
        <button className="btn sand sm" style={{ flex: 1, justifyContent: "center" }} onClick={onAddIncome}>{t("＋ Income")}</button>
        <button className="btn primary sm" style={{ flex: 1, justifyContent: "center" }} onClick={onAddExpense}>{t("＋ Expense")}</button>
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
  const { t } = useLang();
  const incomes = filtered.filter((x) => x.type === "income");
  const expenses = filtered.filter((x) => x.type === "expense");
  const totalIn = incomes.reduce((s, x) => s + x.amount, 0);
  const totalOut = expenses.reduce((s, x) => s + x.amount, 0);
  const net = totalIn - totalOut;

  const group = (list: Transaction[]) => {
    const m = new Map<string, number>();
    list.forEach((x) => m.set(x.category, (m.get(x.category) ?? 0) + x.amount));
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
          icon="💰" title={t("Income")} desc={t("{count} pos pemasukan pada periode ini", { count: incomes.length })}
          action={<button className="btn sand sm" onClick={onAddIncome}>{t("＋ Tambah Income")}</button>}
        />
        <div className="grid grid-3 mt">
          <Stat k={t("Total income")} v={formatIDR(totalIn)} s={t("{count} transaksi", { count: incomes.length })} />
          <Stat k={t("Rata-rata / pos")} v={formatIDR(incomes.length ? Math.round(totalIn / incomes.length) : 0)} s={t("Per transaksi")} />
          <Stat k={t("Sumber terbesar")} v={top ? t(top.name) : "-"} s={top ? formatIDR(top.value) : t("Belum ada data")} />
        </div>
        <div className="grid grid-2 mt">
          <div>
            <b style={{ fontSize: 13 }}>{t("Komposisi sumber income")}</b>
            <CategoryChart data={byCat.map((c) => ({ name: t(c.name), value: c.value }))} />
          </div>
          <div>
            <b style={{ fontSize: 13 }}>{t("Rincian per kategori")}</b>
            <div className="mt">
              {byCat.map((c) => (
                <div className="cat-row" key={c.name}>
                  <div className="space-between" style={{ fontSize: 13 }}>
                    <span><span className="pill income">{t(c.name)}</span></span><b>{formatIDR(c.value)}</b>
                  </div>
                  <div className="progress green" style={{ marginTop: 6 }}>
                    <div style={{ width: `${totalIn ? (c.value / totalIn) * 100 : 0}%` }} />
                  </div>
                  <div className="sub">{t("{percent}% dari total income", { percent: totalIn ? ((c.value / totalIn) * 100).toFixed(1) : "0" })}</div>
                </div>
              ))}
              {byCat.length === 0 && (
                <div className="empty"><span className="big-emoji">💸</span>{t("Belum ada income. Tambah pos Salary / Bonus / Dividen / Gift.")}</div>
              )}
            </div>
          </div>
        </div>
        <h4 style={{ margin: "14px 0 8px", fontSize: 14 }}>{t("Transaksi income terbaru")}</h4>
        <div className="table-wrap"><table className="tbl">
          <thead><tr><th>{t("Tanggal")}</th><th>{t("Kategori")}</th><th>{t("Catatan")}</th><th style={{ textAlign: "right" }}>{t("Nominal")}</th></tr></thead>
          <tbody>{incomes.slice(0, 5).map((x) => (
            <tr key={x.id}><td>{x.date}</td><td>{t(x.category)}</td><td>{x.note || <span className="sub">-</span>}</td><td style={{ textAlign: "right" }} className="positive"><b>+{formatIDR(x.amount)}</b></td></tr>
          ))}{incomes.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center" }} className="sub">{t("Kosong")}</td></tr>}</tbody>
        </table></div>
      </div>
    );
  }

  if (tab === "expenses") {
    const byCat = group(expenses);
    const pay = new Map<string, number>();
    expenses.forEach((x) => pay.set(x.paymentMethod ?? "Cash", (pay.get(x.paymentMethod ?? "Cash") ?? 0) + x.amount));
    const payArr = Array.from(pay.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    return (
      <div className="card">
        <PanelHead
          icon="🧾" title={t("Expenses")} desc={t("{count} pos pengeluaran pada periode ini", { count: expenses.length })}
          action={<button className="btn primary sm" onClick={onAddExpense}>{t("＋ Tambah Expense")}</button>}
        />
        <div className="grid grid-3 mt">
          <Stat k={t("Total expense")} v={formatIDR(totalOut)} s={t("{count} transaksi", { count: expenses.length })} />
          <Stat k={t("Metode favorit")} v={payArr[0] ? t(payArr[0].name) : "-"} s={payArr[0] ? formatIDR(payArr[0].value) : t("Belum ada data")} />
          <Stat k={t("Kategori terbesar")} v={byCat[0] ? t(byCat[0].name) : "-"} s={byCat[0] ? formatIDR(byCat[0].value) : t("Belum ada data")} />
        </div>
        <div className="grid grid-2 mt">
          <div>
            <b style={{ fontSize: 13 }}>{t("Komposisi pengeluaran")}</b>
            <CategoryChart data={byCat.map((c) => ({ name: t(c.name), value: c.value }))} />
            <b style={{ fontSize: 13 }}>{t("Top kategori")}</b>
            <div className="mt">
              {byCat.slice(0, 5).map((c) => (
                <div key={c.name} className="space-between cat-row" style={{ fontSize: 13 }}>
                  <span><span className="dot" style={{ background: colorForCategory(c.name) }} />{t(c.name)}</span>
                  <b>{formatIDR(c.value)}</b>
                </div>
              ))}
            </div>
          </div>
          <div>
            <b style={{ fontSize: 13 }}>{t("Per metode pembayaran")}</b>
            <div className="mt">
              {payArr.map((p) => (
                <div key={p.name} style={{ marginBottom: 12 }}>
                  <div className="space-between" style={{ fontSize: 13 }}>
                    <span className="pill method">{t(p.name)}</span><b>{formatIDR(p.value)}</b>
                  </div>
                  <div className="progress" style={{ marginTop: 6 }}>
                    <div style={{ width: `${totalOut ? (p.value / totalOut) * 100 : 0}%` }} />
                  </div>
                  <div className="sub">{t("{percent}% dari total expense", { percent: totalOut ? ((p.value / totalOut) * 100).toFixed(1) : "0" })}</div>
                </div>
              ))}
              {payArr.length === 0 && <p className="sub">{t("Belum ada expense.")}</p>}
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
        <PanelHead icon="📊" title={t("Cash Flow")} desc={t("Selisih income dan expense — penentu kesehatan keuangan")} />
        <div className="grid grid-3 mt">
          <Stat k={t("Income")} v={formatIDR(totalIn)} s={t("Total masuk")} />
          <Stat k={t("Expense")} v={formatIDR(totalOut)} s={t("Total keluar")} />
          <Stat k={t("Net cash flow")} v={formatIDR(net)} s={`${t("Savings rate")} ${rate.toFixed(1)}%`} />
        </div>
        <div className={`insight-box ${good ? "good" : "bad"} mt`}>
          {good
            ? t("✅ Surplus {amount}. Bagus! Sisihkan minimal 20% ke Saving & Investasi sebelum belanja keinginan.", { amount: formatIDR(net) })
            : t("⚠️ Defisit {amount}. Coba pangkas 10–15% dari Hobby, Entertainment, atau Shopping bulan ini.", { amount: formatIDR(Math.abs(net)) })}
        </div>
        <h4 style={{ margin: "14px 0 8px", fontSize: 14 }}>{t("Rincian bulanan")}</h4>
        <div className="table-wrap"><table className="tbl">
          <thead><tr><th>{t("Bulan")}</th><th>{t("Income")}</th><th>{t("Expense")}</th><th>{t("Net")}</th><th>{t("Status")}</th></tr></thead>
          <tbody>{monthly.map((m) => (
            <tr key={m.key}>
              <td><b>{m.label}</b></td>
              <td className="positive">{formatIDR(m.income)}</td>
              <td className="negative">{formatIDR(m.expense)}</td>
              <td style={{ fontWeight: 800, color: m.cashflow >= 0 ? "#1e7a4c" : "#b34434" }}>{formatIDR(m.cashflow)}</td>
              <td>{m.cashflow >= 0 ? <span className="pill ok">{t("Surplus")}</span> : <span className="pill bad">{t("Defisit")}</span>}</td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>
    );
  }

  if (tab === "saving") {
    const savingTx = filtered.filter((x) => x.type === "expense" && x.category === "Saving");
    const totalSaving = savingTx.reduce((s, x) => s + x.amount, 0);
    const pctIncome = totalIn ? (totalSaving / totalIn) * 100 : 0;
    return (
      <div className="card">
        <PanelHead
          icon="🏦" title={t("Saving")} desc={t("Dana yang disisihkan + progres tiap goal")}
          action={<button className="btn primary sm" onClick={onAddExpense}>{t("＋ Tambah Saving")}</button>}
        />
        <div className="grid grid-2 mt">
          <Stat k={t("Total saving")} v={formatIDR(totalSaving)} s={t("{count} pos kategori Saving", { count: savingTx.length })} />
          <Stat k={t("Porsi dari income")} v={`${pctIncome.toFixed(1)}%`} s={pctIncome >= 20 ? t("Sudah ideal 🎉") : t("Target ideal ≥ 20%")} />
        </div>
        <h4 style={{ margin: "14px 0 8px", fontSize: 14 }}>{t("Goals")}</h4>
        {goals.map((g) => {
          const pct = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0;
          return (
            <div key={g.id} className="stat-mini" style={{ marginBottom: 10 }}>
              <div className="space-between"><b>{g.name}</b><span className="sub">{formatIDR(g.saved)} / {formatIDR(g.target)}</span></div>
              <div className="progress green" style={{ margin: "8px 0" }}><div style={{ width: `${pct}%` }} /></div>
              <div className="sub">
                {t("{percent}% tercapai • Deadline {deadline} • Sisa {remaining}", {
                  percent: pct.toFixed(0),
                  deadline: g.deadline || "-",
                  remaining: formatIDR(Math.max(0, g.target - g.saved)),
                })}
              </div>
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="empty"><span className="big-emoji">🏦</span>{t("Belum ada saving goal. Buat di halaman Planner.")}</div>
        )}
      </div>
    );
  }

  const investOut = filtered.filter((x) => x.type === "expense" && x.category === "Invest").reduce((s, x) => s + x.amount, 0);
  const investIn = filtered.filter((x) => x.type === "income" && (x.category === "Investasi" || x.category === "Dividen")).reduce((s, x) => s + x.amount, 0);
  const investTx = filtered.filter((x) => x.category === "Invest" || x.category === "Investasi" || x.category === "Dividen");

  const byInstrument = new Map<string, number>();
  filtered
    .filter((x) => x.type === "expense" && x.category === "Invest")
    .forEach((x) => {
      const key = x.instrument ?? "Belum ditentukan";
      byInstrument.set(key, (byInstrument.get(key) ?? 0) + x.amount);
    });
  const instrumentArr = Array.from(byInstrument.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const totalInstrument = instrumentArr.reduce((s, x) => s + x.value, 0);

  return (
    <div className="card">
      <PanelHead
        icon="📈" title={t("Investment")} desc={t("Modal yang ditanam vs return yang kembali")}
        action={<button className="btn primary sm" onClick={onAddExpense}>{t("＋ Tambah Investasi")}</button>}
      />
      <div className="grid grid-3 mt">
        <Stat k={t("Modal (keluar)")} v={formatIDR(investOut)} s={t("Kategori Invest")} />
        <Stat k={t("Return (masuk)")} v={formatIDR(investIn)} s={t("Investasi + Dividen")} />
        <Stat k={t("Net investasi")} v={formatIDR(investIn - investOut)} s={t("Return − Modal")} />
      </div>

      <div className="grid grid-2 mt">
        <div>
          <b style={{ fontSize: 13 }}>{t("Alokasi per bentuk investasi")}</b>
          <div className="mt">
            {instrumentArr.map((x) => (
              <div key={x.name} style={{ marginBottom: 11 }}>
                <div className="space-between" style={{ fontSize: 13 }}>
                  <span>
                    <span className="dot" style={{ background: colorForInstrument(x.name) }} />
                    {t(x.name)}
                  </span>
                  <b>{formatIDR(x.value)}</b>
                </div>
                <div className="progress" style={{ marginTop: 5 }}>
                  <div style={{ width: `${totalInstrument ? (x.value / totalInstrument) * 100 : 0}%`, background: colorForInstrument(x.name) }} />
                </div>
              </div>
            ))}
            {instrumentArr.length === 0 && (
              <div className="empty"><span className="big-emoji">🥇</span>{t("Belum ada pos investasi. Tambahkan dan pilih bentuknya: Gold, Stock, Bonds, dll.")}</div>
            )}
          </div>
        </div>
        <div>
          <b style={{ fontSize: 13 }}>{t("Bentuk investasi tersedia")}</b>
          <div className="mt row" style={{ gap: 6 }}>
            {INVESTMENT_INSTRUMENTS.map((m) => (
              <span key={m} className="pill sand">{t(m)}</span>
            ))}
          </div>
          <div className="insight-box mt">
            {t("💡 Strategi: alokasikan 10–20% income ke Invest di awal bulan (pay yourself first), dan sebar ke beberapa bentuk agar risiko tidak menumpuk di satu instrumen.")}
          </div>
        </div>
      </div>

      <h4 style={{ margin: "14px 0 8px", fontSize: 14 }}>{t("Transaksi investasi")}</h4>
      <div className="table-wrap"><table className="tbl">
        <thead><tr><th>{t("Tanggal")}</th><th>{t("Tipe")}</th><th>{t("Kategori")}</th><th>{t("Bentuk")}</th><th>{t("Catatan")}</th><th style={{ textAlign: "right" }}>{t("Nominal")}</th></tr></thead>
        <tbody>{investTx.slice(0, 8).map((x) => (
          <tr key={x.id}><td>{x.date}</td><td><span className={`pill ${x.type}`}>{x.type}</span></td><td>{t(x.category)}</td>
          <td>{x.instrument ? <span className="pill sand">{t(x.instrument)}</span> : <span className="sub">-</span>}</td>
          <td>{x.note || <span className="sub">-</span>}</td>
          <td style={{ textAlign: "right" }}><b>{formatIDR(x.amount)}</b></td></tr>
        ))}{investTx.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center" }} className="sub">{t("Belum ada pos investasi.")}</td></tr>}</tbody>
      </table></div>
    </div>
  );
}
