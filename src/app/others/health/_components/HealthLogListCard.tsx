// src/app/others/health/_components/HealthLogListCard.tsx
'use client';

import { Fragment } from 'react';
import { HealthLogRow } from '../_utils/healthTypes';

type Props = {
  rows: HealthLogRow[];
  category: 'GENERAL' | 'CONSTIPATION';
  loadingRows: boolean;
  errorRows: string | null;
  onDelete: (row: HealthLogRow) => void;
};

function formatDate(value?: string) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('ko-KR');
}

function formatDateKey(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(0, 10);
}

function formatDateOnly(value?: string) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('ko-KR');
}

export default function HealthLogListCard({
  rows,
  category,
  loadingRows,
  errorRows,
  onDelete,
}: Props) {
  const title = category === 'GENERAL' ? '양호일지 목록' : '변비일지 목록';
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {title} ({rows.length}건)
        </h2>
        {loadingRows && (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">목록 로딩 중...</div>
        )}
      </div>

      {errorRows && (
        <div className="p-4">
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-200">
            {errorRows}
          </div>
        </div>
      )}

      <div className="h-[520px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-950/30 sticky top-0">
            <tr className="text-left text-sm text-zinc-600 dark:text-zinc-400">
              <th className="px-5 py-4">기록일</th>
              <th className="px-5 py-4">조</th>
              <th className="px-5 py-4">학생</th>
              <th className="px-5 py-4">멘토</th>
              <th className="px-5 py-4">증상</th>
              <th className="px-5 py-4">조치</th>
              <th className="px-5 py-4">비고</th>
              <th className="px-5 py-4">최초 발견일</th>
              <th className="px-5 py-4">담당</th>
              <th className="px-5 py-4">수정일</th>
              <th className="px-5 py-4 text-right">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((row, index) => {
              const currentKey = formatDateKey(row.logDate);
              const prevKey = index > 0 ? formatDateKey(rows[index - 1].logDate) : null;
              const showDivider = index === 0 || currentKey !== prevKey;

              return (
                <Fragment key={row.id}>
                  {showDivider && (
                    <tr>
                      <td colSpan={11} className="px-5 pt-6 pb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                            {formatDate(row.logDate)}
                          </span>
                          <div className="h-[2px] flex-1 bg-blue-200 dark:bg-zinc-800"></div>
                        </div>
                      </td>
                    </tr>
                  )}
                  <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors align-top">
                    <td className="px-5 py-4 text-sm">{formatDate(row.logDate)}</td>
                    <td className="px-5 py-4">{row.teamNo ?? '-'}</td>
                    <td className="px-5 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                      {row.studentName}
                    </td>
                    <td className="px-5 py-4">{row.mentorName ?? '-'}</td>
                    <td className="px-5 py-4 whitespace-pre-wrap text-sm">{row.symptom || '-'}</td>
                    <td className="px-5 py-4 whitespace-pre-wrap text-sm">{row.actionTaken || '-'}</td>
                    <td className="px-5 py-4 whitespace-pre-wrap text-sm">{row.note || '-'}</td>
                    <td className="px-5 py-4 text-sm">{formatDate(row.firstDetectedDate)}</td>
                    <td className="px-5 py-4 text-sm">{row.handledBy || '-'}</td>
                    <td className="px-5 py-4 text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDateOnly(row.updatedAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDelete(row)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                </Fragment>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={12}
                  className="px-5 py-10 text-center text-zinc-500 dark:text-zinc-400"
                >
                  등록된 건강일지가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
