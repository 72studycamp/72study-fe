import { NextResponse } from 'next/server';

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

function resolveBaseUrls(): string[] {
  const ordered = [API_BASE_URL, API_BASE_URL_FALLBACK, LOCAL_FALLBACK_BASE_URL]
    .map((v) => String(v ?? '').trim())
    .filter((v) => v.length > 0);
  return [...new Set(ordered)];
}

async function requestRaw(url: string) {
  const auth = authHeader();
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (auth) headers.Authorization = auth;

  return fetch(url, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });
}

async function toResponse(res: Response) {
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

export async function GET() {
  const envError = requireEnv();
  if (envError) return envError;

  const baseUrls = resolveBaseUrls();
  let lastError: unknown = null;

  for (const baseUrl of baseUrls) {
    const targetBasic = `${baseUrl}/api/admin/students/raw/basic`;
    const targetRaw = `${baseUrl}/api/admin/students/raw`;

    try {
      const basicRes = await requestRaw(targetBasic);

      if (basicRes.ok) {
        return toResponse(basicRes);
      }

      if (basicRes.status !== 404 && basicRes.status < 500) {
        return toResponse(basicRes);
      }
    } catch (e) {
      lastError = e;
    }

    try {
      const rawRes = await requestRaw(targetRaw);
      return toResponse(rawRes);
    } catch (e) {
      lastError = e;
    }
  }

  const detail = lastError instanceof Error ? lastError.message : 'unknown';
  return NextResponse.json(
    {
      message: '학생 원본 데이터 조회에 실패했습니다. (/raw/basic, /raw 모두 실패)',
      attemptedBaseUrls: baseUrls,
      detail,
    },
    { status: 502 }
  );
}
