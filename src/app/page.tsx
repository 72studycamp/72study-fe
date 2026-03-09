// src/app/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import StudentTable from '@/components/StudentTable';
import DropoutList from '@/components/DropoutList';
import SameNameList from '@/components/SameNameList';
import SummaryStatsHeader from '@/components/SummaryStatsHeader';
import SummaryStats from '@/components/SummaryStats';
import StudentFormModal from '@/components/StudentFormModal';

import {
  Student,
  Dropout,
  SameNamePerson,
  SummaryStats as SummaryStatsType,
  StudentFilters,
} from '@/types/student';
import { studentApi } from '@/lib/api';
import { mapApiStudentToStudent } from '@/lib/studentMapper';

const LECTURE_HALLS = ['1강의장', '2강의장', '5강의장', '6강의장'] as const;

function isDroppedStatus(status?: string | null) {
  const s = String(status ?? '').trim();
  return s === 'DROPPED' || s === '퇴소';
}

// ✅ "1" / "1조" / " 1조 " 같은 입력을 항상 "1조"로 통일
function normalizeTeamLabel(teamNo?: string | null): string | undefined {
  if (!teamNo) return undefined;
  const t = String(teamNo).trim();
  if (!t) return undefined;
  if (t.endsWith('조')) return t;
  return `${t}조`;
}

function resolveLectureHall(student: Student): {
  hall: string | null;
  source: 'teamNo' | 'none';
  reason?: string;
} {
  // 강의장 통계는 조 기준 고정 매핑만 사용:
  // 1~5조 -> 1강의장, 6~10조 -> 2강의장, 12~13조 -> 5강의장, 14~15조 -> 6강의장
  const teamRaw = String(student.teamNo ?? student.group ?? '').trim();
  const teamMatch = teamRaw.match(/(\d+)/);
  if (teamMatch) {
    const teamNo = Number(teamMatch[1]);
    if (teamNo >= 1 && teamNo <= 5) return { hall: '1강의장', source: 'teamNo' };
    if (teamNo >= 6 && teamNo <= 10) return { hall: '2강의장', source: 'teamNo' };
    if (teamNo >= 12 && teamNo <= 13) return { hall: '5강의장', source: 'teamNo' };
    if (teamNo >= 14 && teamNo <= 15) return { hall: '6강의장', source: 'teamNo' };
    return { hall: null, source: 'none', reason: `teamNo-unmapped:${teamNo}` };
  }

  return {
    hall: null,
    source: 'none',
    reason: !teamRaw ? 'missing-team' : 'unclassified-team',
  };
}

// 통계 계산 함수 (전체 학생 기준으로만 돌릴 것)
const calculateStats = (students: Student[]): SummaryStatsType => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getAbsentCount = (studentList: Student[]) =>
    studentList.filter((student) => {
      return (
        student.absences?.some((absence) => {
          const startDate = new Date(absence.startDate);
          const endDate = new Date(absence.endDate);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          return today >= startDate && today <= endDate;
        }) || false
      );
    }).length;

  const hallResolved = students.map((student) => ({
    student,
    resolved: resolveLectureHall(student),
  }));

  const hallSourceCounts = hallResolved.reduce<Record<string, number>>((acc, item) => {
    acc[item.resolved.source] = (acc[item.resolved.source] ?? 0) + 1;
    return acc;
  }, {});
  const unclassifiedReasons = hallResolved
    .filter((item) => !item.resolved.hall)
    .reduce<Record<string, number>>((acc, item) => {
      const key = item.resolved.reason ?? 'unknown';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

  const byLectureHall = [...LECTURE_HALLS].map((hall) => {
    const hallStudents = hallResolved
      .filter((item) => item.resolved.hall === hall)
      .map((item) => item.student);
    const assigned = hallStudents.length;
    const absent = getAbsentCount(hallStudents);
    const present = assigned - absent;
    return {
      category: hall,
      subCategory: hall,
      quota: 20,
      assigned,
      present,
      absent,
      difference: assigned - 20,
    };
  });

  if (typeof window !== 'undefined') {
    console.info('[Stats:LectureHall]', {
      totalStudents: students.length,
      classifiedCount: hallResolved.filter((item) => !!item.resolved.hall).length,
      filteredOutCount: hallResolved.filter((item) => !item.resolved.hall).length,
      sourceCounts: hallSourceCounts,
      filteredOutReasons: unclassifiedReasons,
    });
  }

  const groups = Array.from({ length: 15 }, (_, i) => `${i + 1}조`);
  const byGroup = groups.map((group) => {
    const groupStudents = students.filter((s) => s.group === group);
    const assigned = groupStudents.length;
    const absent = getAbsentCount(groupStudents);
    const present = assigned - absent;
    return {
      category: group,
      subCategory: group,
      quota: 15,
      assigned,
      present,
      absent,
      difference: assigned - 15,
    };
  });

  const grades = ['중3', '고1', '고2', '고3'];
  const byGender: SummaryStatsType['byGender'] = [
    {
      gender: '남',
      byGrade: grades.map((grade) => {
        const list = students.filter((s) => s.gender === '남' && s.grade === grade);
        const assigned = list.length;
        const absent = getAbsentCount(list);
        const present = assigned - absent;
        return {
          category: '남',
          subCategory: grade,
          quota: 20,
          assigned,
          present,
          absent,
          difference: assigned - 20,
        };
      }),
    },
    {
      gender: '여',
      byGrade: grades.map((grade) => {
        const list = students.filter((s) => s.gender === '여' && s.grade === grade);
        const assigned = list.length;
        const absent = getAbsentCount(list);
        const present = assigned - absent;
        return {
          category: '여',
          subCategory: grade,
          quota: 20,
          assigned,
          present,
          absent,
          difference: assigned - 20,
        };
      }),
    },
  ];

  const totalAssigned = students.length;
  const totalAbsent = getAbsentCount(students);
  const totalPresent = totalAssigned - totalAbsent;
  const totalDropped = students.filter((student) => isDroppedStatus(student.status)).length;

  return {
    totalQuota: 253,
    totalAssigned,
    totalPresent,
    totalAbsent,
    totalDropped,
    difference: totalAssigned - 253,
    byLectureHall,
    byGroup,
    byGender,
  };
};

// 로컬 필터 적용 (API 호출 X)
const applyLocalFilters = (students: Student[], filters: StudentFilters): Student[] => {
  let list = [...students];

  // 이름 검색
  const rawName =
    (filters as any).studentName ??
    (filters as any).name ??
    (filters as any).keyword ??
    '';
  const name = String(rawName).trim();
  if (name) {
    const q = name.toLowerCase();
    list = list.filter((s) => (s.name ?? '').toLowerCase().includes(q));
  }

  // 과정
  const course = (filters as any).course ?? (filters as any).program;
  if (course && course !== '전체') {
    list = list.filter((s) => s.course === course);
  }

  // 학년
  const grade = (filters as any).grade;
  if (grade && grade !== '전체') {
    list = list.filter((s) => s.grade === grade);
  }

  // 성별
  const gender = (filters as any).gender;
  if (gender && gender !== '전체') {
    list = list.filter((s) => s.gender === gender);
  }

  // ✅ 조: teamNo를 항상 "n조"로 정규화해서 비교
  const teamNoRaw = (filters as any).teamNo;
  const teamLabel = normalizeTeamLabel(teamNoRaw);
  if (teamLabel) {
    list = list.filter((s) => {
      const sGroup = normalizeTeamLabel(s.group);      // 이미 "1조"일 가능성 높음
      const sTeamNo = normalizeTeamLabel(s.teamNo);    // "1"일 수도 있어서 정규화
      return sGroup === teamLabel || sTeamNo === teamLabel;
    });
  }

  return list;
};

const toYyMmDd = (input?: string | null) => {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}/${mm}/${dd}`;
};

const buildDropoutsFromStudents = (students: Student[]): Dropout[] => {
  const today = new Date();
  const yy = String(today.getFullYear()).slice(2);
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayLabel = `${yy}/${mm}/${dd}`;

  return students
    .filter((s) => isDroppedStatus(s.status))
    .map((s) => ({
      id: s.id,
      name: s.name || '-',
      grade: s.grade || '-',
      gender: s.gender || '남',
      date: toYyMmDd(s.dropoutDate) || todayLabel,
      reason: s.adminMemo?.trim() || '퇴소',
    }));
};

const buildSameNamesFromStudents = (students: Student[]): SameNamePerson[] => {
  return students
    .filter((s) => {
      const name = String(s.name ?? '').trim();
      if (!(name.includes('(') && name.includes(')'))) return false;
      const parenContents = [...name.matchAll(/\(([^)]*)\)/g)].map((m) => String(m[1] ?? ''));
      return !parenContents.some((v) => v.includes('퇴소'));
    })
    .map((s) => ({
      id: s.id,
      name: s.name || '-',
      location:
        [
          s.campus ?? s.applicationProcess ?? '',
          s.group ?? normalizeTeamLabel(s.teamNo) ?? '',
          s.lectureHall ?? '',
        ]
          .filter((v) => String(v).trim().length > 0)
          .join(' / ') || '-',
    }));
};

export default function Home() {
  const [studentsAll, setStudentsAll] = useState<Student[]>([]);
  const [studentsView, setStudentsView] = useState<Student[]>([]);

  const [dropouts, setDropouts] = useState<Dropout[]>([]);
  const [sameNames, setSameNames] = useState<SameNamePerson[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStatsType | null>(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<StudentFilters>({});
  const filtersRef = useRef<StudentFilters>({});
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // ✅ 너가 원하는 방식: 1조~14조 "항상 고정"
  const teamOptions = Array.from({ length: 14 }, (_, i) => `${i + 1}조`);

  // ✅ 전체 학생 목록은 "초기 1회" 또는 CRUD 이후에만 갱신
  const fetchAllStudents = async () => {
    try {
      setFetching(true);
      setError(null);

      const apiStudents = await studentApi.getStudents({});
      const mapped = apiStudents.map(mapApiStudentToStudent);
      setStudentsAll(mapped);
      setSummaryStats(calculateStats(mapped));

      const nextView = applyLocalFilters(mapped, filtersRef.current);
      setStudentsView(nextView);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '학생 목록을 불러오는데 실패했습니다.';
      setError(msg);
    } finally {
      setFetching(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDropouts(buildDropoutsFromStudents(studentsAll));
    setSameNames(buildSameNamesFromStudents(studentsAll));
  }, [studentsAll]);

  // ✅ filters가 바뀌면 API 호출 없이 studentsView만 변경
  useEffect(() => {
    setStudentsView(applyLocalFilters(studentsAll, filters));
  }, [filters, studentsAll]);

  const handleStudentUpdate = (updatedStudent: Student) => {
    setStudentsAll((prev) => {
      const updatedAll = prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
      setSummaryStats(calculateStats(updatedAll));
      return updatedAll;
    });

    setStudentsView(() => {
      const updatedAll = studentsAll.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
      return applyLocalFilters(updatedAll, filtersRef.current);
    });
  };

  const handleAddStudent = async (data: any) => {
    await studentApi.createStudent(data);
    await fetchAllStudents();
  };

  const handleUpdateStudent = async (data: any) => {
    if (!editingStudent) return;
    await studentApi.updateStudent(editingStudent.id, data);
    setEditingStudent(null);
    await fetchAllStudents();
  };

  const handleDeleteStudent = async (student: Student) => {
    if (!confirm(`${student.name} 학생을 삭제하시겠습니까?`)) return;

    try {
      await studentApi.deleteStudent(student.id);
      await fetchAllStudents();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '삭제에 실패했습니다.';
      alert(msg);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            기본 DB
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            학생 데이터 관리 및 통계 대시보드
          </p>
        </header>

        {summaryStats && <SummaryStatsHeader stats={summaryStats} />}

        <div className="mb-4">
          {fetching && (
            <div className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
              목록 갱신 중...
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <StudentTable
            students={studentsView}
            teamOptions={teamOptions}
            filters={filters}
            onFiltersChange={setFilters}
            onAddClick={() => setIsAddModalOpen(true)}
            onEditClick={(s) => setEditingStudent(s)}
            onDeleteClick={handleDeleteStudent}
          />
        </div>

        {summaryStats && (
          <SummaryStats
            stats={summaryStats}
            students={studentsAll}
            onStudentUpdate={handleStudentUpdate}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DropoutList
            dropouts={dropouts}
            onRowClick={(dropout) => {
              const target = studentsAll.find((s) => s.id === dropout.id);
              if (target) setEditingStudent(target);
            }}
          />
          <SameNameList sameNames={sameNames} />
        </div>
      </div>

      <StudentFormModal
        isOpen={isAddModalOpen}
        mode="create"
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddStudent}
      />

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
