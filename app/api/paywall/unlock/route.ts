import { type NextRequest, NextResponse } from "next/server";
import { isPaidSessionRecorded } from "@/lib/db";

const SESSION_ID_PATTERN = /^cs_(test|live)_[a-zA-Z0-9_]+$/;

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id")?.trim();
  if (!sessionId || !SESSION_ID_PATTERN.test(sessionId)) {
    return NextResponse.redirect(new URL("/dashboard?unlock=invalid", request.url));
  }

  const strictCheck = process.env.ENFORCE_WEBHOOK_UNLOCK === "true";
  if (strictCheck) {
    const isRecorded = await isPaidSessionRecorded(sessionId);
    if (!isRecorded) {
      return NextResponse.redirect(
        new URL("/dashboard?unlock=awaiting_webhook", request.url)
      );
    }
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set({
    name: "sleep_pro_access",
    value: "active",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}
