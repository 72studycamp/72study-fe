'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStudents } from '@/app/others/parcel/_hooks/useStudents';
import { Student } from '@/types/student';

type ReceptionStatus = '입소' | '퇴소' | '외출' | '외박';

type ItemCheck = {
  reception: ReceptionStatus;
  phoneCount: number;
  watchCount: number;
  secondKit: boolean;
};

const STORAGE_KEY = 'students-reception-check-v1';

function isDropped(status?: string | null) {
  const s = String(status ?? '').trim();
  return s === 'DROPPED' || s === '퇴소';
}

function getActiveAbsence(student: Student) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return student.absences?.find((absence) => {
    const start = new Date(absence.startDate);
    const end = new Date(absence.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return today >= start && today <= end;
  });
}

function inferReceptionStatus(student: Student): ReceptionStatus {
  if (isDropped(student.status)) return '퇴소';
  const active = getActiveAbsence(student);
  if (active?.type === '외박') return '외박';
  if (active?.type === '외출') return '외출';
  return '입소';
}

function formatTeam(team?: string | null) {
  const t = String(team ?? '').trim();
  const match = t.match(/(\d+)/);
  if (!match) return '-';
  return String(Number(match[1])).padStart(2, '0');
}

function parseParentPhone(adminMemo?: string | null) {
  const raw = String(adminMemo ?? '');
  const found = raw.match(/01[0-9]-?\d{3,4}-?\d{4}/);
  return found ? found[0] : '-';
}

function ReceptionTable({
  gender,
  students,
  checks,
  onChange,
}: {
  gender: '남자' | '여자';
  students: Student[];
  checks: Record<string, ItemCheck>;
  onChange: (studentId: string, patch: Partial<ItemCheck>) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/60">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{gender}</h2>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
          {students.length}명
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1080px] w-full text-[13px]">
          <thead className="bg-white dark:bg-zinc-900">
            <tr className="text-left text-zinc-600 dark:text-zinc-300">
              <th className="px-2 py-2">No</th>
              <th className="px-2 py-2">학생명</th>
              <th className="px-2 py-2">학년</th>
              <th className="px-2 py-2">성별</th>
              <th className="px-2 py-2">연락처1(보호자)</th>
              <th className="px-2 py-2">연락처2(학생)</th>
              <th className="px-2 py-2">방배정</th>
              <th className="px-2 py-2">조편성</th>
              <th className="px-2 py-2">접수</th>
              <th className="px-2 py-2">휴대폰</th>
              <th className="px-2 py-2">워치</th>
              <th className="px-2 py-2">2차키트</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {students.map((student, idx) => {
              const serverStatus = inferReceptionStatus(student);
              const check = checks[student.id] ?? {
                reception: serverStatus,
                phoneCount: 0,
                watchCount: 0,
                secondKit: false,
              };
              const status: ReceptionStatus = serverStatus === '입소' ? check.reception : serverStatus;
              const statusLocked = serverStatus !== '입소';
              const statusClass =
                status === '퇴소'
                  ? 'bg-rose-100 text-rose-700'
                  : status === '외출' || status === '외박'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700';

              return (
                <tr key={student.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                  <td className="px-2 py-2 text-zinc-600 dark:text-zinc-300">{idx + 1}</td>
                  <td className="px-2 py-2 font-semibold text-zinc-900 dark:text-zinc-100">{student.name || '-'}</td>
                  <td className="px-2 py-2 text-zinc-700 dark:text-zinc-200">{student.grade || '-'}</td>
                  <td className="px-2 py-2 text-zinc-700 dark:text-zinc-200">{student.gender || '-'}</td>
                  <td className="px-2 py-2 text-zinc-700 dark:text-zinc-200">{parseParentPhone(student.adminMemo)}</td>
                  <td className="px-2 py-2 text-zinc-700 dark:text-zinc-200">{student.studentPhone || '-'}</td>
                  <td className="px-2 py-2 text-zinc-700 dark:text-zinc-200">{student.roomNo ? `${student.roomNo}호` : '-'}</td>
                  <td className="px-2 py-2 text-zinc-700 dark:text-zinc-200">{formatTeam(student.teamNo ?? student.group)}</td>
                  <td className="px-2 py-2">
                    <select
                      value={status}
                      onChange={(e) => onChange(student.id, { reception: e.target.value as ReceptionStatus })}
                      disabled={statusLocked}
                      title={statusLocked ? '학생정보(퇴소/외출·외박) 기준으로 자동 고정됩니다.' : '접수 상태를 선택하세요.'}
                      className={`w-16 rounded-md border px-1.5 py-1 text-xs font-semibold ${statusClass} disabled:cursor-not-allowed disabled:opacity-80`}
                    >
                      {(['입소', '퇴소', '외출', '외박'] as ReceptionStatus[]).map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={check.phoneCount}
                      onChange={(e) => onChange(student.id, { phoneCount: Number(e.target.value) })}
                      className="w-14 rounded-md border border-zinc-300 px-1.5 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                    >
                      {[0, 1, 2, 3].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={check.watchCount}
                      onChange={(e) => onChange(student.id, { watchCount: Number(e.target.value) })}
                      className="w-14 rounded-md border border-zinc-300 px-1.5 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                    >
                      {[0, 1, 2, 3].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <label className="inline-flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={check.secondKit}
                        onChange={(e) => onChange(student.id, { secondKit: e.target.checked })}
                        className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-300">확인</span>
                    </label>
                  </td>
                </tr>
              );
            })}
            {students.length === 0 && (
              <tr>
                <td colSpan={12} className="px-2 py-8 text-center text-zinc-500 dark:text-zinc-400">
                  표시할 학생이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function StudentsReceptionPage() {
  const { studentsAll, loadingStudents, errorStudents } = useStudents();
  const [selectedGender, setSelectedGender] = useState<'남자' | '여자'>('남자');
  const [checks, setChecks] = useState<Record<string, ItemCheck>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw) as Record<string, ItemCheck>;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
  }, [checks]);

  const maleStudents = useMemo(
    () => studentsAll.filter((s) => String(s.gender ?? '').trim() === '남'),
    [studentsAll]
  );
  const femaleStudents = useMemo(
    () => studentsAll.filter((s) => String(s.gender ?? '').trim() === '여'),
    [studentsAll]
  );

  const handleChange = (studentId: string, patch: Partial<ItemCheck>) => {
    const fallbackStudent = studentsAll.find((s) => s.id === studentId);
    setChecks((prev) => ({
      ...prev,
      [studentId]: {
        reception: prev[studentId]?.reception ?? (fallbackStudent ? inferReceptionStatus(fallbackStudent) : '입소'),
        phoneCount: prev[studentId]?.phoneCount ?? 0,
        watchCount: prev[studentId]?.watchCount ?? 0,
        secondKit: prev[studentId]?.secondKit ?? false,
        ...patch,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6">
          <h1 className="mb-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">접수철</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            입퇴소/외출·외박 상태와 휴대폰·워치·2차키트 확인 내역을 관리합니다.
          </p>
        </header>

        {loadingStudents && <div className="text-sm text-zinc-500 dark:text-zinc-400">로딩 중...</div>}
        {errorStudents && <div className="text-sm text-red-600 dark:text-red-300">{errorStudents}</div>}

        {!loadingStudents && !errorStudents && (
          <div className="space-y-4">
            <section className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedGender('남자')}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  selectedGender === '남자'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <div className="text-base font-semibold">남자</div>
                <div className="text-xs opacity-80">남학생 접수 현황</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedGender('여자')}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  selectedGender === '여자'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <div className="text-base font-semibold">여자</div>
                <div className="text-xs opacity-80">여학생 접수 현황</div>
              </button>
            </section>

            <ReceptionTable
              gender={selectedGender}
              students={selectedGender === '남자' ? maleStudents : femaleStudents}
              checks={checks}
              onChange={handleChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
