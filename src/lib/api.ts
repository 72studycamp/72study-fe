import { ApiStudent, StudentFilters } from '@/types/student';

const DEFAULT_BASE_URL = 'http://localhost:3001';

function buildQuery(params: Record<string, any>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    q.set(k, String(v));
  });
  return q.toString();
}

async function safeReadJson<T>(res: Response): Promise<T | null> {
  // 204/205 는 바디가 없음
  if (res.status === 204 || res.status === 205) return null;

  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  // 바디가 비어있으면 null
  if (!text || text.trim().length === 0) return null;

  // JSON 아닌 경우도 있을 수 있으니 방어
  if (!contentType.includes('application/json')) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function readErrorMessage(res: Response): Promise<string> {
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text().catch(() => '');

  if (contentType.includes('application/json') && text) {
    try {
      const obj = JSON.parse(text);
      if (obj?.message) return String(obj.message);
      if (obj?.error) return String(obj.error);
      if (obj?.path && obj?.status) return `HTTP ${obj.status} (${obj.path})`;
    } catch {
      // ignore
    }
  }

  if (text && text.trim().length > 0) return text.slice(0, 300);
  return `HTTP ${res.status} ${res.statusText}`;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const msg = await readErrorMessage(response);
      throw new Error(msg);
    }

    const data = await safeReadJson<T>(response);
    return data as unknown as T;
  }

  async getStudents(filters: StudentFilters = {}): Promise<ApiStudent[]> {
    const query = buildQuery(filters as any);
    const path = query ? `/api/admin/students?${query}` : `/api/admin/students`;
    return this.request<ApiStudent[]>(path, { method: 'GET' });
  }

  async createStudent(data: any): Promise<any> {
    return this.request<any>(`/api/admin/students`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStudent(id: string | number, data: any): Promise<any> {
    return this.request<any>(`/api/admin/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteStudent(id: string | number): Promise<void> {
    await this.request<void>(`/api/admin/students/${id}`, {
      method: 'DELETE',
    });
  }
}

export const studentApi = new ApiClient();