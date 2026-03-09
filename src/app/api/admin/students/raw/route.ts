import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.API_BASE_URL;
const API_BASE_URL_FALLBACK = process.env.API_BASE_URL_FALLBACK;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const LOCAL_FALLBACK_BASE_URL = 'http://localhost:8080';

function authHeader() {
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) return '';
  const token = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');
  return `Basic ${token}`;
}

function requireEnv() {
  const hasAnyBaseUrl =
    String(API_BASE_URL ?? '').trim().length > 0 ||
    String(API_BASE_URL_FALLBACK ?? '').trim().length > 0;
  if (!hasAnyBaseUrl) {
    return NextResponse.json(
      { message: 'API_BASE_URL(API_BASE_URL_FALLBACK 포함) is not set' },
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
  const text = await res.text();

  if (contentType.includes('application/json')) {
    return new NextResponse(text || 'null', {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new NextResponse(text, { status: res.status });
}

function resolveBaseUrls(): string[] {
  const ordered = [API_BASE_URL, API_BASE_URL_FALLBACK, LOCAL_FALLBACK_BASE_URL]
    .map((v) => String(v ?? '').trim())
    .filter((v) => v.length > 0);
  return [...new Set(ordered)];
}

async function proxyWithFallback(req: NextRequest, path: string) {
  const baseUrls = resolveBaseUrls();
  if (baseUrls.length === 0) {
    return NextResponse.json(
      { message: 'API_BASE_URL is not set' },
      { status: 500 }
    );
  }

  let lastError: unknown = null;

  for (const baseUrl of baseUrls) {
    try {
      return await proxy(req, `${baseUrl}${path}`);
    } catch (e) {
      lastError = e;
    }
  }

  const detail = lastError instanceof Error ? lastError.message : 'unknown';
  return NextResponse.json(
    {
      message: '학생 원본데이터 API 프록시 연결 실패',
      attemptedBaseUrls: baseUrls,
      detail,
    },
    { status: 502 }
  );
}

export async function GET(req: NextRequest) {
  const envError = requireEnv();
  if (envError) return envError;

  return proxyWithFallback(req, '/api/admin/students/raw');
}
