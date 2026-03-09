// src/app/others/health/_hooks/useHealthLogs.ts
'use client';

import { useEffect, useState } from 'react';
import { healthLogApi } from '@/lib/api';
import { HealthLogCategory, HealthLogRow } from '../_utils/healthTypes';

type Params = {
  category: HealthLogCategory;
  date?: string;
};

export function useHealthLogs(params: Params) {
  const [rows, setRows] = useState<HealthLogRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [errorRows, setErrorRows] = useState<string | null>(null);

  const fetchRows = async (p: Params) => {
    try {
      setLoadingRows(true);
      setErrorRows(null);
      const list = await healthLogApi.getAll(p);
      const mapped: HealthLogRow[] = (list || []).map((item: any) => ({
        id: Number(item.id),
        campStudentId: Number(item.campStudentId),
        studentName: item.studentName ?? '',
        campus: item.campus ?? undefined,
        teamNo: item.teamNo ?? undefined,
        mentorName: item.mentorName ?? undefined,
        logDate: item.logDate ?? '',
        category: item.category,
        symptom: item.symptom ?? '',
        actionTaken: item.actionTaken ?? undefined,
        note: item.note ?? undefined,
        firstDetectedDate: item.firstDetectedDate ?? undefined,
        handledBy: item.handledBy ?? undefined,
        createdAt: item.createdAt ?? undefined,
        updatedAt: item.updatedAt ?? undefined,
      }));
      setRows(mapped);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '건강일지 목록을 불러오는데 실패했습니다.';
      setErrorRows(msg);
      setRows([]);
    } finally {
      setLoadingRows(false);
    }
  };

  useEffect(() => {
    fetchRows(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.category, params.date]);

  return {
    rows,
    setRows,
    loadingRows,
    errorRows,
    refetchRows: fetchRows,
  };
}
