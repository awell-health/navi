import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { requireAdmin } from "@/domains/admin/auth";

const SESSION_PREFIX = "session:";

export async function GET() {
  await requireAdmin();
  let cursor = "0";
  let count = 0;
  do {
    const result = (await kv.scan(cursor, {
      match: `${SESSION_PREFIX}*`,
      count: 1000,
    })) as [string, string[]];
    cursor = result[0];
    const keys = result[1] ?? [];
    count += keys.length;
  } while (cursor !== "0");
  return NextResponse.json({ count });
}
