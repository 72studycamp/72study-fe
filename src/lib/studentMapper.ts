// src/lib/studentMapper.ts
import { ApiStudent, Student } from '@/types/student';

function normalizeTeamLabel(teamNo?: string | null): string | undefined {
  if (!teamNo) return undefined;
  const t = String(teamNo).trim();
  if (!t) return undefined;
  // 이미 "1조" 형태로 내려오면 그대로
  if (t.endsWith('조')) return t;
  // "1" 형태면 "1조"로 표시
  return `${t}조`;
}

function buildRoomGroup(roomNo?: string | null, teamNo?: string | null): string {
  const r = roomNo ? String(roomNo).trim() : '';
  const t = teamNo ? String(teamNo).trim() : '';
  if (r && t) return `${r}호 ${t}`;
  if (r) return `${r}호`;
  return '-';
}

export function mapApiStudentToStudent(api: ApiStudent): Student {
  const teamLabel = normalizeTeamLabel(api.teamNo);

  return {
    id: String(api.id),

    // ✅ 이름
    name: api.studentName ?? '',
    fullName: api.studentName ?? '',

    // ✅ 기본값(백엔드에 없으면 UI에서 '-'로 처리)
    gender: api.gender ?? '남',
    course: api.course ?? '중등',
    grade: api.grade ?? '',
    school: api.school ?? '',
    mentor: api.mentorName ?? '',

    // ✅ 백엔드 키 그대로 보존
    campus: api.campus,
    status: api.status,
    teamNo: api.teamNo ?? null,
    roomNo: api.roomNo ?? null,

    // ✅ 표시용 파생 값(기존 화면/통계 호환)
    group: teamLabel, // "1조" 형태
    roomGroup: buildRoomGroup(api.roomNo, api.teamNo),

    // 기타
    email: api.email,
    studentPhone: api.studentPhone ?? null,
    adminMemo: api.adminMemo ?? null,
    birthDate: api.birthDate ?? null,

    // 지금은 백엔드에 applicationProcess/age 같은 값이 없어서 고정/빈값 처리
    // (필요하면 나중에 birthDate로 age 표기 계산해도 됨)
    age: '-', // UI에서 '-'로 보여주기
    applicationProcess: api.campus ?? '', // 캠퍼스를 여기 박아두고 있었다면 유지. 아니면 ''로.
  };
}