export interface Absence {
  id: string;
  type: '외출' | '외박';
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  note?: string; // 비고
}

export interface Student {
  id: string;
  name: string;
  fullName: string;
  gender: '남' | '여';
  age: string; // 예: "2010년생"
  course: '중등' | '고등';
  grade: string; // 예: "중3", "고2"
  school: string;
  mentor: string;
  roomGroup: string; // 예: "501호 01"
  email?: string;
  mockTestGrade?: string;
  applicationProcess: string; // 예: "강화31기"
  lectureHall?: string; // 강의장: "1강의장", "2강의장", "5강의장", "6강의장"
  group?: string; // 조: "1조", "2조", ... "14조"
  absences?: Absence[]; // 외출/외박 기록
}

export interface Dropout {
  id: string;
  name: string;
  grade: string;
  gender: '남' | '여';
  date: string; // 예: "7/23"
  reason: string; // 예: "부적응", "수두", "유학" 등
}

export interface SameNamePerson {
  id: string;
  name: string;
  location: string; // 예: "연무/쌍용"
}

export interface CategoryStats {
  category: string;
  subCategory: string;
  quota: number;
  assigned: number;
  present: number; // 현재 출석 인원 (외출/외박 제외)
  absent: number; // 외출/외박 인원
  difference: number;
}

export interface SummaryStats {
  totalQuota: number;
  totalAssigned: number;
  totalPresent: number; // 현재 출석 인원
  totalAbsent: number; // 외출/외박 인원
  difference: number;
  byLectureHall: CategoryStats[]; // 강의장별
  byGroup: CategoryStats[]; // 조별
  byGender: {
    gender: '남' | '여';
    byGrade: CategoryStats[];
  }[]; // 성별별
}

