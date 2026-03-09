// src/app/others/room-assignment/_components/RoomAssignmentPage.tsx
'use client';

import { useMemo, useRef, useState } from 'react';
import RoomAssignmentTable from './RoomAssignmentTable';
import RoomAssignmentForm from './RoomAssignmentForm';
import { useRoomAssignments } from '../_hooks/useRoomAssignments';
import { useStudents } from '../../parcel/_hooks/useStudents';
import { roomAssignmentApi } from '@/lib/api';

export default function RoomAssignmentPage() {
  const { rooms, assignmentsByRoom, loading, error, refetch } = useRoomAssignments();
  const { studentsAll, loadingStudents, errorStudents } = useStudents();
  const [query, setQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [roomNo, setRoomNo] = useState('');
  const [slotNo, setSlotNo] = useState<number>(1);
  const [note, setNote] = useState('');
  const [hasAssignment, setHasAssignment] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const assignmentByStudentId = useMemo(() => {
    const map = new Map<string, { roomNo: string; slotNo: number; note: string | null }>();
    Object.values(assignmentsByRoom).forEach((list) => {
      list.forEach((a) => {
        map.set(String(a.campStudentId), {
          roomNo: a.roomNo,
          slotNo: a.slotNo,
          note: a.note ?? null,
        });
      });
    });
    return map;
  }, [assignmentsByRoom]);

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return studentsAll.find((s) => s.id === selectedStudentId) ?? null;
  }, [selectedStudentId, studentsAll]);

  const handleSelectStudent = (studentId: string) => {
    const s = studentsAll.find((x) => x.id === studentId);
    if (!s) return;
    setSelectedStudentId(studentId);
    setQuery(s.name ?? '');
    const assignment = assignmentByStudentId.get(String(studentId));
    if (assignment) {
      setRoomNo(assignment.roomNo);
      setSlotNo(assignment.slotNo);
      setNote(assignment.note ?? '');
      setHasAssignment(true);
    }
  };

  const handleSave = async () => {
    if (!selectedStudentId || !roomNo || !slotNo) return;
    try {
      await roomAssignmentApi.upsert(selectedStudentId, {
        roomNo,
        slotNo,
        note: note.trim() || null,
      });
      await refetch();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '저장에 실패했습니다.';
      alert(msg);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudentId) return;
    if (!confirm('이 학생의 방 배정을 해제하시겠습니까?')) return;
    try {
      await roomAssignmentApi.deleteByStudent(selectedStudentId);
      await refetch();
      setHasAssignment(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '삭제에 실패했습니다.';
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            방배정
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            방별 슬롯 현황을 빠르게 확인할 수 있습니다.
          </p>
        </div>

        {(error || errorStudents) && (
          <div className="mb-4">
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
              {error || errorStudents}
            </div>
          </div>
        )}

        <RoomAssignmentForm
          rooms={rooms}
          studentsAll={studentsAll}
          assignmentByStudentId={assignmentByStudentId}
          loadingStudents={loadingStudents}
          errorStudents={errorStudents}
          query={query}
          setQuery={setQuery}
          selectedStudentId={selectedStudentId}
          setSelectedStudentId={setSelectedStudentId}
          roomNo={roomNo}
          setRoomNo={setRoomNo}
          slotNo={slotNo}
          setSlotNo={setSlotNo}
          note={note}
          setNote={setNote}
          nameInputRef={nameInputRef}
          onSelectStudent={handleSelectStudent}
          onSave={handleSave}
          onDelete={handleDelete}
          canDelete={hasAssignment}
        />

        <RoomAssignmentTable
          rooms={rooms}
          assignmentsByRoom={assignmentsByRoom}
          studentsAll={studentsAll}
          loading={loading || loadingStudents}
          onSelectSlot={(payload) => {
            setRoomNo(payload.roomNo);
            setSlotNo(payload.slotNo);
            setNote(payload.note ?? '');
            setHasAssignment(payload.hasAssignment);
            if (payload.studentId) {
              const s = studentsAll.find((x) => String(x.id) === payload.studentId);
              setSelectedStudentId(payload.studentId);
              setQuery(s?.name ?? payload.studentName ?? '');
            } else {
              setSelectedStudentId(null);
              setQuery(payload.studentName ?? '');
            }
            requestAnimationFrame(() => {
              nameInputRef.current?.focus();
            });
          }}
        />
      </div>
    </div>
  );
}
