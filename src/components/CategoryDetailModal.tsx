'use client';

import { useEffect, useState } from 'react';
import { Student, Absence } from '@/types/student';

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subTitle: string;
  students: Student[];
  onAbsenceAdd: (studentId: string, absence: Absence) => void;
  onAbsenceRemove: (studentId: string, absenceId: string) => void;
}

export default function CategoryDetailModal({
  isOpen,
  onClose,
  title,
  subTitle,
  students,
  onAbsenceAdd,
  onAbsenceRemove,
}: CategoryDetailModalProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAbsenceForm, setShowAbsenceForm] = useState(false);
  const [absenceType, setAbsenceType] = useState<'외출' | '외박'>('외출');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getStudentStatus = (student: Student) => {
    const currentAbsence = student.absences?.find((absence) => {
      const start = new Date(absence.startDate);
      const end = new Date(absence.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return today >= start && today <= end;
    });

    return currentAbsence;
  };

  const handleAddAbsence = () => {
    if (!selectedStudent || !startDate || !endDate) return;

    const newAbsence: Absence = {
      id: Date.now().toString(),
      type: absenceType,
      startDate,
      endDate,
      note: note || undefined,
    };

    onAbsenceAdd(selectedStudent.id, newAbsence);
    setShowAbsenceForm(false);
    setStartDate('');
    setEndDate('');
    setNote('');
    setSelectedStudent(null);
  };

  const presentStudents = students.filter((s) => !getStudentStatus(s));
  const absentStudents = students.filter((s) => getStudentStatus(s));

  return (
    <div className="modal-overlay-enter fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-3 backdrop-blur-sm md:p-6">
      <div className="modal-panel-enter w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl flex flex-col">
        {/* 헤더 */}
        <div className="px-6 py-5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">
              {title} - {subTitle}
            </h2>
            <p className="text-sm text-zinc-600 mt-1">
              총 {students.length}명 (출석: {presentStudents.length}명, 외출/외박:{' '}
              {absentStudents.length}명)
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 탭 */}
        <div className="px-6 py-3 border-b border-zinc-200 flex gap-2 bg-white">
          <button
            onClick={() => setShowAbsenceForm(false)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              !showAbsenceForm
                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            학생 목록
          </button>
          <button
            onClick={() => setShowAbsenceForm(true)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              showAbsenceForm
                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            외출/외박 등록
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-6">
          {showAbsenceForm ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  학생 선택
                </label>
                <select
                  value={selectedStudent?.id || ''}
                  onChange={(e) => {
                    const student = students.find((s) => s.id === e.target.value);
                    setSelectedStudent(student || null);
                  }}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">학생을 선택하세요</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.grade})
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudent && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      유형
                    </label>
                    <select
                      value={absenceType}
                      onChange={(e) =>
                        setAbsenceType(e.target.value as '외출' | '외박')
                      }
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="외출">외출</option>
                      <option value="외박">외박</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        시작일
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        종료일
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      비고
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="예: 졸업식 외박, 오후 3시 복귀 예정"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <button
                    onClick={handleAddAbsence}
                    disabled={!startDate || !endDate}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    등록
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* 출석 학생 */}
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                  출석 학생 ({presentStudents.length}명)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {presentStudents.map((student) => (
                    <div
                      key={student.id}
                      className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm transition hover:bg-zinc-50"
                    >
                      <div className="font-medium text-zinc-900">
                        {student.name}
                      </div>
                      <div className="text-sm text-zinc-600">
                        {student.grade} · {student.school}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 외출/외박 학생 */}
              {absentStudents.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                    외출/외박 학생 ({absentStudents.length}명)
                  </h3>
                  <div className="space-y-3">
                    {absentStudents.map((student) => {
                      const absence = getStudentStatus(student);
                      return (
                        <div
                          key={student.id}
                          className="p-4 border border-amber-200 rounded-xl bg-amber-50"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-zinc-900">
                                {student.name}
                              </div>
                              <div className="text-sm text-zinc-600 mt-1">
                                {student.grade} · {student.school}
                              </div>
                              {absence && (
                                <div className="mt-2 text-sm">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mr-2">
                                    {absence.type}
                                  </span>
                                  <span className="text-zinc-600">
                                    {new Date(absence.startDate).toLocaleDateString(
                                      'ko-KR'
                                    )}{' '}
                                    ~{' '}
                                    {new Date(absence.endDate).toLocaleDateString(
                                      'ko-KR'
                                    )}
                                  </span>
                                  {absence.note && (
                                    <div className="mt-1 text-zinc-700">
                                      비고: {absence.note}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            {absence && (
                              <button
                                onClick={() =>
                                  onAbsenceRemove(student.id, absence.id)
                                }
                                className="text-sm text-red-600 transition hover:text-red-700"
                              >
                                삭제
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
