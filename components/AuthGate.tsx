"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

/**
 * Penjaga halaman:
 * - Kalau Supabase belum dikonfigurasi -> biarkan aplikasi jalan di mode lokal.
 * - Kalau sudah dikonfigurasi tapi belum login -> arahkan ke /login.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, cloud } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!cloud || loading) return;
    if (!user && pathname !== "/login") router.replace("/login");
    if (user && pathname === "/login") router.replace("/");
  }, [cloud, loading, user, pathname, router]);

  if (cloud && loading) {
    return (
      <div className="container" style={{ paddingTop: 60 }}>
        <div className="card" style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>💙</div>
          <b>Memuat data Tania...</b>
          <p className="sub" style={{ marginTop: 6 }}>Menyambungkan ke database.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
