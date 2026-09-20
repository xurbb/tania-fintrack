"use client";

import { useLang } from "@/lib/i18n";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface MonthlyPoint {
  key: string;
  label: string;
  income: number;
  expense: number;
  saving: number;
  investment: number;
}

export default function CashflowChart({ data }: { data: MonthlyPoint[] }) {
  const { t } = useLang();
  if (data.length === 0) return <p className="sub">{t("Belum ada data.")}</p>;
  const fmt = (v: unknown) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(v));
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" fontSize={12} />
          <YAxis fontSize={12} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
          <Tooltip
            formatter={(v: unknown, name: unknown) => {
              const label =
                name === "income" ? t("Income")
                : name === "expense" ? t("Expense")
                : name === "saving" ? t("Saving")
                : t("Investment");
              return [fmt(v), label];
            }}
          />
          <Legend
            formatter={(v: unknown) =>
              v === "income" ? t("Income")
              : v === "expense" ? t("Expense")
              : v === "saving" ? t("Saving")
              : t("Investment")
            }
          />
          <Bar dataKey="income" name="income" fill="#1e5aa8" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expense" name="expense" stackId="out" fill="#b34434" />
          <Bar dataKey="saving" name="saving" stackId="out" fill="#2f7d62" />
          <Bar dataKey="investment" name="investment" stackId="out" fill="#7a9cc6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
