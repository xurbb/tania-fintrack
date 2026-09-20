"use client";

import { Transaction, TransactionType } from "@/lib/types";
import { formatIDR } from "@/lib/utils";
import { colorForCategory, TYPE_META } from "@/lib/constants";
import { groupByCategory, totalsByType } from "@/lib/taxonomy";
import { useLang } from "@/lib/i18n";
import { SavingGoal } from "@/lib/types";
import CategoryChart from "@/components/CategoryChart";

export type DetailTab = "income" | "expenses" | "cashflow" | "saving" | "investment";

const TABS: { id: DetailTab; type: TransactionType; icon: string }[] = [
  { id: "income", type: "income", icon: "💰" },
  { id: "expenses", type: "expense", icon: "💸" },
  { id: "cashflow", type: "income", icon: "📊" },
  { id: "saving", type: "saving", icon: "🏦" },
  { id: "investment", type: "investment", icon: "📈" },
];

function shortIDR(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} jt`;
  if (Math.abs(n) >= 1_000) return `Rp ${Math.round(n / 1_000)} rb`;
  return formatIDR(n);
}

interface PanelProps {
  active: DetailTab;
  onChange: (t: DetailTab) => void;
  summary: Record<DetailTab, number>;
  onAdd: (type: TransactionType) => void;
}

export function DetailSidePanel({ active, onChange, summary, onAdd }: PanelProps) {
  const { t } = useLang();
  const labels: Record<DetailTab, string> = {
    income: t("Income"),
    expenses: t("Expense"),
    cashflow: t("Cash Flow"),
    saving: t("Saving"),
    investment: t("Investment"),
  };
  const subs: Record<DetailTab, string> = {
    income: t("Pemasukan"),
    expenses: t("Pengeluaran"),
    cashflow: t("Arus kas"),
    saving: t("Tabungan"),
    investment: t("Investasi"),
  };
  return (
    <aside className="side-panel">
      <h4>{t("☰ Detail Keuangan")}</h4>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`side-tab ${active === tab.id ? "active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="side-ico">{tab.icon}</span>
          <span className="lbl">{labels[tab.id]}<small>{subs[tab.id]}</small></span>
          <span className="amt">{shortIDR(summary[tab.id])}</span>
        </button>
      ))}
      <div className="side-hint">
        {t("Setiap tab menampilkan statistik, grafik, dan transaksi terkait — plus tombol tambah pos.")}
      </div>
      <div className="row" style={{ padding: "4px 4px 2px" }}>
        <button className="btn sand sm" style={{ flex: 1, justifyContent: "center" }} onClick={() => onAdd("income")}>💰</button>
        <button className="btn primary sm" style={{ flex: 1, justifyContent: "center" }} onClick={() => onAdd("expense")}>💸</button>
        <button className="btn primary sm" style={{ flex: 1, justifyContent: "center" }} onClick={() => onAdd("saving")}>🏦</button>
        <button className="btn primary sm" style={{ flex: 1, justifyContent: "center" }} onClick={() => onAdd("investment")}>📈</button>
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

interface ContentProps {
  tab: DetailTab;
  transactions: Transaction[];
  filtered: Transaction[];
  monthly: { key: string; label: string; income: number; expense: number; saving: number; investment: number }[];
  goals: SavingGoal[];
  onAdd: (type: TransactionType) => void;
}

const ADD_LABEL: Record<DetailTab, string> = {
  income: "＋ Tambah Income",
  expenses: "＋ Tambah Expense",
  cashflow: "＋ Tambah Income",
  saving: "＋ Tambah Saving",
  investment: "＋ Tambah Investasi",
};

const ADD_TYPE: Record<DetailTab, TransactionType> = {
  income: "income",
  expenses: "expense",
  cashflow: "income",
  saving: "saving",
  investment: "investment",
};

export function DetailContent({ tab, filtered, monthly, goals, onAdd }: ContentProps) {
  const { t } = useLang();
  const totals = totalsByType(filtered);
  const byType = (type: TransactionType) => filtered.filter((x) => x.type === type);
  const addBtn = (
    <button className="btn primary sm" onClick={() => onAdd(ADD_TYPE[tab])}>{t(ADD_LABEL[tab])}</button>
  );

  if (tab === "income" || tab === "expenses") {
    const type: TransactionType = tab === "income" ? "income" : "expense";
    const list = byType(type);
    const total = tab === "income" ? totals.income : totals.expense;
    const byCat = groupByCategory(list);
    const top = byCat[0];
    const pay = new Map<string, number>();
    list.forEach((x) => pay.set(x.paymentMethod ?? "Cash", (pay.get(x.paymentMethod ?? "Cash") ?? 0) + x.amount));
    const payArr = Array.from(pay.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const meta = TYPE_META[type];

    return (
      <div className="card">
        <PanelHead
          icon={meta.icon}
          title={t(meta.label)}
          desc={t(tab === "income" ? "{count} pos pemasukan pada periode ini" : "{count} pos pengeluaran pada periode ini", { count: list.length })}
          action={addBtn}
        />
        <div className="grid grid-3 mt">
          <Stat k={t(tab === "income" ? "Total income" : "Total expense")} v={formatIDR(total)} s={t("{count} transaksi", { count: list.length })} />
          <Stat
            k={t(tab === "income" ? "Rata-rata / pos" : "Metode favorit")}
            v={tab === "income"
              ? formatIDR(list.length ? Math.round(total / list.length) : 0)
              : payArr[0] ? t(payArr[0].name) : "-"}
            s={tab === "income" ? t("Per transaksi") : payArr[0] ? formatIDR(payArr[0].value) : t("Belum ada data")}
          />
          <Stat k={t(tab === "income" ? "Sumber terbesar" : "Kategori terbesar")} v={top ? t(top.name) : "-"} s={top ? formatIDR(top.value) : t("Belum ada data")} />
        </div>
        <div className="grid grid-2 mt">
          <div>
            <b style={{ fontSize: 13 }}>{t(tab === "income" ? "Komposisi sumber income" : "Komposisi pengeluaran")}</b>
            <CategoryChart data={byCat.map((c) => ({ name: t(c.name), value: c.value }))} />
          </div>
          <div>
            <b style={{ fontSize: 13 }}>{t("Rincian per kategori")}</b>
            <div className="mt">
              {byCat.map((c) => (
                <div className="cat-row" key={c.name}>
                  <div className="space-between" style={{ fontSize: 13 }}>
                    <span><span className={`pill ${type === "income" ? "income" : "expense"}`}>{t(c.name)}</span></span><b>{formatIDR(c.value)}</b>
                  </div>
                  <div className={`progress ${type === "income" ? "green" : ""}`} style={{ marginTop: 6 }}>
                    <div style={{ width: `${total ? (c.value / total) * 100 : 0}%` }} />
                  </div>
                  <div className="sub">
                    {total ? ((c.value / total) * 100).toFixed(1) : "0"}% {t("dari total")}
                  </div>
                </div>
              ))}
              {byCat.length === 0 && (
                <div className="empty"><span className="big-emoji">{meta.icon}</span>{t("Belum ada data.")}</div>
              )}
              {tab === "expenses" && (
                <div className="mt">
                  <b style={{ fontSize: 13 }}>{t("Per metode pembayaran")}</b>
                  {payArr.map((p) => (
                    <div key={p.name} style={{ margin: "8px 0" }}>
                      <div className="space-between" style={{ fontSize: 13 }}>
                        <span className="pill method">{t(p.name)}</span><b>{formatIDR(p.value)}</b>
                      </div>
                      <div className="progress" style={{ marginTop: 5 }}>
                        <div style={{ width: `${total ? (p.value / total) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <h4 style={{ margin: "14px 0 8px", fontSize: 14 }}>{t("Transaksi terbaru")}</h4>
        <div className="table-wrap"><table className="tbl">
          <thead><tr><th>{t("Tanggal")}</th><th>{t("Kategori")}</th><th>{t("Catatan")}</th><th style={{ textAlign: "right" }}>{t("Nominal")}</th></tr></thead>
          <tbody>{list.slice(0, 5).map((x) => (
            <tr key={x.id}><td>{x.date}</td><td>{t(x.category)}</td><td>{x.note || <span className="sub">-</span>}</td><td style={{ textAlign: "right" }} className={type === "income" ? "positive" : "negative"}><b>{type === "income" ? "+" : "−"}{formatIDR(x.amount)}</b></td></tr>
          ))}{list.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center" }} className="sub">{t("Kosong")}</td></tr>}</tbody>
        </table></div>
      </div>
    );
  }

  if (tab === "cashflow") {
    const good = totals.remaining >= 0;
    return (
      <div className="card">
        <PanelHead icon="📊" title={t("Cash Flow")} desc={t("Income dikurangi seluruh alokasi — penentu kesehatan keuangan")} />
        <div className="grid grid-3 mt">
          <Stat k={t("Income")} v={formatIDR(totals.income)} s={t("Total masuk")} />
          <Stat k={t("Expense")} v={formatIDR(totals.expense)} s={t("Total keluar")} />
          <Stat k={t("Saving + Investment")} v={formatIDR(totals.saving + totals.investment)} s={`${t("Masa depan")} ${totals.futureRate.toFixed(1)}%`} />
        </div>
        <div className="grid grid-2 mt">
          <Stat k={t("Sisa belum dialokasikan")} v={formatIDR(totals.remaining)} s={t("Income − Expense − Saving − Investment")} />
          <Stat k={t("Masa depan")} v={`${totals.futureRate.toFixed(1)}%`} s={totals.futureRate >= 20 ? t("Sudah ideal 🎉") : t("Target ideal ≥ 20%")} />
        </div>
        <div className={`insight-box ${good ? "good" : "bad"} mt`}>
          {good
            ? t("✅ Sisa {amount}. Bagus! Sisa ini bisa menambah Saving & Investment bulan ini.", { amount: formatIDR(totals.remaining) })
            : t("⚠️ Minus {amount}. Alokasimu melebihi income — kurangi expense atau kecilkan pos saving/investasi bulan ini.", { amount: formatIDR(Math.abs(totals.remaining)) })}
        </div>
        <h4 style={{ margin: "14px 0 8px", fontSize: 14 }}>{t("Rincian bulanan")}</h4>
        <div className="table-wrap"><table className="tbl">
          <thead><tr><th>{t("Bulan")}</th><th>{t("Income")}</th><th>{t("Expense")}</th><th>{t("Saving")}</th><th>{t("Investment")}</th><th>{t("Sisa")}</th></tr></thead>
          <tbody>{monthly.map((m) => {
            const rest = m.income - m.expense - m.saving - m.investment;
            return (
              <tr key={m.key}>
                <td><b>{m.label}</b></td>
                <td className="positive">{formatIDR(m.income)}</td>
                <td className="negative">{formatIDR(m.expense)}</td>
                <td>{formatIDR(m.saving)}</td>
                <td>{formatIDR(m.investment)}</td>
                <td style={{ fontWeight: 800, color: rest >= 0 ? "#1e7a4c" : "#b34434" }}>{formatIDR(rest)}</td>
              </tr>
            );
          })}</tbody>
        </table></div>
      </div>
    );
  }

  if (tab === "saving") {
    const list = byType("saving");
    const byCat = groupByCategory(list);
    const pctIncome = totals.income ? (totals.saving / totals.income) * 100 : 0;
    const contributions = new Map<string, number>();
    list.filter((x) => x.goalId).forEach((x) => contributions.set(x.goalId!, (contributions.get(x.goalId!) ?? 0) + (x.amount)));
    const goalName = (id: string) => goals.find((g) => g.id === id)?.name ?? "Goal";
    return (
      <div className="card">
        <PanelHead
          icon="🏦" title={t("Saving")} desc={t("Dana yang disisihkan + progres tiap goal")}
          action={addBtn}
        />
        <div className="grid grid-3 mt">
          <Stat k={t("Total saving")} v={formatIDR(totals.saving)} s={t("{count} transaksi", { count: list.length })} />
          <Stat k={t("Porsi dari income")} v={`${pctIncome.toFixed(1)}%`} s={t("Target ideal ≥ 20%")} />
          <Stat k={t("Kontribusi ke goal")} v={formatIDR(Array.from(contributions.values()).reduce((s, v) => s + v, 0))} s={t("Via kategori Goals")} />
        </div>
        <div className="mt">
          <b style={{ fontSize: 13 }}>{t("Rincian per kategori saving")}</b>
          {byCat.map((c) => (
            <div className="cat-row" key={c.name}>
              <div className="space-between" style={{ fontSize: 13 }}>
                <span><span className="pill income">{t(c.name)}</span></span><b>{formatIDR(c.value)}</b>
              </div>
              <div className="progress green" style={{ marginTop: 6 }}>
                <div style={{ width: `${totals.saving ? (c.value / totals.saving) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
          {byCat.length === 0 && (
            <div className="empty"><span className="big-emoji">🏦</span>{t("Belum ada saving. Mulai dari Emergency Fund atau Goal. 🐖")}</div>
          )}
        </div>
        <h4 style={{ margin: "14px 0 8px", fontSize: 14 }}>{t("Goals")}</h4>
        {goals.map((g) => {
          const pct = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0;
          const via = contributions.get(g.id) ?? 0;
          return (
            <div key={g.id} className="stat-mini" style={{ marginBottom: 10 }}>
              <div className="space-between"><b>🎯 {g.name}</b><span className="sub">{formatIDR(g.saved)} / {formatIDR(g.target)}</span></div>
              <div className="progress green" style={{ margin: "8px 0" }}><div style={{ width: `${pct}%` }} /></div>
              <div className="sub">
                {t("{percent}% tercapai • Deadline {deadline} • Sisa {remaining}", {
                  percent: pct.toFixed(0),
                  deadline: g.deadline || "-",
                  remaining: formatIDR(Math.max(0, g.target - g.saved)),
                })}
                {via > 0 && (
                  <span> • {t("Setoran tercatat: {amount}", { amount: formatIDR(via) })}</span>
                )}
              </div>
              <div className="row mt">
                <button className="btn primary sm" onClick={() => onAdd("saving")}>{t("＋ Setor ke goal ini")}</button>
              </div>
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="empty"><span className="big-emoji">🎯</span>{t("Belum ada goal. Buat di halaman Planner. 🗺️")}</div>
        )}
      </div>
    );
  }

  // investment
  const list = byType("investment");
  const byCat = groupByCategory(list);
  const pctIncome = totals.income ? (totals.investment / totals.income) * 100 : 0;
  return (
    <div className="card">
      <PanelHead
        icon="📈" title={t("Investment")} desc={t("Modal yang ditanam per instrumen")}
        action={addBtn}
      />
      <div className="grid grid-3 mt">
        <Stat k={t("Total investment")} v={formatIDR(totals.investment)} s={t("{count} transaksi", { count: list.length })} />
        <Stat k={t("Porsi dari income")} v={`${pctIncome.toFixed(1)}%`} s={t("Target 10–20%")} />
        <Stat k={t("Instrumen terbesar")} v={byCat[0] ? t(byCat[0].name) : "-"} s={byCat[0] ? formatIDR(byCat[0].value) : t("Belum ada data")} />
      </div>
      <div className="mt">
        <b style={{ fontSize: 13 }}>{t("Alokasi per instrumen")}</b>
        {byCat.map((c) => (
          <div key={c.name} style={{ marginBottom: 11 }}>
            <div className="space-between" style={{ fontSize: 13 }}>
              <span>
                <span className="dot" style={{ background: colorForCategory(c.name) }} />
                {t(c.name)}
              </span>
              <b>{formatIDR(c.value)}</b>
            </div>
            <div className="progress" style={{ marginTop: 5 }}>
              <div style={{ width: `${totals.investment ? (c.value / totals.investment) * 100 : 0}%`, background: colorForCategory(c.name) }} />
            </div>
          </div>
        ))}
        {byCat.length === 0 && (
          <div className="empty"><span className="big-emoji">📈</span>{t("Belum ada investasi. Mulai dari Gold atau Stocks. 💹")}</div>
        )}
      </div>
      <div className="insight-box mt">
        {t("💡 Strategi: alokasikan 10–20% income ke investasi di awal bulan (pay yourself first), dan sebar ke beberapa instrumen.")}
      </div>
      <h4 style={{ margin: "14px 0 8px", fontSize: 14 }}>{t("Transaksi investasi")}</h4>
      <div className="table-wrap"><table className="tbl">
        <thead><tr><th>{t("Tanggal")}</th><th>{t("Kategori")}</th><th>{t("Metode")}</th><th>{t("Catatan")}</th><th style={{ textAlign: "right" }}>{t("Nominal")}</th></tr></thead>
        <tbody>{list.slice(0, 8).map((x) => (
          <tr key={x.id}><td>{x.date}</td><td>{t(x.category)}</td>
          <td>{x.paymentMethod ? <span className="pill method">{t(x.paymentMethod)}</span> : <span className="sub">-</span>}</td>
          <td>{x.note || <span className="sub">-</span>}</td>
          <td style={{ textAlign: "right" }}><b>{formatIDR(x.amount)}</b></td></tr>
        ))}{list.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center" }} className="sub">{t("Belum ada pos investasi.")}</td></tr>}</tbody>
      </table></div>
    </div>
  );
}
