// src/app/others/health/_components/HealthLogHeader.tsx
'use client';

export default function HealthLogHeader() {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
        건강관리
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        양호일지와 변비일지를 학생별로 기록하고 관리합니다.
      </p>
    </div>
  );
}
