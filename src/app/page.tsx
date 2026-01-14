'use client';

import { useState, useEffect } from 'react';
import SummaryStats from '@/components/SummaryStats';
import StudentTable from '@/components/StudentTable';
import DropoutList from '@/components/DropoutList';
import SameNameList from '@/components/SameNameList';
import {
  Student,
  Dropout,
  SameNamePerson,
  SummaryStats as SummaryStatsType,
  StudentFilters,
} from '@/types/student';
import { studentApi } from '@/lib/api';
import { mapApiStudentToStudent } from '@/lib/studentMapper';
import StudentFormModal from '@/components/StudentFormModal';

// 임시 더미 데이터 (나중에 API로 교체)
const mockStudents: Student[] = [
  {
    id: '1',
    name: '김현서(연무)',
    fullName: '김현서',
    gender: '여',
    age: '2010년생',
    course: '중등',
    grade: '중3',
    school: '연무중학교',
    mentor: '곽민재',
    roomGroup: '501호 01',
    email: 'kim@example.com',
    applicationProcess: '강화31기',
    lectureHall: '1강의장',
    group: '1조',
  },
  {
    id: '2',
    name: '정예진',
    fullName: '정예진',
    gender: '여',
    age: '2010년생',
    course: '중등',
    grade: '중3',
    school: '월촌중학교',
    mentor: '곽민재',
    roomGroup: '502호 01',
    email: 'jung@example.com',
    applicationProcess: '강화31기',
    lectureHall: '1강의장',
    group: '2조',
  },
  {
    id: '3',
    name: '손소현',
    fullName: '손소현',
    gender: '여',
    age: '2010년생',
    course: '중등',
    grade: '중3',
    school: '서산여자중학교',
    mentor: '곽민재',
    roomGroup: '503호 01',
    email: 'son@example.com',
    applicationProcess: '강화31기',
    lectureHall: '2강의장',
    group: '3조',
  },
  {
    id: '4',
    name: '김시아(대전)',
    fullName: '김시아',
    gender: '여',
    age: '2008년생',
    course: '고등',
    grade: '고2',
    school: '대전둔산여자고등학교',
    mentor: '윤수연',
    roomGroup: '605호 01',
    email: 'kim2@example.com',
    applicationProcess: '강화31기',
    lectureHall: '5강의장',
    group: '5조',
  },
  {
    id: '5',
    name: '신다정',
    fullName: '신다정',
    gender: '여',
    age: '2008년생',
    course: '고등',
    grade: '고2',
    school: '누원고등학교',
    mentor: '윤수연',
    roomGroup: '606호 01',
    email: 'shin@example.com',
    applicationProcess: '강화31기',
    lectureHall: '6강의장',
    group: '6조',
  },
];

const mockDropouts: Dropout[] = [
  {
    id: '1',
    name: '김가영',
    grade: '중3',
    gender: '여',
    date: '7/23',
    reason: '부적응',
  },
  {
    id: '2',
    name: '김현성',
    grade: '고1',
    gender: '남',
    date: '7/25',
    reason: '수두',
  },
  {
    id: '3',
    name: '임지호',
    grade: '고2',
    gender: '남',
    date: '7/28',
    reason: '유학',
  },
];

const mockSameNames: SameNamePerson[] = [
  {
    id: '1',
    name: '김현서',
    location: '연무/쌍용',
  },
  {
    id: '2',
    name: '정수인',
    location: '옥야/소사',
  },
  {
    id: '3',
    name: '김시아',
    location: '송우/대전',
  },
];

// 통계 계산 함수
const calculateStats = (students: Student[]): SummaryStatsType => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 현재 외출/외박 중인 학생 수 계산
  const getAbsentCount = (studentList: Student[]) => {
    return studentList.filter((student) => {
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
  };

  // 강의장별 통계
  const lectureHalls = ['1강의장', '2강의장', '5강의장', '6강의장'];
  const byLectureHall = lectureHalls.map((hall) => {
    const hallStudents = students.filter((s) => s.lectureHall === hall);
    const assigned = hallStudents.length;
    const absent = getAbsentCount(hallStudents);
    const present = assigned - absent;
    return {
      category: hall,
      subCategory: hall,
      quota: 20, // 임시 값
      assigned,
      present,
      absent,
      difference: assigned - 20,
    };
  });

  // 조별 통계
  const groups = Array.from({ length: 14 }, (_, i) => `${i + 1}조`);
  const byGroup = groups.map((group) => {
    const groupStudents = students.filter((s) => s.group === group);
    const assigned = groupStudents.length;
    const absent = getAbsentCount(groupStudents);
    const present = assigned - absent;
    return {
      category: group,
      subCategory: group,
      quota: 15, // 임시 값
      assigned,
      present,
      absent,
      difference: assigned - 15,
    };
  });

  // 성별별 통계
  const grades = ['중3', '고1', '고2', '고3'];
  const byGender: SummaryStatsType['byGender'] = [
    {
      gender: '남',
      byGrade: grades.map((grade) => {
        const gradeStudents = students.filter(
          (s) => s.gender === '남' && s.grade === grade
        );
        const assigned = gradeStudents.length;
        const absent = getAbsentCount(gradeStudents);
        const present = assigned - absent;
        return {
          category: '남',
          subCategory: grade,
          quota: 20, // 임시 값
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
        const gradeStudents = students.filter(
          (s) => s.gender === '여' && s.grade === grade
        );
        const assigned = gradeStudents.length;
        const absent = getAbsentCount(gradeStudents);
        const present = assigned - absent;
        return {
          category: '여',
          subCategory: grade,
          quota: 20, // 임시 값
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
  const [summaryStats, setSummaryStats] = useState<SummaryStatsType | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StudentFilters>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // 학생 목록 조회
  const fetchStudents = async (currentFilters: StudentFilters) => {
    try {
      setLoading(true);
      setError(null);
      const apiStudents = await studentApi.getStudents(currentFilters);
      const mappedStudents = apiStudents.map(mapApiStudentToStudent);
      setStudents(mappedStudents);
      setSummaryStats(calculateStats(mappedStudents));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '학생 목록을 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('학생 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 필터 변경 시 재조회
  useEffect(() => {
    fetchStudents(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // 초기 데이터 로드 (퇴소자, 동명이인은 임시로 유지)
  useEffect(() => {
    setDropouts(mockDropouts);
    setSameNames(mockSameNames);
  }, []);

  const handleStudentUpdate = (updatedStudent: Student) => {
    setStudents((prev) => {
      const updated = prev.map((s) =>
        s.id === updatedStudent.id ? updatedStudent : s
      );
      // 통계 재계산
      setSummaryStats(calculateStats(updated));
      return updated;
    });
  };

  // 학생 추가
  const handleAddStudent = async (data: any) => {
    await studentApi.createStudent(data);
    await fetchStudents(filters); // 목록 새로고침
  };

  // 학생 수정
  const handleUpdateStudent = async (data: any) => {
    if (!editingStudent) return;
    await studentApi.updateStudent(editingStudent.id, data);
    setEditingStudent(null);
    await fetchStudents(filters); // 목록 새로고침
  };

  // 학생 삭제
  const handleDeleteStudent = async (student: Student) => {
    if (!confirm(`${student.name} 학생을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await studentApi.deleteStudent(student.id);
      await fetchStudents(filters); // 목록 새로고침
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '삭제에 실패했습니다.';
      alert(errorMessage);
    }
  };

  if (loading) {
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
        {/* 헤더 */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            기본DB
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            학생 데이터 관리 및 통계 대시보드
          </p>
        </header>

        {/* 통계 요약 */}
        {summaryStats && (
          <SummaryStats
            stats={summaryStats}
            students={students}
            onStudentUpdate={handleStudentUpdate}
          />
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* 학생 목록 */}
        <div className="mb-8">
          <StudentTable
            students={students}
            filters={filters}
            onFiltersChange={setFilters}
            onAddClick={() => setIsAddModalOpen(true)}
            onEditClick={(student) => setEditingStudent(student)}
            onDeleteClick={handleDeleteStudent}
          />
        </div>

        {/* 하단 섹션: 퇴소자 및 동명이인 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DropoutList dropouts={dropouts} />
          <SameNameList sameNames={sameNames} />
        </div>
      </div>

      {/* 학생 추가 모달 */}
      <StudentFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddStudent}
      />

      {/* 학생 수정 모달 */}
      <StudentFormModal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        student={editingStudent}
        onSubmit={handleUpdateStudent}
      />
    </div>
  );
}
