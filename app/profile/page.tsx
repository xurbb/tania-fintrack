"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useFinance } from "@/lib/store";
import { displayName, useLang } from "@/lib/i18n";
import { formatIDR, monthKey } from "@/lib/utils";
import { LogOut, CheckCircle2, CloudOff, ShieldCheck, Trash2, UserRound, KeyRound } from "lucide-react";

export default function ProfilePage() {
  const { user, cloud, signOut, session, updateProfile, updatePassword } = useAuth();
  const { transactions, budgets, goals, clearAll, loading } = useFinance();
  const { t } = useLang();
  const router = useRouter();

  const [name, setName] = useState("");
  const [nameMsg, setNameMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(displayName(user) ?? "");
  }, [user]);

  const stats = useMemo(() => {
    const totalIn = transactions.filter((x) => x.type === "income").reduce((s, x) => s + x.amount, 0);
    const totalOut = transactions.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0);
    const months = new Set(transactions.map((x) => monthKey(x.date))).size;
    return {
      count: transactions.length,
      totalIn,
      totalOut,
      net: totalIn - totalOut,
      months,
      goals: goals.length,
      budgets: budgets.filter((b) => b.limit > 0).length,
      firstDate: transactions.length ? transactions.map((x) => x.date).sort()[0] : "-",
    };
  }, [transactions, budgets, goals]);

  const saveName = async () => {
    setNameMsg(null);
    if (!name.trim()) { setNameMsg({ ok: false, text: t("Nama tidak boleh kosong.") }); return; }
    setBusy(true);
    const { error } = await updateProfile(name);
    setBusy(false);
    setNameMsg(error ? { ok: false, text: error } : { ok: true, text: t("Nama berhasil diperbarui.") });
  };

  const savePassword = async () => {
    setPwdMsg(null);
    if (pwd1.length < 6) { setPwdMsg({ ok: false, text: t("Password minimal 6 karakter.") }); return; }
    if (pwd1 !== pwd2) { setPwdMsg({ ok: false, text: t("Konfirmasi password tidak cocok.") }); return; }
    setBusy(true);
    const { error } = await updatePassword(pwd1);
    setBusy(false);
    if (error) setPwdMsg({ ok: false, text: error });
    else {
      setPwdMsg({ ok: true, text: t("Password berhasil diubah.") });
      setPwd1(""); setPwd2("");
    }
  };

  return (
    <div>
      <header className="hero">
        <div className="hero-eyebrow">👤 Profile</div>
        <h1>{displayName(user) ?? t("Mode Lokal")}</h1>
        <p>
          {cloud
            ? t("Akunmu tersinkron di semua device. Data dipisahkan per akun oleh Row Level Security.")
            : t("Kamu sedang memakai mode lokal — data hanya tersimpan di browser ini.")}
        </p>
        <div className="hero-actions">
          {cloud && user ? (
            <button className="btn ghost-light" onClick={async () => { await signOut(); router.replace("/login"); }}>
              <LogOut size={15} /> {t("Keluar dari akun")}
            </button>
          ) : (
            <button className="btn sand" onClick={() => router.push("/login")}>
              {t("Aktifkan Sinkronisasi")}
            </button>
          )}
        </div>
      </header>

      <div className="section-head">
        <span className="section-num">01</span>
        <div>
          <h2>{t("Status akun")}</h2>
          <p>{t("Informasi login dan kondisi sinkronisasi datamu.")}</p>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 className="plain">🔐 {t("🔐 Akun")}</h3>
          <div className="mt">
            <div className="stat-mini">
              <div className="k">{t("Nama")}</div>
              <div className="v" style={{ fontSize: 15 }}>{displayName(user) ?? "—"}</div>
            </div>
            <div className="stat-mini mt">
              <div className="k">{t("Email")}</div>
              <div className="v" style={{ fontSize: 15, wordBreak: "break-all" }}>{user?.email ?? "—"}</div>
            </div>
            <div className="stat-mini mt">
              <div className="k">{t("User ID")}</div>
              <div className="v" style={{ fontSize: 12, wordBreak: "break-all", fontWeight: 600 }}>{user?.id ?? "—"}</div>
            </div>
            <div className="stat-mini mt">
              <div className="k">{t("Login terakhir")}</div>
              <div className="v" style={{ fontSize: 15 }}>
                {session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="plain">☁️ {t("☁️ Sinkronisasi")}</h3>
          <div className={`insight-box ${cloud ? "good" : ""} mt`}>
            {cloud ? (
              <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                <CheckCircle2 size={16} /> <b>{t("Sinkronisasi aktif.")}</b>{" "}
                {t("Datamu tersimpan di database dan bisa diakses dari HP, laptop, maupun tablet dengan akun yang sama.")}
              </span>
            ) : (
              <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                <CloudOff size={16} /> <b>{t("Mode lokal.")}</b> {t("Data hanya ada di browser ini.")}
              </span>
            )}
          </div>
          <div className="insight-box mt">
            <span style={{ display: "inline-flex", gap: 8, alignItems: "flex-start" }}>
              <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                {t("Setiap akun hanya bisa membaca datanya sendiri. Isolasi ini dijaga oleh Row Level Security di database, bukan hanya oleh tampilan web — jadi akun lain tidak bisa melihat keuanganmu walau memodifikasi halaman ini.")}
              </span>
            </span>
          </div>
          <div className="sub mt">
            {t("Status data: {status} • Transaksi tercatat sejak {since}", {
              status: loading ? t("memuat...") : t("siap"),
              since: stats.firstDate,
            })}
          </div>
        </div>
      </div>

      {cloud && user && (
        <>
          <div className="section-head">
            <span className="section-num">02</span>
            <div>
              <h2>{t("Ubah profil")}</h2>
              <p>{t("Perbarui nama tampilan dan password akunmu.")}</p>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h3 className="plain">
                <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                  <UserRound size={17} /> {t("Nama tampilan")}
                </span>
              </h3>
              <div className="mt">
                <label className="lbl">{t("Nama")}</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("cth: Rina")} />
                {nameMsg && (
                  <div className={`insight-box ${nameMsg.ok ? "good" : "bad"} mt`}>
                    {nameMsg.ok ? "✅" : "⚠️"} {nameMsg.text}
                  </div>
                )}
                <button className="btn primary mt" onClick={saveName} disabled={busy}>{t("Simpan Nama")}</button>
              </div>
            </div>

            <div className="card">
              <h3 className="plain">
                <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                  <KeyRound size={17} /> {t("Ubah Password")}
                </span>
              </h3>
              <div className="mt">
                <label className="lbl">{t("Password baru")}</label>
                <input className="input" type="password" value={pwd1} onChange={(e) => setPwd1(e.target.value)} placeholder={t("minimal 6 karakter")} autoComplete="new-password" />
                <div className="mt">
                  <label className="lbl">{t("Konfirmasi password baru")}</label>
                  <input className="input" type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} placeholder={t("minimal 6 karakter")} autoComplete="new-password" />
                </div>
                {pwdMsg && (
                  <div className={`insight-box ${pwdMsg.ok ? "good" : "bad"} mt`}>
                    {pwdMsg.ok ? "✅" : "⚠️"} {pwdMsg.text}
                  </div>
                )}
                <button className="btn primary mt" onClick={savePassword} disabled={busy}>{t("Ubah Password")}</button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="section-head">
        <span className="section-num">{cloud && user ? "03" : "02"}</span>
        <div>
          <h2>{t("Ringkasan data")}</h2>
          <p>{t("Total keseluruhan dari semua transaksi yang tercatat di akun ini.")}</p>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="card kpi k-green">
          <div className="kpi-top"><span className="kpi-icon">💰</span><h3>{t("Total income")}</h3></div>
          <div className="big positive">{formatIDR(stats.totalIn)}</div>
          <div className="sub">{t("sepanjang waktu")}</div>
        </div>
        <div className="card kpi k-red">
          <div className="kpi-top"><span className="kpi-icon">🧾</span><h3>{t("Total expense")}</h3></div>
          <div className="big negative">{formatIDR(stats.totalOut)}</div>
          <div className="sub">{t("sepanjang waktu")}</div>
        </div>
        <div className="card kpi k-sand">
          <div className="kpi-top"><span className="kpi-icon">📊</span><h3>{t("Net")}</h3></div>
          <div className={`big ${stats.net >= 0 ? "positive" : "negative"}`}>{formatIDR(stats.net)}</div>
          <div className="sub">{t("income − expense")}</div>
        </div>
        <div className="card kpi">
          <div className="kpi-top"><span className="kpi-icon">🗂️</span><h3>{t("Catatan")}</h3></div>
          <div className="big">{stats.count}</div>
          <div className="sub">{t("{months} bulan · {goals} goal · {budgets} budget", { months: stats.months, goals: stats.goals, budgets: stats.budgets })}</div>
        </div>
      </div>

      <div className="section-head">
        <span className="section-num">{cloud && user ? "04" : "03"}</span>
        <div>
          <h2>{t("Kelola data")}</h2>
          <p>{t("Tindakan yang mengubah seluruh data di akun ini.")}</p>
        </div>
      </div>

      <div className="card">
        <div className="space-between">
          <div>
            <h3 className="plain">{t("🗑️ Hapus semua transaksi")}</h3>
            <p className="sub" style={{ margin: "2px 0 0" }}>
              {t("Menghapus {count} transaksi dari akun ini{scope}.", {
                count: stats.count,
                scope: cloud ? t(" (termasuk di database)") : "",
              })}{" "}
              {t("Budget dan goal tidak terpengaruh.")}
            </p>
          </div>
          <button
            className="btn danger"
            onClick={() => {
              if (confirm(t("Hapus semua {count} transaksi? Tindakan ini tidak bisa dibatalkan.", { count: stats.count }))) clearAll();
            }}
          >
            <Trash2 size={15} /> {t("Hapus Semua Transaksi")}
          </button>
        </div>
      </div>
    </div>
  );
}
