'use client';

import { useState } from 'react';
import { SummaryStats as SummaryStatsType, Student } from '@/types/student';
import CategoryStatsTable from './CategoryStats';
import CategoryDetailModal from './CategoryDetailModal';
import { Absence } from '@/types/student';

interface SummaryStatsProps {
  stats: SummaryStatsType;
  students: Student[];
  onStudentUpdate?: (student: Student) => void;
}

export default function SummaryStats({
  stats,
  students,
  onStudentUpdate,
}: SummaryStatsProps) {
  const [selectedCategory, setSelectedCategory] = useState<{
    title: string;
    category: string;
    subCategory: string;
  } | null>(null);

  const handleCategoryClick = (title: string, category: string, subCategory: string) => {
    setSelectedCategory({ title, category, subCategory });
  };

  const handleAbsenceAdd = (studentId: string, absence: Absence) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const updatedStudent: Student = {
      ...student,
      absences: [...(student.absences || []), absence],
    };

    onStudentUpdate?.(updatedStudent);
  };

  const handleAbsenceRemove = (studentId: string, absenceId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const updatedStudent: Student = {
      ...student,
      absences: student.absences?.filter((a) => a.id !== absenceId) || [],
    };

    onStudentUpdate?.(updatedStudent);
  };

  const getFilteredStudents = () => {
    if (!selectedCategory) return [];

    return students.filter((student) => {
      const { title, subCategory, category } = selectedCategory;

      if (title === '강의장') {
        return student.lectureHall === subCategory;
      } else if (title === '조') {
        return student.group === subCategory;
      } else if (title === '성별') {
        // category는 '남' 또는 '여', subCategory는 학년
        return student.gender === category && student.grade === subCategory;
      }
      return false;
    });
  };

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
            정원
          </div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            {stats.totalQuota}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
            편성
          </div>
          <div className="text-3xl font-bold text-green-900 dark:text-green-100">
            {stats.totalAssigned}
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
          <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">
            현재 출석
          </div>
          <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
            {stats.totalPresent}
          </div>
        </div>
        <div
          className={`rounded-xl p-6 border ${
            stats.totalAbsent > 0
              ? 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800'
              : 'bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 border-zinc-200 dark:border-zinc-800'
          }`}
        >
          <div
            className={`text-sm font-medium mb-2 ${
              stats.totalAbsent > 0
                ? 'text-orange-700 dark:text-orange-300'
                : 'text-zinc-700 dark:text-zinc-300'
            }`}
          >
            외출/외박
          </div>
          <div
            className={`text-3xl font-bold ${
              stats.totalAbsent > 0
                ? 'text-orange-900 dark:text-orange-100'
                : 'text-zinc-900 dark:text-zinc-100'
            }`}
          >
            {stats.totalAbsent}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* 강의장별 통계 */}
        <CategoryStatsTable
          title="강의장"
          stats={stats.byLectureHall}
          students={students}
          onCategoryClick={(category, subCategory) =>
            handleCategoryClick('강의장', category, subCategory)
          }
        />

        {/* 조별 통계 */}
        <CategoryStatsTable
          title="조"
          stats={stats.byGroup}
          students={students}
          onCategoryClick={(category, subCategory) =>
            handleCategoryClick('조', category, subCategory)
          }
        />

        {/* 성별별 통계 */}
        {stats.byGender.map((genderStat) => (
          <CategoryStatsTable
            key={genderStat.gender}
            title="성별"
            stats={genderStat.byGrade}
            students={students}
            onCategoryClick={(category, subCategory) =>
              handleCategoryClick('성별', category, subCategory)
            }
          />
        ))}
      </div>

      {/* 상세 모달 */}
      {selectedCategory && (
        <CategoryDetailModal
          isOpen={!!selectedCategory}
          onClose={() => setSelectedCategory(null)}
          title={selectedCategory.title}
          subTitle={selectedCategory.subCategory}
          students={getFilteredStudents()}
          onAbsenceAdd={handleAbsenceAdd}
          onAbsenceRemove={handleAbsenceRemove}
        />
      )}
    </div>
  );
}
