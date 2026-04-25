import { createHmac, timingSafeEqual } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { recordPaidSession } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/lemonsqueezy";

interface StripeEventPayload {
  type?: string;
  data?: {
    object?: {
      id?: string;
      customer_details?: {
        email?: string;
      };
    };
  };
}

interface LemonPayload {
  meta?: {
    event_name?: string;
  };
  data?: {
    id?: string;
    attributes?: {
      user_email?: string;
    };
  };
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const lemonSignature = request.headers.get("x-signature");
  const stripeSignature = request.headers.get("stripe-signature");

  if (lemonSignature && process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    const isValid = verifyWebhookSignature(
      rawBody,
      lemonSignature,
      process.env.LEMONSQUEEZY_WEBHOOK_SECRET
    );
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Lemon Squeezy signature." },
        { status: 401 }
      );
    }
  }

  if (stripeSignature && process.env.STRIPE_WEBHOOK_SECRET) {
    const parts = Object.fromEntries(
      stripeSignature.split(",").map((item) => {
        const [key, value] = item.split("=");
        return [key?.trim() ?? "", value?.trim() ?? ""];
      })
    );

    const timestamp = parts.t;
    const signatureV1 = parts.v1;
    if (!timestamp || !signatureV1) {
      return NextResponse.json(
        { error: "Malformed Stripe signature header." },
        { status: 401 }
      );
    }

    const expected = createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected);
    const providedBuffer = Buffer.from(signatureV1);

    const isValid =
      expectedBuffer.length === providedBuffer.length &&
      timingSafeEqual(expectedBuffer, providedBuffer);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Stripe signature." },
        { status: 401 }
      );
    }
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const stripePayload = payload as StripeEventPayload;
  if (stripePayload.type === "checkout.session.completed") {
    const sessionId = stripePayload.data?.object?.id;
    const email = stripePayload.data?.object?.customer_details?.email;
    if (sessionId) {
      await recordPaidSession(sessionId, email);
    }
  }

  const lemonPayload = payload as LemonPayload;
  if (lemonPayload.meta?.event_name === "order_created") {
    const sessionId = lemonPayload.data?.id;
    const email = lemonPayload.data?.attributes?.user_email;
    if (sessionId) {
      await recordPaidSession(sessionId, email);
    }
  }

  return NextResponse.json({ received: true });
}
