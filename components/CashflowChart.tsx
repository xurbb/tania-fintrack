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
  cashflow: number;
}

export default function CashflowChart({ data }: { data: MonthlyPoint[] }) {
  const { t } = useLang();
  if (data.length === 0) return <p className="sub">{t("Belum ada data.")}</p>;
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" fontSize={12} />
          <YAxis fontSize={12} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
          <Tooltip
            formatter={(v: unknown, name: unknown) => [
              new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(Number(v)),
              name === "income" ? "Income" : name === "expense" ? "Expense" : "Cash Flow",
            ]}
          />
          <Legend />
          <Bar dataKey="income" name="Income" fill="#16a34a" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expense" name="Expense" fill="#dc2626" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
