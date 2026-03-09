// src/components/SummaryStats.tsx
'use client';

import { useState } from 'react';
import { SummaryStats as SummaryStatsType, Student, Absence } from '@/types/student';
import CategoryStatsTable from './CategoryStats';
import CategoryDetailModal from './CategoryDetailModal';
import { isStudentInLectureHall } from '@/lib/lectureHall';

interface SummaryStatsProps {
  stats: SummaryStatsType;
  students: Student[];
  onStudentUpdate?: (student: Student) => void;
}

export default function SummaryStats({ stats, students, onStudentUpdate }: SummaryStatsProps) {
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
      const { title, subCategory } = selectedCategory;

      if (title === '강의장') return isStudentInLectureHall(student, subCategory);
      if (title === '조') return student.group === subCategory;

      return false;
    });
  };

  return (
    <div className="mb-8">
      {/* ✅ 강의장별 / 조별 통계를 한 줄에 2개 배치 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryStatsTable
          title="강의장"
          stats={stats.byLectureHall}
          onCategoryClick={(category, subCategory) =>
            handleCategoryClick('강의장', category, subCategory)
          }
        />

        <CategoryStatsTable
          title="조"
          stats={stats.byGroup}
          onCategoryClick={(category, subCategory) =>
            handleCategoryClick('조', category, subCategory)
          }
        />
      </div>

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
