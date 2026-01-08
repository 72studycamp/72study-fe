'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface MenuItem {
  label: string;
  href: string;
  subItems?: { label: string; href: string }[];
}

const menuItems: MenuItem[] = [
  {
    label: '학생 관리',
    href: '/students',
    subItems: [
      { label: '기본DB', href: '/students/basic' },
      { label: '좌석배치', href: '/students/seating' },
      { label: '조편성', href: '/students/groups' },
      { label: '방배정', href: '/students/rooms' },
      { label: '방이름표', href: '/students/room-tags' },
    ],
  },
  {
    label: '근무 관리',
    href: '/work',
    subItems: [
      { label: '근무일정', href: '/work/schedule' },
      { label: '출퇴근', href: '/work/attendance' },
      { label: '학습멘토근무표', href: '/work/learning-mentor' },
      { label: '총괄멘토근무표', href: '/work/general-mentor' },
      { label: '총괄멘토근무표의 사본', href: '/work/general-mentor-copy' },
      { label: '입소일근무표', href: '/work/admission' },
      { label: '주말근무1회', href: '/work/weekend' },
      { label: '지원근무', href: '/work/support' },
    ],
  },
  {
    label: '멘토 관리',
    href: '/mentors',
    subItems: [
      { label: '멘토 조편성', href: '/mentors/groups' },
      { label: '멘토정보', href: '/mentors/info' },
    ],
  },
  {
    label: '수강/접수',
    href: '/enrollment',
    subItems: [
      { label: '수강대장', href: '/enrollment/register' },
      { label: '교습비영수', href: '/enrollment/receipt' },
      { label: '접수철', href: '/enrollment/desk' },
      { label: '수강', href: '/enrollment/courses' },
    ],
  },
  {
    label: '기타 관리',
    href: '/others',
    subItems: [
      { label: '택배관리', href: '/others/packages' },
      { label: '야간자습', href: '/others/night-study' },
      { label: '집중상담', href: '/others/counseling' },
      { label: '특강', href: '/others/special-lecture' },
      { label: '스피치', href: '/others/speech' },
      { label: '층별배치', href: '/others/floor-assignment' },
      { label: '담당숙소', href: '/others/dormitory' },
      { label: '식사 순번+탁구장', href: '/others/meals' },
      { label: '퇴소1일전', href: '/others/dropout-1day' },
      { label: '퇴소일', href: '/others/dropout-day' },
      { label: '식수', href: '/others/meals-count' },
    ],
  },
];

export default function Navigation() {
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  return (
    <nav className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-1 z-50 shadow-sm">
      <div className="container mx-auto px-3 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* 로고 영역 */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/72Logo.png"
                alt="72h 로고"
                width={120}
                height={60}
                className="h-15 w-auto dark:invert"
                priority
              />
            </Link>
          </div>

          {/* 메인 메뉴 */}
          <div className="flex items-center gap-1">
            {menuItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setHoveredMenu(item.label)}
                onMouseLeave={() => setHoveredMenu(null)}
              >
                <Link
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                    hoveredMenu === item.label
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {item.label}
                  {hoveredMenu === item.label && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></span>
                  )}
                </Link>

                {/* 드롭다운 메뉴 */}
                {item.subItems && hoveredMenu === item.label && (
                  <div className="absolute top-full left-0 mt-0 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg py-2 z-50">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 우측 유틸리티 아이콘 */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <button className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

