import { MoonStar, BedDouble, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buildRecoveryPlan } from "@/lib/sleep-calculator";

interface RecoveryPlanProps {
  currentDebt: number;
}

export function RecoveryPlan({ currentDebt }: RecoveryPlanProps) {
  const plan = buildRecoveryPlan(currentDebt);

  if (plan.daysToRecover === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recovery Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 rounded-lg border border-[rgba(52,211,153,0.35)] bg-[rgba(52,211,153,0.1)] p-4">
            <MoonStar className="mt-0.5 h-5 w-5 text-[var(--success)]" />
            <div>
              <p className="font-medium text-[var(--success)]">No active debt detected</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Maintain your current routine with a consistent wake time and protected wind-down.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recovery Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Recovery timeline</p>
            <p className="mt-1 flex items-center gap-2 text-lg font-semibold">
              <CalendarClock className="h-4 w-4 text-[var(--accent)]" />
              {plan.daysToRecover} nights
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Extra per night</p>
            <p className="mt-1 flex items-center gap-2 text-lg font-semibold">
              <BedDouble className="h-4 w-4 text-[var(--accent)]" />
              +{plan.extraSleepPerNight} h
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Goal</p>
            <p className="mt-1 text-lg font-semibold">Debt ≤ 0 h</p>
          </div>
        </div>

        <div className="space-y-3">
          {plan.plan.map((item) => (
            <div
              key={item.day}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">Night {item.day}</p>
                <Badge variant={item.expectedDebtAfterDay === 0 ? "success" : "default"}>
                  {item.recommendedSleepHours} hours target
                </Badge>
              </div>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{item.guidance}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-[var(--text-muted)]">
                Expected remaining debt: {item.expectedDebtAfterDay} h
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
