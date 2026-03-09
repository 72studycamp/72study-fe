// src/app/others/room-assignment/_components/RoomAssignmentForm.tsx
'use client';

import { useMemo } from 'react';
import { Student } from '@/types/student';
import { RoomInfo } from '../_utils/roomTypes';

type Props = {
  rooms: RoomInfo[];
  studentsAll: Student[];
  assignmentByStudentId: Map<string, { roomNo: string; slotNo: number; note: string | null }>;
  loadingStudents: boolean;
  errorStudents: string | null;

  query: string;
  setQuery: (v: string) => void;

  selectedStudentId: string | null;
  setSelectedStudentId: (v: string | null) => void;

  roomNo: string;
  setRoomNo: (v: string) => void;
  slotNo: number;
  setSlotNo: (v: number) => void;
  note: string;
  setNote: (v: string) => void;

  nameInputRef: React.RefObject<HTMLInputElement | null>;

  onSelectStudent: (studentId: string) => void;
  onSave: () => void;
  onDelete: () => void;
  canDelete: boolean;
};

export default function RoomAssignmentForm({
  rooms,
  studentsAll,
  assignmentByStudentId,
  loadingStudents,
  errorStudents,
  query,
  setQuery,
  selectedStudentId,
  setSelectedStudentId,
  roomNo,
  setRoomNo,
  slotNo,
  setSlotNo,
  note,
  setNote,
  nameInputRef,
  onSelectStudent,
  onSave,
  onDelete,
  canDelete,
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
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">배정 수정</h2>
        {loadingStudents && (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">학생 로딩 중...</div>
        )}
      </div>

      {errorStudents && (
        <div className="p-4">
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
            {errorStudents}
          </div>
        </div>
      )}

      <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-4">
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
                {candidates.map((s) => {
                  const assignment = assignmentByStudentId.get(String(s.id));
                  const roomLabel = assignment?.roomNo ?? s.roomNo ?? '-';
                  const slotLabel = assignment?.slotNo ? `${assignment.slotNo}번` : '';
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onSelectStudent(s.id)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
                    >
                      <div className="text-zinc-900 dark:text-zinc-100 font-medium">
                        {s.name}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {roomLabel}
                        {slotLabel ? ` ${slotLabel}` : ''} · {s.group ?? s.teamNo ?? '-'} ·{' '}
                        {s.mentor ?? '-'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
            {selectedStudent
              ? `${selectedStudent.name} · ${selectedStudent.grade ?? '-'} · ${
                  selectedStudent.gender ?? '-'
                }`
              : '학생을 선택하면 상세 정보가 표시됩니다.'}
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs text-zinc-500 mb-1">방번호</label>
          <input
            list="room-no-list"
            value={roomNo}
            onChange={(e) => setRoomNo(e.target.value)}
            placeholder="예: 402"
            className="
              h-10 w-full px-3 text-sm rounded-lg
              border border-zinc-200 dark:border-zinc-700
              bg-white dark:bg-zinc-950
              text-zinc-900 dark:text-zinc-100
              outline-none
              focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
            "
          />
          <datalist id="room-no-list">
            {rooms.map((room) => (
              <option key={room.roomNo} value={room.roomNo} />
            ))}
          </datalist>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs text-zinc-500 mb-1">슬롯</label>
          <input
            type="number"
            min={1}
            value={slotNo || 1}
            onChange={(e) => setSlotNo(Number(e.target.value))}
            className="
              h-10 w-full px-3 text-sm rounded-lg
              border border-zinc-200 dark:border-zinc-700
              bg-white dark:bg-zinc-950
              text-zinc-900 dark:text-zinc-100
              outline-none
              focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
            "
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs text-zinc-500 mb-1">비고</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="메모"
            className="
              h-10 w-full px-3 text-sm rounded-lg
              border border-zinc-200 dark:border-zinc-700
              bg-white dark:bg-zinc-950
              text-zinc-900 dark:text-zinc-100
              outline-none
              focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
            "
          />
        </div>

        <div className="md:col-span-12 flex justify-end gap-2">
          <button
            type="button"
            onClick={onDelete}
            disabled={!canDelete}
            className="
              h-10 px-4 rounded-lg border border-zinc-200 text-sm
              bg-white text-zinc-700 hover:bg-zinc-50
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            배정 해제
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!selectedStudentId || !roomNo || !slotNo}
            className="
              h-10 px-4 rounded-lg
              bg-blue-600 text-white text-sm font-medium
              hover:bg-blue-700 transition
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
