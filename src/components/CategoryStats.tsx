'use client';

import { useState } from 'react';
import { CategoryStats } from '@/types/student';

interface CategoryStatsProps {
  title: string;
  stats: CategoryStats[];
  onCategoryClick?: (category: string, subCategory: string) => void;
}

export default function CategoryStatsTable({
  title,
  stats,
  onCategoryClick,
}: CategoryStatsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {title}별 통계
          </h3>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            {expanded ? '접기' : '펼치기'}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {title === '성별' ? '성별/학년' : title}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  정원
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  편성
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  현재 출석
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  외출/외박
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  비교
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  상세
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {stats.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400"
                  >
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                stats.map((item, index) => {
                  return (
                    <tr
                      key={index}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {title === '성별'
                          ? `${item.category} ${item.subCategory}`
                          : item.subCategory}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-zinc-900 dark:text-zinc-100">
                        {item.quota}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-zinc-900 dark:text-zinc-100">
                        {item.assigned}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600 dark:text-green-400">
                        {item.present}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {item.absent > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            {item.absent}명
                          </span>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-500">
                            0
                          </span>
                        )}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                          item.difference >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {item.difference > 0 ? '+' : ''}
                        {item.difference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() =>
                            onCategoryClick?.(item.category, item.subCategory)
                          }
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          보기
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
