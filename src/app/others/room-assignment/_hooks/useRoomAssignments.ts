// src/app/others/room-assignment/_hooks/useRoomAssignments.ts
'use client';

import { useEffect, useState } from 'react';
import { roomApi, roomAssignmentApi } from '@/lib/api';
import { RoomAssignment, RoomInfo } from '../_utils/roomTypes';

type RoomAssignmentsMap = Record<string, RoomAssignment[]>;

export function useRoomAssignments() {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [assignmentsByRoom, setAssignmentsByRoom] = useState<RoomAssignmentsMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const [roomsList, assignmentsList] = await Promise.all([
        roomApi.getRooms({ active: true }),
        roomAssignmentApi.listAll({ active: true }),
      ]);
      const mappedRooms: RoomInfo[] = (roomsList || [])
        .map((r: any) => ({
          roomNo: String(r.roomNo),
          floor: r.floor ?? null,
          campus: r.campus ?? null,
          genderZone: r.genderZone ?? null,
          capacity: Number(r.capacity ?? 0),
          active: Boolean(r.active),
        }))
        .filter((room) => {
          const num = Number(room.roomNo.replace(/[^\d]/g, ''));
          if (Number.isNaN(num)) return true;
          return num < 101 || num > 108;
        });

      setRooms(mappedRooms);

      const map: RoomAssignmentsMap = {};
      (assignmentsList || []).forEach((a: any) => {
        const roomNo = String(a.roomNo);
        if (!map[roomNo]) map[roomNo] = [];
        map[roomNo].push({
          id: Number(a.id),
          campStudentId: Number(a.campStudentId),
          studentName: a.studentName ?? '',
          roomNo,
          slotNo: Number(a.slotNo),
          note: a.note ?? null,
          assignedAt: a.assignedAt ?? null,
        });
      });
      setAssignmentsByRoom(map);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '방 배정 정보를 불러오는데 실패했습니다.';
      setError(msg);
      setRooms([]);
      setAssignmentsByRoom({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return {
    rooms,
    assignmentsByRoom,
    loading,
    error,
    refetch: fetchAll,
  };
}
