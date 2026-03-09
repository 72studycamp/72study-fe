// src/app/api/admin/parcels/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.API_BASE_URL;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

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
  try {
    const auth = authHeader();
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (auth) headers.Authorization = auth;

    // POST/PATCH 바디 전달
    const isBodyMethod = req.method !== 'GET' && req.method !== 'HEAD';
    const body = isBodyMethod ? await req.text() : undefined;

    // 디버깅: 요청 정보 로깅
    if (isBodyMethod && body) {
      console.log('[프록시] 요청 URL:', url);
      console.log('[프록시] 요청 Body:', body);
      console.log('[프록시] Authorization:', auth ? '있음' : '없음');
    }

    const res = await fetch(url, {
      method: req.method,
      headers: {
        ...headers,
        ...(isBodyMethod ? { 'Content-Type': 'application/json' } : {}),
      },
      body,
      cache: 'no-store',
    });

    const contentType = res.headers.get('content-type') || '';

    // 204 처리는 그대로 반환
    if (res.status === 204 || res.status === 205) {
      return new NextResponse(null, { status: res.status });
    }

    // JSON이면 text로 받아 그대로 전달(빈 바디 방어)
    const text = await res.text();

    // 에러 응답인 경우 로깅 및 에러 메시지 파싱
    if (!res.ok) {
      console.error('[프록시] 백엔드 에러 응답:', {
        status: res.status,
        statusText: res.statusText,
        body: text,
        url,
      });

      // 백엔드 에러 메시지를 파싱해서 전달
      if (contentType.includes('application/json') && text) {
        try {
          const errorObj = JSON.parse(text);
          // 백엔드 에러 응답 형식: {timestamp, status, error, path, message?}
          const errorMessage =
            errorObj.message ||
            errorObj.error ||
            `백엔드 서버 오류 (${res.status})`;
          return NextResponse.json(
            {
              message: errorMessage,
              status: res.status,
              path: errorObj.path,
              timestamp: errorObj.timestamp,
            },
            { status: res.status }
          );
        } catch {
          // JSON 파싱 실패 시 원본 텍스트 반환
        }
      }
    }

    if (contentType.includes('application/json')) {
      return new NextResponse(text || 'null', {
        status: res.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new NextResponse(text, { status: res.status });
  } catch (error) {
    // 프록시 자체 에러 (네트워크 에러 등)
    console.error('[프록시] 프록시 에러:', error);
    const errorMessage = error instanceof Error ? error.message : '프록시 요청 실패';
    return NextResponse.json(
      { message: errorMessage, error: 'PROXY_ERROR' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const envError = requireEnv();
    if (envError) return envError;

    const url = new URL(req.url);
    const query = url.search ? url.search : '';
    // ✅ 백엔드는 /api/parcels (admin 없음)
    const target = `${API_BASE_URL}/api/parcels${query}`;

    return await proxy(req, target);
  } catch (error) {
    console.error('GET /api/admin/parcels 에러:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : '서버 오류' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const envError = requireEnv();
    if (envError) return envError;

    // ✅ 백엔드는 /api/parcels (admin 없음)
    const target = `${API_BASE_URL}/api/parcels`;
    return await proxy(req, target);
  } catch (error) {
    console.error('POST /api/admin/parcels 에러:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : '서버 오류' },
      { status: 500 }
    );
  }
}

