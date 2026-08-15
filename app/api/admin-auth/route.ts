import { NextRequest, NextResponse } from "next/server";
import { ADMIN_PASSWORD } from "@/lib/config";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const password = body?.password;
  if (password === ADMIN_PASSWORD) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
