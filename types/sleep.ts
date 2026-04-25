export interface SleepEntry {
  id: string;
  date: string;
  hoursSlept: number;
  targetHours: number;
  notes?: string;
  createdAt: string;
}

export interface DebtPoint {
  date: string;
  sleepHours: number;
  targetHours: number;
  dailyDebt: number;
  cumulativeDebt: number;
}

export interface RecoveryStep {
  day: number;
  recommendedSleepHours: number;
  expectedDebtAfterDay: number;
  guidance: string;
}

export interface RecoveryPlanData {
  daysToRecover: number;
  extraSleepPerNight: number;
  plan: RecoveryStep[];
}

export interface HealthWarning {
  level: "low" | "medium" | "high";
  title: string;
  description: string;
  recommendation: string;
}

export interface SleepInsights {
  currentDebt: number;
  sevenDayAverage: number;
  streakBelowTarget: number;
  debtTrend: "improving" | "worsening" | "stable";
  sleepScore: number;
}
