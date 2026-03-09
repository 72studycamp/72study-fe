'use client';

type Row = Record<string, unknown>;

type Props = {
  rows: Row[];
  onRowClick?: (row: Row) => void;
};

const PRIORITY_COLUMNS = [
  'id',
  'campus',
  'studentName',
  'status',
  'gender',
  'course',
  'grade',
  'teamNo',
  'roomNo',
  'mentorName',
  'studentPhone',
  'birthDate',
  'dropoutDate',
  'lectureHall',
  'adminMemo',
];

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    const t = String(value).trim();
    return t.length > 0 ? t : '-';
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export default function StudentRawDataTable({ rows, onRowClick }: Props) {
  const keySet = new Set<string>();
  rows.forEach((row) => {
    Object.keys(row).forEach((k) => keySet.add(k));
  });

  const rest = [...keySet].filter((k) => !PRIORITY_COLUMNS.includes(k)).sort((a, b) => a.localeCompare(b));
  const columns = [...PRIORITY_COLUMNS.filter((k) => keySet.has(k)), ...rest];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          전체 학생 원본 데이터 ({rows.length}건)
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1700px] w-full text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr className="text-left text-zinc-700 dark:text-zinc-200">
              {columns.map((column) => (
                <th key={column} className="whitespace-nowrap px-2 py-2 font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((row, idx) => (
              <tr
                key={String(row.id ?? idx)}
                className={`text-zinc-800 dark:text-zinc-100 ${
                  onRowClick ? 'cursor-pointer hover:bg-blue-50/60 dark:hover:bg-zinc-800/60' : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={`${idx}-${column}`} className="px-2 py-2 align-top break-words">
                    {stringifyValue(row[column])}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={Math.max(columns.length, 1)}
                  className="px-2 py-8 text-center text-zinc-500 dark:text-zinc-400"
                >
                  표시할 원본 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
