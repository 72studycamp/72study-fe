import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.API_BASE_URL!;
const USER = process.env.ADMIN_USERNAME!;
const PASS = process.env.ADMIN_PASSWORD!;

function authHeader() {
  const token = Buffer.from(`${USER}:${PASS}`).toString('base64');
  return { Authorization: `Basic ${token}` };
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const res = await fetch(`${BACKEND}/api/admin/students/${params.id}`, {
    method: 'DELETE',
    headers: {
      ...authHeader(),
    },
  });

  // 204 No Content 대비
  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { message: text || `HTTP ${res.status}` },
      { status: res.status }
    );
  }

  return new NextResponse(null, { status: 204 });
}