"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Activity, Moon, Timer, Trash2, TrendingUp } from "lucide-react";
import { DebtChart } from "@/components/DebtChart";
import { RecoveryPlan } from "@/components/RecoveryPlan";
import { HealthWarnings } from "@/components/HealthWarnings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  calculateDebtSeries,
  calculateInsights,
  generateHealthWarnings
} from "@/lib/sleep-calculator";
import { type SleepEntry } from "@/types/sleep";

interface SleepLoggerProps {
  plan: "free" | "pro";
}

const LOCAL_STORAGE_KEY = "sleep-debt-free-entries";

async function parseApiResponse(response: Response) {
  const payload = (await response.json()) as {
    entries?: SleepEntry[];
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed");
  }

  return payload.entries ?? [];
}

export function SleepLogger({ plan }: SleepLoggerProps) {
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [hoursSlept, setHoursSlept] = useState("7");
  const [targetHours, setTargetHours] = useState("8");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadEntries() {
      try {
        setError(null);

        if (plan === "pro") {
          const response = await fetch("/api/sleep", { cache: "no-store" });
          const remoteEntries = await parseApiResponse(response);
          setEntries(remoteEntries);
          return;
        }

        const local = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        setEntries(local ? (JSON.parse(local) as SleepEntry[]) : []);
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : "Could not load entries";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadEntries();
  }, [plan]);

  useEffect(() => {
    if (plan === "free") {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, plan]);

  const insights = useMemo(() => calculateInsights(entries), [entries]);
  const debtSeries = useMemo(() => calculateDebtSeries(entries), [entries]);
  const warnings = useMemo(
    () =>
      generateHealthWarnings(
        insights.currentDebt,
        insights.streakBelowTarget,
        insights.sevenDayAverage
      ),
    [insights.currentDebt, insights.sevenDayAverage, insights.streakBelowTarget]
  );

  async function saveEntry(nextEntry: SleepEntry) {
    if (plan === "pro") {
      const response = await fetch("/api/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextEntry)
      });
      const updated = await parseApiResponse(response);
      setEntries(updated);
      return;
    }

    setEntries((current) => [...current, nextEntry].sort((a, b) => a.date.localeCompare(b.date)));
  }

  async function removeEntry(id: string) {
    try {
      setError(null);
      if (plan === "pro") {
        const response = await fetch(`/api/sleep?id=${id}`, { method: "DELETE" });
        const updated = await parseApiResponse(response);
        setEntries(updated);
        return;
      }

      setEntries((current) => current.filter((entry) => entry.id !== id));
    } catch (removeError) {
      const message =
        removeError instanceof Error ? removeError.message : "Could not remove entry";
      setError(message);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const slept = Number(hoursSlept);
    const target = Number(targetHours);

    if (!date || Number.isNaN(slept) || Number.isNaN(target)) {
      setError("Date and numeric sleep hours are required.");
      return;
    }

    if (slept < 0 || slept > 16 || target < 4 || target > 12) {
      setError("Use realistic values: slept 0-16h and target 4-12h.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const entry: SleepEntry = {
      id: crypto.randomUUID(),
      date,
      hoursSlept: slept,
      targetHours: target,
      notes: notes.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      await saveEntry(entry);
      setNotes("");
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "Could not save sleep entry";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Current debt</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Timer className="h-5 w-5 text-[var(--accent)]" />
              {insights.currentDebt}h
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Sleep score</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Activity className="h-5 w-5 text-[var(--accent)]" />
              {insights.sleepScore}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>7-day average</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Moon className="h-5 w-5 text-[var(--accent)]" />
              {insights.sevenDayAverage}h
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Debt trend</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl capitalize">
              <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
              {insights.debtTrend}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Sleep Log</CardTitle>
          <CardDescription>
            Record each night in under 20 seconds. Debt and recovery guidance update instantly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 lg:grid-cols-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm text-[var(--text-muted)]" htmlFor="sleep-date">
                Date
              </label>
              <Input
                id="sleep-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[var(--text-muted)]" htmlFor="hours-slept">
                Hours slept
              </label>
              <Input
                id="hours-slept"
                type="number"
                step="0.25"
                min="0"
                max="16"
                value={hoursSlept}
                onChange={(event) => setHoursSlept(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[var(--text-muted)]" htmlFor="target-hours">
                Sleep target
              </label>
              <Input
                id="target-hours"
                type="number"
                step="0.25"
                min="4"
                max="12"
                value={targetHours}
                onChange={(event) => setTargetHours(event.target.value)}
              />
            </div>
            <div className="space-y-2 lg:col-span-4">
              <label className="text-sm text-[var(--text-muted)]" htmlFor="sleep-notes">
                Notes (optional)
              </label>
              <Textarea
                id="sleep-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Late shift, caffeine after 4pm, or workout intensity are useful context for trend analysis."
              />
            </div>
            <div className="lg:col-span-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Add sleep entry"}
              </Button>
            </div>
          </form>
          {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}
        </CardContent>
      </Card>

      <DebtChart series={debtSeries} />
      <RecoveryPlan currentDebt={insights.currentDebt} />
      <HealthWarnings warnings={warnings} />

      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-[var(--text-muted)]">Loading your sleep history...</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              No entries yet. Start with tonight to build an accurate debt baseline.
            </p>
          ) : (
            <div className="space-y-2">
              {[...entries]
                .reverse()
                .slice(0, 14)
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {format(new Date(entry.date), "EEE, MMM d")} - {entry.hoursSlept}h
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Target {entry.targetHours}h
                        {entry.notes ? ` | ${entry.notes}` : ""}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void removeEntry(entry.id)}
                      aria-label={`Delete entry for ${entry.date}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
