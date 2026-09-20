"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ReceiptText,
  PiggyBank,
  UserRound,
  Menu,
  X,
  LogOut,
  CloudOff,
  Languages,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import LangSwitch from "@/components/LangSwitch";
import Logo from "@/components/Logo";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaction", icon: ReceiptText },
  { href: "/planner", label: "Planner", icon: PiggyBank },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const { user, cloud, signOut } = useAuth();
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  const is = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  // Tutup menu otomatis setiap pindah halaman
  useEffect(() => { setOpen(false); }, [path]);

  // Halaman login tampil bersih tanpa navigasi
  if (path === "/login") return null;

  const logout = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Header: nama web + subtitle — sengaja tidak diterjemahkan */}
          <Link href="/" className="brand">
            <span className="brand-mark"><Logo size={24} /></span>
            <span>
              Your Personal FinTrack <span className="badge">PLANNER</span>
              <small>Manage Money Better and Wiser, Get Richer Faster!</small>
            </span>
          </Link>

          {/* Menu horizontal — desktop */}
          <div className="nav-links">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className={is(item.href) ? "active" : ""}>
                  <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                    <Icon size={15} /> {item.label}
                  </span>
                </Link>
              );
            })}

            <LangSwitch />

            {cloud && user && (
              <span className="nav-account">
                <span className="nav-email" title={user.email ?? ""}>{user.email}</span>
                <button className="btn ghost-light sm" onClick={logout}>
                  <LogOut size={14} /> {t("Keluar")}
                </button>
              </span>
            )}
          </div>

          {/* Tombol tiga garis — mobile */}
          <button
            className="nav-burger"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? t("Tutup menu") : t("Buka menu")}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu dropdown — mobile */}
        {open && (
          <div className="nav-drawer">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-drawer-item ${is(item.href) ? "active" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  <Icon size={17} /> {item.label}
                </Link>
              );
            })}

            <div className="nav-drawer-lang">
              <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                <Languages size={16} /> {t("Bahasa")}
              </span>
              <LangSwitch compact />
            </div>

            {cloud && user && (
              <div className="nav-drawer-account">
                <div className="nav-email" style={{ maxWidth: "100%" }}>{user.email}</div>
                <button className="btn ghost-light sm" style={{ width: "100%", justifyContent: "center" }} onClick={logout}>
                  <LogOut size={14} /> {t("Keluar")}
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {!cloud && (
        <Link href="/login" className="setup-strip">
          <CloudOff size={14} />
          <span>
            <b>{t("Mode lokal")}</b>{" "}
            {t("— data belum tersinkron antar device. Klik di sini untuk mengaktifkan sinkronisasi.")}
          </span>
        </Link>
      )}
    </>
  );
}
