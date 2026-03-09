'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStudents } from '@/app/others/parcel/_hooks/useStudents';
import { lectureHallFromStudent } from '@/lib/lectureHall';

type SeatValue = {
  name: string;
  room: string;
};

type Block = {
  id: string;
  x: number;
  y: number;
  rows: number;
  cols: number;
};

type MentorTag = {
  label: string;
  name: string;
  x: number;
  y: number;
};

type HallTemplate = {
  id: string;
  title: string;
  seatCount: number;
  canvasHeight: number;
  blocks: Block[];
  mentorTop: MentorTag[];
  mentorBottom: MentorTag[];
};

const STORAGE_KEY = 'seat-plan-sheet-v2';
const MENTOR_STORAGE_KEY = 'seat-plan-mentor-sheet-v1';

type ActiveTarget =
  | { type: 'student'; hallId: string; seatIndex: number }
  | { type: 'mentor'; hallId: string; slot: 'top' | 'bottom'; index: number };

type MentorAssignments = Record<string, { top: string[]; bottom: string[] }>;

const HALL_TEMPLATES: HallTemplate[] = [
  {
    id: '1',
    title: '1강의장',
    seatCount: 90,
    canvasHeight: 720,
    blocks: [
      { id: '1-a', x: 110, y: 120, rows: 8, cols: 1 },
      { id: '1-b', x: 280, y: 120, rows: 8, cols: 2 },
      { id: '1-c', x: 600, y: 120, rows: 8, cols: 2 },
      { id: '1-d', x: 920, y: 120, rows: 8, cols: 2 },
      { id: '1-e', x: 1240, y: 120, rows: 8, cols: 1 },
      { id: '1-f', x: 280, y: 430, rows: 4, cols: 2 },
      { id: '1-g', x: 600, y: 430, rows: 4, cols: 2 },
      { id: '1-h', x: 920, y: 430, rows: 4, cols: 2 },
    ],
    mentorTop: [
      { label: '멘토7', name: '', x: 110, y: 70 },
      { label: '멘토8', name: '', x: 1280, y: 70 },
    ],
    mentorBottom: [
      { label: '멘토9', name: '', x: 110, y: 680 },
      { label: '멘토10', name: '', x: 320, y: 680 },
      { label: '멘토11', name: '', x: 1280, y: 680 },
    ],
  },
  {
    id: '2',
    title: '2강의장',
    seatCount: 75,
    canvasHeight: 700,
    blocks: [
      { id: '2-a', x: 110, y: 110, rows: 5, cols: 1 },
      { id: '2-b', x: 300, y: 110, rows: 6, cols: 2 },
      { id: '2-c', x: 640, y: 110, rows: 6, cols: 2 },
      { id: '2-d', x: 980, y: 110, rows: 5, cols: 1 },
      { id: '2-e', x: 110, y: 300, rows: 5, cols: 1 },
      { id: '2-f', x: 300, y: 330, rows: 6, cols: 2 },
      { id: '2-g', x: 640, y: 330, rows: 6, cols: 2 },
      { id: '2-h', x: 980, y: 330, rows: 5, cols: 1 },
    ],
    mentorTop: [
      { label: '멘토12', name: '', x: 120, y: 70 },
      { label: '멘토13', name: '', x: 1280, y: 70 },
    ],
    mentorBottom: [
      { label: '멘토14', name: '', x: 110, y: 650 },
      { label: '멘토15', name: '', x: 280, y: 650 },
      { label: '멘토16', name: '', x: 450, y: 650 },
      { label: '멘토17', name: '', x: 620, y: 650 },
      { label: '멘토20', name: '', x: 790, y: 650 },
      { label: '멘토19', name: '', x: 960, y: 650 },
      { label: '멘토18', name: '', x: 1130, y: 650 },
    ],
  },
  {
    id: '5',
    title: '5강의장',
    seatCount: 50,
    canvasHeight: 610,
    blocks: [
      { id: '5-a', x: 220, y: 110, rows: 4, cols: 1 },
      { id: '5-b', x: 440, y: 110, rows: 4, cols: 2 },
      { id: '5-c', x: 810, y: 110, rows: 4, cols: 1 },
      { id: '5-d', x: 1030, y: 110, rows: 4, cols: 1 },
      { id: '5-e', x: 220, y: 300, rows: 6, cols: 1 },
      { id: '5-f', x: 440, y: 300, rows: 6, cols: 2 },
      { id: '5-g', x: 810, y: 300, rows: 6, cols: 1 },
      { id: '5-h', x: 1030, y: 300, rows: 6, cols: 1 },
    ],
    mentorTop: [],
    mentorBottom: [
      { label: '멘토22', name: '', x: 120, y: 560 },
      { label: '멘토25', name: '', x: 295, y: 560 },
      { label: '멘토26', name: '', x: 470, y: 560 },
      { label: '멘토21', name: '', x: 810, y: 560 },
      { label: '멘토24', name: '', x: 985, y: 560 },
      { label: '멘토23', name: '', x: 1160, y: 560 },
    ],
  },
  {
    id: '6',
    title: '6강의장',
    seatCount: 40,
    canvasHeight: 500,
    blocks: [
      { id: '6-a', x: 110, y: 100, rows: 4, cols: 1 },
      { id: '6-b', x: 330, y: 100, rows: 4, cols: 2 },
      { id: '6-c', x: 700, y: 100, rows: 4, cols: 1 },
      { id: '6-d', x: 920, y: 100, rows: 4, cols: 1 },
      { id: '6-e', x: 110, y: 260, rows: 4, cols: 1 },
      { id: '6-f', x: 330, y: 260, rows: 4, cols: 2 },
      { id: '6-g', x: 700, y: 260, rows: 4, cols: 1 },
      { id: '6-h', x: 920, y: 260, rows: 4, cols: 1 },
    ],
    mentorTop: [],
    mentorBottom: [
      { label: '멘토30', name: '', x: 120, y: 460 },
      { label: '멘토28', name: '', x: 350, y: 460 },
      { label: '멘토29', name: '', x: 580, y: 460 },
      { label: '멘토27', name: '', x: 810, y: 460 },
      { label: '멘토31', name: '', x: 1040, y: 460 },
    ],
  },
];

type Assignments = Record<string, SeatValue[]>;

function emptyAssignments(): Assignments {
  return Object.fromEntries(
    HALL_TEMPLATES.map((hall) => [
      hall.id,
      Array.from({ length: hall.seatCount }, () => ({ name: '', room: '' })),
    ])
  );
}

function emptyMentorAssignments(): MentorAssignments {
  return Object.fromEntries(
    HALL_TEMPLATES.map((hall) => [
      hall.id,
      {
        top: Array.from({ length: hall.mentorTop.length }, () => ''),
        bottom: Array.from({ length: hall.mentorBottom.length }, () => ''),
      },
    ])
  );
}

function hallIdByName(name?: string | null): string | null {
  const t = String(name ?? '').trim();
  const m = t.match(/^([1256])강의장$/);
  return m ? m[1] : null;
}

function normalizeMentor(v?: string | null) {
  const t = String(v ?? '').trim();
  return t || '미지정';
}

export default function SeatingPage() {
  const { studentsAll, loadingStudents, errorStudents } = useStudents();
  const [selectedHallId, setSelectedHallId] = useState<string>('1');
  const [activeTarget, setActiveTarget] = useState<ActiveTarget | null>(null);
  const [assignments, setAssignments] = useState<Assignments>(() => {
    if (typeof window === 'undefined') return emptyAssignments();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyAssignments();
      const parsed = JSON.parse(raw) as Assignments;
      const fallback = emptyAssignments();
      return {
        ...fallback,
        ...Object.fromEntries(
          HALL_TEMPLATES.map((h) => [
            h.id,
            Array.from({ length: h.seatCount }, (_, idx) => {
              const cell = parsed?.[h.id]?.[idx];
              return { name: String(cell?.name ?? ''), room: String(cell?.room ?? '') };
            }),
          ])
        ),
      };
    } catch {
      return emptyAssignments();
    }
  });
  const [mentorAssignments, setMentorAssignments] = useState<MentorAssignments>(() => {
    if (typeof window === 'undefined') return emptyMentorAssignments();
    try {
      const raw = window.localStorage.getItem(MENTOR_STORAGE_KEY);
      if (!raw) return emptyMentorAssignments();
      const parsed = JSON.parse(raw) as MentorAssignments;
      const fallback = emptyMentorAssignments();
      return Object.fromEntries(
        HALL_TEMPLATES.map((hall) => [
          hall.id,
          {
            top: Array.from(
              { length: hall.mentorTop.length },
              (_, idx) => String(parsed?.[hall.id]?.top?.[idx] ?? fallback[hall.id].top[idx] ?? '')
            ),
            bottom: Array.from(
              { length: hall.mentorBottom.length },
              (_, idx) => String(parsed?.[hall.id]?.bottom?.[idx] ?? fallback[hall.id].bottom[idx] ?? '')
            ),
          },
        ])
      );
    } catch {
      return emptyMentorAssignments();
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  }, [assignments]);
  useEffect(() => {
    window.localStorage.setItem(MENTOR_STORAGE_KEY, JSON.stringify(mentorAssignments));
  }, [mentorAssignments]);

  const studentsByHall = useMemo(() => {
    const grouped: Record<string, Array<{ name: string; room: string; mentor: string }>> = {
      '1': [],
      '2': [],
      '5': [],
      '6': [],
    };
    studentsAll.forEach((student) => {
      const hall = hallIdByName(lectureHallFromStudent(student));
      if (!hall) return;
      const name = String(student.name ?? '').trim();
      if (!name) return;
      grouped[hall].push({
        name,
        room: String(student.roomNo ?? '').trim(),
        mentor: normalizeMentor(student.mentor),
      });
    });
    return grouped;
  }, [studentsAll]);

  const selectedHall = HALL_TEMPLATES.find((h) => h.id === selectedHallId) ?? HALL_TEMPLATES[0];
  const selectedSeats = useMemo(
    () => assignments[selectedHall.id] ?? [],
    [assignments, selectedHall.id]
  );

  const hallMentors = useMemo(() => {
    const map = new Map<string, number>();
    (studentsByHall[selectedHall.id] ?? []).forEach((s) => {
      map.set(s.mentor, (map.get(s.mentor) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [selectedHall.id, studentsByHall]);

  const assignedMentors = useMemo(() => {
    const current = mentorAssignments[selectedHall.id] ?? { top: [], bottom: [] };
    return [...current.top, ...current.bottom].filter((v) => String(v).trim().length > 0);
  }, [mentorAssignments, selectedHall.id]);

  const unassignedMentors = useMemo(() => {
    const assignedSet = new Set(assignedMentors);
    return hallMentors.filter((name) => !assignedSet.has(name));
  }, [assignedMentors, hallMentors]);

  const unassignedStudents = useMemo(() => {
    const source = studentsByHall[selectedHall.id] ?? [];
    const usedCount = new Map<string, number>();
    selectedSeats.forEach((seat) => {
      const name = String(seat.name ?? '').trim();
      if (!name) return;
      usedCount.set(name, (usedCount.get(name) ?? 0) + 1);
    });
    return source
      .map((s) => ({ ...s }))
      .filter((s) => {
        const left = usedCount.get(s.name) ?? 0;
        if (left <= 0) return true;
        usedCount.set(s.name, left - 1);
        return false;
      });
  }, [selectedHall.id, selectedSeats, studentsByHall]);

  const updateSeat = (seatIndex: number, patch: Partial<SeatValue>) => {
    setAssignments((prev) => ({
      ...prev,
      [selectedHall.id]: (prev[selectedHall.id] ?? []).map((cell, idx) =>
        idx === seatIndex ? { ...cell, ...patch } : cell
      ),
    }));
  };

  const assignMentor = (slot: 'top' | 'bottom', index: number, name: string) => {
    setMentorAssignments((prev) => {
      const hall = prev[selectedHall.id] ?? { top: [], bottom: [] };
      const nextSlot = [...(hall[slot] ?? [])];
      nextSlot[index] = name;
      return {
        ...prev,
        [selectedHall.id]: { ...hall, [slot]: nextSlot },
      };
    });
  };

  const clearMentor = (slot: 'top' | 'bottom', index: number) => assignMentor(slot, index, '');

  const autoFill = () => {
    const source = studentsByHall[selectedHall.id] ?? [];
    setAssignments((prev) => ({
      ...prev,
      [selectedHall.id]: Array.from({ length: selectedHall.seatCount }, (_, idx) => ({
        name: source[idx]?.name ?? '',
        room: source[idx]?.room ?? '',
      })),
    }));
  };

  const clearHall = () => {
    setAssignments((prev) => ({
      ...prev,
      [selectedHall.id]: Array.from({ length: selectedHall.seatCount }, () => ({ name: '', room: '' })),
    }));
  };

  const mentorPalette = [
    'bg-blue-600',
    'bg-red-500',
    'bg-emerald-600',
    'bg-orange-500',
    'bg-indigo-600',
    'bg-pink-600',
    'bg-cyan-600',
    'bg-amber-600',
  ];

  const assignedCount = selectedSeats.filter((v) => v.name.trim()).length;

  const blockRanges = useMemo(() => {
    return selectedHall.blocks.reduce<{
      ranges: Array<{ blockId: string; start: number; count: number }>;
      cursor: number;
    }>(
      (acc, block) => {
        const count = block.rows * block.cols;
        const next = {
          blockId: block.id,
          start: acc.cursor,
          count,
        };
        return {
          ranges: [...acc.ranges, next],
          cursor: acc.cursor + count,
        };
      },
      { ranges: [], cursor: 0 }
    ).ranges;
  }, [selectedHall.blocks]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto max-w-[1500px] px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">좌석배치</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            시트형 좌석배치표. 셀 클릭 후 우측에서 이름/호수를 수정하세요.
          </p>
        </header>

        {loadingStudents && <div className="text-sm text-zinc-500 dark:text-zinc-400">학생 로딩 중...</div>}
        {errorStudents && <div className="text-sm text-red-600 dark:text-red-300">{errorStudents}</div>}

        <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {HALL_TEMPLATES.map((hall) => {
            const count = assignments[hall.id]?.filter((v) => v.name.trim()).length ?? 0;
            return (
              <button
                key={hall.id}
                type="button"
                onClick={() => setSelectedHallId(hall.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  selectedHallId === hall.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-zinc-200 bg-white hover:bg-zinc-50'
                }`}
              >
                <div className="text-sm font-semibold text-zinc-900">{hall.title}</div>
                <div className="text-xs text-zinc-500">
                  {count}/{hall.seatCount}
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px]">
          <section className="overflow-auto rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-zinc-700">
                {selectedHall.title} · 편성 {assignedCount}/{selectedHall.seatCount}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={autoFill}
                  className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                >
                  자동채우기
                </button>
                <button
                  type="button"
                  onClick={clearHall}
                  className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  전체비우기
                </button>
              </div>
            </div>

            <div
              className="relative min-w-[1600px] rounded-lg border border-zinc-300 bg-white"
              style={{
                height: selectedHall.canvasHeight,
                backgroundImage:
                  'linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)',
                backgroundSize: '42px 28px',
              }}
            >
              <div className="absolute left-4 top-4 text-sm font-semibold text-zinc-900">
                야자신청 <span className="ml-8">월</span>
                <span className="ml-10">일 *본인 이름 밑 박스에 체크하세요.</span>
              </div>

              <div
                className="absolute left-0 w-[74px] border-r border-zinc-700"
                style={{ top: 66, height: 'calc(100% - 66px)' }}
              >
                <div className="border-b border-zinc-700 px-2 py-2 text-xl font-bold text-zinc-900">
                  {selectedHall.title}
                </div>
              </div>

              {selectedHall.mentorTop.map((mentor, idx) => (
                <button
                  key={`top-${idx}`}
                  type="button"
                  className="absolute flex items-center text-xs"
                  style={{ left: mentor.x, top: mentor.y }}
                  onClick={() =>
                    setActiveTarget({ type: 'mentor', hallId: selectedHall.id, slot: 'top', index: idx })
                  }
                >
                  <span className={`px-2 py-1 font-semibold text-white ${mentorPalette[idx % mentorPalette.length]}`}>
                    {mentor.label}
                  </span>
                  <span className="border border-zinc-700 bg-white px-2 py-1 font-semibold">
                    {mentorAssignments[selectedHall.id]?.top?.[idx] || hallMentors[idx] || mentor.name || '-'}
                  </span>
                </button>
              ))}

              {selectedHall.blocks.map((block) => {
                const range = blockRanges.find((v) => v.blockId === block.id);
                const start = range?.start ?? 0;
                const count = range?.count ?? 0;
                const cells = selectedSeats.slice(start, start + count);
                return (
                  <div
                    key={block.id}
                    className="absolute border border-zinc-700 bg-white"
                    style={{ left: block.x, top: block.y }}
                  >
                    <div
                      className="grid"
                      style={{ gridTemplateColumns: `repeat(${block.cols}, 150px)` }}
                    >
                      {Array.from({ length: block.rows * block.cols }, (_, i) => {
                        const seatIndex = start + i;
                        const seat = cells[i] ?? { name: '', room: '' };
                        const isActive =
                          activeTarget?.type === 'student' &&
                          activeTarget.hallId === selectedHall.id &&
                          activeTarget.seatIndex === seatIndex;
                        return (
                          <button
                            key={`${block.id}-${i}`}
                            type="button"
                            onClick={() => setActiveTarget({ type: 'student', hallId: selectedHall.id, seatIndex })}
                            className={`grid h-20 grid-cols-[1fr_52px] border-r border-b border-zinc-700 text-left text-[11px] ${
                              isActive
                                ? 'ring-1 ring-blue-400'
                                : ''
                            }`}
                          >
                            <span
                              className={`truncate px-2 py-1 text-zinc-900 ${
                                seat.name.trim() ? 'bg-lime-100' : 'bg-white'
                              }`}
                            >
                              {seat.name}
                            </span>
                            <span
                              className={`border-l border-zinc-700 px-1 py-1 text-center text-zinc-700 ${
                                seat.name.trim() ? 'bg-lime-100' : 'bg-white'
                              }`}
                            >
                              {seat.room ? `${seat.room}호` : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {selectedHall.mentorBottom.map((mentor, idx) => (
                <button
                  key={`bot-${idx}`}
                  className="absolute flex items-center text-xs"
                  style={{ left: mentor.x, top: mentor.y }}
                  type="button"
                  onClick={() =>
                    setActiveTarget({ type: 'mentor', hallId: selectedHall.id, slot: 'bottom', index: idx })
                  }
                >
                  <span
                    className={`px-2 py-1 font-semibold text-white ${
                      mentorPalette[(idx + selectedHall.mentorTop.length) % mentorPalette.length]
                    }`}
                  >
                    {mentor.label}
                  </span>
                  <span className="border border-zinc-700 bg-white px-2 py-1 font-semibold">
                    {mentorAssignments[selectedHall.id]?.bottom?.[idx] ||
                      hallMentors[selectedHall.mentorTop.length + idx] ||
                      mentor.name ||
                      '-'}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <aside className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900">배치 편집</h3>
            {!activeTarget || activeTarget.hallId !== selectedHall.id ? (
              <p className="mt-3 text-xs text-zinc-500">학생 셀 또는 멘토 칩을 클릭하세요.</p>
            ) : activeTarget.type === 'student' ? (
              <div className="mt-3 space-y-2">
                <div className="text-xs text-zinc-500">학생 좌석 #{activeTarget.seatIndex + 1}</div>
                <input
                  value={selectedSeats[activeTarget.seatIndex]?.name ?? ''}
                  onChange={(e) => updateSeat(activeTarget.seatIndex, { name: e.target.value })}
                  placeholder="학생 이름"
                  className="h-9 w-full rounded-md border border-zinc-300 px-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <input
                  value={selectedSeats[activeTarget.seatIndex]?.room ?? ''}
                  onChange={(e) => updateSeat(activeTarget.seatIndex, { room: e.target.value })}
                  placeholder="호수(예: 603)"
                  className="h-9 w-full rounded-md border border-zinc-300 px-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <div className="pt-2 text-xs font-semibold text-zinc-600">미배치 학생</div>
                <div className="max-h-60 space-y-1 overflow-y-auto">
                  {unassignedStudents.map((s, idx) => (
                    <button
                      key={`${s.name}-${idx}`}
                      type="button"
                      onClick={() =>
                        updateSeat(activeTarget.seatIndex, { name: s.name, room: s.room || '' })
                      }
                      className="w-full rounded-md border border-zinc-200 px-2 py-1.5 text-left text-xs hover:bg-zinc-50"
                    >
                      {s.name} {s.room ? `${s.room}호` : ''}
                    </button>
                  ))}
                  {unassignedStudents.length === 0 && (
                    <div className="text-xs text-zinc-400">미배치 학생 없음</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <div className="text-xs text-zinc-500">
                  멘토 자리 {activeTarget.slot === 'top' ? '상단' : '하단'} #{activeTarget.index + 1}
                </div>
                <div className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs">
                  현재: {mentorAssignments[selectedHall.id]?.[activeTarget.slot]?.[activeTarget.index] || '-'}
                </div>
                <button
                  type="button"
                  onClick={() => clearMentor(activeTarget.slot, activeTarget.index)}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50"
                >
                  멘토 배치 해제
                </button>
                <div className="pt-2 text-xs font-semibold text-zinc-600">미배치 멘토</div>
                <div className="max-h-72 space-y-1 overflow-y-auto">
                  {unassignedMentors.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => assignMentor(activeTarget.slot, activeTarget.index, name)}
                      className="w-full rounded-md border border-zinc-200 px-2 py-1.5 text-left text-xs hover:bg-zinc-50"
                    >
                      {name}
                    </button>
                  ))}
                  {unassignedMentors.length === 0 && (
                    <div className="text-xs text-zinc-400">미배치 멘토 없음</div>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
