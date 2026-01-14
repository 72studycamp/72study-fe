import { NextResponse } from 'next/server';

const BASE_URL = process.env.API_BASE_URL!;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

function basicAuthHeader() {
  const token = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');
  return `Basic ${token}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const qs = url.searchParams.toString();
  const upstream = `${BASE_URL}/api/admin/students${qs ? `?${qs}` : ''}`;

  const res = await fetch(upstream, {
    method: 'GET',
    headers: {
      Authorization: basicAuthHeader(),
    },
    cache: 'no-store',
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function POST(req: Request) {
  const body = await req.text(); // 그대로 전달
  const upstream = `${BASE_URL}/api/admin/students`;

  const res = await fetch(upstream, {
    method: 'POST',
    headers: {
      Authorization: basicAuthHeader(),
      'Content-Type': 'application/json',
    },
    body,
  });

  // ✅ 201 Created + empty body 대비: json 파싱 금지
  return new NextResponse(null, { status: res.status });
}