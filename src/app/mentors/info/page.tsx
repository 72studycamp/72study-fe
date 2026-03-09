'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useStudents } from '@/app/others/parcel/_hooks/useStudents';

type MentorRow = {
  mentorName: string;
  totalStudents: number;
  teams: string[];
};

type MentorColumn = {
  key: string;
  label: string;
  editable: boolean;
};

type MentorProfile = Record<string, string>;

const PROFILE_STORAGE_KEY = 'mentor-info-profiles-v2';
const HIDDEN_MENTORS_STORAGE_KEY = 'mentor-info-hidden-v1';

const COLUMNS: MentorColumn[] = [
  { key: 'name', label: '이름', editable: false },
  { key: 'gender', label: '성별', editable: true },
  { key: 'team', label: '조', editable: true },
  { key: 'specialLecture', label: '특강', editable: true },
  { key: 'certificate', label: '수료증명', editable: true },
  { key: 'previousParticipation', label: '기참여', editable: true },
  { key: 'participation', label: '참가', editable: true },
  { key: 'workType', label: '근무 유형', editable: true },
  { key: 'birthDate', label: '생년월일', editable: true },
  { key: 'phone', label: '연락처', editable: true },
  { key: 'email', label: '이메일', editable: true },
  { key: 'program', label: '프로그램', editable: true },
  { key: 'personId', label: 'ID', editable: true },
  { key: 'universityName', label: '재학 중인 대명', editable: true },
  { key: 'department', label: '학과/학부', editable: true },
  { key: 'grade', label: '학년', editable: true },
  { key: 'highTrack', label: '계열(고등)', editable: true },
  { key: 'admissionType', label: '대입 전형', editable: true },
  { key: 'isRetake', label: '재수 여부', editable: true },
  { key: 'otherUniversityGraduate', label: '타 대학 졸업', editable: true },
  { key: 'address', label: '주민등록주소지(우편번호/기본 주소+상세 주소)', editable: true },
  { key: 'otherCamp1', label: '타캠프', editable: true },
  { key: 'otherCamp2', label: '타캠프(2)', editable: true },
  { key: 'preferredGrade', label: '희망학년', editable: true },
  { key: 'teachableSubjectsG1', label: '학습/운영총괄멘토)고1 교습가능과목(*복수선택)', editable: true },
  { key: 'teachableSubjectsG2', label: '학습/운영총괄멘토)고2 교습가능과목(*복수선택)', editable: true },
  { key: 'teachableSubjectsG3', label: '학습/운영총괄멘토)고3 교습가능과목(*복수선택)', editable: true },
  { key: 'salaryBank', label: '급여 지급은행명', editable: true },
  { key: 'accountNo', label: '계좌번호', editable: true },
  { key: 'residentNo', label: '주민번호', editable: true },
  { key: 'laptop', label: '노트북', editable: true },
  { key: 'shuttleBus', label: '셔틀버스', editable: true },
  { key: 'beforeCallTips', label: '재참여자)입소 전 전화 시 어떤 내용으로 대화해야 할까요?', editable: true },
  { key: 'consultingProcess', label: '재참여자)입소 상담은 어떻게 진행했나요?', editable: true },
  { key: 'effectiveGuidance', label: '재참여자)효과적이었던 자신만의 지도방법이나 목표설정은 어떤 것이 있었나요?', editable: true },
  { key: 'dontSayDo', label: '재참여자)멘티에게 절대 하지 말아야 하는 말과 행동에는 무엇이 있을까요?', editable: true },
  { key: 'closingConsulting', label: '재참여자)마무리 상담은 어떻게 진행하나요?', editable: true },
  { key: 'adviceForNewMentor', label: '재참여자) 앞선 질문들 외에 신규 멘토에게 조언할 사항은 무엇인가요?', editable: true },
  { key: 'campExperience', label: '캠프경험', editable: true },
];

const EMPTY_PROFILE: MentorProfile = COLUMNS.reduce<MentorProfile>((acc, col) => {
  if (col.key !== 'name') acc[col.key] = '';
  return acc;
}, {});

function normalizeMentorName(v?: string | null) {
  const t = String(v ?? '').trim();
  return t.length > 0 ? t : '미지정';
}

function normalizeTeam(v?: string | null) {
  const t = String(v ?? '').trim();
  if (!t) return '-';
  return t.endsWith('조') ? t : `${t}조`;
}

function getTeamOrder(team?: string | null) {
  const normalized = normalizeTeam(team);
  const match = normalized.match(/(\d+)/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[1]);
}

export default function MentorInfoPage() {
  const { studentsAll, loadingStudents, errorStudents } = useStudents();
  const [query, setQuery] = useState('');
  const [profiles, setProfiles] = useState<Record<string, MentorProfile>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw) as Record<string, MentorProfile>;
    } catch {
      return {};
    }
  });
  const [hiddenMentors, setHiddenMentors] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(HIDDEN_MENTORS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map((v) => String(v)) : [];
    } catch {
      return [];
    }
  });
  const [selectedMentorName, setSelectedMentorName] = useState<string | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [newMentorName, setNewMentorName] = useState('');
  const [editingProfile, setEditingProfile] = useState<MentorProfile>(EMPTY_PROFILE);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const effectiveProfiles = useMemo(
    () => (hydrated ? profiles : {}),
    [hydrated, profiles]
  );

  const mentorRows = useMemo(() => {
    const map = new Map<string, MentorRow>();

    Object.keys(effectiveProfiles).forEach((mentorName) => {
      if (!map.has(mentorName)) {
        map.set(mentorName, {
          mentorName,
          totalStudents: 0,
          teams: [],
        });
      }
    });

    studentsAll.forEach((student) => {
      const mentorName = normalizeMentorName(student.mentor);
      const team = normalizeTeam(student.group ?? student.teamNo);
      const current = map.get(mentorName) ?? {
        mentorName,
        totalStudents: 0,
        teams: [],
      };
      current.totalStudents += 1;
      if (!current.teams.includes(team)) current.teams.push(team);
      map.set(mentorName, current);
    });

    return Array.from(map.values())
      .filter((row) => !hiddenMentors.includes(row.mentorName))
      .map((row) => ({
        ...row,
        teams: row.teams.sort((a, b) => a.localeCompare(b, 'ko')),
      }))
      .sort((a, b) => {
        const aProfileTeam = effectiveProfiles[a.mentorName]?.team ?? '';
        const bProfileTeam = effectiveProfiles[b.mentorName]?.team ?? '';
        const aPrimary = aProfileTeam || a.teams[0] || '';
        const bPrimary = bProfileTeam || b.teams[0] || '';
        const teamDiff = getTeamOrder(aPrimary) - getTeamOrder(bPrimary);
        if (teamDiff !== 0) return teamDiff;
        return a.mentorName.localeCompare(b.mentorName, 'ko');
      });
  }, [effectiveProfiles, hiddenMentors, studentsAll]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mentorRows;
    return mentorRows.filter((row) => row.mentorName.toLowerCase().includes(q));
  }, [mentorRows, query]);

  const tableRows = useMemo<Array<{ mentorName: string; data: MentorProfile }>>(() => {
    return filtered.map((row) => {
      const profile = effectiveProfiles[row.mentorName] ?? EMPTY_PROFILE;
      return {
        mentorName: row.mentorName,
        data: {
          ...profile,
          name: row.mentorName,
          team: profile.team || row.teams[0] || '-',
        } as MentorProfile,
      };
    });
  }, [effectiveProfiles, filtered]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(HIDDEN_MENTORS_STORAGE_KEY, JSON.stringify(hiddenMentors));
  }, [hiddenMentors]);

  const openEditModal = (mentorName: string) => {
    setIsCreateMode(false);
    setSelectedMentorName(mentorName);
    setNewMentorName(mentorName);
    setEditingProfile(profiles[mentorName] ?? EMPTY_PROFILE);
  };

  const closeEditModal = () => {
    setSelectedMentorName(null);
    setIsCreateMode(false);
    setNewMentorName('');
    setEditingProfile(EMPTY_PROFILE);
  };

  useEffect(() => {
    if (!selectedMentorName) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeEditModal();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedMentorName]);

  const saveProfile = () => {
    const targetName = String((isCreateMode ? newMentorName : selectedMentorName) ?? '').trim();
    if (!targetName) {
      alert('멘토 이름을 입력해주세요.');
      return;
    }

    if (isCreateMode && profiles[targetName]) {
      alert('이미 존재하는 멘토 이름입니다.');
      return;
    }

    setProfiles((prev) => ({ ...prev, [targetName]: editingProfile }));
    setHiddenMentors((prev) => prev.filter((name) => name !== targetName));
    closeEditModal();
  };

  const handleProfileChange = (key: string, value: string) => {
    setEditingProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddMentor = () => {
    setIsCreateMode(true);
    setSelectedMentorName('__new__');
    setNewMentorName('');
    setEditingProfile({ ...EMPTY_PROFILE });
  };

  const handleDeleteMentor = () => {
    if (isCreateMode || !selectedMentorName) return;
    const ok = window.confirm(`${selectedMentorName} 멘토 정보를 삭제할까요?`);
    if (!ok) return;

    setProfiles((prev) => {
      const next = { ...prev };
      delete next[selectedMentorName];
      return next;
    });
    setHiddenMentors((prev) =>
      prev.includes(selectedMentorName) ? prev : [...prev, selectedMentorName]
    );
    closeEditModal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6">
          <h1 className="mb-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">멘토정보</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            전달한 컬럼 구조 기준으로 멘토 정보를 조회/수정합니다.
          </p>
        </header>

        <section className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">멘토 검색</label>
          <div className="flex gap-2">
            <input
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder="멘토 이름 입력"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddMentor}
              className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              멘토 추가
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {loadingStudents && <div className="p-4 text-sm text-zinc-500 dark:text-zinc-400">로딩 중...</div>}
          {errorStudents && <div className="p-4 text-sm text-red-600 dark:text-red-300">{errorStudents}</div>}

          {!loadingStudents && !errorStudents && (
            <div className="overflow-x-auto">
              <table className="min-w-[4200px] text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-800">
                  <tr className="text-left text-zinc-700 dark:text-zinc-200">
                    {COLUMNS.map((column) => (
                      <th key={column.key} className="whitespace-nowrap px-4 py-3">
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {tableRows.map((row) => (
                    <tr
                      key={row.mentorName}
                      className="cursor-pointer text-zinc-800 transition hover:bg-blue-50/70 dark:text-zinc-100 dark:hover:bg-zinc-800/70"
                    >
                      {COLUMNS.map((column) => {
                        const value = row.data[column.key] ?? '';
                        return (
                          <td
                            key={`${row.mentorName}-${column.key}`}
                            className={`whitespace-nowrap px-4 py-3 ${
                              column.key === 'name' ? 'font-medium' : ''
                            }`}
                            onClick={() => openEditModal(row.mentorName)}
                          >
                            {value && String(value).trim().length > 0 ? value : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {tableRows.length === 0 && (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400"
                        colSpan={COLUMNS.length}
                      >
                        표시할 멘토 정보가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selectedMentorName && (
        <div className="modal-overlay-enter fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="modal-panel-enter w-full max-w-6xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {isCreateMode ? '멘토 추가' : `${selectedMentorName} 정보 수정`}
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  필요한 컬럼값을 입력하고 저장하세요.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-lg px-2 py-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                {isCreateMode ? (
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    이름
                    <input
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      value={newMentorName}
                      onChange={(e) => setNewMentorName(e.target.value)}
                      placeholder="멘토 이름 입력"
                    />
                  </label>
                ) : (
                  <>
                    이름: <span className="font-semibold">{selectedMentorName}</span>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {COLUMNS.filter((col) => col.editable).map((column) => (
                  <label
                    key={column.key}
                    className={`text-sm font-medium text-zinc-700 dark:text-zinc-300 ${
                      column.label.length > 24 ? 'md:col-span-2' : ''
                    }`}
                  >
                    {column.label}
                    {column.label.length > 24 ? (
                      <textarea
                        className="mt-1 min-h-[110px] w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                        value={editingProfile[column.key] ?? ''}
                        onChange={(e) => handleProfileChange(column.key, e.target.value)}
                      />
                    ) : (
                      <input
                        className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                        value={editingProfile[column.key] ?? ''}
                        onChange={(e) => handleProfileChange(column.key, e.target.value)}
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between gap-2 border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <div>
                {!isCreateMode && (
                  <button
                    type="button"
                    onClick={handleDeleteMentor}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
                  >
                    멘토 삭제
                  </button>
                )}
              </div>
              <div className="flex gap-2">
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                취소
              </button>
              <button
                type="button"
                onClick={saveProfile}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                저장
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
