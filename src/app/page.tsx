'use client';

import { useEffect, useState } from 'react';
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

/**
 * 통계 계산 함수
 */
const calculateStats = (students: Student[]): SummaryStatsType => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getAbsentCount = (list: Student[]) =>
    list.filter(
      (s) =>
        s.absences?.some((a) => {
          const start = new Date(a.startDate);
          const end = new Date(a.endDate);
          start.setHours(0, 0, 0, 0);
          end.setHours(0, 0, 0, 0);
          return today >= start && today <= end;
        }) ?? false
    ).length;

  const totalAssigned = students.length;
  const totalAbsent = getAbsentCount(students);
  const totalPresent = totalAssigned - totalAbsent;

  return {
    totalQuota: 253,
    totalAssigned,
    totalPresent,
    totalAbsent,
    difference: totalAssigned - 253,
    byLectureHall: [],
    byGroup: [],
    byGender: [],
  };
};

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [dropouts, setDropouts] = useState<Dropout[]>([]);
  const [sameNames, setSameNames] = useState<SameNamePerson[]>([]);
  const [summaryStats, setSummaryStats] =
    useState<SummaryStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!API_BASE) {
      console.error('NEXT_PUBLIC_API_BASE_URL is not set');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/applications`);
        if (!res.ok) throw new Error(`API error ${res.status}`);

        const apps = await res.json();

        const mapped: Student[] = apps.map((a: any) => ({
          id: String(a.id),
          name: a.studentName,
          fullName: a.studentName,
          gender: a.gender,
          age: a.birthDate ? `${String(a.birthDate).slice(0, 4)}년생` : '',
          course: a.course,
          grade: a.grade,
          school: a.school ?? '',
          mentor: a.mentor ?? '',
          roomGroup: a.roomGroup ?? '',
          email: a.email ?? '',
          applicationProcess: a.campus ?? '',
          lectureHall: a.lectureHall ?? '',
          group: a.group ?? '',
          absences: a.absences ?? [],
        }));

        setStudents(mapped);
        setSummaryStats(calculateStats(mapped));
      } catch (e) {
        console.error('[API ERROR]', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">기본DB</h1>
        <p className="text-zinc-500">학생 데이터 관리 및 통계 대시보드</p>
      </header>

      {summaryStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div>정원 {summaryStats.totalQuota}</div>
          <div>편성 {summaryStats.totalAssigned}</div>
          <div>출석 {summaryStats.totalPresent}</div>
          <div>외출 {summaryStats.totalAbsent}</div>
        </div>
      )}

      <StudentTable students={students} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <DropoutList dropouts={dropouts} />
        <SameNameList sameNames={sameNames} />
      </div>
    </div>
  );
}
