import { NextResponse } from 'next/server';

const BASE_URL = process.env.API_BASE_URL!;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

function basicAuthHeader() {
  const token = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');
  return `Basic ${token}`;
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const body = await req.text();
  const upstream = `${BASE_URL}/api/admin/students/${ctx.params.id}`;

  const res = await fetch(upstream, {
    method: 'PATCH',
    headers: {
      Authorization: basicAuthHeader(),
      'Content-Type': 'application/json',
    },
    body,
  });

  // ✅ 204 No Content 대비
  return new NextResponse(null, { status: res.status });
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const upstream = `${BASE_URL}/api/admin/students/${ctx.params.id}`;

  const res = await fetch(upstream, {
    method: 'DELETE',
    headers: {
      Authorization: basicAuthHeader(),
    },
  });

  return new NextResponse(null, { status: res.status });
}