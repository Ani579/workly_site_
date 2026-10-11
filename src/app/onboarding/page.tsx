'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase } from 'lucide-react';

export default function OnboardingPage() {
  const { update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<'STUDENT' | 'RECRUITER' | null>(null);

  async function selectRole(role: 'STUDENT' | 'RECRUITER') {
    setLoading(role);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error('Failed to save role');

      // Trigger NextAuth session update to refresh the role in the JWT
      await update({ role });

      router.push(role === 'STUDENT' ? '/student/dashboard' : '/recruiter/dashboard');
    } catch (err) {
      console.error(err);
      setLoading(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-soft-bg)] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl text-center"
      >
        <h1 className="mb-2 text-4xl font-extrabold text-[var(--color-dark-navy)]">
          I am a…
        </h1>
        <p className="mb-10 text-gray-500">Choose your role. You can&apos;t change this later.</p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Student card */}
          <button
            onClick={() => selectRole('STUDENT')}
            disabled={!!loading}
            className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-gray-200 bg-white p-10 transition hover:border-[var(--color-primary-blue)] hover:shadow-lg disabled:opacity-60"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[var(--color-primary-blue)] transition group-hover:bg-[var(--color-primary-blue)] group-hover:text-white">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--color-dark-navy)]">Student</p>
              <p className="mt-1 text-sm text-gray-500">Find jobs and grow your career</p>
            </div>
            {loading === 'STUDENT' && (
              <span className="text-sm text-[var(--color-primary-blue)] animate-pulse">Setting up…</span>
            )}
          </button>

          {/* Recruiter card */}
          <button
            onClick={() => selectRole('RECRUITER')}
            disabled={!!loading}
            className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-gray-200 bg-white p-10 transition hover:border-[var(--color-success-green)] hover:shadow-lg disabled:opacity-60"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-[var(--color-success-green)] transition group-hover:bg-[var(--color-success-green)] group-hover:text-white">
              <Briefcase className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--color-dark-navy)]">Recruiter</p>
              <p className="mt-1 text-sm text-gray-500">Post jobs and find top talent</p>
            </div>
            {loading === 'RECRUITER' && (
              <span className="text-sm text-[var(--color-success-green)] animate-pulse">Setting up…</span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

