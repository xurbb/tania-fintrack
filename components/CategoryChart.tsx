"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { colorForCategory } from "@/lib/constants";
import { useLang } from "@/lib/i18n";
import { formatIDR } from "@/lib/utils";

export default function CategoryChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const { t } = useLang();
  if (data.length === 0) return <p className="sub">{t("Belum ada data.")}</p>;
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={95} label={false}>
            {data.map((d) => (
              <Cell key={d.name} fill={colorForCategory(d.name)} />
            ))}
          </Pie>
          <Tooltip formatter={(v: unknown) => formatIDR(Number(v))} />
          <Legend fontSize={12} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
