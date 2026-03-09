export type RoomInfo = {
  roomNo: string;
  floor?: number | null;
  campus?: string | null;
  genderZone?: string | null;
  capacity: number;
  active: boolean;
};

export type RoomAssignment = {
  id: number;
  campStudentId: number;
  studentName: string;
  roomNo: string;
  slotNo: number;
  note?: string | null;
  assignedAt?: string | null;
};
