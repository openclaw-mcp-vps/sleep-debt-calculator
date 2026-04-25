import Link from "next/link";
import { cookies } from "next/headers";
import { Lock, ShieldCheck } from "lucide-react";
import { SleepLogger } from "@/components/SleepLogger";
import { UnlockAccess } from "@/components/UnlockAccess";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardPageProps {
  searchParams: Promise<{
    purchase?: string;
    session_id?: string;
    unlock?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
  const cookieStore = await cookies();
  const hasPaidAccess = cookieStore.get("sleep_pro_access")?.value === "active";

  if (!hasPaidAccess && params.purchase === "success" && params.session_id) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <UnlockAccess sessionId={params.session_id} />
      </main>
    );
  }

  if (!hasPaidAccess) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Lock className="h-5 w-5 text-[var(--accent)]" />
              Pro Dashboard Locked
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm text-[var(--text-muted)]">
            <p>
              Sleep logging, cumulative debt analytics, and recovery planning are available to paying
              subscribers. Use the Stripe checkout link to unlock this dashboard.
            </p>
            {params.unlock === "invalid" && (
              <p className="rounded-md border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.1)] px-3 py-2 text-[var(--danger)]">
                The checkout session ID was invalid. Complete checkout and return with a valid
                `session_id`.
              </p>
            )}
            {params.unlock === "awaiting_webhook" && (
              <p className="rounded-md border border-[rgba(251,191,36,0.35)] bg-[rgba(251,191,36,0.1)] px-3 py-2 text-[var(--warning)]">
                Your payment is likely complete, but we are still waiting for Stripe webhook
                confirmation. Refresh in 15-30 seconds.
              </p>
            )}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="font-medium text-[var(--text)]">Checkout return URL requirement</p>
              <p className="mt-2">
                Configure your Stripe Payment Link completion redirect to:
              </p>
              <code className="mt-2 block overflow-x-auto rounded-md bg-[#0b0f14] p-2 text-xs text-[var(--accent)]">
                /dashboard?purchase=success&session_id={"{CHECKOUT_SESSION_ID}"}
              </code>
            </div>
            <div className="flex flex-wrap gap-3">
              {paymentLink ? (
                <a href={paymentLink} target="_blank" rel="noreferrer">
                  <Button>
                    <ShieldCheck className="h-4 w-4" />
                    Buy Pro Access
                  </Button>
                </a>
              ) : (
                <Button disabled>Set NEXT_PUBLIC_STRIPE_PAYMENT_LINK first</Button>
              )}
              <Link href="/">
                <Button variant="secondary">Back to Landing Page</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Pro Dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold">Cumulative Sleep Debt Tracking</h1>
        </div>
        <Link href="/">
          <Button variant="secondary" size="sm">
            View Product Page
          </Button>
        </Link>
      </div>
      <SleepLogger plan="pro" />
    </main>
  );
}
