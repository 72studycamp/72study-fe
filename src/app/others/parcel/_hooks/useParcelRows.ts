// src/app/others/parcel/_hooks/useParcelRows.ts
'use client';

import { useEffect, useState } from 'react';
import { ParcelRow } from '../_utils/parcelTypes';
import { parcelApi } from '@/lib/api';

export function useParcelRows(date: string) {
  const [rows, setRows] = useState<ParcelRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [errorRows, setErrorRows] = useState<string | null>(null);

  const fetchParcelRows = async (d: string) => {
    try {
      setLoadingRows(true);
      setErrorRows(null);

      const list = await parcelApi.getParcels({ date: d });
      // 백엔드 ParcelListResponse를 ParcelRow 형식으로 변환
      // 백엔드 응답: {id, receivedDate, campStudentId, studentName, count}
      const mappedRows: ParcelRow[] = (list || []).map((item: any) => ({
        id: String(item.id || Date.now()),
        date: item.receivedDate || d, // LocalDate → YYYY-MM-DD 문자열
        studentId: String(item.campStudentId || ''),
        studentName: item.studentName || '',
        teamNo: item.teamNo, // 백엔드 응답에 없을 수 있음
        grade: item.grade, // 백엔드 응답에 없을 수 있음
        gender: item.gender, // 백엔드 응답에 없을 수 있음
        quantity: item.count || 1,
        roomNo: item.roomNo ? String(item.roomNo) : undefined, // 백엔드 응답에 없을 수 있음
        lectureHall: item.lectureHall, // 백엔드 응답에 없을 수 있음
      }));
      setRows(mappedRows);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '택배 목록을 불러오는데 실패했습니다.';
      setErrorRows(msg);
      setRows([]); // 에러 시 빈 배열
    } finally {
      setLoadingRows(false);
    }
  };

  useEffect(() => {
    fetchParcelRows(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  return {
    rows,
    setRows,
    loadingRows,
    errorRows,
    refetchRows: fetchParcelRows,
  };
}