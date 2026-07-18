"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type Row = { symbol: string; changePct: number };

export function ChangeBarChart({ data }: { data: Row[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#232328" vertical={false} />
          <XAxis
            dataKey="symbol"
            tick={{ fill: "#8b8b95", fontSize: 12 }}
            axisLine={{ stroke: "#232328" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#8b8b95", fontSize: 12 }}
            axisLine={{ stroke: "#232328" }}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: "#17171b",
              border: "1px solid #232328",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [`${Number(value).toFixed(2)}%`, "Change"]}
          />
          <Bar dataKey="changePct" radius={[4, 4, 4, 4]} isAnimationActive={false}>
            {data.map((row) => (
              <Cell key={row.symbol} fill={row.changePct >= 0 ? "#22c55e" : "#ef4444"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
