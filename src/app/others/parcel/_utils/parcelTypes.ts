// src/app/others/parcel/_utils/parcelTypes.ts
export type ParcelRow = {
  id: string;
  date: string; // YYYY-MM-DD
  studentId?: string;
  studentName: string;
  teamNo?: string; // "1조" 등
  grade?: string; // "고1" 등
  gender?: string; // "남" | "여"
  quantity: number;
  roomNo?: string; // "404"
  lectureHall?: string; // "1강의실"
};