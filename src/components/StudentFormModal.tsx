'use client';

import { useState, useEffect } from 'react';
import { Student } from '@/types/student';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null; // 수정 모드일 때만 전달
  onSubmit: (data: {
    campus: string;
    studentName: string;
    gender: string;
    course: string;
    grade: string;
    studentPhone?: string | null;
    mentorName?: string | null;
    roomNo?: string | null;
    teamNo?: string | null;
    birthDate?: string | null;
    status?: string;
    adminMemo?: string | null;
  }) => Promise<void>;
}

export default function StudentFormModal({
  isOpen,
  onClose,
  student,
  onSubmit,
}: StudentFormModalProps) {
  const isEditMode = !!student;
  const [formData, setFormData] = useState({
    campus: '',
    studentName: '',
    gender: '',
    course: '',
    grade: '',
    studentPhone: '',
    mentorName: '',
    roomNo: '',
    teamNo: '',
    birthDate: '',
    status: '재원',
    adminMemo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (student) {
        // 수정 모드: 기존 데이터로 초기화
        setFormData({
          campus: student.applicationProcess || '',
          studentName: student.name || '',
          gender: student.gender || '',
          course: student.course || '',
          grade: student.grade || '',
          studentPhone: '',
          mentorName: student.mentor || '',
          roomNo: student.roomGroup?.split('호')[0] || '',
          teamNo: student.group?.replace('조', '') || '',
          birthDate: student.age?.replace('년생', '') || '',
          status: '재원',
          adminMemo: '',
        });
      } else {
        // 추가 모드: 빈 폼
        setFormData({
          campus: '',
          studentName: '',
          gender: '',
          course: '',
          grade: '',
          studentPhone: '',
          mentorName: '',
          roomNo: '',
          teamNo: '',
          birthDate: '',
          status: '재원',
          adminMemo: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, student]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.campus.trim()) {
      newErrors.campus = '캠퍼스를 입력해주세요.';
    }
    if (!formData.studentName.trim()) {
      newErrors.studentName = '이름을 입력해주세요.';
    }
    if (!formData.gender) {
      newErrors.gender = '성별을 선택해주세요.';
    }
    if (!formData.course) {
      newErrors.course = '과정을 선택해주세요.';
    }
    if (!formData.grade.trim()) {
      newErrors.grade = '학년을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        campus: formData.campus,
        studentName: formData.studentName,
        gender: formData.gender,
        course: formData.course,
        grade: formData.grade,
        studentPhone: formData.studentPhone || null,
        mentorName: formData.mentorName || null,
        roomNo: formData.roomNo || null,
        teamNo: formData.teamNo || null,
        birthDate: formData.birthDate || null,
        status: formData.status,
        adminMemo: formData.adminMemo || null,
      });
      onClose();
    } catch (error) {
      console.error('제출 실패:', error);
      alert(error instanceof Error ? error.message : '저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between sticky top-0">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {isEditMode ? '학생 정보 수정' : '학생 추가'}
          </h2>
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

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 캠퍼스 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                캠퍼스 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.campus}
                onChange={(e) =>
                  setFormData({ ...formData, campus: e.target.value })
                }
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ${
                  errors.campus
                    ? 'border-red-500'
                    : 'border-zinc-300 dark:border-zinc-600'
                }`}
                placeholder="예: 강화 33기"
              />
              {errors.campus && (
                <p className="mt-1 text-sm text-red-600">{errors.campus}</p>
              )}
            </div>

            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) =>
                  setFormData({ ...formData, studentName: e.target.value })
                }
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ${
                  errors.studentName
                    ? 'border-red-500'
                    : 'border-zinc-300 dark:border-zinc-600'
                }`}
              />
              {errors.studentName && (
                <p className="mt-1 text-sm text-red-600">{errors.studentName}</p>
              )}
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                성별 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ${
                  errors.gender
                    ? 'border-red-500'
                    : 'border-zinc-300 dark:border-zinc-600'
                }`}
              >
                <option value="">선택하세요</option>
                <option value="남">남</option>
                <option value="여">여</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
              )}
            </div>

            {/* 과정 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                과정 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.course}
                onChange={(e) =>
                  setFormData({ ...formData, course: e.target.value })
                }
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ${
                  errors.course
                    ? 'border-red-500'
                    : 'border-zinc-300 dark:border-zinc-600'
                }`}
              >
                <option value="">선택하세요</option>
                <option value="중등">중등</option>
                <option value="고등">고등</option>
              </select>
              {errors.course && (
                <p className="mt-1 text-sm text-red-600">{errors.course}</p>
              )}
            </div>

            {/* 학년 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                학년 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ${
                  errors.grade
                    ? 'border-red-500'
                    : 'border-zinc-300 dark:border-zinc-600'
                }`}
                placeholder="예: 중3, 고1"
              />
              {errors.grade && (
                <p className="mt-1 text-sm text-red-600">{errors.grade}</p>
              )}
            </div>

            {/* 전화번호 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                value={formData.studentPhone}
                onChange={(e) =>
                  setFormData({ ...formData, studentPhone: e.target.value })
                }
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                placeholder="010-1234-5678"
              />
            </div>

            {/* 멘토 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                멘토
              </label>
              <input
                type="text"
                value={formData.mentorName}
                onChange={(e) =>
                  setFormData({ ...formData, mentorName: e.target.value })
                }
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* 방 번호 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                방 번호
              </label>
              <input
                type="text"
                value={formData.roomNo}
                onChange={(e) =>
                  setFormData({ ...formData, roomNo: e.target.value })
                }
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                placeholder="예: 501"
              />
            </div>

            {/* 조 번호 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                조 번호
              </label>
              <input
                type="text"
                value={formData.teamNo}
                onChange={(e) =>
                  setFormData({ ...formData, teamNo: e.target.value })
                }
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                placeholder="예: 1"
              />
            </div>

            {/* 생년월일 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                생년월일
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* 상태 (수정 모드만) */}
            {isEditMode && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  상태
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="재원">재원</option>
                  <option value="퇴소">퇴소</option>
                </select>
              </div>
            )}

            {/* 관리자 메모 (수정 모드만) */}
            {isEditMode && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  관리자 메모
                </label>
                <textarea
                  value={formData.adminMemo}
                  onChange={(e) =>
                    setFormData({ ...formData, adminMemo: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed"
            >
              {submitting ? '저장 중...' : isEditMode ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

