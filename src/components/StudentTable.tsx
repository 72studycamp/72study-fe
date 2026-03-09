// src/components/StudentTable.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Student, StudentFilters } from '@/types/student';

type Props = {
  students: Student[];
  teamOptions: string[]; // ✅ 고정 1~14조 같은 옵션을 부모에서 내려줌
  filters: StudentFilters;
  onFiltersChange: (filters: StudentFilters) => void;
  onAddClick: () => void;
  onEditClick: (student: Student) => void;
  onDeleteClick: (student: Student) => void;
};

export default function StudentTable({
  students,
  teamOptions,
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isAbsentToday = (student: Student) => {
    return (
      student.absences?.some((absence) => {
        const start = new Date(absence.startDate);
        const end = new Date(absence.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return today >= start && today <= end;
      }) ?? false
    );
  };

  const isDropped = (student: Student) => {
    const status = String(student.status ?? '').trim();
    return status === 'DROPPED' || status === '퇴소';
  };

  const orderedStudents = useMemo(() => {
    return [...students].sort((a, b) => Number(isDropped(a)) - Number(isDropped(b)));
  }, [students]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
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
        {/* Toolbar container */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 검색 */}
          <div className="relative">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
              placeholder="이름 검색..."
              className="
                h-10 w-56 pl-10 pr-3 text-sm
                rounded-full
                border border-zinc-200 dark:border-zinc-700
                bg-white dark:bg-zinc-950
                text-zinc-900 dark:text-zinc-100
                outline-none
                focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
              "
            />
            {/* 돋보기 아이콘 (SVG) */}
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 21l-4.3-4.3" />
              <circle cx="11" cy="11" r="7" />
            </svg>
          </div>

          {/* Divider (wrap 대응) */}
          <div className="hidden md:block h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

          {/* 공통 select 스타일: pill + 커스텀 화살표 */}
          {[
            {
              value: filters.course || '',
              onChange: (v: string) => onFiltersChange({ ...filters, course: v || undefined }),
              options: [
                { value: '', label: '전체 과정' },
                { value: '중등', label: '중등' },
                { value: '고등', label: '고등' },
              ],
            },
            {
              value: filters.grade || '',
              onChange: (v: string) => onFiltersChange({ ...filters, grade: v || undefined }),
              options: [
                { value: '', label: '전체 학년' },
                { value: '중3', label: '중3' },
                { value: '고1', label: '고1' },
                { value: '고2', label: '고2' },
                { value: '고3', label: '고3' },
              ],
            },
            {
              value: filters.gender || '',
              onChange: (v: string) => onFiltersChange({ ...filters, gender: v || undefined }),
              options: [
                { value: '', label: '전체 성별' },
                { value: '남', label: '남' },
                { value: '여', label: '여' },
              ],
            },
            {
              value: (filters as any).teamNo || '',
              onChange: (v: string) => onFiltersChange({ ...filters, teamNo: v || undefined } as any),
              options: [
                { value: '', label: '전체 조' },
                ...teamOptions.map((t) => ({ value: t, label: t })), // ✅ 1~14조 고정
              ],
            },
          ].map((cfg, idx) => (
            <div key={idx} className="relative">
              <select
                className="
                  h-10 pl-4 pr-9 text-sm
                  rounded-full
                  border border-zinc-200 dark:border-zinc-700
                  bg-white dark:bg-zinc-950
                  text-zinc-900 dark:text-zinc-100
                  outline-none
                  appearance-none
                  hover:bg-zinc-50 dark:hover:bg-zinc-900
                  focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                "
                value={cfg.value}
                onChange={(e) => cfg.onChange(e.target.value)}
              >
                {cfg.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              {/* 커스텀 화살표 */}
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* 테이블 */}
      <div className="h-[495px] overflow-y-auto">
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
            {orderedStudents.map((student) => (
              <tr
                key={student.id}
                onClick={() => onEditClick(student)}
                className={`transition-colors ${
                  isDropped(student)
                    ? 'bg-red-50/80 hover:bg-red-100/80 dark:bg-red-900/20 dark:hover:bg-red-900/30'
                    : isAbsentToday(student)
                    ? 'bg-amber-50/80 hover:bg-amber-100/80 dark:bg-amber-900/20 dark:hover:bg-amber-900/30'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                } cursor-pointer`}
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {student.name}
                  </div>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClick(student);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      type="button"
                    >
                      수정
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClick(student);
                      }}
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
