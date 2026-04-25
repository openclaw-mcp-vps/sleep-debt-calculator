import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { type SleepEntry } from "@/types/sleep";

interface PaidSession {
  sessionId: string;
  createdAt: string;
  email?: string;
}

interface SleepStore {
  users: Record<string, SleepEntry[]>;
  paidSessions: Record<string, PaidSession>;
}

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIRECTORY, "sleep-store.json");

const EMPTY_STORE: SleepStore = {
  users: {},
  paidSessions: {}
};

async function ensureStore() {
  await mkdir(DATA_DIRECTORY, { recursive: true });
  try {
    await readFile(STORE_PATH, "utf-8");
  } catch {
    await writeFile(STORE_PATH, JSON.stringify(EMPTY_STORE, null, 2), "utf-8");
  }
}

async function readStore(): Promise<SleepStore> {
  await ensureStore();
  const raw = await readFile(STORE_PATH, "utf-8");
  try {
    const parsed = JSON.parse(raw) as SleepStore;
    return {
      users: parsed.users ?? {},
      paidSessions: parsed.paidSessions ?? {}
    };
  } catch {
    return EMPTY_STORE;
  }
}

async function writeStore(store: SleepStore) {
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function getSleepEntries(userId: string): Promise<SleepEntry[]> {
  const store = await readStore();
  return store.users[userId] ?? [];
}

export async function upsertSleepEntry(
  userId: string,
  entry: SleepEntry
): Promise<SleepEntry[]> {
  const store = await readStore();
  const current = store.users[userId] ?? [];

  const withoutExisting = current.filter((item) => item.id !== entry.id);
  const next = [...withoutExisting, entry].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  store.users[userId] = next;
  await writeStore(store);
  return next;
}

export async function deleteSleepEntry(
  userId: string,
  entryId: string
): Promise<SleepEntry[]> {
  const store = await readStore();
  const next = (store.users[userId] ?? []).filter((item) => item.id !== entryId);
  store.users[userId] = next;
  await writeStore(store);
  return next;
}

export async function recordPaidSession(sessionId: string, email?: string) {
  const store = await readStore();
  store.paidSessions[sessionId] = {
    sessionId,
    email,
    createdAt: new Date().toISOString()
  };
  await writeStore(store);
}

export async function isPaidSessionRecorded(sessionId: string) {
  const store = await readStore();
  return Boolean(store.paidSessions[sessionId]);
}
