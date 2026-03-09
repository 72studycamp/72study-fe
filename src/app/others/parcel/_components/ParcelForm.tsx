// src/app/others/parcel/_components/ParcelForm.tsx
'use client';

import { useMemo } from 'react';
import { Student } from '@/types/student';

type Props = {
  studentsAll: Student[];
  loadingStudents: boolean;
  errorStudents: string | null;

  query: string;
  setQuery: (v: string) => void;

  selectedStudentId: string | null;
  setSelectedStudentId: (v: string | null) => void;

  quantity: number;
  setQuantity: (v: number) => void;

  nameInputRef: React.RefObject<HTMLInputElement | null>;
  qtyInputRef: React.RefObject<HTMLInputElement | null>;

  onSelectStudent: (studentId: string) => void;
  onAdd: () => void;
};

export default function ParcelForm({
  studentsAll,
  loadingStudents,
  errorStudents,
  query,
  setQuery,
  selectedStudentId,
  setSelectedStudentId,
  quantity,
  setQuantity,
  nameInputRef,
  qtyInputRef,
  onSelectStudent,
  onAdd,
}: Props) {
  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return studentsAll.filter((s) => (s.name ?? '').toLowerCase().includes(q)).slice(0, 8);
  }, [query, studentsAll]);

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return studentsAll.find((s) => s.id === selectedStudentId) ?? null;
  }, [selectedStudentId, studentsAll]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 mb-6">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">등록</h2>
        {loadingStudents && (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">학생 로딩 중...</div>
        )}
      </div>

      {errorStudents && (
        <div className="p-4">
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-200">
            {errorStudents}
          </div>
        </div>
      )}

      <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* 이름 검색 + 후보 */}
        <div className="md:col-span-6">
          <div className="relative">
            <input
              ref={nameInputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedStudentId(null);
              }}
              onKeyDown={(e) => {
                if ((e.nativeEvent as any).isComposing) return;

                if (e.key === 'Enter') {
                  e.preventDefault();

                  if (!selectedStudentId && candidates.length > 0) {
                    onSelectStudent(candidates[0].id);
                    return;
                  }

                  if (selectedStudentId) {
                    onAdd();
                  }
                }
              }}
              placeholder="학생 이름 검색..."
              className="
                h-10 w-full pl-10 pr-3 text-sm
                rounded-full
                border border-zinc-200 dark:border-zinc-700
                bg-white dark:bg-zinc-950
                text-zinc-900 dark:text-zinc-100
                outline-none
                focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
              "
            />
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

            {candidates.length > 0 && !selectedStudentId && (
              <div className="absolute z-20 mt-2 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-lg overflow-hidden">
                {candidates.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelectStudent(s.id)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
                  >
                    <div className="text-zinc-900 dark:text-zinc-100 font-medium">{s.name}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {s.group ?? s.teamNo ?? '-'} · {s.grade ?? '-'} · {s.roomGroup ?? '-'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 개수 */}
        <div className="md:col-span-2">
          <input
            ref={qtyInputRef}
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            onKeyDown={(e) => {
              if ((e.nativeEvent as any).isComposing) return;
              if (e.key === 'Enter') {
                e.preventDefault();
                if (!selectedStudentId) return;
                onAdd();
              }
            }}
            className="
              h-10 w-full px-3 text-sm rounded-lg
              border border-zinc-200 dark:border-zinc-700
              bg-white dark:bg-zinc-950
              text-zinc-900 dark:text-zinc-100
              outline-none
              focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
            "
            placeholder="개수"
          />
        </div>

        {/* 프리뷰 */}
        <div className="md:col-span-4 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          {selectedStudent ? (
            <>
              <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                {selectedStudent.group ?? selectedStudent.teamNo ?? '-'}
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                {selectedStudent.grade ?? '-'}
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                {(selectedStudent.gender as any) ?? '-'}
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                {selectedStudent.roomGroup ?? '-'}
              </span>
            </>
          ) : (
            <span className="text-zinc-500 dark:text-zinc-400">
              학생을 선택하면 자동으로 정보가 채워집니다.
            </span>
          )}
        </div>

        {/* 추가 */}
        <div className="md:col-span-12 flex justify-end">
          <button
            type="button"
            onClick={onAdd}
            disabled={!selectedStudent}
            className="
              h-10 px-4 rounded-lg
              bg-blue-600 text-white text-sm font-medium
              hover:bg-blue-700 transition
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}