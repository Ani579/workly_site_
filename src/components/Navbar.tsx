'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { LogOut, User } from 'lucide-react';

export function Navbar() {
  const { data: session } = useSession();

  if (!session) return null;

  const role = session.user.role;
  const dashboardHref = role === 'STUDENT' ? '/student/dashboard' : '/recruiter/dashboard';

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href={dashboardHref} className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-[var(--color-primary-blue)] flex items-center justify-center">
            <span className="text-white text-base font-black">W</span>
          </div>
          <span className="font-extrabold text-[var(--color-dark-navy)] text-lg tracking-tight">
            work<span className="text-[var(--color-primary-blue)]">ly</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Role badge */}
          {role && (
            <span className={`hidden sm:inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              role === 'STUDENT'
                ? 'bg-blue-100 text-[var(--color-primary-blue)]'
                : 'bg-green-100 text-[var(--color-success-green)]'
            }`}>
              {role}
            </span>
          )}

          {/* User name */}
          <div className="flex items-center gap-2">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name ?? ''}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                <User className="h-4 w-4 text-gray-500" />
              </div>
            )}
            <span className="hidden text-sm font-medium text-[var(--color-dark-navy)] sm:block">
              {session.user.name}
            </span>
          </div>

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:border-red-300 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

