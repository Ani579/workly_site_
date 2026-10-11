'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { GraduationCap, Briefcase, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function LoginForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const roleParam = searchParams.get('role');

  const [customEmail, setCustomEmail] = useState('');
  const [customRole, setCustomRole] = useState<'STUDENT' | 'RECRUITER'>(
    roleParam === 'recruiter' ? 'RECRUITER' : 'STUDENT'
  );
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleDemoLogin = async (type: 'STUDENT' | 'RECRUITER') => {
    setIsLoading(type);
    if (type === 'STUDENT') {
      await signIn('credentials', {
        email: 'demo.student@workly.local',
        name: 'Demo Student',
        role: 'STUDENT',
        callbackUrl: '/student/dashboard',
      });
    } else {
      await signIn('credentials', {
        email: 'demo-recruiter-1@workly.demo',
        name: 'Demo Recruiter',
        role: 'RECRUITER',
        callbackUrl: '/recruiter/dashboard',
      });
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    setIsLoading('custom');
    await signIn('credentials', {
      email: customEmail.trim(),
      name: customEmail.split('@')[0],
      role: customRole,
      callbackUrl: customRole === 'STUDENT' ? '/student/dashboard' : '/recruiter/dashboard',
    });
  };

  const handleGoogleLogin = () => {
    setIsLoading('google');
    signIn('google', { callbackUrl: '/onboarding' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-soft-bg)] p-4 sm:p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 sm:p-10 shadow-xl border border-gray-100 text-center">
        {/* Brand Logo */}
        <div className="mb-4 flex justify-center">
          <div className="h-14 w-14 rounded-2xl bg-[var(--color-primary-blue)] flex items-center justify-center shadow-md shadow-blue-200">
            <span className="text-white text-2xl font-black">W</span>
          </div>
        </div>

        <h1 className="text-2xl font-black text-[var(--color-dark-navy)]">
          Welcome to Workly
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Match. Learn. Grow.
        </p>

        {errorParam && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-amber-50 p-3.5 text-left text-xs text-amber-800 border border-amber-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold">Google OAuth Not Configured</p>
              <p className="mt-0.5 text-amber-700">
                Google Client ID is not yet provided in <code className="bg-amber-100 px-1 py-0.5 rounded">.env.local</code>. Use the 1-Click demo logins below to explore everything instantly!
              </p>
            </div>
          </div>
        )}

        {/* 1-Click Fast Demo Logins */}
        <div className="mt-6 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Quick 1-Click Demo Access
          </p>

          <button
            type="button"
            disabled={!!isLoading}
            onClick={() => handleDemoLogin('STUDENT')}
            className="w-full flex items-center justify-between rounded-2xl border-2 border-blue-200 bg-blue-50/70 p-3.5 transition hover:border-[var(--color-primary-blue)] hover:bg-blue-100/70 text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-blue)] text-white font-bold">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-[var(--color-dark-navy)]">
                  Continue as Demo Student
                </p>
                <p className="text-xs text-gray-500">
                  Preloaded verified resume, skills & matches
                </p>
              </div>
            </div>
            {isLoading === 'STUDENT' ? (
              <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary-blue)]" />
            ) : (
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[var(--color-primary-blue)] transition-transform group-hover:translate-x-0.5" />
            )}
          </button>

          <button
            type="button"
            disabled={!!isLoading}
            onClick={() => handleDemoLogin('RECRUITER')}
            className="w-full flex items-center justify-between rounded-2xl border-2 border-purple-200 bg-purple-50/70 p-3.5 transition hover:border-purple-600 hover:bg-purple-100/70 text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white font-bold">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-[var(--color-dark-navy)]">
                  Continue as Demo Recruiter
                </p>
                <p className="text-xs text-gray-500">
                  Manage demo company jobs & candidates
                </p>
              </div>
            </div>
            {isLoading === 'RECRUITER' ? (
              <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
            ) : (
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-0.5" />
            )}
          </button>
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[11px] font-medium text-gray-400 uppercase">Or Sign In with Email</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Custom Email Form */}
        <form onSubmit={handleCustomLogin} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="email"
              required
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:border-[var(--color-primary-blue)] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCustomRole('STUDENT')}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold border transition ${
                customRole === 'STUDENT'
                  ? 'border-blue-500 bg-blue-50 text-[var(--color-primary-blue)]'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              I am a Student
            </button>
            <button
              type="button"
              onClick={() => setCustomRole('RECRUITER')}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold border transition ${
                customRole === 'RECRUITER'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              I am a Recruiter
            </button>
          </div>

          <Button
            type="submit"
            disabled={!customEmail || !!isLoading}
            variant="primary"
            size="md"
            className="w-full justify-center"
          >
            {isLoading === 'custom' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>Sign In with Email</span>
            )}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[11px] font-medium text-gray-400 uppercase">Or Google</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          type="button"
          disabled={!!isLoading}
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-[var(--color-dark-navy)] transition hover:border-[var(--color-primary-blue)] hover:bg-blue-50/50"
        >
          <svg className="h-4 w-4" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.4 30.2 0 24 0 14.6 0 6.6 5.5 2.7 13.5l7.8 6C12.5 13 17.8 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.7c-.5 2.9-2.2 5.3-4.7 6.9l7.3 5.7c4.3-4 6.8-9.9 7.2-16.9z"/>
            <path fill="#FBBC05" d="M10.5 28.5A14.3 14.3 0 0 1 9.5 24c0-1.6.3-3.1.8-4.5l-7.8-6A23.8 23.8 0 0 0 0 24c0 3.8.9 7.4 2.5 10.6l8-6.1z"/>
            <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.3-5.7c-2 1.4-4.6 2.2-7.9 2.2-6.2 0-11.5-4.2-13.4-9.8l-8 6.1C6.5 42.4 14.6 48 24 48z"/>
          </svg>
          Continue with Google OAuth
        </button>

        <p className="mt-5 text-[11px] text-gray-400">
          By signing in, you agree to Workly&apos;s terms &amp; code of conduct.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
