// src/components/StudentTable.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Student, StudentFilters } from '@/types/student';

type Props = {
  students: Student[];
  filters: StudentFilters;
  onFiltersChange: (filters: StudentFilters) => void;
  onAddClick: () => void;
  onEditClick: (student: Student) => void;
  onDeleteClick: (student: Student) => void;
};

export default function StudentTable({
  students,
  filters,
  onFiltersChange,
  onAddClick,
  onEditClick,
  onDeleteClick,
}: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.studentName || '');

  // 입력값 local state -> 300ms 디바운스 후 filters 반영
  useEffect(() => {
    const t = setTimeout(() => {
      onFiltersChange({
        ...filters,
        studentName: searchTerm,
      });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // 외부에서 filters가 바뀌면 input도 동기화
  useEffect(() => {
    setSearchTerm(filters.studentName || '');
  }, [filters.studentName]);

  const total = students.length;

  // ✅ teamNo 목록 만들기
  const uniqueTeams = useMemo(() => {
    const s = new Set<string>();
    students.forEach((x) => x.teamNo && s.add(x.teamNo));
    return Array.from(s).sort();
  }, [students]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          학생 목록 ({total}명)
        </h2>
        <button
          onClick={onAddClick}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          type="button"
        >
          학생 추가
        </button>
      </div>

      {/* 필터 */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-wrap gap-3">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              // Enter 눌러도 submit/리로드 성격의 동작 막기
              if (e.key === 'Enter') e.preventDefault();
            }}
            placeholder="이름 검색..."
            className="h-11 w-56 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
          />

          <select
            className="h-11 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
            value={filters.course || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                course: e.target.value || undefined,
              })
            }
          >
            <option value="">전체 과정</option>
            <option value="중등">중등</option>
            <option value="고등">고등</option>
          </select>

          <select
            className="h-11 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
            value={filters.grade || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                grade: e.target.value || undefined,
              })
            }
          >
            <option value="">전체 학년</option>
            <option value="중3">중3</option>
            <option value="고1">고1</option>
            <option value="고2">고2</option>
            <option value="고3">고3</option>
          </select>

          <select
            className="h-11 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
            value={filters.gender || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                gender: e.target.value || undefined,
              })
            }
          >
            <option value="">전체 성별</option>
            <option value="남">남</option>
            <option value="여">여</option>
          </select>

          {/* ✅ group -> teamNo, 그리고 uniqueGroups -> uniqueTeams */}
          <select
            className="h-11 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
            value={filters.teamNo || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                teamNo: e.target.value || undefined,
              })
            }
          >
            <option value="">전체 조</option>
            {uniqueTeams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-950/30">
            <tr className="text-left text-sm text-zinc-600 dark:text-zinc-400">
              <th className="px-6 py-4">이름</th>
              <th className="px-6 py-4">성별</th>
              <th className="px-6 py-4">멘토</th>
              <th className="px-6 py-4">방호조</th>
              <th className="px-6 py-4">나이</th>
              <th className="px-6 py-4">과정</th>
              <th className="px-6 py-4">학년</th>
              <th className="px-6 py-4">학교</th>
              <th className="px-6 py-4">이메일</th>
              <th className="px-6 py-4 text-right">작업</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {students.map((student) => (
              <tr
                key={student.id}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {student.name}
                  </div>
                  {student.fullName && (
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      {student.fullName}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      student.gender === '남'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-pink-100 text-pink-700'
                    }`}
                  >
                    {student.gender}
                  </span>
                </td>

                <td className="px-6 py-4">{student.mentor || '-'}</td>
                <td className="px-6 py-4">{student.roomGroup || '-'}</td>
                <td className="px-6 py-4">{student.age || '-'}</td>

                <td className="px-6 py-4">
                  {student.course ? (
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        student.course === '중등'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {student.course}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>

                <td className="px-6 py-4">{student.grade || '-'}</td>
                <td className="px-6 py-4">{student.school || '-'}</td>
                <td className="px-6 py-4">{student.email || '-'}</td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => onEditClick(student)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      type="button"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => onDeleteClick(student)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      type="button"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {students.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-6 py-10 text-center text-zinc-500 dark:text-zinc-400"
                >
                  학생이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}