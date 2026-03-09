'use client';

import { useMemo } from 'react';
import { useStudents } from '@/app/others/parcel/_hooks/useStudents';
import { lectureHallFromTeamNo, parseTeamNo } from '@/lib/lectureHall';

type TeamSummary = {
  teamLabel: string;
  teamNo: number | null;
  hall: string;
  total: number;
  male: number;
  female: number;
  mentors: Array<{ name: string; count: number }>;
};

const HALL_ORDER = ['1강의장', '2강의장', '5강의장', '6강의장', '미지정'] as const;

function normalizeMentor(v?: string | null) {
  const t = String(v ?? '').trim();
  return t || '미지정';
}

export default function StudentGroupsPage() {
  const { studentsAll, loadingStudents, errorStudents } = useStudents();

  const teams = useMemo<TeamSummary[]>(() => {
    const map = new Map<string, TeamSummary>();

    studentsAll.forEach((student) => {
      const teamNo = parseTeamNo(student.teamNo ?? student.group ?? null);
      const teamLabel = teamNo === null ? '미지정' : `${teamNo}조`;
      const hall = lectureHallFromTeamNo(teamNo) ?? '미지정';
      const mentor = normalizeMentor(student.mentor);
      const gender = String(student.gender ?? '').trim();

      const current = map.get(teamLabel) ?? {
        teamLabel,
        teamNo,
        hall,
        total: 0,
        male: 0,
        female: 0,
        mentors: [],
      };

      current.total += 1;
      if (gender === '남') current.male += 1;
      if (gender === '여') current.female += 1;

      const mentorCell = current.mentors.find((m) => m.name === mentor);
      if (mentorCell) mentorCell.count += 1;
      else current.mentors.push({ name: mentor, count: 1 });

      map.set(teamLabel, current);
    });

    return Array.from(map.values())
      .map((team) => ({
        ...team,
        mentors: [...team.mentors].sort((a, b) => b.count - a.count),
      }))
      .sort((a, b) => {
        if (a.teamNo === null && b.teamNo === null) return a.teamLabel.localeCompare(b.teamLabel, 'ko');
        if (a.teamNo === null) return 1;
        if (b.teamNo === null) return -1;
        return a.teamNo - b.teamNo;
      });
  }, [studentsAll]);

  const hallGroups = useMemo(() => {
    const map = new Map<string, TeamSummary[]>();
    HALL_ORDER.forEach((hall) => map.set(hall, []));

    teams.forEach((team) => {
      const key = HALL_ORDER.includes(team.hall as (typeof HALL_ORDER)[number]) ? team.hall : '미지정';
      map.get(key)?.push(team);
    });

    return HALL_ORDER.map((hall) => ({
      hall,
      teams: map.get(hall) ?? [],
      totalStudents: (map.get(hall) ?? []).reduce((sum, team) => sum + team.total, 0),
    })).filter((group) => group.teams.length > 0);
  }, [teams]);

  const totalAssigned = teams.reduce((sum, team) => sum + team.total, 0);
  const totalTeams = teams.filter((team) => team.teamNo !== null).length;
  const unassigned = teams.find((team) => team.teamNo === null)?.total ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6">
          <h1 className="mb-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">조편성</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            조/강의장 기준 학생 배치를 한 번에 확인합니다.
          </p>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">편성 학생</div>
            <div className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{totalAssigned}</div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">운영 조 수</div>
            <div className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{totalTeams}</div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">미지정 인원</div>
            <div className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{unassigned}</div>
          </div>
        </section>

        {loadingStudents && <div className="text-sm text-zinc-500 dark:text-zinc-400">로딩 중...</div>}
        {errorStudents && <div className="text-sm text-red-600 dark:text-red-300">{errorStudents}</div>}

        {!loadingStudents && !errorStudents && (
          <div className="space-y-6">
            {hallGroups.map((group) => (
              <section
                key={group.hall}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-800/60">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{group.hall}</h2>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
                    {group.teams.length}개 조 · {group.totalStudents}명
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-white dark:bg-zinc-900">
                      <tr className="text-left text-zinc-600 dark:text-zinc-300">
                        <th className="px-5 py-3">조</th>
                        <th className="px-5 py-3">학생 수</th>
                        <th className="px-5 py-3">남/여</th>
                        <th className="px-5 py-3">담당 멘토</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {group.teams.map((team) => (
                        <tr key={`${group.hall}-${team.teamLabel}`} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                          <td className="px-5 py-3 font-semibold text-zinc-900 dark:text-zinc-100">{team.teamLabel}</td>
                          <td className="px-5 py-3 text-zinc-700 dark:text-zinc-200">{team.total}명</td>
                          <td className="px-5 py-3 text-zinc-700 dark:text-zinc-200">
                            남 {team.male} · 여 {team.female}
                          </td>
                          <td className="px-5 py-3 text-zinc-700 dark:text-zinc-200">
                            {team.mentors.length > 0
                              ? team.mentors.map((mentor) => `${mentor.name}(${mentor.count})`).join(', ')
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}

            {hallGroups.length === 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                표시할 조편성 데이터가 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
