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
    // ✅ 브라우저에서는 무조건 같은 오리진으로 호출 (/api/..)
    // (Vercel https -> 브라우저가 http 백엔드로 직접 못 가게 차단)
    this.baseUrl = '';
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

  async getStudentsRaw(): Promise<Record<string, string>[]> {
    return this.request<Record<string, string>[]>(`/api/admin/students/raw`, {
      method: 'GET',
    });
  }

  async getStudentsRawBasic(): Promise<Record<string, string>[]> {
    try {
      return await this.request<Record<string, string>[]>(`/api/admin/students/raw/basic`, {
        method: 'GET',
      });
    } catch {
      return this.request<Record<string, string>[]>(`/api/admin/students/raw`, {
        method: 'GET',
      });
    }
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

// 택배 관련 API
export const parcelApi = {
  // 택배 목록 조회
  getParcels: (params?: { date?: string }) => {
    const query = buildQuery(params || {});
    const path = query ? `/api/admin/parcels?${query}` : `/api/admin/parcels`;
    return new ApiClient().request<any[]>(path, { method: 'GET' });
  },

  // 택배 저장 (upsert - 단일 parcel)
  // 백엔드는 ParcelUpsertRequest를 받으므로 단일 parcel을 전송
  saveParcel: (parcel: any) => {
    return new ApiClient().request<any>(`/api/admin/parcels`, {
      method: 'POST',
      body: JSON.stringify(parcel),
    });
  },

  // 택배 일괄 저장 (여러 개를 순차적으로 저장)
  saveParcels: async (parcels: any[]) => {
    const results = [];
    const errors: Array<{ parcel: any; error: string }> = [];

    for (const parcel of parcels) {
      try {
        const result = await new ApiClient().request<any>(`/api/admin/parcels`, {
          method: 'POST',
          body: JSON.stringify(parcel),
        });
        results.push(result);
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : '알 수 없는 오류';
        console.error('택배 저장 실패:', parcel, errorMsg);
        errors.push({ parcel, error: errorMsg });
        // 첫 번째 에러를 throw (나머지는 로그만)
        if (errors.length === 1) {
          throw new Error(
            `택배 저장 실패: ${parcel.studentId ? `학생 ID ${parcel.studentId}` : '알 수 없음'} - ${errorMsg}`
          );
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`${errors.length}개의 택배 저장에 실패했습니다.`);
    }

    return results;
  },

  // 택배 수정
  updateParcel: (id: string | number, data: any) => {
    return new ApiClient().request<any>(`/api/admin/parcels/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // 택배 삭제
  deleteParcel: (id: string | number) => {
    return new ApiClient().request<void>(`/api/admin/parcels/${id}`, {
      method: 'DELETE',
    });
  },
};

// 집중상담 관련 API
export const focusCounselingApi = {
  // 집중상담 전체 조회
  getFocusCounselings: (params?: { campus?: string; teamNo?: string; mentorName?: string }) => {
    const query = buildQuery(params || {});
    const path = query
      ? `/api/admin/students/focus-counselings?${query}`
      : `/api/admin/students/focus-counselings`;
    return new ApiClient().request<any[]>(path, { method: 'GET' });
  },

  // 학생별 집중상담 조회
  getByStudent: (studentId: string | number) => {
    return new ApiClient().request<any>(
      `/api/admin/students/${studentId}/focus-counseling`,
      { method: 'GET' }
    );
  },

  // 집중상담 생성/수정 (upsert)
  upsert: (studentId: string | number, memo: string) => {
    const path = `/api/admin/students/${studentId}/focus-counseling`;
    return new ApiClient().request<any>(path, {
      method: 'PUT',
      body: JSON.stringify({ memo }),
    });
  },

  // 집중상담 삭제
  deleteByStudent: (studentId: string | number) => {
    return new ApiClient().request<void>(
      `/api/admin/students/${studentId}/focus-counseling`,
      { method: 'DELETE' }
    );
  },
};

// 건강관리 관련 API
export const healthLogApi = {
  // 건강일지 전체 조회 (category 필수)
  getAll: (params: { category: 'GENERAL' | 'CONSTIPATION'; date?: string }) => {
    const query = buildQuery(params || {});
    const path = query ? `/api/admin/students/health-logs?${query}` : `/api/admin/students/health-logs`;
    return new ApiClient().request<any[]>(path, { method: 'GET' });
  },

  // 학생별 건강일지 조회 (category 필수)
  getByStudent: (
    studentId: string | number,
    params: { category: 'GENERAL' | 'CONSTIPATION'; date?: string }
  ) => {
    const query = buildQuery(params || {});
    const path = query
      ? `/api/admin/students/${studentId}/health-logs?${query}`
      : `/api/admin/students/${studentId}/health-logs`;
    return new ApiClient().request<any[]>(path, { method: 'GET' });
  },

  // 건강일지 등록
  create: (studentId: string | number, payload: any) => {
    return new ApiClient().request<any>(`/api/admin/students/${studentId}/health-logs`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 건강일지 삭제 (category 필수)
  deleteOne: (logId: string | number, category: 'GENERAL' | 'CONSTIPATION') => {
    const query = buildQuery({ category });
    return new ApiClient().request<void>(
      `/api/admin/students/health-logs/${logId}?${query}`,
      { method: 'DELETE' }
    );
  },
};

// 방 관리 관련 API
export const roomApi = {
  getRooms: (params?: { campus?: string; genderZone?: string; active?: boolean }) => {
    const query = buildQuery(params || {});
    const path = query ? `/api/admin/rooms?${query}` : `/api/admin/rooms`;
    return new ApiClient().request<any[]>(path, { method: 'GET' });
  },

  createRoom: (payload: any) => {
    return new ApiClient().request<any>(`/api/admin/rooms`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateRoom: (roomNo: string, payload: any) => {
    return new ApiClient().request<any>(`/api/admin/rooms/${roomNo}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};

export const roomAssignmentApi = {
  listAll: (params?: { active?: boolean }) => {
    const query = buildQuery(params || {});
    const path = query
      ? `/api/admin/students/room-assignments?${query}`
      : `/api/admin/students/room-assignments`;
    return new ApiClient().request<any[]>(path, { method: 'GET' });
  },

  upsert: (studentId: string | number, payload: any) => {
    return new ApiClient().request<any>(`/api/admin/students/${studentId}/room-assignment`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  getByStudent: (studentId: string | number) => {
    return new ApiClient().request<any>(`/api/admin/students/${studentId}/room-assignment`, {
      method: 'GET',
    });
  },

  deleteByStudent: (studentId: string | number) => {
    return new ApiClient().request<void>(`/api/admin/students/${studentId}/room-assignment`, {
      method: 'DELETE',
    });
  },

  listByRoom: (roomNo: string) => {
    return new ApiClient().request<any[]>(
      `/api/admin/students/rooms/${roomNo}/assignments`,
      { method: 'GET' }
    );
  },
};
