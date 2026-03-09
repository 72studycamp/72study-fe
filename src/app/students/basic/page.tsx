'use client';

import { useEffect, useMemo, useState } from 'react';
import StudentRawDataTable from '@/components/StudentRawDataTable';
import StudentFormModal from '@/components/StudentFormModal';
import { studentApi } from '@/lib/api';
import { Student } from '@/types/student';
import { mapApiStudentToStudent } from '@/lib/studentMapper';

export default function BasicDbPage() {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [studentsAll, setStudentsAll] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const fetchRows = async () => {
    try {
      setLoading(true);
      setError(null);
      const [rawRows, apiStudents] = await Promise.all([
        studentApi.getStudentsRawBasic(),
        studentApi.getStudents({}),
      ]);
      setRows(rawRows);
      setStudentsAll(apiStudents.map(mapApiStudentToStudent));
    } catch (e) {
      const msg = e instanceof Error ? e.message : '원본 데이터를 불러오는데 실패했습니다.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const pickString = (row: Record<string, unknown>, keys: string[]) => {
    for (const key of keys) {
      const v = row[key];
      if (v === undefined || v === null) continue;
      const t = String(v).trim();
      if (t.length > 0) return t;
    }
    return '';
  };

  const toStudentFromRaw = (row: Record<string, unknown>): Student | null => {
    const id = pickString(row, ['id', 'ID', 'studentId', '학생ID']);
    if (!id) return null;

    const name = pickString(row, ['studentName', '학생명', 'name', '이름']);
    const genderRaw = pickString(row, ['gender', '성별']);
    const courseRaw = pickString(row, ['course', '과정']);

    const gender: '남' | '여' = genderRaw === '여' ? '여' : '남';
    const course: '중등' | '고등' = courseRaw.includes('고') ? '고등' : '중등';

    return {
      id,
      name,
      fullName: name,
      gender,
      age: '-',
      course,
      grade: pickString(row, ['grade', '학년']) || '-',
      school: pickString(row, ['school', '학교']) || '-',
      mentor: pickString(row, ['mentorName', '멘토명', '멘토']) || '',
      campus: pickString(row, ['campus', '캠퍼스']),
      status: pickString(row, ['status', '상태']) || 'ENROLLED',
      teamNo: pickString(row, ['teamNo', 'team', '조편성', '조']) || null,
      roomNo: pickString(row, ['roomNo', '방배정', '방']) || null,
      roomGroup: '-',
      group: pickString(row, ['group', '조']),
      email: pickString(row, ['email', '이메일']) || undefined,
      applicationProcess: pickString(row, ['applicationProcess', '기수/붙캠프']) || '',
      lectureHall: pickString(row, ['lectureHall', '강의장']) || undefined,
      adminMemo: pickString(row, ['adminMemo', '관리자메모']) || null,
      birthDate: pickString(row, ['birthDate', '생년월일']) || null,
      studentPhone: pickString(row, ['studentPhone', '연락처2(학생)', '연락처']) || null,
      dropoutDate: pickString(row, ['dropoutDate', '퇴소일']) || null,
      absences: [],
    };
  };

  const norm = (v?: string | null) => String(v ?? '').replace(/\s+/g, '').trim().toLowerCase();
  const digits = (v?: string | null) => String(v ?? '').replace(/\D/g, '');

  const studentsById = useMemo(() => {
    const map = new Map<string, Student>();
    studentsAll.forEach((s) => map.set(String(s.id), s));
    return map;
  }, [studentsAll]);

  const resolveStudentByRow = (row: Record<string, unknown>): Student | null => {
    const directId = pickString(row, ['id', 'ID', 'studentId', '학생ID']);
    if (directId && studentsById.has(directId)) return studentsById.get(directId) ?? null;

    const rowName = pickString(row, ['studentName', '학생명', 'name', '이름']);
    const rowPhone = digits(
      pickString(row, ['studentPhone', '연락처2(학생)', '학생연락처', '연락처'])
    );
    const rowGrade = pickString(row, ['grade', '학년']);
    const rowTeam = pickString(row, ['teamNo', 'team', '조', '조편성']);

    let candidates = studentsAll.filter((s) => norm(s.name) === norm(rowName));
    if (rowPhone) {
      const phoneMatched = candidates.filter((s) => digits(s.studentPhone) === rowPhone);
      if (phoneMatched.length > 0) candidates = phoneMatched;
    }
    if (rowGrade) {
      const gradeMatched = candidates.filter((s) => norm(s.grade) === norm(rowGrade));
      if (gradeMatched.length > 0) candidates = gradeMatched;
    }
    if (rowTeam) {
      const teamMatched = candidates.filter(
        (s) => norm(s.teamNo ?? s.group ?? '') === norm(rowTeam)
      );
      if (teamMatched.length > 0) candidates = teamMatched;
    }

    if (candidates.length === 1) return candidates[0];
    return null;
  };

  const handleRowClick = (row: Record<string, unknown>) => {
    const fallback = toStudentFromRaw(row);
    const matched = resolveStudentByRow(row);
    const student = matched ?? fallback;

    if (!student || !student.id) {
      alert('이 행은 학생 매칭이 안되어 수정할 수 없습니다. (이름/연락처 확인 필요)');
      return;
    }
    setEditingStudent(student);
  };

  const handleUpdateStudent = async (data: unknown) => {
    if (!editingStudent) return;
    await studentApi.updateStudent(editingStudent.id, data);
    setEditingStudent(null);
    await fetchRows();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6">
          <h1 className="mb-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">원본 DB</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            학생 원본 데이터 전체 컬럼
          </p>
        </header>

        {loading && (
          <div className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">원본 데이터를 불러오는 중...</div>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        <StudentRawDataTable
          rows={rows as Record<string, unknown>[]}
          onRowClick={handleRowClick}
        />
      </div>

      <StudentFormModal
        isOpen={!!editingStudent}
        mode="edit"
        student={editingStudent}
        onClose={() => setEditingStudent(null)}
        onSubmit={handleUpdateStudent}
      />
    </div>
  );
}
