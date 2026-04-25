import { type NextRequest, NextResponse } from "next/server";
import {
  deleteSleepEntry,
  getSleepEntries,
  upsertSleepEntry
} from "@/lib/db";
import { type SleepEntry } from "@/types/sleep";

function hasPaidAccess(request: NextRequest) {
  return request.cookies.get("sleep_pro_access")?.value === "active";
}

function getUserId(request: NextRequest) {
  return request.cookies.get("sleep_uid")?.value ?? "guest";
}

export async function GET(request: NextRequest) {
  if (!hasPaidAccess(request)) {
    return NextResponse.json(
      { error: "Pro access required." },
      { status: 401 }
    );
  }

  const userId = getUserId(request);
  const entries = await getSleepEntries(userId);
  return NextResponse.json({ entries });
}

export async function POST(request: NextRequest) {
  if (!hasPaidAccess(request)) {
    return NextResponse.json(
      { error: "Pro access required." },
      { status: 401 }
    );
  }

  const body = (await request.json()) as Partial<SleepEntry>;
  if (!body.date || typeof body.hoursSlept !== "number") {
    return NextResponse.json(
      { error: "Invalid sleep entry payload." },
      { status: 400 }
    );
  }

  const entry: SleepEntry = {
    id: body.id ?? crypto.randomUUID(),
    date: body.date,
    hoursSlept: Number(body.hoursSlept),
    targetHours: Number(body.targetHours ?? 8),
    notes: body.notes?.slice(0, 280) ?? "",
    createdAt: body.createdAt ?? new Date().toISOString()
  };

  const userId = getUserId(request);
  const entries = await upsertSleepEntry(userId, entry);
  return NextResponse.json({ entries });
}

export async function DELETE(request: NextRequest) {
  if (!hasPaidAccess(request)) {
    return NextResponse.json(
      { error: "Pro access required." },
      { status: 401 }
    );
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing entry id." }, { status: 400 });
  }

  const userId = getUserId(request);
  const entries = await deleteSleepEntry(userId, id);
  return NextResponse.json({ entries });
}
