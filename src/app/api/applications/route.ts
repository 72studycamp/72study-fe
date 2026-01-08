import { NextResponse } from "next/server";

export async function GET() {
  // 여기서는 env를 읽어도 되고(너 이미 설정했음),
  // 없으면 에러를 확실히 뱉게 해두자.
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    return NextResponse.json({ message: "API base missing" }, { status: 500 });
  }

  // EC2가 BasicAuth 걸려있으면 여기서 Authorization도 붙여야 함
  // 일단 먼저 연결만 보려면 아래 Authorization 주석은 그대로 두고 테스트
  const res = await fetch(`${base}/api/applications`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // "Authorization": `Basic ${Buffer.from("아이디:비번").toString("base64")}`,
    },
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}