// src/app/others/parcel/_components/ParcelHeader.tsx
'use client';

export default function ParcelHeader() {
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">택배관리</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        이름 입력 → Enter(첫 후보 선택) → 개수 Enter(추가)
      </p>
    </header>
  );
}