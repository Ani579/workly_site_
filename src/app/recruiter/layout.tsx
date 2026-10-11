import React from 'react';
import { Navbar } from '@/components/Navbar';
import { RecruiterNavigation } from '@/components/RecruiterNavigation';
import { requireRole } from '@/lib/auth';

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce authenticated recruiter
  await requireRole('RECRUITER');

  return (
    <div className="min-h-screen bg-[var(--color-soft-bg)] pb-20 md:pb-10">
      <Navbar />
      <div className="mx-auto flex max-w-7xl px-4 sm:px-6 lg:px-8">
        <RecruiterNavigation />
        <div className="min-w-0 flex-1 py-6 md:pl-6">{children}</div>
      </div>
    </div>
  );
}

