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
  compact?: boolean;
}

export default function SummaryStats({
  stats,
  students,
  onStudentUpdate,
  compact = false,
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
      {!compact && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            카테고리별 통계
          </h2>
        </div>
      )}

      <div className="space-y-4">
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
