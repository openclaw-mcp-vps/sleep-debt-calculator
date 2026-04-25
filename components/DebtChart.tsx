"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type DebtPoint } from "@/types/sleep";

interface DebtChartProps {
  series: DebtPoint[];
}

export function DebtChart({ series }: DebtChartProps) {
  if (series.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sleep Debt Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--text-muted)]">
            Add your first sleep entry to visualize cumulative debt and nightly recovery.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sleep Debt Trend</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="debtGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#273346" />
              <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
                label={{ value: "Debt Hours", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
              />
              <Tooltip
                contentStyle={{
                  background: "#111821",
                  border: "1px solid #273346",
                  borderRadius: 10,
                  color: "#e6edf3"
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulativeDebt"
                stroke="#2dd4bf"
                fillOpacity={1}
                fill="url(#debtGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="4 4" stroke="#273346" />
              <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#111821",
                  border: "1px solid #273346",
                  borderRadius: 10,
                  color: "#e6edf3"
                }}
              />
              <Line
                type="monotone"
                dataKey="sleepHours"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={{ fill: "#60a5fa", strokeWidth: 0, r: 3 }}
                name="Slept"
              />
              <Line
                type="monotone"
                dataKey="targetHours"
                stroke="#fbbf24"
                strokeWidth={2}
                strokeDasharray="8 6"
                dot={false}
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
