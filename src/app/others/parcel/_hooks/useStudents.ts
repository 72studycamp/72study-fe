// src/app/others/parcel/_hooks/useStudents.ts
'use client';

import { useEffect, useState } from 'react';
import { studentApi } from '@/lib/api';
import { mapApiStudentToStudent } from '@/lib/studentMapper';
import { Student } from '@/types/student';

export function useStudents() {
  const [studentsAll, setStudentsAll] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [errorStudents, setErrorStudents] = useState<string | null>(null);

  const fetchStudentsAll = async () => {
    try {
      setLoadingStudents(true);
      setErrorStudents(null);
      const apiStudents = await studentApi.getStudents({});
      const mapped = apiStudents.map(mapApiStudentToStudent);
      setStudentsAll(mapped);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '학생 목록을 불러오는데 실패했습니다.';
      setErrorStudents(msg);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudentsAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    studentsAll,
    loadingStudents,
    errorStudents,
    refetchStudents: fetchStudentsAll,
  };
}