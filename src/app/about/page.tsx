import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Target, Users, ShieldCheck, Heart, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'About Us | Workly',
  description: 'Learn about the team behind Workly and our mission to create fair, skills-first student career opportunities.',
};

const teamMembers = [
  {
    name: 'Gaurav Saha',
    role: 'Full-Stack & Systems Architecture',
    bio: 'Dedicated to building resilient, distributed web systems and seamless data pipelines that empower students worldwide.',
  },
  {
    name: 'Deep Mondal',
    role: 'AI / Machine Learning & Analytics',
    bio: 'Specializing in objective resume evaluation, natural language parsing, and fair, bias-reducing matching models.',
  },
  {
    name: 'Ankit Ghosh',
    role: 'Frontend Engineering & Experience Design',
    bio: 'Crafting responsive, accessible, and delight-driven web interfaces that make career growth feel natural and empowering.',
  },
  {
    name: 'Aniruddha Chakraborty',
    role: 'Product Strategy & Integration Lead',
    bio: 'Connecting engineering excellence with real student needs, ensuring honest skill assessments and transparent hiring.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 via-white to-gray-50 text-[var(--color-dark-navy)]">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-primary-blue)] text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              W
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[var(--color-dark-navy)]">
              Workly
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-[var(--color-dark-navy)]">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-[var(--color-primary-blue)] hover:bg-blue-700">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero & Mission Statement */}
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 text-xs font-bold text-[var(--color-primary-blue)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Our Mission & Team</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-dark-navy)]">
            Leveling the Playing Field for Every Student
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed pt-2">
            Traditional recruiting favors pedigree and prestige over true capability. Workly is built on a simple conviction: 
            <strong> hiring should be merit-driven, transparent, and grounded strictly in verified skills.</strong>
          </p>
        </div>

        {/* Mission Statement Callout */}
        <div className="mt-12 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 p-8 sm:p-12 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary-blue)] text-white shadow-md">
              <Target className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[var(--color-dark-navy)]">
                The Workly Mission
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                We empower students to discover their authentic skill strengths, address real gaps through curated free education, and match directly with forward-thinking employers without pedigree bias or hidden filters.
              </p>
            </div>
          </div>
        </div>

        {/* Core Principles */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[var(--color-primary-blue)] mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-dark-navy)]">
              Zero Pedigree Bias
            </h3>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              Our evaluation models deliberately ignore candidate names, gender, photos, and university prestige — focusing 100% on skills, hands-on projects, and real achievements.
            </p>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mb-4">
              <Heart className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-dark-navy)]">
              Free For Everyone
            </h3>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              Resume scoring, skill gap identification, curated coursework from verified open platforms, and job applications will remain completely free for all students.
            </p>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 mb-4">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-dark-navy)]">
              Deterministic + AI Harmony
            </h3>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              Match scores are computed by transparent, verifiable skill overlap algorithms. AI provides actionable context and clear explanations without distorting the numbers.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-24 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3.5 py-1 text-xs font-bold text-gray-700">
              <Users className="h-3.5 w-3.5 text-gray-500" />
              <span>Meet The Creators</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[var(--color-dark-navy)]">
              The Engineering Team
            </h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              Built with care by students, for students — solving the real challenges of entry-level tech recruiting.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:border-blue-200 hover:shadow-md transition"
              >
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-lg shadow-sm mb-4">
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-dark-navy)]">
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold text-[var(--color-primary-blue)] mt-0.5">
                    {member.role}
                  </p>
                  <p className="mt-3 text-xs text-gray-600 leading-relaxed">
                    {member.bio}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-semibold">
                  <span>Workly Core Team</span>
                  <span>2026</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-20 text-center rounded-3xl border border-gray-100 bg-white p-8 sm:p-12 shadow-sm space-y-4">
          <h2 className="text-2xl font-bold text-[var(--color-dark-navy)]">
            Ready to experience skills-based career matching?
          </h2>
          <p className="text-sm text-gray-600 max-w-lg mx-auto">
            Upload your resume to get your personalized skill gap breakdown and match with open roles immediately.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login">
              <Button size="lg" className="bg-[var(--color-primary-blue)] hover:bg-blue-700">
                Get Started for Free
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="border-gray-200">
                Back to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 text-center text-xs text-gray-500">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Workly. Built with merit by Gaurav Saha, Deep Mondal, Ankit Ghosh, and Aniruddha Chakraborty.</p>
          <div className="flex gap-4 font-semibold text-gray-600">
            <Link href="/" className="hover:text-[var(--color-primary-blue)]">Home</Link>
            <Link href="/about" className="hover:text-[var(--color-primary-blue)]">About</Link>
            <Link href="/login" className="hover:text-[var(--color-primary-blue)]">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

