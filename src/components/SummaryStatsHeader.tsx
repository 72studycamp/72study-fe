'use client';
import { SummaryStats as SummaryStatsType } from '@/types/student';

export default function SummaryStatsHeader({ stats }: { stats: SummaryStatsType }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
      <div className="bg-blue-50 rounded-xl p-4">
        <div className="text-xs text-zinc-600">편성</div>
        <div className="text-2xl font-extrabold tracking-tight">
          {stats.totalAssigned}
        </div>
      </div>

      <div className="bg-emerald-50 rounded-xl p-4">
        <div className="text-xs text-zinc-600">현인원</div>
        <div className="text-2xl font-extrabold tracking-tight">
          {stats.totalPresent}
        </div>
      </div>

      <div className="bg-amber-50 rounded-xl p-4">
        <div className="text-xs text-zinc-600">외출/외박</div>
        <div className="text-2xl font-extrabold tracking-tight">
          {stats.totalAbsent}
        </div>
      </div>

      <div className="bg-rose-50 rounded-xl p-4">
        <div className="text-xs text-zinc-600">퇴소</div>
        <div className="text-2xl font-extrabold tracking-tight">
          {stats.totalDropped}
        </div>
      </div>
    </div>
  );
}
