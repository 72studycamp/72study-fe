// src/app/others/health/page.tsx
'use client';

import { useMemo, useRef, useState } from 'react';

import HealthLogHeader from './_components/HealthLogHeader';
import HealthLogForm from './_components/HealthLogForm';
import HealthLogListCard from './_components/HealthLogListCard';

import { useStudents } from '../parcel/_hooks/useStudents';
import { useHealthLogs } from './_hooks/useHealthLogs';
import { HealthLogCategory, HealthLogRow } from './_utils/healthTypes';
import { healthLogApi } from '@/lib/api';
import { toYmd } from '../parcel/_utils/date';

const categories: Array<{ value: HealthLogCategory; label: string; note: string }> = [
  { value: 'GENERAL', label: '양호일지', note: '기본 건강 기록' },
  { value: 'CONSTIPATION', label: '변비일지', note: '배변 관련 기록' },
];

export default function HealthLogPage() {
  const { studentsAll, loadingStudents, errorStudents } = useStudents();

  const [category, setCategory] = useState<HealthLogCategory>('GENERAL');
  const { rows, setRows, loadingRows, errorRows, refetchRows } = useHealthLogs({ category });

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [rows]);

  const [query, setQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [logDate, setLogDate] = useState(() => toYmd(new Date()));
  const [symptom, setSymptom] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [note, setNote] = useState('');
  const [firstDetectedDate, setFirstDetectedDate] = useState('');
  const [handledBy, setHandledBy] = useState('');

  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return studentsAll.find((s) => s.id === selectedStudentId) ?? null;
  }, [selectedStudentId, studentsAll]);

  const handleSelectStudent = (studentId: string) => {
    const s = studentsAll.find((x) => x.id === studentId);
    if (!s) return;
    setSelectedStudentId(studentId);
    setQuery(s.name ?? '');
  };

  const resetForm = () => {
    setQuery('');
    setSelectedStudentId(null);
    setLogDate(toYmd(new Date()));
    setSymptom('');
    setActionTaken('');
    setNote('');
    setFirstDetectedDate('');
    setHandledBy('');
    requestAnimationFrame(() => {
      nameInputRef.current?.focus();
    });
  };

  const handleSave = async () => {
    if (!selectedStudent) return;
    const nextSymptom = symptom.trim();
    if (!logDate || nextSymptom.length === 0) {
      alert('기록일과 증상은 필수입니다.');
      return;
    }

    const payload = {
      logDate,
      category,
      symptom: nextSymptom,
      actionTaken: actionTaken.trim() || null,
      note: note.trim() || null,
      firstDetectedDate: firstDetectedDate || null,
      handledBy: handledBy.trim() || null,
    };

    try {
      await healthLogApi.create(selectedStudent.id, payload);
      await refetchRows({ category });
      resetForm();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '저장에 실패했습니다.';
      alert(msg);
    }
  };

  const handleDelete = async (row: HealthLogRow) => {
    if (!confirm(`${row.studentName}의 건강일지를 삭제하시겠습니까?`)) return;
    try {
      await healthLogApi.deleteOne(row.id, category);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (e) {
      const msg = e instanceof Error ? e.message : '삭제에 실패했습니다.';
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <HealthLogHeader />

        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setCategory(item.value)}
                className={`p-4 rounded-xl border text-left transition ${
                  category === item.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-blue-300'
                }`}
              >
                <div className="text-sm font-semibold">{item.label}</div>
                <div className="text-xs mt-1 text-zinc-500">{item.note}</div>
              </button>
            ))}
          </div>
        </div>

        <HealthLogForm
          studentsAll={studentsAll}
          loadingStudents={loadingStudents}
          errorStudents={errorStudents}
          query={query}
          setQuery={setQuery}
          selectedStudentId={selectedStudentId}
          setSelectedStudentId={setSelectedStudentId}
          category={category}
          logDate={logDate}
          setLogDate={setLogDate}
          symptom={symptom}
          setSymptom={setSymptom}
          actionTaken={actionTaken}
          setActionTaken={setActionTaken}
          note={note}
          setNote={setNote}
          firstDetectedDate={firstDetectedDate}
          setFirstDetectedDate={setFirstDetectedDate}
          handledBy={handledBy}
          setHandledBy={setHandledBy}
          nameInputRef={nameInputRef}
          onSelectStudent={handleSelectStudent}
          onSave={handleSave}
        />

        <HealthLogListCard
          rows={sortedRows}
          category={category}
          loadingRows={loadingRows}
          errorRows={errorRows}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
