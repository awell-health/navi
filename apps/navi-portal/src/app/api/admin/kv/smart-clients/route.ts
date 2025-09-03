import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { requireAdmin } from "@/domains/admin/auth";

const KEY_PREFIX = "smart:client:";

async function scanKeys(prefix: string): Promise<string[]> {
  let cursor = "0";
  const keys: string[] = [];
  do {
    // kv.scan returns [cursor, keys]
    const result = (await kv.scan(cursor, {
      match: `${prefix}*`,
      count: 200,
    })) as [string, string[]];
    cursor = result[0];
    const batch = result[1] ?? [];
    if (batch.length > 0) keys.push(...batch);
  } while (cursor !== "0");
  return keys;
}

export async function GET() {
  await requireAdmin();
  const keys = await scanKeys(KEY_PREFIX);
  if (keys.length === 0) return NextResponse.json({ clients: [] });
  const values = (await kv.mget(...keys)) as unknown[];
  const clients = keys.map((key, index) => ({
    id: key.replace(KEY_PREFIX, ""),
    key,
    value: values[index] ?? null,
  }));
  return NextResponse.json({ clients });
}

export async function PUT(request: Request) {
  await requireAdmin();
  const body = (await request.json()) as { id?: string; value?: unknown };
  if (!body?.id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const key = `${KEY_PREFIX}${body.id}`;
  await kv.set(key, body.value ?? null);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const key = `${KEY_PREFIX}${id}`;
  await kv.del(key);
  return NextResponse.json({ ok: true });
}
