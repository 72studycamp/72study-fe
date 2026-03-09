'use client';

import { Fragment, useMemo } from 'react';
import { useStudents } from '@/app/others/parcel/_hooks/useStudents';

type TeamMentorSummary = {
  team: string;
  totalStudents: number;
  mentorCounts: Array<{ mentor: string; count: number }>;
};

type MentorTeamSummary = {
  mentor: string;
  totalStudents: number;
  teams: string[];
};

function normalizeMentorName(v?: string | null) {
  const t = String(v ?? '').trim();
  return t.length > 0 ? t : '미지정';
}

function normalizeTeam(v?: string | null) {
  const t = String(v ?? '').trim();
  if (!t) return '-';
  return t.endsWith('조') ? t : `${t}조`;
}

function getTeamNumber(team?: string | null): number | null {
  const t = String(team ?? '').trim();
  const match = t.match(/(\d+)\s*조?$/);
  if (!match) return null;
  return Number(match[1]);
}

function sortTeamsNumeric(a: string, b: string) {
  const aNo = getTeamNumber(a);
  const bNo = getTeamNumber(b);
  if (aNo === null && bNo === null) return a.localeCompare(b, 'ko');
  if (aNo === null) return 1;
  if (bNo === null) return -1;
  return aNo - bNo;
}

function getLectureHallByTeam(team: string): string {
  const n = getTeamNumber(team);
  if (n === null) return '기타';
  if (n >= 1 && n <= 5) return '1강의장';
  if (n >= 6 && n <= 10) return '2강의장';
  if (n >= 12 && n <= 13) return '5강의장';
  if (n >= 14 && n <= 15) return '6강의장';
  return '기타';
}

export default function MentorGroupsPage() {
  const { studentsAll, loadingStudents, errorStudents } = useStudents();

  const teamRows = useMemo<TeamMentorSummary[]>(() => {
    const detectedTeamNos = studentsAll
      .map((student) => getTeamNumber(normalizeTeam(student.group ?? student.teamNo)))
      .filter((v): v is number => v !== null);
    const maxTeamNo = Math.max(15, detectedTeamNos.length > 0 ? Math.max(...detectedTeamNos) : 0);
    const teams = Array.from({ length: maxTeamNo }, (_, i) => `${i + 1}조`);
    const map = new Map<string, TeamMentorSummary>(
      teams.map((team) => [team, { team, totalStudents: 0, mentorCounts: [] }])
    );

    studentsAll.forEach((student) => {
      const team = normalizeTeam(student.group ?? student.teamNo);
      if (!map.has(team)) {
        map.set(team, { team, totalStudents: 0, mentorCounts: [] });
      }
      const mentor = normalizeMentorName(student.mentor);
      const row = map.get(team)!;
      row.totalStudents += 1;

      const existing = row.mentorCounts.find((v) => v.mentor === mentor);
      if (existing) {
        existing.count += 1;
      } else {
        row.mentorCounts.push({ mentor, count: 1 });
      }
    });

    return Array.from(map.values())
      .map((row) => ({
        ...row,
        mentorCounts: [...row.mentorCounts].sort((a, b) => b.count - a.count),
      }))
      .sort((a, b) => sortTeamsNumeric(a.team, b.team));
  }, [studentsAll]);

  const mentorRows = useMemo<MentorTeamSummary[]>(() => {
    const map = new Map<string, MentorTeamSummary>();

    studentsAll.forEach((student) => {
      const mentor = normalizeMentorName(student.mentor);
      const team = normalizeTeam(student.group ?? student.teamNo);
      const row = map.get(mentor) ?? { mentor, totalStudents: 0, teams: [] };
      row.totalStudents += 1;
      if (!row.teams.includes(team)) row.teams.push(team);
      map.set(mentor, row);
    });

    return Array.from(map.values())
      .map((row) => ({ ...row, teams: row.teams.sort(sortTeamsNumeric) }))
      .sort((a, b) => {
        const aPrimary = a.teams[0] ?? '';
        const bPrimary = b.teams[0] ?? '';
        const byTeam = sortTeamsNumeric(aPrimary, bPrimary);
        if (byTeam !== 0) return byTeam;
        return a.mentor.localeCompare(b.mentor, 'ko');
      });
  }, [studentsAll]);

  const groupedTeamRows = useMemo(() => {
    const groups = [
      { title: '1강의장', teams: [] as TeamMentorSummary[] },
      { title: '2강의장', teams: [] as TeamMentorSummary[] },
      { title: '5강의장', teams: [] as TeamMentorSummary[] },
      { title: '6강의장', teams: [] as TeamMentorSummary[] },
      { title: '기타', teams: [] as TeamMentorSummary[] },
    ];

    teamRows.forEach((row) => {
      const hall = getLectureHallByTeam(row.team);
      const target = groups.find((g) => g.title === hall);
      target?.teams.push(row);
    });

    return groups.filter((g) => g.teams.length > 0);
  }, [teamRows]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6">
          <h1 className="mb-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">멘토 조편성</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            조 기준 멘토 배치와 멘토 기준 담당 조를 동시에 확인합니다.
          </p>
        </header>

        {loadingStudents && <div className="text-sm text-zinc-500 dark:text-zinc-400">로딩 중...</div>}
        {errorStudents && <div className="text-sm text-red-600 dark:text-red-300">{errorStudents}</div>}

        {!loadingStudents && !errorStudents && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">조별 멘토 배치</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-800">
                    <tr className="text-left text-zinc-700 dark:text-zinc-200">
                      <th className="px-4 py-3">조</th>
                      <th className="px-4 py-3">학생 수</th>
                      <th className="px-4 py-3">멘토 배치</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {groupedTeamRows.map((group) => (
                      <Fragment key={group.title}>
                        <tr className="bg-blue-50/70 text-zinc-800 dark:bg-zinc-800/70 dark:text-zinc-100">
                          <td className="px-4 py-2 font-semibold" colSpan={3}>
                            {group.title}
                          </td>
                        </tr>
                        {group.teams.map((row) => (
                          <tr key={`${group.title}-${row.team}`} className="text-zinc-800 dark:text-zinc-100">
                            <td className="px-4 py-3 font-medium">{row.team}</td>
                            <td className="px-4 py-3">{row.totalStudents}명</td>
                            <td className="px-4 py-3">
                              {row.mentorCounts.length > 0
                                ? row.mentorCounts.map((v) => `${v.mentor}(${v.count})`).join(', ')
                                : '-'}
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">멘토별 담당 조</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-800">
                    <tr className="text-left text-zinc-700 dark:text-zinc-200">
                      <th className="px-4 py-3">멘토</th>
                      <th className="px-4 py-3">담당 학생</th>
                      <th className="px-4 py-3">담당 조</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {mentorRows.map((row) => (
                      <tr key={row.mentor} className="text-zinc-800 dark:text-zinc-100">
                        <td className="px-4 py-3 font-medium">{row.mentor}</td>
                        <td className="px-4 py-3">{row.totalStudents}명</td>
                        <td className="px-4 py-3">{row.teams.join(', ') || '-'}</td>
                      </tr>
                    ))}
                    {mentorRows.length === 0 && (
                      <tr>
                        <td className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400" colSpan={3}>
                          표시할 멘토 조편성 데이터가 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
