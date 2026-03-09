// src/app/others/counseling/_components/FocusCounselingHeader.tsx
'use client';

export default function FocusCounselingHeader() {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
        집중상담
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        학생을 선택하고 상담 메모를 입력하면 집중상담 기록으로 저장됩니다.
      </p>
    </div>
  );
}
