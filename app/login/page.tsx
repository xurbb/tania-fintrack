"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import LangSwitch from "@/components/LangSwitch";

export default function LoginPage() {
  const { signIn, signUp, cloud, user } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "daftar">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!cloud) {
    return (
      <div className="card" style={{ maxWidth: 560, margin: "40px auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h2 className="page-title" style={{ fontSize: 20 }}>{t("⚙️ Sinkronisasi belum aktif")}</h2>
          <LangSwitch light />
        </div>
        <p className="sub">
          {t("Aplikasi sedang berjalan dalam mode lokal (data hanya tersimpan di browser ini). Untuk bisa diakses dan disinkronkan antar device, ikuti 3 langkah berikut.")}
        </p>
        <ol className="sub" style={{ lineHeight: 1.9, marginTop: 10 }}>
          <li>{t("Buat project gratis di supabase.com, lalu salin Project URL dan anon public key (menu Settings → API).")}</li>
          <li>{t("Buka SQL Editor di Supabase, copy-paste isi file supabase-schema.sql, lalu klik Run.")}</li>
          <li>{t("Buat file .env.local di folder proyek ini, isi dua nilai tadi, lalu jalankan ulang start-tania.cmd.")}</li>
        </ol>
        <button className="btn primary mt" onClick={() => router.push("/")}>
          {t("Lanjut pakai mode lokal")}
        </button>
      </div>
    );
  }

  if (user) {
    return (
      <div className="card" style={{ maxWidth: 420, margin: "40px auto", textAlign: "center" }}>
        <div style={{ fontSize: 28 }}>✅</div>
        <b>{t("Kamu sudah login")}</b>
        <p className="sub">{user.email}</p>
        <button className="btn primary mt" onClick={() => router.push("/")}>{t("Buka Dashboard")}</button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email || !password) { setError(t("Email dan password wajib diisi.")); return; }
    if (mode === "daftar" && !name.trim()) { setError(t("Nama wajib diisi.")); return; }
    if (password.length < 6) { setError(t("Password minimal 6 karakter.")); return; }

    setBusy(true);
    if (mode === "login") {
      const { error } = await signIn(email.trim(), password);
      setBusy(false);
      if (error) setError(error);
      else router.replace("/");
    } else {
      const { error, info } = await signUp(email.trim(), password, name);
      setBusy(false);
      if (error) setError(error);
      if (info) setInfo(info);
    }
  };

  return (
    <div style={{ maxWidth: 430, margin: "36px auto" }}>
      <header className="hero" style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          {/* Header: nama web + subtitle — tidak diterjemahkan */}
          <div>
            <div className="hero-eyebrow">💙 Your Personal FinTrack</div>
            <p style={{ margin: 0 }}>Manage Money Better and Wiser, Get Richer Faster!</p>
          </div>
          <LangSwitch />
        </div>
        <h1 style={{ fontSize: 22, marginTop: 12 }}>
          {mode === "login" ? t("Masuk ke akunmu") : t("Buat akun baru")}
        </h1>
        <p>{t("Login sekali, data keuanganmu tersinkron di HP, laptop, dan tablet.")}</p>
      </header>

      <div className="card mt">
        <form onSubmit={submit}>
          {mode === "daftar" && (
            <div style={{ marginBottom: 12 }}>
              <label className="lbl">{t("Nama")}</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("cth: Rina")}
                autoComplete="name"
                required
              />
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <label className="lbl">{t("Email")}</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("masuk@email.com")}
              autoComplete="email"
              required
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="lbl">{t("Password")}</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("minimal 6 karakter")}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
          </div>

          {error && <div className="insight-box bad" style={{ marginBottom: 12 }}>⚠️ {error}</div>}
          {info && <div className="insight-box good" style={{ marginBottom: 12 }}>✅ {info}</div>}

          <button className="btn primary" type="submit" disabled={busy} style={{ width: "100%", justifyContent: "center" }}>
            {busy ? t("Memproses...") : mode === "login" ? t("Masuk") : t("Daftar")}
          </button>
        </form>

        <p className="sub" style={{ textAlign: "center", marginTop: 14 }}>
          {mode === "login" ? t("Belum punya akun? ") : t("Sudah punya akun? ")}
          <button
            className="btn sm"
            style={{ marginLeft: 6 }}
            onClick={() => { setMode(mode === "login" ? "daftar" : "login"); setError(null); setInfo(null); }}
          >
            {mode === "login" ? t("Daftar sekarang") : t("Masuk")}
          </button>
        </p>
      </div>

      <p className="sub" style={{ textAlign: "center", marginTop: 12 }}>
        {t("Data kamu dilindungi Row Level Security — hanya akunmu yang bisa membacanya.")}
      </p>
    </div>
  );
}
