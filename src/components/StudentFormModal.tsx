// src/components/StudentFormModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { Student } from '@/types/student';

export type AbsenceDraft = {
  type: '외출' | '외박';
  startDate: string;
  endDate: string;
  note: string | null;
} | null;

type Props = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  student?: Student | null;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
};

// "" -> null, "   " -> null
function toNullableString(v: string) {
  const t = (v ?? '').trim();
  return t.length ? t : null;
}

// UI(재원/퇴소/미선택) <-> API(ENROLLED/DROPPED/null)
function uiStatusToApi(v: string): string | null {
  const t = (v ?? '').trim();
  if (!t) return null;
  if (t === '재원') return 'ENROLLED';
  if (t === '퇴소') return 'DROPPED';
  // 혹시 이미 ENROLLED/DROPPED가 들어오면 그대로 통과
  if (t === 'ENROLLED' || t === 'DROPPED') return t;
  return t; // 확장 가능성 대비(다른 enum이면 그대로)
}

function apiStatusToUi(v?: string | null): string {
  if (!v) return '';
  if (v === 'ENROLLED') return '재원';
  if (v === 'DROPPED') return '퇴소';
  // 모르는 enum이면 그냥 보여주기(혹시 디버깅용)
  return v;
}

function getTodayYmd() {
  return new Date().toISOString().slice(0, 10);
}

export default function StudentFormModal({
  isOpen,
  mode,
  student,
  onClose,
  onSubmit,
}: Props) {
  const [formData, setFormData] = useState({
    campus: '',
    studentName: '',
    gender: '남',     // ''도 허용(선택안함)
    course: '중등',   // ''도 허용(선택안함)
    grade: '',
    studentPhone: '',
    mentorName: '',
    roomNo: '',
    teamNo: '',
    birthDate: '', // YYYY-MM-DD
    dropoutDate: '', // YYYY-MM-DD
    status: '재원', // ''도 허용(선택안함)
    adminMemo: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAbsence, setHasAbsence] = useState(false);
  const [absenceData, setAbsenceData] = useState({
    type: '외출' as '외출' | '외박',
    startDate: getTodayYmd(),
    endDate: getTodayYmd(),
    note: '',
  });

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'create') {
      setFormData({
        campus: '',
        studentName: '',
        gender: '남',
        course: '중등',
        grade: '',
        studentPhone: '',
        mentorName: '',
        roomNo: '',
        teamNo: '',
        birthDate: '',
        dropoutDate: '',
        status: '재원',
        adminMemo: '',
      });
      setHasAbsence(false);
      setAbsenceData({
        type: '외출',
        startDate: getTodayYmd(),
        endDate: getTodayYmd(),
        note: '',
      });
      return;
    }

    if (mode === 'edit' && student) {
      // 수정 모달에서는 "오늘 진행중"이 아니어도, 저장된 외출/외박이 있으면
      // 가장 가까운(진행중 > 예정 > 최근) 기록을 폼에 다시 채운다.
      const activeAbsence = student.absences?.find((absence) => {
        const today = new Date();
        const start = new Date(absence.startDate);
        const end = new Date(absence.endDate);
        today.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return today >= start && today <= end;
      });
      const upcomingAbsence = !activeAbsence
        ? [...(student.absences ?? [])]
            .filter((absence) => {
              const today = new Date();
              const start = new Date(absence.startDate);
              today.setHours(0, 0, 0, 0);
              start.setHours(0, 0, 0, 0);
              return start > today;
            })
            .sort(
              (a, b) =>
                new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            )[0]
        : null;
      const latestAbsence = !activeAbsence && !upcomingAbsence
        ? [...(student.absences ?? [])].sort(
            (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
          )[0]
        : null;
      const editableAbsence = activeAbsence ?? upcomingAbsence ?? latestAbsence ?? null;

      setFormData({
        campus: (student.campus ?? student.applicationProcess ?? '').toString(),
        studentName: (student.name ?? '').toString(),

        // ✅ 백엔드에 null 허용이니, UI에서도 ''(미선택) 가능하게
        gender: (student.gender ?? '') as any,
        course: (student.course ?? '') as any,
        grade: (student.grade ?? '').toString(),
        studentPhone: (student.studentPhone ?? '').toString(),
        mentorName: (student.mentor ?? '').toString(),

        // ✅ 이제 백엔드가 String roomNo/teamNo 받으므로 string 그대로
        roomNo: (student.roomNo ?? '').toString(),
        teamNo: (student.teamNo ?? '').toString(),

        birthDate: student.birthDate ? String(student.birthDate) : '',
        dropoutDate: student.dropoutDate ? String(student.dropoutDate).slice(0, 10) : '',

        // ✅ API enum -> UI 라벨
        status: apiStatusToUi(student.status ?? null) as any,

        adminMemo: (student.adminMemo ?? '').toString(),
      });

      setHasAbsence(!!editableAbsence);
      setAbsenceData({
        type: editableAbsence?.type ?? '외출',
        startDate: editableAbsence?.startDate?.slice(0, 10) ?? getTodayYmd(),
        endDate: editableAbsence?.endDate?.slice(0, 10) ?? getTodayYmd(),
        note: editableAbsence?.note ?? '',
      });
    }
  }, [isOpen, mode, student]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ "필수입니다" 경고는 유지하되, 저장을 막지 말 것
    const missing: string[] = [];
    if (!formData.campus.trim()) missing.push('캠퍼스는 필수입니다.');
    if (!formData.studentName.trim()) missing.push('학생 이름은 필수입니다.');
    // gender/course/grade도 경각심용으로만 경고
    if (!formData.gender.trim()) missing.push('성별은 필수입니다.');
    if (!formData.course.trim()) missing.push('과정은 필수입니다.');
    if (!formData.grade.trim()) missing.push('학년은 필수입니다.');

    if (missing.length > 0) {
      const ok = window.confirm(`${missing.join('\n')}\n\n그래도 저장할까요?`);
      if (!ok) return;
    }

    if (hasAbsence) {
      if (!absenceData.startDate || !absenceData.endDate) {
        alert('외출/외박 기간을 입력해주세요.');
        return;
      }
      if (absenceData.startDate > absenceData.endDate) {
        alert('외출/외박 종료일은 시작일보다 빠를 수 없습니다.');
        return;
      }
    }

    if (formData.status === '퇴소' && !formData.dropoutDate.trim()) {
      alert('퇴소일자를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const absenceDraft: AbsenceDraft = hasAbsence
        ? {
            type: absenceData.type,
            startDate: absenceData.startDate,
            endDate: absenceData.endDate,
            note: toNullableString(absenceData.note),
          }
        : null;

      const payload = {
        // ✅ 백엔드 record 필드명 그대로
        campus: toNullableString(formData.campus),
        studentName: toNullableString(formData.studentName),

        // ✅ 선택안함('')이면 null
        gender: toNullableString(formData.gender),
        course: toNullableString(formData.course),

        grade: toNullableString(formData.grade),
        studentPhone: toNullableString(formData.studentPhone),

        // ✅ status: 재원/퇴소 -> ENROLLED/DROPPED, 선택안함 -> null
        status: uiStatusToApi(formData.status),

        // ✅ String|null 로 보냄 (숫자 변환 금지)
        roomNo: toNullableString(formData.roomNo),
        teamNo: toNullableString(formData.teamNo),

        mentorName: toNullableString(formData.mentorName),
        birthDate: toNullableString(formData.birthDate), // "YYYY-MM-DD" | null
        dropoutDate: formData.status === '퇴소' ? toNullableString(formData.dropoutDate) : null,
        adminMemo: toNullableString(formData.adminMemo),
        absenceDraft,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      alert(`제출 실패: ${err?.message ?? 'Bad Request'}`);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100';
  const sectionClass = 'rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 md:p-5';
  const labelClass = 'mb-1.5 block text-sm font-semibold text-zinc-700';

  return (
    <div className="modal-overlay-enter fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-3 backdrop-blur-sm md:p-6">
      <div className="modal-panel-enter w-full max-w-3xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl">
        <div className="border-b border-zinc-200 bg-gradient-to-r from-sky-50 via-white to-indigo-50 px-5 py-4 md:px-7 md:py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">
                {mode === 'create' ? '학생 추가' : '학생 수정'}
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                학생 기본 정보와 생활 정보를 입력하세요.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[80vh] space-y-4 overflow-y-auto px-5 py-5 md:px-7">
          <section className={sectionClass}>
            <h3 className="mb-4 text-sm font-bold text-zinc-800">기본 정보</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  캠퍼스 <span className="text-rose-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={formData.campus}
                  onChange={(e) => handleChange('campus', e.target.value)}
                  placeholder="예: 강화 33기"
                />
              </div>

              <div>
                <label className={labelClass}>
                  이름 <span className="text-rose-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={formData.studentName}
                  onChange={(e) => handleChange('studentName', e.target.value)}
                  placeholder="학생 이름"
                />
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <h3 className="mb-4 text-sm font-bold text-zinc-800">학적 정보</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  성별 <span className="text-rose-500">*</span>
                </label>
                <select
                  className={inputClass}
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <option value="">선택안함</option>
                  <option value="남">남</option>
                  <option value="여">여</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  과정 <span className="text-rose-500">*</span>
                </label>
                <select
                  className={inputClass}
                  value={formData.course}
                  onChange={(e) => handleChange('course', e.target.value)}
                >
                  <option value="">선택안함</option>
                  <option value="중등">중등</option>
                  <option value="고등">고등</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  학년 <span className="text-rose-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={formData.grade}
                  onChange={(e) => handleChange('grade', e.target.value)}
                  placeholder="예: 중3, 고2"
                />
              </div>

              <div>
                <label className={labelClass}>전화번호</label>
                <input
                  className={inputClass}
                  value={formData.studentPhone}
                  onChange={(e) => handleChange('studentPhone', e.target.value)}
                  placeholder="예: 010-1234-5678"
                />
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <h3 className="mb-4 text-sm font-bold text-zinc-800">생활 정보</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>멘토</label>
                <input
                  className={inputClass}
                  value={formData.mentorName}
                  onChange={(e) => handleChange('mentorName', e.target.value)}
                  placeholder="담당 멘토명"
                />
              </div>

              <div>
                <label className={labelClass}>방 번호</label>
                <input
                  className={inputClass}
                  value={formData.roomNo}
                  onChange={(e) => handleChange('roomNo', e.target.value)}
                  placeholder="예: 501"
                />
              </div>

              <div>
                <label className={labelClass}>조 번호</label>
                <input
                  className={inputClass}
                  value={formData.teamNo}
                  onChange={(e) => handleChange('teamNo', e.target.value)}
                  placeholder="예: 1"
                />
              </div>

              <div>
                <label className={labelClass}>생년월일</label>
                <input
                  type="date"
                  className={inputClass}
                  value={formData.birthDate}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <h3 className="mb-4 text-sm font-bold text-zinc-800">상태 및 메모</h3>
            <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  checked={hasAbsence}
                  onChange={(e) => setHasAbsence(e.target.checked)}
                />
                현재 외출/외박 중
              </label>
            </div>

            {hasAbsence && (
              <div className="mb-4 grid grid-cols-1 gap-4 rounded-xl border border-zinc-200 bg-white p-3 md:grid-cols-3">
                <div>
                  <label className={labelClass}>구분</label>
                  <select
                    className={inputClass}
                    value={absenceData.type}
                    onChange={(e) =>
                      setAbsenceData((prev) => ({
                        ...prev,
                        type: e.target.value as '외출' | '외박',
                      }))
                    }
                  >
                    <option value="외출">외출</option>
                    <option value="외박">외박</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>시작일</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={absenceData.startDate}
                    onChange={(e) =>
                      setAbsenceData((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>종료일</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={absenceData.endDate}
                    onChange={(e) =>
                      setAbsenceData((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                  />
                </div>

                <div className="md:col-span-3">
                  <label className={labelClass}>외출/외박 사유</label>
                  <input
                    className={inputClass}
                    value={absenceData.note}
                    onChange={(e) =>
                      setAbsenceData((prev) => ({ ...prev, note: e.target.value }))
                    }
                    placeholder="예: 병원 진료, 집안 행사"
                  />
                </div>
              </div>
            )}

            <div>
              <label className={labelClass}>상태</label>
              <select
                className={inputClass}
                value={formData.status}
                onChange={(e) => {
                  const next = e.target.value;
                  handleChange('status', next);
                  if (next === '퇴소' && !formData.dropoutDate) {
                    handleChange('dropoutDate', getTodayYmd());
                  }
                }}
              >
                <option value="">선택안함</option>
                <option value="재원">재원</option>
                <option value="퇴소">퇴소</option>
              </select>
            </div>

            {formData.status === '퇴소' && (
              <div>
                <label className={labelClass}>퇴소일자</label>
                <input
                  type="date"
                  className={inputClass}
                  value={formData.dropoutDate}
                  onChange={(e) => handleChange('dropoutDate', e.target.value)}
                />
              </div>
            )}

            <div>
              <label className={labelClass}>관리자 메모</label>
              <textarea
                className={`${inputClass} min-h-[130px] resize-y`}
                value={formData.adminMemo}
                onChange={(e) => handleChange('adminMemo', e.target.value)}
                rows={4}
                placeholder="특이사항, 전달사항 등을 입력하세요."
              />
            </div>
          </section>

          <div className="sticky bottom-0 flex justify-end gap-2 border-t border-zinc-200 bg-white/95 py-3 backdrop-blur">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
