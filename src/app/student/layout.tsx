import React from 'react';
import { Navbar } from '@/components/Navbar';
import { StudentNavigation } from '@/components/StudentNavigation';
import { requireRole } from '@/lib/auth';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure authenticated student
  await requireRole('STUDENT');

  return (
    <div className="min-h-screen bg-[var(--color-soft-bg)] pb-20 md:pb-10">
      <Navbar />
      <div className="mx-auto flex max-w-7xl px-4 sm:px-6 lg:px-8">
        <StudentNavigation />
        <div className="min-w-0 flex-1 py-6 md:pl-6">{children}</div>
      </div>
    </div>
  );
}

