// src/lib/studentMapper.ts
import { ApiStudent, Student } from '@/types/student';

function normalizeTeamLabel(teamNo?: string | null): string | undefined {
  if (!teamNo) return undefined;
  const t = String(teamNo).trim();
  if (!t) return undefined;

  // 이미 "1조" 형태면 그대로
  if (t.endsWith('조')) return t;

  // "1" 형태면 "1조"로 통일
  return `${t}조`;
}

function buildRoomGroup(roomNo?: string | null, teamNo?: string | null): string {
  const r = roomNo ? String(roomNo).trim() : '';
  const tLabel = normalizeTeamLabel(teamNo) ?? '';

  if (!r && !tLabel) return '-';
  if (r && tLabel) return `${r}호 ${tLabel}`;
  if (r) return `${r}호`;
  return tLabel || '-';
}

function normalizeAbsenceType(type?: string): '외출' | '외박' {
  if (type === 'OVERNIGHT' || type === '외박') return '외박';
  return '외출';
}

function normalizeLectureHallLabel(v?: string | null): string | undefined {
  const t = String(v ?? '').trim();
  if (!t) return undefined;
  const match = t.match(/([1256])/);
  if (!match) return undefined;
  return `${match[1]}강의장`;
}

export function mapApiStudentToStudent(api: ApiStudent): Student {
  // ✅ teamNo 자체도 "1조"로 통일해서 저장 (필터/정렬/통계 깨짐 방지)
  const teamLabel = normalizeTeamLabel(api.teamNo);

  const apiAny = api as any;
  const dropoutDateRaw = api.dropoutDate ?? apiAny?.droppedAt ?? apiAny?.dropoutAt ?? null;
  const lectureHallRaw =
    api.lectureHall ??
    apiAny?.classRoom ??
    apiAny?.classroom ??
    apiAny?.hall ??
    apiAny?.lecture_hall ??
    null;
  const lectureHall = normalizeLectureHallLabel(lectureHallRaw);

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

    // ✅ 백엔드 키 그대로 보존 (roomNo는 숫자 들어와도 문자열로 다루기 쉬워서 그대로 둠)
    campus: api.campus,
    status: api.status,

    // ✅ 여기 중요: teamNo를 정규화한 값으로 저장해야 필터가 동작함
    teamNo: teamLabel ?? null, // ✅ 변경됨 (기존: api.teamNo ?? null)
    roomNo: api.roomNo ?? null,

    // ✅ 표시용 파생 값
    group: teamLabel, // "1조"
    roomGroup: buildRoomGroup(api.roomNo, api.teamNo),

    // 기타
    email: api.email,
    studentPhone: api.studentPhone ?? null,
    adminMemo: api.adminMemo ?? null,
    birthDate: api.birthDate ?? null,
    dropoutDate: dropoutDateRaw ? String(dropoutDateRaw).slice(0, 10) : null,
    absences: (api.absences ?? []).map((absence) => ({
      id: String(absence.id),
      type: normalizeAbsenceType(absence.type),
      startDate: String(absence.startDate).slice(0, 10),
      endDate: String(absence.endDate).slice(0, 10),
      note: absence.note ?? undefined,
    })),

    // 지금은 백엔드에 age 같은 값이 없어서 고정/빈값 처리
    age: '-',
    applicationProcess: api.campus ?? '',
    lectureHall,
  };
}
