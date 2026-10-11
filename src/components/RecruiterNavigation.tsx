'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, PlusCircle, Building } from 'lucide-react';

const RECRUITER_NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/recruiter/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'My Jobs',
    href: '/recruiter/jobs',
    icon: Briefcase,
  },
  {
    label: 'Post a Job',
    href: '/recruiter/jobs/new',
    icon: PlusCircle,
  },
  {
    label: 'Company Profile',
    href: '/recruiter/company',
    icon: Building,
  },
];

export function RecruiterNavigation() {
  const pathname = usePathname();

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col py-6 pr-6 border-r border-gray-200/70">
        <div className="space-y-1">
          {RECRUITER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/recruiter/dashboard'
                ? pathname === '/recruiter/dashboard'
                : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-purple-50 font-bold text-purple-700'
                    : 'font-medium text-gray-600 hover:bg-gray-100/60 hover:text-[var(--color-dark-navy)]'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-purple-700' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Recruiter info callout */}
        <div className="mt-auto rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50/50 p-4 border border-purple-100/60">
          <p className="text-xs font-bold text-[var(--color-dark-navy)]">Merit-Based Hiring</p>
          <p className="mt-1 text-[11px] text-gray-500">
            Transparent skill match scores and bias-free anonymous screening.
          </p>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-gray-200/80 bg-white/95 px-2 py-2 backdrop-blur-md md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        {RECRUITER_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/recruiter/dashboard'
              ? pathname === '/recruiter/dashboard'
              : pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center rounded-xl px-3 py-1 text-[11px] transition-colors ${
                isActive
                  ? 'font-bold text-purple-700'
                  : 'font-medium text-gray-500 hover:text-[var(--color-dark-navy)]'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-purple-700' : 'text-gray-400'}`} />
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

