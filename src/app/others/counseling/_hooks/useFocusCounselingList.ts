// src/app/others/counseling/_hooks/useFocusCounselingList.ts
'use client';

import { useEffect, useState } from 'react';
import { focusCounselingApi } from '@/lib/api';
import { FocusCounselingRow } from '../_utils/counselingTypes';

export function useFocusCounselingList() {
  const [rows, setRows] = useState<FocusCounselingRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [errorRows, setErrorRows] = useState<string | null>(null);

  const fetchRows = async () => {
    try {
      setLoadingRows(true);
      setErrorRows(null);
      const list = await focusCounselingApi.getFocusCounselings();
      const mapped: FocusCounselingRow[] = (list || []).map((item: any) => ({
        campStudentId: Number(item.campStudentId),
        studentName: item.studentName ?? '',
        campus: item.campus ?? undefined,
        teamNo: item.teamNo ?? undefined,
        mentorName: item.mentorName ?? undefined,
        memo: item.memo ?? '',
        updatedAt: item.updatedAt ?? undefined,
      }));
      setRows(mapped);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '집중상담 목록을 불러오는데 실패했습니다.';
      setErrorRows(msg);
      setRows([]);
    } finally {
      setLoadingRows(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    rows,
    setRows,
    loadingRows,
    errorRows,
    refetchRows: fetchRows,
  };
}
