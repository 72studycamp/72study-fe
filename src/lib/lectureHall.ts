import { Student } from '@/types/student';

export function parseTeamNo(teamLike?: string | null): number | null {
  const raw = String(teamLike ?? '').trim();
  if (!raw) return null;
  const match = raw.match(/(\d+)/);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

export function lectureHallFromTeamNo(teamNo: number | null): string | null {
  if (teamNo === null) return null;
  if (teamNo >= 1 && teamNo <= 5) return '1강의장';
  if (teamNo >= 6 && teamNo <= 10) return '2강의장';
  if (teamNo >= 12 && teamNo <= 13) return '5강의장';
  if (teamNo >= 14 && teamNo <= 15) return '6강의장';
  return null;
}

export function lectureHallFromStudent(student: Student): string | null {
  const teamNo = parseTeamNo(student.teamNo ?? student.group ?? null);
  return lectureHallFromTeamNo(teamNo);
}

export function isStudentInLectureHall(student: Student, hall: string): boolean {
  return lectureHallFromStudent(student) === hall;
}
