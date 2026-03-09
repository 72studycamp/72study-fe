// src/app/others/counseling/_components/FocusCounselingListCard.tsx
'use client';

import { FocusCounselingRow } from '../_utils/counselingTypes';

type Props = {
  rows: FocusCounselingRow[];
  loadingRows: boolean;
  errorRows: string | null;

  editingId: number | null;
  editingMemo: string;
  setEditingMemo: (v: string) => void;

  onStartEdit: (row: FocusCounselingRow) => void;
  onCancelEdit: () => void;
  onCommitEdit: (row: FocusCounselingRow) => void;
  onDelete: (row: FocusCounselingRow) => void;
};

function formatDateTime(value?: string) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('ko-KR');
}

export default function FocusCounselingListCard({
  rows,
  loadingRows,
  errorRows,
  editingId,
  editingMemo,
  setEditingMemo,
  onStartEdit,
  onCancelEdit,
  onCommitEdit,
  onDelete,
}: Props) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          집중상담 목록 ({rows.length}건)
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
              <th className="px-5 py-4">캠퍼스</th>
              <th className="px-5 py-4">조</th>
              <th className="px-5 py-4">학생</th>
              <th className="px-5 py-4">멘토</th>
              <th className="px-5 py-4">메모</th>
              <th className="px-5 py-4">수정일</th>
              <th className="px-5 py-4 text-right">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((row) => (
              <tr
                key={row.campStudentId}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors align-top"
              >
                <td className="px-5 py-4">{row.campus ?? '-'}</td>
                <td className="px-5 py-4">{row.teamNo ?? '-'}</td>
                <td className="px-5 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                  {row.studentName}
                </td>
                <td className="px-5 py-4">{row.mentorName ?? '-'}</td>
                <td className="px-5 py-4 w-[36%]">
                  {editingId === row.campStudentId ? (
                    <textarea
                      value={editingMemo}
                      onChange={(e) => setEditingMemo(e.target.value)}
                      onBlur={() => onCommitEdit(row)}
                      rows={3}
                      className="
                        w-full px-3 py-2 text-sm rounded-lg
                        border border-zinc-200 dark:border-zinc-700
                        bg-white dark:bg-zinc-950
                        text-zinc-900 dark:text-zinc-100
                        outline-none
                        focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                        resize-y
                      "
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => onStartEdit(row)}
                      className="text-left w-full whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200 hover:underline"
                      title="클릭해서 수정"
                    >
                      {row.memo || '-'}
                    </button>
                  )}
                </td>
                <td className="px-5 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                  {formatDateTime(row.updatedAt)}
                </td>
                <td className="px-5 py-4 text-right">
                  {editingId === row.campStudentId ? (
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className="text-sm text-zinc-500 hover:text-zinc-700"
                    >
                      취소
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onDelete(row)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      삭제
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-10 text-center text-zinc-500 dark:text-zinc-400"
                >
                  등록된 집중상담이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
