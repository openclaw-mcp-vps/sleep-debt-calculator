import Link from "next/link";
import { ArrowRight, BriefcaseMedical, Clock3, MoonStar, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const problemPoints = [
  {
    title: "Debt is invisible until performance drops",
    description:
      "Most professionals notice sleep loss only after errors, slow decisions, or emotional burnout begin showing up at work."
  },
  {
    title: "Shift changes erase healthy routines",
    description:
      "Rotating schedules and overnight work make it hard to detect whether recovery is actually happening week to week."
  },
  {
    title: "Generic trackers miss cumulative load",
    description:
      "Raw sleep-hours apps rarely translate logs into actionable debt, risk levels, and a concrete recovery timeline."
  }
];

const solutionPoints = [
  {
    icon: MoonStar,
    title: "Debt Engine",
    description:
      "Transforms nightly logs into a running cumulative debt score so you can see whether you are recovering or sliding backward."
  },
  {
    icon: Clock3,
    title: "Recovery Plan",
    description:
      "Builds a practical multi-night catch-up schedule with realistic extra-hours targets, not vague sleep advice."
  },
  {
    icon: ShieldAlert,
    title: "Health Warnings",
    description:
      "Flags sustained debt zones linked to reduced cognition, stress load, and reaction-time risk."
  },
  {
    icon: BriefcaseMedical,
    title: "Built For Work Reality",
    description:
      "Designed for health-conscious professionals and shift workers balancing unpredictable demand with recovery goals."
  }
];

const faqs = [
  {
    question: "How is sleep debt calculated?",
    answer:
      "Each night compares your actual sleep against your target. Deficits add to cumulative debt and surplus sleep reduces it."
  },
  {
    question: "Is this only for night-shift workers?",
    answer:
      "No. The app is useful for anyone with fluctuating workloads, frequent travel, early starts, or late project pushes."
  },
  {
    question: "What happens after checkout?",
    answer:
      "Stripe redirects you back to your dashboard with a checkout session ID. The app sets a secure access cookie and unlocks pro features."
  },
  {
    question: "Can I use it on mobile during commutes?",
    answer:
      "Yes. Logging and charts are designed for quick mobile updates so your debt trend stays current throughout the week."
  }
];

export default function HomePage() {
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="text-sm font-semibold tracking-[0.18em] text-[var(--accent)]">
            SLEEP DEBT CALCULATOR
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="secondary" size="sm">
                Open Dashboard
              </Button>
            </Link>
            {paymentLink && (
              <a href={paymentLink} target="_blank" rel="noreferrer">
                <Button size="sm">Start Pro</Button>
              </a>
            )}
          </div>
        </header>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">Track what fatigue hides</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Calculate and track your cumulative sleep debt
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-[var(--text-muted)]">
              Log nightly sleep in seconds, quantify accumulated debt, and follow a recovery
              strategy that protects your focus, health, and day-shift performance.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button size="lg">
                  View Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {paymentLink ? (
                <a href={paymentLink} target="_blank" rel="noreferrer">
                  <Button variant="secondary" size="lg">
                    Buy Pro Access
                  </Button>
                </a>
              ) : (
                <Button variant="secondary" size="lg" disabled>
                  Set NEXT_PUBLIC_STRIPE_PAYMENT_LINK
                </Button>
              )}
            </div>
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              Built for health-conscious professionals and shift workers.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Why teams and solo professionals pay for this</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--text-muted)]">
              <p>
                Most people misjudge chronic fatigue because they track nights, not cumulative debt.
                This dashboard translates daily logs into a concrete risk signal and nightly recovery plan.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                  <p className="text-xs uppercase tracking-wide">Price</p>
                  <p className="mt-1 text-xl font-semibold text-[var(--text)]">$8/mo</p>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                  <p className="text-xs uppercase tracking-wide">Niche</p>
                  <p className="mt-1 text-xl font-semibold text-[var(--text)]">Health Tracking</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">The Problem</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {problemPoints.map((point) => (
            <Card key={point.title}>
              <CardHeader>
                <CardTitle className="text-base">{point.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--text-muted)]">{point.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">The Solution</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {solutionPoints.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-5 w-5 text-[var(--accent)]" />
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--text-muted)]">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-4xl font-semibold">$8<span className="text-lg text-[var(--text-muted)]">/month</span></p>
              <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
                Includes the full dashboard, persistent pro data storage, debt trends, recovery plans,
                and health impact warnings.
              </p>
            </div>
            {paymentLink ? (
              <a href={paymentLink} target="_blank" rel="noreferrer">
                <Button size="lg">Buy With Stripe</Button>
              </a>
            ) : (
              <Button size="lg" disabled>
                Add Stripe Payment Link
              </Button>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <div className="mt-6 space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.question}>
              <CardHeader>
                <CardTitle className="text-base">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--text-muted)]">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
