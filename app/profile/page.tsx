"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useFinance } from "@/lib/store";
import { formatIDR, monthKey } from "@/lib/utils";
import { LogOut, CheckCircle2, CloudOff, ShieldCheck, Trash2 } from "lucide-react";

export default function ProfilePage() {
  const { user, cloud, signOut, session } = useAuth();
  const { transactions, budgets, goals, clearAll, loading } = useFinance();
  const router = useRouter();

  const stats = useMemo(() => {
    const totalIn = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalOut = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const months = new Set(transactions.map((t) => monthKey(t.date))).size;
    return {
      count: transactions.length,
      totalIn,
      totalOut,
      net: totalIn - totalOut,
      months,
      goals: goals.length,
      budgets: budgets.filter((b) => b.limit > 0).length,
      firstDate: transactions.length
        ? transactions.map((t) => t.date).sort()[0]
        : "-",
    };
  }, [transactions, budgets, goals]);

  const logout = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <div>
      <header className="hero">
        <div className="hero-eyebrow">👤 Profile</div>
        <h1>{user?.email ?? "Mode Lokal"}</h1>
        <p>
          {cloud
            ? "Akunmu tersinkron di semua device. Data dipisahkan per akun oleh Row Level Security."
            : "Kamu sedang memakai mode lokal — data hanya tersimpan di browser ini."}
        </p>
        <div className="hero-actions">
          {cloud && user ? (
            <button className="btn ghost-light" onClick={logout}>
              <LogOut size={15} /> Keluar dari akun
            </button>
          ) : (
            <button className="btn sand" onClick={() => router.push("/login")}>
              Aktifkan Sinkronisasi
            </button>
          )}
        </div>
      </header>

      <div className="section-head">
        <span className="section-num">01</span>
        <div>
          <h2>Status akun</h2>
          <p>Informasi login dan kondisi sinkronisasi datamu.</p>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 className="plain">🔐 Akun</h3>
          <div className="mt">
            <div className="stat-mini">
              <div className="k">Email</div>
              <div className="v" style={{ fontSize: 15, wordBreak: "break-all" }}>
                {user?.email ?? "—"}
              </div>
            </div>
            <div className="stat-mini mt">
              <div className="k">User ID</div>
              <div className="v" style={{ fontSize: 12, wordBreak: "break-all", fontWeight: 600 }}>
                {user?.id ?? "—"}
              </div>
            </div>
            <div className="stat-mini mt">
              <div className="k">Login terakhir</div>
              <div className="v" style={{ fontSize: 15 }}>
                {session?.expires_at
                  ? new Date(session.expires_at * 1000).toLocaleString("id-ID")
                  : "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="plain">☁️ Sinkronisasi</h3>
          <div className={`insight-box ${cloud ? "good" : ""} mt`}>
            {cloud ? (
              <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                <CheckCircle2 size={16} /> <b>Sinkronisasi aktif.</b> Datamu tersimpan di database dan bisa
                diakses dari HP, laptop, maupun tablet dengan akun yang sama.
              </span>
            ) : (
              <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                <CloudOff size={16} /> <b>Mode lokal.</b> Data hanya ada di browser ini.
              </span>
            )}
          </div>
          <div className="insight-box mt">
            <span style={{ display: "inline-flex", gap: 8, alignItems: "flex-start" }}>
              <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                Setiap akun hanya bisa membaca datanya sendiri. Isolasi ini dijaga oleh{" "}
                <b>Row Level Security</b> di database, bukan hanya oleh tampilan web — jadi akun lain
                tidak bisa melihat keuanganmu walau memodifikasi halaman ini.
              </span>
            </span>
          </div>
          <div className="sub mt">
            Status data: {loading ? "memuat..." : "siap"} • Transaksi tercatat sejak {stats.firstDate}
          </div>
        </div>
      </div>

      <div className="section-head">
        <span className="section-num">02</span>
        <div>
          <h2>Ringkasan data</h2>
          <p>Total keseluruhan dari semua transaksi yang tercatat di akun ini.</p>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="card kpi k-green">
          <div className="kpi-top"><span className="kpi-icon">💰</span><h3>Total Income</h3></div>
          <div className="big positive">{formatIDR(stats.totalIn)}</div>
          <div className="sub">sepanjang waktu</div>
        </div>
        <div className="card kpi k-red">
          <div className="kpi-top"><span className="kpi-icon">🧾</span><h3>Total Expense</h3></div>
          <div className="big negative">{formatIDR(stats.totalOut)}</div>
          <div className="sub">sepanjang waktu</div>
        </div>
        <div className="card kpi k-sand">
          <div className="kpi-top"><span className="kpi-icon">📊</span><h3>Net</h3></div>
          <div className={`big ${stats.net >= 0 ? "positive" : "negative"}`}>{formatIDR(stats.net)}</div>
          <div className="sub">income − expense</div>
        </div>
        <div className="card kpi">
          <div className="kpi-top"><span className="kpi-icon">🗂️</span><h3>Catatan</h3></div>
          <div className="big">{stats.count}</div>
          <div className="sub">{stats.months} bulan · {stats.goals} goal · {stats.budgets} budget</div>
        </div>
      </div>

      <div className="section-head">
        <span className="section-num">03</span>
        <div>
          <h2>Kelola data</h2>
          <p>Tindakan yang mengubah seluruh data di akun ini.</p>
        </div>
      </div>

      <div className="card">
        <div className="space-between">
          <div>
            <h3 className="plain">🗑️ Hapus semua transaksi</h3>
            <p className="sub" style={{ margin: "2px 0 0" }}>
              Menghapus {stats.count} transaksi dari akun ini{cloud ? " (termasuk di database)" : ""}.
              Budget dan goal tidak terpengaruh.
            </p>
          </div>
          <button
            className="btn danger"
            onClick={() => {
              if (confirm(`Hapus semua ${stats.count} transaksi? Tindakan ini tidak bisa dibatalkan.`)) clearAll();
            }}
          >
            <Trash2 size={15} /> Hapus Semua Transaksi
          </button>
        </div>
      </div>
    </div>
  );
}
