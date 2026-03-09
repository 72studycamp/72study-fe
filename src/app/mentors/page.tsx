import Link from 'next/link';

export default function MentorsHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6">
          <h1 className="mb-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">멘토 관리</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            멘토 정보 조회와 조편성 현황을 확인합니다.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link
            href="/mentors/info"
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">멘토정보</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              멘토별 담당 학생 수, 성비, 학년/과정 분포를 확인합니다.
            </p>
          </Link>

          <Link
            href="/mentors/groups"
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">멘토 조편성</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              조별 멘토 배치와 멘토별 담당 조 현황을 확인합니다.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
