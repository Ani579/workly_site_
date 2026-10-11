import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Target,
  BookOpen,
  CheckCircle2,
  Building2,
  PlusCircle,
  Users2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Zap,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Workly | Match. Learn. Grow. — Merit-Based Career Platform',
  description:
    'Honest AI skill evaluations, free curated learning paths, and deterministic matching for students and forward-thinking recruiters.',
};

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-soft-bg)] text-[var(--color-dark-navy)]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-primary-blue)] text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              W
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[var(--color-dark-navy)]">
              Workly
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
            <a href="#how-it-works" className="hover:text-[var(--color-primary-blue)] transition">
              How It Works
            </a>
            <a href="#students" className="hover:text-[var(--color-primary-blue)] transition">
              For Students
            </a>
            <a href="#recruiters" className="hover:text-[var(--color-primary-blue)] transition">
              For Recruiters
            </a>
            <a href="#free-guarantee" className="hover:text-[var(--color-primary-blue)] transition">
              Free Guarantee
            </a>
            <Link href="/about" className="hover:text-[var(--color-primary-blue)] transition">
              About Team
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-semibold text-gray-700 hover:text-[var(--color-dark-navy)]">
                Sign In
              </Button>
            </Link>
            <Link href="/login?role=student">
              <Button size="sm" className="bg-[var(--color-primary-blue)] hover:bg-blue-700 font-bold shadow-sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 text-xs font-bold text-[var(--color-primary-blue)] shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Merit-Driven Skills Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[var(--color-dark-navy)] leading-[1.1]">
            Match. Learn. Grow.
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-xl text-gray-600 leading-relaxed font-normal">
            Say goodbye to pedigree bias. Workly provides honest AI resume skill gap analysis, connects you with verified free learning resources, and matches you to roles based strictly on capabilities.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login?role=student" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-[var(--color-primary-blue)] hover:bg-blue-700 shadow-md gap-2 font-bold px-8">
                <GraduationCap className="h-5 w-5" />
                <span>I&apos;m a Student</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/login?role=recruiter" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-gray-300 bg-white hover:bg-gray-50 text-[var(--color-dark-navy)] shadow-sm gap-2 font-bold px-8">
                <Briefcase className="h-5 w-5 text-purple-600" />
                <span>I&apos;m a Recruiter</span>
              </Button>
            </Link>
          </div>

          {/* Value Props Pills */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-gray-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              100% Free For Students
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-purple-500" />
              Anonymous Bias-Free Screening
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              Deterministic Matching
            </span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="border-t border-gray-200/80 bg-white px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary-blue)]">
              Transparent Workflows
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[var(--color-dark-navy)]">
              How Workly Works
            </p>
            <p className="mx-auto max-w-xl text-sm sm:text-base text-gray-500">
              Designed for merit, built for progress. Explore the four-step journey for students and employers.
            </p>
          </div>

          {/* Student Flow (4 steps) */}
          <div id="students" className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[var(--color-primary-blue)] font-bold">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--color-dark-navy)]">
                  Student Flow: From Resume to Real Matches
                </h3>
                <p className="text-xs text-gray-500">Four straightforward steps to advance your tech career</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Step 1 */}
              <div className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-gray-50/70 p-6 shadow-xs hover:border-blue-200 transition">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-blue)] text-white font-black text-xs">
                      1
                    </span>
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <h4 className="text-base font-bold text-[var(--color-dark-navy)]">
                    Upload Resume
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Upload your PDF. Our system parses skills in memory without storing raw personal documents or leaking private data.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 text-[11px] font-bold text-gray-400">
                  Zero disk storage of files
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-gray-50/70 p-6 shadow-xs hover:border-blue-200 transition">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-blue)] text-white font-black text-xs">
                      2
                    </span>
                    <Target className="h-5 w-5 text-gray-400" />
                  </div>
                  <h4 className="text-base font-bold text-[var(--color-dark-navy)]">
                    AI Gap Breakdown
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Receive an objective 0–100 profile score, prioritized skill gaps, and concrete resume improvement recommendations.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 text-[11px] font-bold text-gray-400">
                  Fair, uninflated evaluation
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-gray-50/70 p-6 shadow-xs hover:border-blue-200 transition">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-blue)] text-white font-black text-xs">
                      3
                    </span>
                    <BookOpen className="h-5 w-5 text-gray-400" />
                  </div>
                  <h4 className="text-base font-bold text-[var(--color-dark-navy)]">
                    Free Learning Courses
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Get automatically matched to verified free courses (freeCodeCamp, official docs, Coursera audit) targeted directly to your gaps.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 text-[11px] font-bold text-gray-400">
                  100% verified free resources
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-gray-50/70 p-6 shadow-xs hover:border-blue-200 transition">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-blue)] text-white font-black text-xs">
                      4
                    </span>
                    <CheckCircle2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <h4 className="text-base font-bold text-[var(--color-dark-navy)]">
                    Match & Apply
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Browse jobs sorted by your mathematical fit score, inspect AI alignment factors, and submit applications in one click.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 text-[11px] font-bold text-gray-400">
                  Instant transparent ranking
                </div>
              </div>
            </div>
          </div>

          {/* Recruiter Flow (4 steps) */}
          <div id="recruiters" className="space-y-6 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--color-dark-navy)]">
                  Recruiter Flow: Hire Purely on Competence
                </h3>
                <p className="text-xs text-gray-500">Fast, merit-first candidate sourcing with zero pedigree noise</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Step 1 */}
              <div className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-gray-50/70 p-6 shadow-xs hover:border-purple-200 transition">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white font-black text-xs">
                      1
                    </span>
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <h4 className="text-base font-bold text-[var(--color-dark-navy)]">
                    Company Profile
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Configure your organization details, size, mission, and official website to establish authenticity.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 text-[11px] font-bold text-gray-400">
                  Simple single-step setup
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-gray-50/70 p-6 shadow-xs hover:border-purple-200 transition">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white font-black text-xs">
                      2
                    </span>
                    <PlusCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <h4 className="text-base font-bold text-[var(--color-dark-navy)]">
                    Post Roles & Skills
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Publish openings specifying exact required technical skills, experience tier, and location expectations.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 text-[11px] font-bold text-gray-400">
                  Normalized skill tagging
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-gray-50/70 p-6 shadow-xs hover:border-purple-200 transition">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white font-black text-xs">
                      3
                    </span>
                    <Users2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <h4 className="text-base font-bold text-[var(--color-dark-navy)]">
                    Automated Candidate Matching
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Instantly view ranked candidates evaluated through deterministic overlap algorithms with AI explanation breakdowns.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 text-[11px] font-bold text-gray-400">
                  Math-backed candidate ranks
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-gray-50/70 p-6 shadow-xs hover:border-purple-200 transition">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white font-black text-xs">
                      4
                    </span>
                    <ShieldCheck className="h-5 w-5 text-gray-400" />
                  </div>
                  <h4 className="text-base font-bold text-[var(--color-dark-navy)]">
                    Anonymous Mode Screening
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Toggle Anonymous Mode to conceal names and identifiers, ensuring completely unbiased merit shortlisting.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 text-[11px] font-bold text-gray-400">
                  True merit-based hiring
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free for Everyone Section */}
      <section id="free-guarantee" className="px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-4xl rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-500 via-indigo-600 to-[var(--color-primary-blue)] p-8 sm:p-14 text-white shadow-xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
            <Lock className="h-3.5 w-3.5" />
            <span>Open Access Commitment</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Free for Everyone. Always.
          </h2>

          <p className="text-base sm:text-lg text-blue-100 leading-relaxed max-w-2xl">
            We believe career development should never be locked behind a paywall. Workly will never charge students for resume evaluations, skill gap insights, AI mock interview practice, or job applications.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xs border border-white/15">
              <h3 className="font-bold text-base mb-1">Zero Paywalls</h3>
              <p className="text-xs text-blue-100">Every feature is accessible without credit cards or trial limitations.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xs border border-white/15">
              <h3 className="font-bold text-base mb-1">Open Curricula</h3>
              <p className="text-xs text-blue-100">Only verified free courses from freeCodeCamp, Coursera audit, and docs.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xs border border-white/15">
              <h3 className="font-bold text-base mb-1">Strict Privacy</h3>
              <p className="text-xs text-blue-100">Your resume files are evaluated in memory and never sold or shared.</p>
            </div>
          </div>

          <div className="pt-4">
            <Link href="/login?role=student">
              <Button size="lg" className="bg-white text-[var(--color-primary-blue)] hover:bg-blue-50 font-extrabold shadow-md">
                Join Workly for Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12 text-xs text-gray-500">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-primary-blue)] text-white font-black text-sm">
                W
              </div>
              <span className="text-lg font-extrabold tracking-tight text-[var(--color-dark-navy)]">
                Workly
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-gray-400 font-medium">Match. Learn. Grow.</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-semibold text-gray-600">
              <a href="#how-it-works" className="hover:text-[var(--color-primary-blue)]">
                How It Works
              </a>
              <a href="#students" className="hover:text-[var(--color-primary-blue)]">
                Students
              </a>
              <a href="#recruiters" className="hover:text-[var(--color-primary-blue)]">
                Recruiters
              </a>
              <Link href="/about" className="hover:text-[var(--color-primary-blue)]">
                About the Team
              </Link>
              <Link href="/login" className="hover:text-[var(--color-primary-blue)]">
                Sign In
              </Link>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-gray-400">
              © 2026 Workly. Designed and developed by{' '}
              <span className="font-semibold text-gray-700">
                Gaurav Saha, Deep Mondal, Ankit Ghosh, and Aniruddha Chakraborty
              </span>
              .
            </p>
            <p className="text-[11px] text-gray-400">
              Built on merit. No vanity metrics or unverified claims.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
