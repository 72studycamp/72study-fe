// src/types/student.ts

export interface Absence {
  id: string;
  type: '외출' | '외박';
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  note?: string; // 비고
}

export interface Student {
  id: string;

  // 표시/검색용
  name: string; // UI에 보여줄 이름 (보통 studentName)
  fullName: string;

  // 기본 정보
  gender: '남' | '여';
  age: string; // 예: "2010년생" (지금은 birthDate 기반 계산/표시로 바뀔 수도 있음)
  course: '중등' | '고등';
  grade: string; // 예: "중3", "고2"
  school: string;
  mentor: string;

  // ✅ 백엔드 필터/도메인 키와 직접 맞추기 위한 필드
  campus?: string;
  status?: string;
  teamNo?: string | null; // ex) "1" (또는 백엔드가 내려주는 그대로)
  roomNo?: string | null; // ex) "404"

  // UI에서 기존에 쓰던 값들(호환 유지)
  roomGroup: string; // 예: "404호 1" 또는 "404호 01" 같은 표시용 문자열
  group?: string; // 예: "1조" (teamNo에서 파생된 표시용)

  // 기타
  email?: string;
  mockTestGrade?: string;
  applicationProcess: string; // 예: "강화31기"
  lectureHall?: string;

  adminMemo?: string | null;
  birthDate?: string | null;
  studentPhone?: string | null;
  dropoutDate?: string | null;

  absences?: Absence[]; // 외출/외박 기록
}

export interface Dropout {
  id: string;
  name: string;
  grade: string;
  gender: '남' | '여';
  date: string; // 예: "7/23"
  reason: string;
}

export interface SameNamePerson {
  id: string;
  name: string;
  location: string;
}

export interface CategoryStats {
  category: string;
  subCategory: string;
  quota: number;
  assigned: number;
  present: number;
  absent: number;
  difference: number;
}

export interface SummaryStats {
  totalQuota: number;
  totalAssigned: number;
  totalPresent: number;
  totalAbsent: number;
  totalDropped: number;
  difference: number;
  byLectureHall: CategoryStats[];
  byGroup: CategoryStats[];
  byGender: {
    gender: '남' | '여';
    byGrade: CategoryStats[];
  }[];
}

// -----------------------------
// 백엔드 API 응답 타입
// -----------------------------
export interface ApiStudent {
  id: string;

  campus?: string;
  status?: string;

  studentName: string;
  gender: '남' | '여';
  course: '중등' | '고등';
  grade: string;

  studentPhone?: string;
  mentorName?: string | null;

  roomNo?: string | null;
  teamNo?: string | null;
  lectureHall?: string | null;
  classRoom?: string | null;

  adminMemo?: string | null;
  birthDate?: string | null;
  dropoutDate?: string | null;
  absences?: Array<{
    id: string | number;
    type: '외출' | '외박' | 'OUTING' | 'OVERNIGHT';
    startDate: string;
    endDate: string;
    note?: string | null;
  }>;

  school?: string;
  email?: string;

  [key: string]: any;
}

// -----------------------------
// Student 필터 타입 (백엔드 @RequestParam과 동일 키)
// -----------------------------
export interface StudentFilters {
  campus?: string;
  status?: string;
  teamNo?: string;
  roomNo?: string;
  grade?: string;
  studentName?: string;
  gender?: string;
  course?: string;
}
