'use client';

import { Student, StudentFilters } from '@/types/student';
import { useState, useEffect } from 'react';

interface StudentTableProps {
  students: Student[];
  filters: StudentFilters;
  onFiltersChange: (filters: StudentFilters) => void;
  onAddClick?: () => void;
  onEditClick?: (student: Student) => void;
  onDeleteClick?: (student: Student) => void;
}

export default function StudentTable({
  students,
  filters,
  onFiltersChange,
  onAddClick,
  onEditClick,
  onDeleteClick,
}: StudentTableProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(filters.studentName || '');

  // 검색어 디바운싱
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({
        ...filters,
        studentName: localSearchTerm || undefined,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm]);

  const uniqueGrades = Array.from(new Set(students.map((s) => s.grade))).sort();
  const uniqueTeamNos = Array.from(
    new Set(students.map((s) => s.group?.replace('조', '')).filter(Boolean))
  ).sort((a, b) => parseInt(a || '0') - parseInt(b || '0'));
  const uniqueRoomNos = Array.from(
    new Set(students.map((s) => s.roomGroup.split('호')[0]).filter(Boolean))
  ).sort();

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              학생 목록 ({students.length}명)
            </h2>
            {onAddClick && (
              <button
                onClick={onAddClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                학생 추가
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <input
              type="text"
              placeholder="이름 검색..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <select
              value={filters.course || 'all'}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  course: e.target.value === 'all' ? undefined : e.target.value,
                })
              }
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all">전체 과정</option>
              <option value="중등">중등</option>
              <option value="고등">고등</option>
            </select>
            <select
              value={filters.grade || 'all'}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  grade: e.target.value === 'all' ? undefined : e.target.value,
                })
              }
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all">전체 학년</option>
              {uniqueGrades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
            <select
              value={filters.gender || 'all'}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  gender: e.target.value === 'all' ? undefined : e.target.value,
                })
              }
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all">전체 성별</option>
              <option value="남">남</option>
              <option value="여">여</option>
            </select>
            <select
              value={filters.teamNo || 'all'}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  teamNo: e.target.value === 'all' ? undefined : e.target.value,
                })
              }
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all">전체 조</option>
              {uniqueTeamNos.map((teamNo) => (
                <option key={teamNo} value={teamNo}>
                  {teamNo}조
                </option>
              ))}
            </select>
            <select
              value={filters.roomNo || 'all'}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  roomNo: e.target.value === 'all' ? undefined : e.target.value,
                })
              }
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all">전체 방</option>
              {uniqueRoomNos.map((roomNo) => (
                <option key={roomNo} value={roomNo}>
                  {roomNo}호
                </option>
              ))}
            </select>
            <select
              value={filters.status || 'all'}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  status: e.target.value === 'all' ? undefined : e.target.value,
                })
              }
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all">전체 상태</option>
              <option value="재원">재원</option>
              <option value="퇴소">퇴소</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                성별
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                멘토
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                방호조
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                나이
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                과정
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                학년
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                학교
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                이메일
              </th>
            </tr>
          </thead>
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                성별
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                멘토
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                방호조
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                나이
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                과정
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                학년
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                학교
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                이메일
              </th>
              {(onEditClick || onDeleteClick) && (
                <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  작업
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {students.length === 0 ? (
              <tr>
                <td
                  colSpan={onEditClick || onDeleteClick ? 10 : 9}
                  className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400"
                >
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  onClick={() => onEditClick?.(student)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {student.name}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {student.fullName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.gender === '남'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                      }`}
                    >
                      {student.gender}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                    {student.mentor || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                    {student.roomGroup || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                    {student.age || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.course === '중등'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}
                    >
                      {student.course}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                    {student.grade}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {student.school || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                    {student.email || '-'}
                  </td>
                  {(onEditClick || onDeleteClick) && (
                    <td
                      className="px-6 py-4 whitespace-nowrap text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {onEditClick && (
                          <button
                            onClick={() => onEditClick(student)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                          >
                            수정
                          </button>
                        )}
                        {onDeleteClick && (
                          <button
                            onClick={() => onDeleteClick(student)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

