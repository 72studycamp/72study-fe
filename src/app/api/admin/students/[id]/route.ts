import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getRequiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} 환경변수가 설정되지 않았습니다.`);
  return v;
}

function buildBasicAuthHeader() {
  const username = getRequiredEnv("ADMIN_USERNAME");
  const password = getRequiredEnv("ADMIN_PASSWORD");
  const token = Buffer.from(`${username}:${password}`).toString("base64");
  return `Basic ${token}`;
}

function buildTargetUrl(req: Request, id: string) {
  const base = getRequiredEnv("API_BASE_URL").replace(/\/$/, "");
  const url = new URL(req.url);
  return `${base}/api/admin/students/${encodeURIComponent(id)}${url.search}`;
}

async function proxy(req: Request, id: string) {
  const targetUrl = buildTargetUrl(req, id);

  const contentType = req.headers.get("content-type") ?? undefined;
  const hasBody = !["GET", "HEAD"].includes(req.method);

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: {
      ...(contentType ? { "Content-Type": contentType } : {}),
      Authorization: buildBasicAuthHeader(),
    },
    body: hasBody ? await req.text() : undefined,
    cache: "no-store",
  });

  const bodyText = await upstream.text();
  const res = new NextResponse(bodyText, { status: upstream.status });

  const upstreamContentType =
    upstream.headers.get("content-type") ?? "application/json; charset=utf-8";
  res.headers.set("content-type", upstreamContentType);

  return res;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await proxy(req, id);
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "프록시 오류" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await proxy(req, id);
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "프록시 오류" },
      { status: 500 }
    );
  }
}


