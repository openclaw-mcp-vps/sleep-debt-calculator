import { compareAsc, format, parseISO } from "date-fns";
import {
  type DebtPoint,
  type HealthWarning,
  type RecoveryPlanData,
  type SleepEntry,
  type SleepInsights
} from "@/types/sleep";

function round(value: number) {
  return Number(value.toFixed(2));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function sortSleepEntries(entries: SleepEntry[]) {
  return [...entries].sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)));
}

export function calculateDailyDebt(entry: SleepEntry) {
  return round(entry.targetHours - entry.hoursSlept);
}

export function calculateDebtSeries(entries: SleepEntry[]): DebtPoint[] {
  const sorted = sortSleepEntries(entries);
  let cumulative = 0;

  return sorted.map((entry) => {
    const dailyDebt = calculateDailyDebt(entry);
    cumulative = Math.max(0, round(cumulative + dailyDebt));

    return {
      date: format(parseISO(entry.date), "MMM d"),
      sleepHours: entry.hoursSlept,
      targetHours: entry.targetHours,
      dailyDebt,
      cumulativeDebt: cumulative
    };
  });
}

export function calculateInsights(entries: SleepEntry[]): SleepInsights {
  const series = calculateDebtSeries(entries);
  const currentDebt = series.length > 0 ? series[series.length - 1].cumulativeDebt : 0;
  const recentEntries = sortSleepEntries(entries).slice(-7);

  const sevenDayAverage =
    recentEntries.length > 0
      ? round(
          recentEntries.reduce((sum, entry) => sum + entry.hoursSlept, 0) /
            recentEntries.length
        )
      : 0;

  let streakBelowTarget = 0;
  const reverse = sortSleepEntries(entries).reverse();
  for (const entry of reverse) {
    if (entry.hoursSlept < entry.targetHours) {
      streakBelowTarget += 1;
    } else {
      break;
    }
  }

  let debtTrend: SleepInsights["debtTrend"] = "stable";
  if (series.length >= 3) {
    const last = series[series.length - 1].cumulativeDebt;
    const prev = series[series.length - 2].cumulativeDebt;
    const older = series[series.length - 3].cumulativeDebt;
    if (last > prev && prev >= older) debtTrend = "worsening";
    if (last < prev && prev <= older) debtTrend = "improving";
  }

  const rawScore = 100 - currentDebt * 4.5 - streakBelowTarget * 2.5;
  const bonus = sevenDayAverage >= 7.5 ? 8 : sevenDayAverage >= 7 ? 4 : 0;
  const sleepScore = round(clamp(rawScore + bonus, 0, 100));

  return {
    currentDebt,
    sevenDayAverage,
    streakBelowTarget,
    debtTrend,
    sleepScore
  };
}

export function buildRecoveryPlan(
  currentDebt: number,
  baselineTarget = 8,
  maxExtraPerNight = 2
): RecoveryPlanData {
  if (currentDebt <= 0) {
    return {
      daysToRecover: 0,
      extraSleepPerNight: 0,
      plan: []
    };
  }

  const extraSleepPerNight = clamp(round(currentDebt / 5), 0.5, maxExtraPerNight);
  const daysToRecover = Math.ceil(currentDebt / extraSleepPerNight);

  let remainingDebt = currentDebt;
  const plan = Array.from({ length: daysToRecover }, (_, index) => {
    const day = index + 1;
    const recoveredTonight = Math.min(extraSleepPerNight, remainingDebt);
    remainingDebt = round(Math.max(0, remainingDebt - recoveredTonight));

    return {
      day,
      recommendedSleepHours: round(baselineTarget + recoveredTonight),
      expectedDebtAfterDay: remainingDebt,
      guidance:
        day <= 2
          ? "Protect your first 2 nights: no screens in the final hour and cap caffeine before noon."
          : "Maintain a consistent wake time and keep weekend oversleep under 90 minutes."
    };
  });

  return {
    daysToRecover,
    extraSleepPerNight,
    plan
  };
}

export function generateHealthWarnings(
  currentDebt: number,
  streakBelowTarget: number,
  sevenDayAverage: number
): HealthWarning[] {
  const warnings: HealthWarning[] = [];

  if (currentDebt >= 12) {
    warnings.push({
      level: "high",
      title: "High sleep debt",
      description:
        "Your current debt is in a range linked with slower reaction time, elevated stress hormones, and reduced glucose control.",
      recommendation:
        "Prioritize immediate recovery nights and reduce high-risk tasks that rely on sustained attention."
    });
  } else if (currentDebt >= 6) {
    warnings.push({
      level: "medium",
      title: "Moderate debt is accumulating",
      description:
        "Sustained debt at this level commonly reduces cognitive performance and mood stability during work shifts.",
      recommendation:
        "Add 60-90 minutes of sleep for the next several nights and standardize your wake time."
    });
  }

  if (streakBelowTarget >= 4) {
    warnings.push({
      level: "medium",
      title: "Consecutive short-sleep streak",
      description:
        "Multiple nights below target can compound decision fatigue even when each individual night seems manageable.",
      recommendation:
        "Break the streak tonight with a protected bedtime and a wind-down routine."
    });
  }

  if (sevenDayAverage < 6.5) {
    warnings.push({
      level: "high",
      title: "Low weekly average sleep",
      description:
        "A weekly average below 6.5 hours is associated with meaningful drops in alertness, immunity, and recovery capacity.",
      recommendation:
        "Treat sleep as a fixed appointment this week and avoid trading it for optional work."
    });
  }

  if (warnings.length === 0) {
    warnings.push({
      level: "low",
      title: "Low immediate risk",
      description:
        "Your recent sleep pattern is close to your target with no major warning signals today.",
      recommendation:
        "Keep your current routine stable to preserve gains and prevent debt rebound."
    });
  }

  return warnings;
}
