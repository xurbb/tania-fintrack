"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { signIn, signUp, cloud, user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "daftar">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!cloud) {
    return (
      <div className="card" style={{ maxWidth: 560, margin: "40px auto" }}>
        <h2 className="page-title" style={{ fontSize: 20 }}>⚙️ Sinkronisasi belum aktif</h2>
        <p className="sub">
          Aplikasi sedang berjalan dalam <b>mode lokal</b> (data hanya tersimpan di browser ini).
          Untuk bisa diakses dan disinkronkan antar device, ikuti 3 langkah berikut.
        </p>
        <ol className="sub" style={{ lineHeight: 1.9, marginTop: 10 }}>
          <li>
            Buat project gratis di <b>supabase.com</b>, lalu salin <b>Project URL</b> dan{" "}
            <b>anon public key</b> (menu Settings → API).
          </li>
          <li>
            Buka <b>SQL Editor</b> di Supabase, copy-paste isi file <code>supabase-schema.sql</code>,
            lalu klik <b>Run</b>.
          </li>
          <li>
            Buat file <code>.env.local</code> di folder proyek ini (contoh ada di{" "}
            <code>.env.local.example</code>), isi dua nilai tadi, lalu jalankan ulang{" "}
            <code>start-tania.cmd</code>.
          </li>
        </ol>
        <button className="btn primary mt" onClick={() => router.push("/")}>
          Lanjut pakai mode lokal
        </button>
      </div>
    );
  }

  if (user) {
    return (
      <div className="card" style={{ maxWidth: 420, margin: "40px auto", textAlign: "center" }}>
        <div style={{ fontSize: 28 }}>✅</div>
        <b>Kamu sudah login</b>
        <p className="sub">{user.email}</p>
        <button className="btn primary mt" onClick={() => router.push("/")}>Buka Dashboard</button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email || !password) { setError("Email dan password wajib diisi."); return; }
    if (password.length < 6) { setError("Password minimal 6 karakter."); return; }

    setBusy(true);
    if (mode === "login") {
      const { error } = await signIn(email.trim(), password);
      setBusy(false);
      if (error) setError(error);
      else router.replace("/");
    } else {
      const { error, info } = await signUp(email.trim(), password);
      setBusy(false);
      if (error) setError(error);
      if (info) setInfo(info);
    }
  };

  return (
    <div style={{ maxWidth: 430, margin: "36px auto" }}>
      <header className="hero" style={{ padding: "22px 24px" }}>
        <div className="hero-eyebrow">💙 Your Personal FinTrack</div>
        <h1 style={{ fontSize: 22 }}>{mode === "login" ? "Masuk ke akunmu" : "Buat akun baru"}</h1>
        <p>Login sekali, data keuanganmu tersinkron di HP, laptop, dan tablet.</p>
      </header>

      <div className="card mt">
        <form onSubmit={submit}>
          <div style={{ marginBottom: 12 }}>
            <label className="lbl">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              autoComplete="email"
              required
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="lbl">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="minimal 6 karakter"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
          </div>

          {error && <div className="insight-box bad" style={{ marginBottom: 12 }}>⚠️ {error}</div>}
          {info && <div className="insight-box good" style={{ marginBottom: 12 }}>✅ {info}</div>}

          <button className="btn primary" type="submit" disabled={busy} style={{ width: "100%", justifyContent: "center" }}>
            {busy ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"}
          </button>
        </form>

        <p className="sub" style={{ textAlign: "center", marginTop: 14 }}>
          {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
          <button
            className="btn sm"
            style={{ marginLeft: 6 }}
            onClick={() => { setMode(mode === "login" ? "daftar" : "login"); setError(null); setInfo(null); }}
          >
            {mode === "login" ? "Daftar sekarang" : "Masuk"}
          </button>
        </p>
      </div>

      <p className="sub" style={{ textAlign: "center", marginTop: 12 }}>
        Data kamu dilindungi Row Level Security — hanya akunmu yang bisa membacanya.
      </p>
    </div>
  );
}
