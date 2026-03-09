// src/app/others/parcel/_components/ParcelListCard.tsx
'use client';

import { ParcelRow } from '../_utils/parcelTypes';
import { normalizeGender } from '../_utils/cafeExport';

type Props = {
  rows: ParcelRow[];
  loadingRows: boolean;
  errorRows: string | null;

  editingQtyId: string | null;
  editingQtyValue: string;
  setEditingQtyValue: (v: string) => void;

  onStartEditQty: (row: ParcelRow) => void;
  onCancelEditQty: () => void;
  onCommitEditQty: (row: ParcelRow) => void;

  onDelete: (row: ParcelRow) => void;

  onCopyForCafe: () => void;
  onPrint: () => void;
};

export default function ParcelListCard({
  rows,
  loadingRows,
  errorRows,
  editingQtyId,
  editingQtyValue,
  setEditingQtyValue,
  onStartEditQty,
  onCancelEditQty,
  onCommitEditQty,
  onDelete,
  onCopyForCafe,
  onPrint,
}: Props) {
  return (
    <div
      id="print-area"
      className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800"
    >
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          택배 목록 ({rows.length}건)
        </h2>

        <div className="flex items-center gap-2">
          {loadingRows && (
            <div className="text-sm text-zinc-500 dark:text-zinc-400">목록 로딩 중...</div>
          )}

          <button
            type="button"
            onClick={onCopyForCafe}
            className="h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm
                       bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100
                       hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            카페용 복사
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="h-9 px-3 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            출력
          </button>
        </div>
      </div>

      {errorRows && (
        <div className="p-4">
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-200">
            {errorRows}
          </div>
        </div>
      )}

      <div className="h-[420px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-950/30 sticky top-0">
            <tr className="text-left text-sm text-zinc-600 dark:text-zinc-400">
              <th className="px-6 py-4">구분</th>
              <th className="px-6 py-4">조</th>
              <th className="px-6 py-4">학년</th>
              <th className="px-6 py-4">성명</th>
              <th className="px-6 py-4">성별</th>
              <th className="px-6 py-4">개수</th>
              <th className="px-6 py-4">방호수</th>
              <th className="px-6 py-4">강의실</th>
              <th className="px-6 py-4 text-right">작업</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((r, idx) => (
              <tr
                key={r.id}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <td className="px-6 py-4">{idx + 1}</td>
                <td className="px-6 py-4">{r.teamNo ?? '-'}</td>
                <td className="px-6 py-4">{r.grade ?? '-'}</td>
                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                  {r.studentName}
                </td>
                <td className="px-6 py-4">{normalizeGender(r.gender) || '-'}</td>

                <td className="px-6 py-4">
                  {editingQtyId === r.id ? (
                    <input
                      type="number"
                      min={1}
                      value={editingQtyValue}
                      onChange={(e) => setEditingQtyValue(e.target.value)}
                      onBlur={() => onCommitEditQty(r)}
                      onKeyDown={(e) => {
                        if ((e.nativeEvent as any).isComposing) return;

                        if (e.key === 'Enter') {
                          e.preventDefault();
                          onCommitEditQty(r);
                        }
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          onCancelEditQty();
                        }
                      }}
                      autoFocus
                      className="
                        h-9 w-20 px-2 text-sm rounded-md
                        border border-zinc-200 dark:border-zinc-700
                        bg-white dark:bg-zinc-950
                        text-zinc-900 dark:text-zinc-100
                        outline-none
                        focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                      "
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => onStartEditQty(r)}
                      className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
                      title="클릭해서 수정"
                    >
                      {r.quantity}
                    </button>
                  )}
                </td>

                <td className="px-6 py-4">{r.roomNo ? `${r.roomNo}호` : '-'}</td>
                <td className="px-6 py-4">{r.lectureHall ?? '-'}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onDelete(r)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-10 text-center text-zinc-500 dark:text-zinc-400">
                  등록된 택배가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
