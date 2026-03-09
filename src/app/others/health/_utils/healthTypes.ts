export type HealthLogCategory = 'GENERAL' | 'CONSTIPATION';

export type HealthLogRow = {
  id: number;
  campStudentId: number;
  studentName: string;
  campus?: string;
  teamNo?: string;
  mentorName?: string;
  logDate: string;
  category: HealthLogCategory;
  symptom: string;
  actionTaken?: string;
  note?: string;
  firstDetectedDate?: string;
  handledBy?: string;
  createdAt?: string;
  updatedAt?: string;
};
