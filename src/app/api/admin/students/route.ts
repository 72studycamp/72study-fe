import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.API_BASE_URL!;
const USER = process.env.ADMIN_USERNAME!;
const PASS = process.env.ADMIN_PASSWORD!;

function authHeader() {
  const token = Buffer.from(`${USER}:${PASS}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const qs = url.searchParams.toString();

  const res = await fetch(`${BACKEND}/api/admin/students${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: { ...authHeader() }, // GET도 서버프록시면 붙여도 됨(안 붙여도 되면 빼도 OK)
  });

  if (!res.ok) {
    const payload = await safeJson(res);
    return NextResponse.json(
      { message: payload ?? `HTTP ${res.status}` },
      { status: res.status }
    );
  }

  const payload = await safeJson(res);
  return NextResponse.json(payload ?? [], { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${BACKEND}/api/admin/students`, {
    method: "POST",
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

  if (res.status === 204) return new NextResponse(null, { status: 204 });

  const payload = await safeJson(res);
  return NextResponse.json(payload ?? {}, { status: res.status });
}