// src/app/api/admin/students/health-logs/[logId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.API_BASE_URL;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

type Context = {
  params: Promise<{ logId: string }>;
};

function authHeader() {
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) return '';
  const token = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString(
    'base64'
  );
  return `Basic ${token}`;
}

function requireEnv() {
  if (!API_BASE_URL) {
    return NextResponse.json(
      { message: 'API_BASE_URL is not set' },
      { status: 500 }
    );
  }
  return null;
}

async function proxy(req: NextRequest, url: string) {
  const auth = authHeader();
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (auth) headers.Authorization = auth;

  const res = await fetch(url, {
    method: req.method,
    headers,
    cache: 'no-store',
  });

  const contentType = res.headers.get('content-type') || '';

  if (res.status === 204 || res.status === 205) {
    return new NextResponse(null, { status: res.status });
  }

  const text = await res.text();

  if (contentType.includes('application/json')) {
    return new NextResponse(text || 'null', {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new NextResponse(text, { status: res.status });
}

export async function DELETE(req: NextRequest, context: Context) {
  const envError = requireEnv();
  if (envError) return envError;

  const { logId } = await context.params;
  const url = new URL(req.url);
  const query = url.search ? url.search : '';
  const target = `${API_BASE_URL}/api/admin/students/health-logs/${logId}${query}`;

  return proxy(req, target);
}
