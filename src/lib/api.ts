// API 호출 유틸리티
// 클라이언트에서는 반드시 same-origin(/api/...)만 호출한다.

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('알 수 없는 오류가 발생했습니다.');
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | null | undefined>): Promise<T> {
    const queryString = params
      ? '?' +
        Object.entries(params)
          .filter(([_, value]) => value !== null && value !== undefined && value !== 'all' && value !== '')
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value!)}`)
          .join('&')
      : '';
    
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();

// 학생 관련 API
export const studentApi = {
  // 학생 전체 조회
  getStudents: (params?: {
    campus?: string;
    status?: string;
    teamNo?: string;
    roomNo?: string;
    grade?: string;
    studentName?: string;
    gender?: string;
    course?: string;
  }) => apiClient.get<any[]>('/api/admin/students', params),

  // 학생 추가
  createStudent: (data: {
    campus: string;
    studentName: string;
    gender: string;
    course: string;
    grade: string;
    studentPhone?: string | null;
    mentorName?: string | null;
    roomNo?: string | null;
    teamNo?: string | null;
    birthDate?: string | null;
  }) => apiClient.post<any>('/api/admin/students', data),

  // 학생 정보 수정
  updateStudent: (id: string, data: {
    status?: string;
    mentorName?: string | null;
    roomNo?: string | null;
    teamNo?: string | null;
    adminMemo?: string | null;
  }) => apiClient.patch<any>(`/api/admin/students/${id}`, data),

  // 학생 삭제
  deleteStudent: (id: string) => apiClient.delete<any>(`/api/admin/students/${id}`),
};
