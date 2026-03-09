export type FocusCounselingRow = {
  campStudentId: number;
  studentName: string;
  campus?: string;
  teamNo?: string;
  mentorName?: string;
  memo: string;
  updatedAt?: string;
};

export type FocusCounselingResponse = {
  id: number | null;
  campStudentId: number;
  studentName: string | null;
  memo: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};
