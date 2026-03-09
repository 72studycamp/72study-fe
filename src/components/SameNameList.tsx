'use client';

import { SameNamePerson } from '@/types/student';

interface SameNameListProps {
  sameNames: SameNamePerson[];
}

export default function SameNameList({ sameNames }: SameNameListProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          동명이인 ({sameNames.length}명)
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                위치/소속
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {sameNames.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400"
                >
                  동명이인이 없습니다.
                </td>
              </tr>
            ) : (
              sameNames.map((person) => (
                <tr
                  key={person.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {person.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                    {person.location}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


