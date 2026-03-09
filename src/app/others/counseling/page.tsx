// src/app/others/counseling/page.tsx
'use client';

import { useMemo, useRef, useState } from 'react';

import FocusCounselingHeader from './_components/FocusCounselingHeader';
import FocusCounselingForm from './_components/FocusCounselingForm';
import FocusCounselingListCard from './_components/FocusCounselingListCard';

import { useStudents } from '../parcel/_hooks/useStudents';
import { useFocusCounselingList } from './_hooks/useFocusCounselingList';
import { FocusCounselingRow } from './_utils/counselingTypes';
import { focusCounselingApi } from '@/lib/api';

export default function FocusCounselingPage() {
  const { studentsAll, loadingStudents, errorStudents } = useStudents();

  const { rows, setRows, loadingRows, errorRows, refetchRows } = useFocusCounselingList();

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [rows]);

  const [query, setQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [memo, setMemo] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingMemo, setEditingMemo] = useState('');

  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return studentsAll.find((s) => s.id === selectedStudentId) ?? null;
  }, [selectedStudentId, studentsAll]);

  const handleSelectStudent = async (studentId: string) => {
    const s = studentsAll.find((x) => x.id === studentId);
    if (!s) return;

    setSelectedStudentId(studentId);
    setQuery(s.name ?? '');

    try {
      const existing = await focusCounselingApi.getByStudent(studentId);
      setMemo(existing?.memo ?? '');
    } catch {
      setMemo('');
    }
  };

  const handleSave = async () => {
    if (!selectedStudent) return;
    const nextMemo = memo.trim();
    if (nextMemo.length === 0) {
      alert('메모를 입력해주세요.');
      return;
    }

    try {
      await focusCounselingApi.upsert(selectedStudent.id, nextMemo);
      await refetchRows();
      setQuery('');
      setSelectedStudentId(null);
      setMemo('');
      requestAnimationFrame(() => {
        nameInputRef.current?.focus();
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '저장에 실패했습니다.';
      alert(msg);
    }
  };

  const startEdit = (row: FocusCounselingRow) => {
    setEditingId(row.campStudentId);
    setEditingMemo(row.memo ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingMemo('');
  };

  const commitEdit = async (row: FocusCounselingRow) => {
    const nextMemo = editingMemo.trim();
    if (!nextMemo) {
      alert('메모를 입력해주세요.');
      return;
    }
    try {
      await focusCounselingApi.upsert(row.campStudentId, nextMemo);
      setRows((prev) =>
        prev.map((r) =>
          r.campStudentId === row.campStudentId ? { ...r, memo: nextMemo } : r
        )
      );
      cancelEdit();
      await refetchRows();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '수정에 실패했습니다.';
      alert(msg);
    }
  };

  const handleDelete = async (row: FocusCounselingRow) => {
    if (!confirm(`${row.studentName}의 집중상담 기록을 삭제하시겠습니까?`)) return;
    try {
      await focusCounselingApi.deleteByStudent(row.campStudentId);
      setRows((prev) => prev.filter((r) => r.campStudentId !== row.campStudentId));
    } catch (e) {
      const msg = e instanceof Error ? e.message : '삭제에 실패했습니다.';
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <FocusCounselingHeader />

        <FocusCounselingForm
          studentsAll={studentsAll}
          loadingStudents={loadingStudents}
          errorStudents={errorStudents}
          query={query}
          setQuery={setQuery}
          selectedStudentId={selectedStudentId}
          setSelectedStudentId={setSelectedStudentId}
          memo={memo}
          setMemo={setMemo}
          nameInputRef={nameInputRef}
          onSelectStudent={handleSelectStudent}
          onSave={handleSave}
        />

        <FocusCounselingListCard
          rows={sortedRows}
          loadingRows={loadingRows}
          errorRows={errorRows}
          editingId={editingId}
          editingMemo={editingMemo}
          setEditingMemo={setEditingMemo}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onCommitEdit={commitEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
