import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.API_BASE_URL!;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

function basicAuthHeader() {
  const token = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');
  return `Basic ${token}`;
}

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params; // ✅ Next 16 타입 대응
  const body = await req.text();

  const upstream = `${BASE_URL}/api/admin/students/${id}`;

  const res = await fetch(upstream, {
    method: 'PATCH',
    headers: {
      Authorization: basicAuthHeader(),
      'Content-Type': 'application/json',
    },
    body,
  });

  // ✅ 204/빈 바디 대비: 파싱 금지
  return new NextResponse(null, { status: res.status });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  const upstream = `${BASE_URL}/api/admin/students/${id}`;

  const res = await fetch(upstream, {
    method: 'DELETE',
    headers: {
      Authorization: basicAuthHeader(),
    },
  });

  return new NextResponse(null, { status: res.status });
}