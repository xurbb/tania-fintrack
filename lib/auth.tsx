"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isCloudEnabled, supabase } from "./supabase";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  cloud: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ error: string | null; info: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (name: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      cloud: isCloudEnabled,
      signIn: async (email, password) => {
        if (!supabase) return { error: "Supabase belum dikonfigurasi." };
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error ? terjemahkan(error.message) : null };
      },
      signUp: async (email, password, name) => {
        if (!supabase) return { error: "Supabase belum dikonfigurasi.", info: null };
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name.trim() } },
        });
        if (error) return { error: terjemahkan(error.message), info: null };
        if (!data.session)
          return { error: null, info: "Akun dibuat. Cek email kamu untuk konfirmasi, lalu login." };
        return { error: null, info: "Akun berhasil dibuat dan kamu sudah login." };
      },
      signOut: async () => {
        if (supabase) await supabase.auth.signOut();
        setSession(null);
      },
      updateProfile: async (name) => {
        if (!supabase) return { error: "Supabase belum dikonfigurasi." };
        const { data, error } = await supabase.auth.updateUser({
          data: { full_name: name.trim() },
        });
        if (error) return { error: terjemahkan(error.message) };
        // segarkan sesi supaya nama baru langsung tampil
        if (data.user) setSession((s) => (s ? { ...s, user: data.user } : s));
        return { error: null };
      },
      updatePassword: async (password) => {
        if (!supabase) return { error: "Supabase belum dikonfigurasi." };
        const { error } = await supabase.auth.updateUser({ password });
        return { error: error ? terjemahkan(error.message) : null };
      },
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function terjemahkan(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email atau password salah.";
  if (m.includes("email not confirmed")) return "Email belum dikonfirmasi. Cek inbox kamu.";
  if (m.includes("user already registered")) return "Email ini sudah terdaftar. Coba login.";
  if (m.includes("password should be at least")) return "Password minimal 6 karakter.";
  if (m.includes("unable to validate email")) return "Format email tidak valid.";
  if (m.includes("rate limit") || m.includes("too many")) return "Terlalu banyak percobaan. Tunggu sebentar.";
  return msg;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
