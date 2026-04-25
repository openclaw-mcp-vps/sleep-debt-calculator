"use client";

import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";

interface UnlockAccessProps {
  sessionId: string;
}

export function UnlockAccess({ sessionId }: UnlockAccessProps) {
  useEffect(() => {
    const params = new URLSearchParams({ session_id: sessionId });
    window.location.assign(`/api/paywall/unlock?${params.toString()}`);
  }, [sessionId]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <LoaderCircle className="h-8 w-8 animate-spin text-[var(--accent)]" />
      <p className="max-w-md text-sm text-[var(--text-muted)]">
        Verifying your completed checkout session and unlocking your pro dashboard.
      </p>
    </div>
  );
}
