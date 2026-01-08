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
} from '@/types/student';

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

  useEffect(() => {
    // TODO: 실제 API 호출로 교체
    // 예: fetch('/api/students').then(res => res.json()).then(data => setStudents(data))
    setTimeout(() => {
      setStudents(mockStudents);
      setDropouts(mockDropouts);
      setSameNames(mockSameNames);
      setSummaryStats(calculateStats(mockStudents));
      setLoading(false);
    }, 500);
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

        {/* 간단한 통계 카드 (상단) */}
        {summaryStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                정원
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {summaryStats.totalQuota}
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                편성
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {summaryStats.totalAssigned}
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                현재 출석
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {summaryStats.totalPresent}
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                외출/외박
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {summaryStats.totalAbsent}
              </div>
            </div>
          </div>
        )}

        {/* 학생 목록 (메인) */}
        <div className="mb-8">
          <StudentTable students={students} />
        </div>

        {/* 카테고리별 통계 (부가적, 작게) */}
        {summaryStats && (
          <div className="mb-8">
            <SummaryStats
              stats={summaryStats}
              students={students}
              onStudentUpdate={handleStudentUpdate}
              compact={true}
            />
          </div>
        )}

        {/* 하단 섹션: 퇴소자 및 동명이인 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DropoutList dropouts={dropouts} />
          <SameNameList sameNames={sameNames} />
        </div>
      </div>
    </div>
  );
}
