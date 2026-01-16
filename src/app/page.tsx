// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import StudentTable from '@/components/StudentTable';
import DropoutList from '@/components/DropoutList';
import SameNameList from '@/components/SameNameList';
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

// 임시 더미 데이터
const mockDropouts: Dropout[] = [
  { id: '1', name: '김가영', grade: '중3', gender: '여', date: '7/23', reason: '부적응' },
  { id: '2', name: '김현성', grade: '고1', gender: '남', date: '7/25', reason: '수두' },
  { id: '3', name: '임지호', grade: '고2', gender: '남', date: '7/28', reason: '유학' },
];

const mockSameNames: SameNamePerson[] = [
  { id: '1', name: '김현서', location: '연무/쌍용' },
  { id: '2', name: '정수인', location: '옥야/소사' },
  { id: '3', name: '김시아', location: '송우/대전' },
];

// 통계 계산 함수
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

  const lectureHalls = ['1강의장', '2강의장', '5강의장', '6강의장'];
  const byLectureHall = lectureHalls.map((hall) => {
    const hallStudents = students.filter((s) => s.lectureHall === hall);
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

  const groups = Array.from({ length: 14 }, (_, i) => `${i + 1}조`);
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

  return {
    totalQuota: 253,
    totalAssigned,
    totalPresent,
    totalAbsent,
    difference: totalAssigned - 253,
    byLectureHall,
    byGroup,
    byGender,
  };
};

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [dropouts, setDropouts] = useState<Dropout[]>([]);
  const [sameNames, setSameNames] = useState<SameNamePerson[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStatsType | null>(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StudentFilters>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const fetchStudents = async (currentFilters: StudentFilters) => {
    try {
      setFetching(true);
      setError(null);

      const apiStudents = await studentApi.getStudents(currentFilters);
      const mapped = apiStudents.map(mapApiStudentToStudent);

      setStudents(mapped);
      setSummaryStats(calculateStats(mapped));
    } catch (e) {
      const msg = e instanceof Error ? e.message : '학생 목록을 불러오는데 실패했습니다.';
      setError(msg);
    } finally {
      setFetching(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    setDropouts(mockDropouts);
    setSameNames(mockSameNames);
  }, []);

  const handleStudentUpdate = (updatedStudent: Student) => {
    setStudents((prev) => {
      const updated = prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
      setSummaryStats(calculateStats(updated));
      return updated;
    });
  };

  const handleAddStudent = async (data: any) => {
    await studentApi.createStudent(data);
    await fetchStudents(filters);
  };

  const handleUpdateStudent = async (data: any) => {
    if (!editingStudent) return;
    await studentApi.updateStudent(editingStudent.id, data);
    setEditingStudent(null);
    await fetchStudents(filters);
  };

  const handleDeleteStudent = async (student: Student) => {
    if (!confirm(`${student.name} 학생을 삭제하시겠습니까?`)) return;

    try {
      await studentApi.deleteStudent(student.id);
      await fetchStudents(filters);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '삭제에 실패했습니다.';
      alert(msg);
    }
  };

  // ✅ 초기 1회만 전체 로딩 화면
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
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            기본DB
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            학생 데이터 관리 및 통계 대시보드
          </p>
        </header>

        {/* ✅ 학생 목록이 가장 위 */}
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
            students={students}
            filters={filters}
            onFiltersChange={setFilters}
            onAddClick={() => setIsAddModalOpen(true)}
            onEditClick={(s) => setEditingStudent(s)}
            onDeleteClick={handleDeleteStudent}
          />
        </div>

        {/* ✅ 통계는 아래로 + SummaryStats 내부에서 접기/펼치기 사용 */}
        {summaryStats && (
          <div className="mb-8">
            <SummaryStats
              stats={summaryStats}
              students={students}
              onStudentUpdate={handleStudentUpdate}
            />
          </div>
        )}

        {/* 퇴소자 / 동명이인 유지 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DropoutList dropouts={dropouts} />
          <SameNameList sameNames={sameNames} />
        </div>
      </div>

      <StudentFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddStudent}
      />

      <StudentFormModal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        student={editingStudent}
        onSubmit={handleUpdateStudent}
      />
    </div>
  );
}