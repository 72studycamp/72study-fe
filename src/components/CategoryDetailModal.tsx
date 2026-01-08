'use client';

import { useState } from 'react';
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
    <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-zinc-200 dark:border-zinc-700">
        {/* 헤더 */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {title} - {subTitle}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              총 {students.length}명 (출석: {presentStudents.length}명, 외출/외박:{' '}
              {absentStudents.length}명)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
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
        <div className="px-6 py-2 border-b border-zinc-200 dark:border-zinc-700 flex gap-4">
          <button
            onClick={() => setShowAbsenceForm(false)}
            className={`px-4 py-2 text-sm font-medium ${
              !showAbsenceForm
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            학생 목록
          </button>
          <button
            onClick={() => setShowAbsenceForm(true)}
            className={`px-4 py-2 text-sm font-medium ${
              showAbsenceForm
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-zinc-600 dark:text-zinc-400'
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
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
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
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      유형
                    </label>
                    <select
                      value={absenceType}
                      onChange={(e) =>
                        setAbsenceType(e.target.value as '외출' | '외박')
                      }
                      className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="외출">외출</option>
                      <option value="외박">외박</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        시작일
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        종료일
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      비고
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="예: 졸업식 외박, 오후 3시 복귀 예정"
                      className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <button
                    onClick={handleAddAbsence}
                    disabled={!startDate || !endDate}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed"
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
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                  출석 학생 ({presentStudents.length}명)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {presentStudents.map((student) => (
                    <div
                      key={student.id}
                      className="p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {student.name}
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {student.grade} · {student.school}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 외출/외박 학생 */}
              {absentStudents.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                    외출/외박 학생 ({absentStudents.length}명)
                  </h3>
                  <div className="space-y-3">
                    {absentStudents.map((student) => {
                      const absence = getStudentStatus(student);
                      return (
                        <div
                          key={student.id}
                          className="p-4 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-950"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                                {student.name}
                              </div>
                              <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                {student.grade} · {student.school}
                              </div>
                              {absence && (
                                <div className="mt-2 text-sm">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 mr-2">
                                    {absence.type}
                                  </span>
                                  <span className="text-zinc-600 dark:text-zinc-400">
                                    {new Date(absence.startDate).toLocaleDateString(
                                      'ko-KR'
                                    )}{' '}
                                    ~{' '}
                                    {new Date(absence.endDate).toLocaleDateString(
                                      'ko-KR'
                                    )}
                                  </span>
                                  {absence.note && (
                                    <div className="mt-1 text-zinc-700 dark:text-zinc-300">
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
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
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

