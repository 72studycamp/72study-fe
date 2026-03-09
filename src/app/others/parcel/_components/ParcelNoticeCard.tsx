// src/app/others/parcel/_components/ParcelNoticeCard.tsx
'use client';

type Props = {
  date: string;
  onChangeDate: (next: string) => void;
};

export default function ParcelNoticeCard({ date, onChangeDate }: Props) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 mb-6">
      <div className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-zinc-700 dark:text-zinc-300">
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">{date} 택배도착</div>
          <div className="text-zinc-600 dark:text-zinc-400">
            교재택배는 바로 전달(강의실 뒷편에서 수령) · 저녁식사/일과종료 후 교무실에서 수령
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-600 dark:text-zinc-400">날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => onChangeDate(e.target.value)}
            className="
              h-10 px-3 text-sm rounded-lg
              border border-zinc-200 dark:border-zinc-700
              bg-white dark:bg-zinc-950
              text-zinc-900 dark:text-zinc-100
              outline-none
              focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
            "
          />
        </div>
      </div>
    </div>
  );
}