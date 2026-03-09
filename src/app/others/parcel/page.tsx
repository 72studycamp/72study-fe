// src/app/others/parcel/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import ParcelHeader from './_components/ParcelHeader';
import ParcelNoticeCard from './_components/ParcelNoticeCard';
import ParcelForm from './_components/ParcelForm';
import ParcelListCard from './_components/ParcelListCard';

import { useStudents } from './_hooks/useStudents';
import { useParcelRows } from './_hooks/useParcelRows';

import { toYmd } from './_utils/date';
import { buildCafeCopyPayload, normalizeGender } from './_utils/cafeExport';
import { ParcelRow } from './_utils/parcelTypes';
import { parcelApi } from '@/lib/api';

function gradeRank(grade?: string) {
  const g = (grade ?? '').replace(/\s/g, '');
  // 원하는 우선순위: 중3, 고1, 고2, 고3
  if (g.includes('중3')) return 1;
  if (g.includes('고1')) return 2;
  if (g.includes('고2')) return 3;
  if (g.includes('고3')) return 4;
  return 99;
}

export default function ParcelPage() {
  // 날짜(기본 오늘)
  const [date, setDate] = useState<string>(() => toYmd(new Date()));

  // students
  const { studentsAll, loadingStudents, errorStudents } = useStudents();

  // rows
  const { rows, setRows, loadingRows, errorRows, refetchRows } = useParcelRows(date);

  // ✅ 정렬: 여학생 먼저 -> 학년(중3,고1,고2,고3) -> 이름
  const sortedRows = useMemo(() => {
    const genderRank = (g?: string) => {
      const v = normalizeGender(g);
      if (v === '여') return 0;
      if (v === '남') return 1;
      return 2;
    };

    return [...rows].sort((a, b) => {
      const g1 = genderRank(a.gender) - genderRank(b.gender);
      if (g1 !== 0) return g1;

      const g2 = gradeRank(a.grade) - gradeRank(b.grade);
      if (g2 !== 0) return g2;

      return (a.studentName ?? '').localeCompare(b.studentName ?? '', 'ko');
    });
  }, [rows]);

  // 입력 폼 상태
  const [query, setQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // 목록에서 개수 인라인 수정
  const [editingQtyId, setEditingQtyId] = useState<string | null>(null);
  const [editingQtyValue, setEditingQtyValue] = useState<string>('');

  // 포커스 ref
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const qtyInputRef = useRef<HTMLInputElement | null>(null);

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return studentsAll.find((s) => s.id === selectedStudentId) ?? null;
  }, [selectedStudentId, studentsAll]);

  const isPersistedParcelId = (id: string) => {
    const num = Number(id);
    return !Number.isNaN(num) && num < 1000000000000;
  };

  useEffect(() => {
    if (rows.length === 0 || studentsAll.length === 0) return;

    let changed = false;
    const next = rows.map((row) => {
      if (!row.studentId) return row;
      const s = studentsAll.find((x) => x.id === row.studentId);
      if (!s) return row;

      const merged: ParcelRow = {
        ...row,
        studentName: row.studentName || s.name,
        teamNo: row.teamNo ?? s.teamNo ?? s.group ?? undefined,
        grade: row.grade ?? s.grade ?? undefined,
        gender: row.gender ?? s.gender ?? undefined,
        roomNo: row.roomNo ?? (s.roomNo ? String(s.roomNo) : undefined),
        lectureHall: row.lectureHall ?? s.lectureHall ?? undefined,
      };

      if (
        merged.studentName !== row.studentName ||
        merged.teamNo !== row.teamNo ||
        merged.grade !== row.grade ||
        merged.gender !== row.gender ||
        merged.roomNo !== row.roomNo ||
        merged.lectureHall !== row.lectureHall
      ) {
        changed = true;
      }
      return merged;
    });

    if (changed) {
      setRows(next);
    }
  }, [rows, studentsAll, setRows]);

  // ✅ 중복 누적 기준: 같은 date + 같은 studentId
  const isSameRow = (a: ParcelRow, b: ParcelRow) => {
    if (a.date !== b.date) return false;
    if (a.studentId && b.studentId) return a.studentId === b.studentId;
    return a.studentName === b.studentName;
  };

  // ✅ 학생 선택 + 개수칸으로 포커스 이동
  const handleSelectStudent = (studentId: string) => {
    const s = studentsAll.find((x) => x.id === studentId);
    if (!s) return;

    setSelectedStudentId(studentId);
    setQuery(s.name ?? '');

    requestAnimationFrame(() => {
      qtyInputRef.current?.focus();
      qtyInputRef.current?.select();
    });
  };

  // ✅ 추가 (즉시 저장)
  const handleAdd = async () => {
    if (!selectedStudent) return;

    const addQty = Math.max(1, Number(quantity) || 1);

    const nextDraft: ParcelRow = {
      id: String(Date.now()),
      date,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      teamNo: (selectedStudent as any).teamNo ?? (selectedStudent as any).group ?? undefined,
      grade: (selectedStudent as any).grade ?? undefined,
      gender: (selectedStudent as any).gender ?? undefined,
      quantity: addQty,
      roomNo: (selectedStudent as any).roomNo ? String((selectedStudent as any).roomNo) : undefined,
      lectureHall: (selectedStudent as any).lectureHall ?? undefined,
    };

    const existing = rows.find((r) => isSameRow(r, nextDraft));
    const targetRow = existing
      ? { ...existing, quantity: existing.quantity + addQty }
      : nextDraft;

    setRows((prev) => {
      if (existing) {
        return prev.map((r) => (r.id === existing.id ? targetRow : r));
      }
      return [targetRow, ...prev];
    });

    // reset + focus
    setQuery('');
    setSelectedStudentId(null);
    setQuantity(1);

    requestAnimationFrame(() => {
      nameInputRef.current?.focus();
    });

    try {
      if (targetRow.studentId) {
        if (isPersistedParcelId(targetRow.id)) {
          await parcelApi.updateParcel(Number(targetRow.id), { count: targetRow.quantity });
        } else {
          await parcelApi.saveParcel({
            receivedDate: targetRow.date,
            campStudentId: Number(targetRow.studentId),
            count: targetRow.quantity,
          });
        }
        await refetchRows(date);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '저장에 실패했습니다.';
      alert(msg);
    }
  };

  // ✅ 삭제
  const handleDelete = async (row: ParcelRow) => {
    if (!confirm(`${row.studentName} 택배 기록을 삭제하시겠습니까?`)) return;

    // 백엔드에 삭제 요청 (parcelId가 숫자면 백엔드 ID로 간주)
    // 임시 ID (Date.now())는 백엔드에 저장되지 않은 것이므로 스킵
    const parcelId = Number(row.id);
    if (!isNaN(parcelId) && parcelId < 1000000000000) {
      try {
        await parcelApi.deleteParcel(parcelId);
      } catch (e) {
        const msg = e instanceof Error ? e.message : '삭제에 실패했습니다.';
        alert(msg);
        return;
      }
    }

    setRows((prev) => prev.filter((x) => x.id !== row.id));
  };

  // ✅ 개수 인라인 수정
  const startEditQty = (row: ParcelRow) => {
    setEditingQtyId(row.id);
    setEditingQtyValue(String(row.quantity));
  };
  const cancelEditQty = () => {
    setEditingQtyId(null);
    setEditingQtyValue('');
  };
  const commitEditQty = async (row: ParcelRow) => {
    const nextQty = Math.max(1, Number(editingQtyValue) || 1);
    setRows((prev) => prev.map((x) => (x.id === row.id ? { ...x, quantity: nextQty } : x)));
    cancelEditQty();

    // 백엔드에 수정 요청 (parcelId가 숫자면 백엔드 ID로 간주)
    // 임시 ID (Date.now())는 백엔드에 저장되지 않은 것이므로 스킵
    const parcelId = Number(row.id);
    if (!isNaN(parcelId) && parcelId < 1000000000000) {
      try {
        // 백엔드 ParcelUpdateRequest: count 필드만 전송
        await parcelApi.updateParcel(parcelId, { count: nextQty });
      } catch (e) {
        // 에러는 조용히 처리 (로컬 상태는 이미 업데이트됨)
        console.error('택배 수정 실패:', e);
      }
    }
  };

  // ✅ 카페 복사 (정렬된 목록 기준으로 복사)
  const handleCopyForCafe = async () => {
    try {
      const { plain, html } = buildCafeCopyPayload(date, sortedRows);

      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' }),
        }),
      ]);

      alert('복사 완료! 네이버 카페 글쓰기에서 그대로 붙여넣으면 표로 들어갑니다.');
    } catch (e) {
      try {
        const { plain } = buildCafeCopyPayload(date, sortedRows);
        await navigator.clipboard.writeText(plain);
        alert('HTML 복사는 막혀서 텍스트로 복사했습니다. (브라우저 권한/HTTPS 확인)');
      } catch {
        alert('복사에 실패했습니다. (브라우저 권한/HTTPS 여부 확인)');
      }
    }
  };

  // ✅ 출력
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <ParcelHeader />

        <ParcelNoticeCard date={date} onChangeDate={setDate} />

        <ParcelForm
          studentsAll={studentsAll}
          loadingStudents={loadingStudents}
          errorStudents={errorStudents}
          query={query}
          setQuery={setQuery}
          selectedStudentId={selectedStudentId}
          setSelectedStudentId={setSelectedStudentId}
          quantity={quantity}
          setQuantity={setQuantity}
          nameInputRef={nameInputRef}
          qtyInputRef={qtyInputRef}
          onSelectStudent={handleSelectStudent}
          onAdd={handleAdd}
        />

        <ParcelListCard
          rows={sortedRows}   // ✅ 여기 중요: 정렬된 rows로 렌더링
          loadingRows={loadingRows}
          errorRows={errorRows}
          editingQtyId={editingQtyId}
          editingQtyValue={editingQtyValue}
          setEditingQtyValue={setEditingQtyValue}
          onStartEditQty={startEditQty}
          onCancelEditQty={cancelEditQty}
          onCommitEditQty={commitEditQty}
          onDelete={handleDelete}
          onCopyForCafe={handleCopyForCafe}
          onPrint={handlePrint}
        />

      </div>
    </div>
  );
}
