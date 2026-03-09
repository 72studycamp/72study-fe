// src/app/others/room-assignment/_components/RoomAssignmentTable.tsx
'use client';

import { useMemo, useState } from 'react';
import { Student } from '@/types/student';
import { RoomAssignment, RoomInfo } from '../_utils/roomTypes';

type Props = {
  rooms: RoomInfo[];
  assignmentsByRoom: Record<string, RoomAssignment[]>;
  studentsAll: Student[];
  loading: boolean;
  onSelectSlot: (payload: {
    roomNo: string;
    slotNo: number;
    studentId: string | null;
    studentName: string | null;
    note: string | null;
    hasAssignment: boolean;
  }) => void;
};

type SlotRow = {
  slotNo: number;
  studentId: string | null;
  name: string;
  grade: string;
  gender: string;
  teamNo: string;
  mentor: string;
  note: string | null;
  hasAssignment: boolean;
};

function parseRoomNo(roomNo: string) {
  const num = Number(roomNo.replace(/[^\d]/g, ''));
  return Number.isNaN(num) ? 0 : num;
}

function getFloor(room: RoomInfo) {
  if (typeof room.floor === 'number') return room.floor;
  const num = parseRoomNo(room.roomNo);
  return num ? Math.floor(num / 100) : 0;
}

export default function RoomAssignmentTable({
  rooms,
  assignmentsByRoom,
  studentsAll,
  loading,
  onSelectSlot,
}: Props) {
  const [openFloors, setOpenFloors] = useState<Record<number, boolean>>({
    4: false,
    5: false,
    6: false,
  });

  const studentsById = useMemo(() => {
    const map = new Map<string, Student>();
    studentsAll.forEach((s) => map.set(String(s.id), s));
    return map;
  }, [studentsAll]);

  const assignedStudentIdsAll = useMemo(() => {
    const set = new Set<string>();
    Object.values(assignmentsByRoom).forEach((list) => {
      list.forEach((a) => set.add(String(a.campStudentId)));
    });
    return set;
  }, [assignmentsByRoom]);

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => parseRoomNo(a.roomNo) - parseRoomNo(b.roomNo));
  }, [rooms]);

  const buildSlots = (room: RoomInfo): SlotRow[] => {
    const assignments = assignmentsByRoom[room.roomNo] || [];
    const bySlot = new Map<number, RoomAssignment>();
    assignments.forEach((a) => bySlot.set(a.slotNo, a));

    const inferredStudents = studentsAll
      .filter(
        (s) =>
          String(s.roomNo ?? '') === room.roomNo &&
          !assignedStudentIdsAll.has(String(s.id))
      )
      .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'ko'));

    const maxSlot = Math.max(
      room.capacity || 0,
      ...assignments.map((a) => a.slotNo),
      inferredStudents.length,
      4
    );

    const rows: SlotRow[] = [];
    let inferredIndex = 0;
    for (let slot = 1; slot <= maxSlot; slot += 1) {
      const assignment = bySlot.get(slot);
      const student = assignment
        ? studentsById.get(String(assignment.campStudentId))
        : inferredStudents[inferredIndex] || null;
      if (!assignment && student) inferredIndex += 1;
      rows.push({
        slotNo: slot,
        studentId: student ? String(student.id) : assignment ? String(assignment.campStudentId) : null,
        name: student?.name ?? assignment?.studentName ?? '-',
        grade: student?.grade ?? '-',
        gender: student?.gender ?? '-',
        teamNo: student?.teamNo ?? student?.group ?? '-',
        mentor: student?.mentor ?? '-',
        note: assignment?.note ?? null,
        hasAssignment: Boolean(assignment),
      });
    }
    return rows;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 text-sm text-zinc-500">
        방 배정 정보를 불러오는 중입니다...
      </div>
    );
  }

  const floors = [4, 5, 6];
  const roomsByFloor = floors.map((floor) => ({
    floor,
    rooms: sortedRooms.filter((room) => getFloor(room) === floor),
  }));

  return (
    <div className="space-y-4">
      {roomsByFloor.map(({ floor, rooms: floorRooms }) => {
        const isOpen = openFloors[floor] ?? false;
        return (
          <div
            key={floor}
            className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800"
          >
            <button
              type="button"
              onClick={() =>
                setOpenFloors((prev) => ({
                  ...prev,
                  [floor]: !isOpen,
                }))
              }
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {floor}층
              </div>
              <span className="text-sm font-semibold text-blue-600">
                {isOpen ? '접기' : '펼치기'}
              </span>
            </button>

            {isOpen && (
              <div className="px-4 pb-5">
                {floorRooms.length === 0 ? (
                  <div className="text-sm text-zinc-500 px-2 py-4">
                    등록된 방 정보가 없습니다.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {floorRooms.map((room) => {
                      const slots = buildSlots(room);
                      return (
                        <div
                          key={room.roomNo}
                          className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                        >
                          <table className="w-full text-sm">
                            <thead className="bg-blue-100/70">
                              <tr className="text-zinc-700">
                                <th className="px-3 py-2 w-12 text-center">
                                  {room.roomNo}
                                </th>
                                <th className="px-3 py-2">이름</th>
                                <th className="px-3 py-2 w-16 text-center">학년</th>
                                <th className="px-3 py-2 w-16 text-center">성별</th>
                                <th className="px-3 py-2 w-16 text-center">조</th>
                                <th className="px-3 py-2 w-20 text-center">멘토</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200">
                              {slots.map((slot) => (
                                <tr
                                  key={`${room.roomNo}-${slot.slotNo}`}
                                  className="hover:bg-zinc-50 cursor-pointer"
                                  onClick={() =>
                                    onSelectSlot({
                                      roomNo: room.roomNo,
                                      slotNo: slot.slotNo,
                                      studentId: slot.studentId,
                                      studentName: slot.name === '-' ? null : slot.name,
                                      note: slot.note,
                                      hasAssignment: slot.hasAssignment,
                                    })
                                  }
                                >
                                  <td className="px-3 py-2 text-center font-medium text-zinc-700">
                                    {slot.slotNo}
                                  </td>
                                  <td className="px-3 py-2">{slot.name}</td>
                                  <td className="px-3 py-2 text-center bg-orange-100/70">
                                    {slot.grade}
                                  </td>
                                  <td className="px-3 py-2 text-center bg-lime-200/70">
                                    {slot.gender}
                                  </td>
                                  <td className="px-3 py-2 text-center">{slot.teamNo}</td>
                                  <td className="px-3 py-2 text-center">{slot.mentor}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
