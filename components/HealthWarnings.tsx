import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type HealthWarning } from "@/types/sleep";

interface HealthWarningsProps {
  warnings: HealthWarning[];
}

function warningIcon(level: HealthWarning["level"]) {
  if (level === "high") return <ShieldAlert className="h-4 w-4" />;
  if (level === "medium") return <AlertTriangle className="h-4 w-4" />;
  return <ShieldCheck className="h-4 w-4" />;
}

function badgeVariant(level: HealthWarning["level"]) {
  if (level === "high") return "danger" as const;
  if (level === "medium") return "warning" as const;
  return "success" as const;
}

export function HealthWarnings({ warnings }: HealthWarningsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Impact Warnings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {warnings.map((warning) => (
          <div
            key={`${warning.level}-${warning.title}`}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={badgeVariant(warning.level)} className="capitalize">
                <span className="mr-1">{warningIcon(warning.level)}</span>
                {warning.level} risk
              </Badge>
              <p className="font-medium">{warning.title}</p>
            </div>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{warning.description}</p>
            <p className="mt-2 text-sm text-[var(--text)]">{warning.recommendation}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
