"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ReceiptText, PiggyBank, LogOut, CloudOff } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const { user, cloud, signOut } = useAuth();
  const is = (p: string) => (p === "/" ? path === "/" : path.startsWith(p));

  // Halaman login tampil bersih tanpa navigasi
  if (path === "/login") return null;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">💙</span>
            <span>
              Tania&apos;s FinTrack <span className="badge">PLANNER</span>
              <small>Income • Expense • Cash Flow • Saving • Invest</small>
            </span>
          </Link>
          <div className="nav-links">
            <Link href="/" className={is("/") ? "active" : ""}>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                <LayoutDashboard size={15} /> Dashboard
              </span>
            </Link>
            <Link href="/transactions" className={is("/transactions") ? "active" : ""}>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                <ReceiptText size={15} /> Transaksi
              </span>
            </Link>
            <Link href="/planner" className={is("/planner") ? "active" : ""}>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                <PiggyBank size={15} /> Planner
              </span>
            </Link>

            {cloud && user && (
              <span className="nav-account">
                <span className="nav-email" title={user.email ?? ""}>{user.email}</span>
                <button
                  className="btn ghost-light sm"
                  onClick={async () => { await signOut(); router.replace("/login"); }}
                >
                  <LogOut size={14} /> Keluar
                </button>
              </span>
            )}
          </div>
        </div>
      </nav>

      {!cloud && (
        <Link href="/login" className="setup-strip">
          <CloudOff size={14} />
          <span>
            <b>Mode lokal</b> — data belum tersinkron antar device. Klik di sini untuk mengaktifkan sinkronisasi.
          </span>
        </Link>
      )}
    </>
  );
}
