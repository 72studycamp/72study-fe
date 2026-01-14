import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.API_BASE_URL!;
const USER = process.env.ADMIN_USERNAME!;
const PASS = process.env.ADMIN_PASSWORD!;

function authHeader() {
  const token = Buffer.from(`${USER}:${PASS}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

type Ctx = { params: Promise<{ id: string }> };

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text; // JSON 아닌 경우 raw text
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  const body = await req.json();

  const res = await fetch(`${BACKEND}/api/admin/students/${id}`, {
    method: "PATCH",
    headers: {
      ...authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const payload = await safeJson(res);
    return NextResponse.json(
      { message: payload ?? `HTTP ${res.status}` },
      { status: res.status }
    );
  }

  // 백엔드가 204일 수도, json일 수도 있으니 안전 처리
  if (res.status === 204) return new NextResponse(null, { status: 204 });

  const payload = await safeJson(res);
  return NextResponse.json(payload ?? {}, { status: res.status });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  const res = await fetch(`${BACKEND}/api/admin/students/${id}`, {
    method: "DELETE",
    headers: {
      ...authHeader(),
    },
  });

  if (!res.ok) {
    const payload = await safeJson(res);
    return NextResponse.json(
      { message: payload ?? `HTTP ${res.status}` },
      { status: res.status }
    );
  }

  // Spring 쪽에서 204 No Content가 흔함 → json() 절대 호출 금지
  return new NextResponse(null, { status: 204 });
}