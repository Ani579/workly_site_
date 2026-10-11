'use client';

import React from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScoreProgressChart } from '@/components/student/ScoreProgressChart';
import {
  Sparkles,
  ArrowRight,
  UploadCloud,
  GraduationCap,
  Briefcase,
  ExternalLink,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface Skill {
  name: string;
  level: number;
  source?: string;
}

interface SkillGap {
  name: string;
  priority: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

interface CourseItem {
  _id: string;
  title: string;
  provider: string;
  url: string;
  skillTag: string;
}

interface ProfileData {
  headline?: string;
  bio?: string;
  profileScore?: number | null;
  scoreSummary?: string;
  strengths?: string[];
  improvements?: string[];
  skills?: Skill[];
  skillGaps?: SkillGap[];
  resumeFileName?: string;
}

interface TopJobItem {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  type: string;
  matchScore: number;
}

interface ScoreHistoryItem {
  _id: string;
  score: number;
  createdAt: string;
}

interface DashboardClientProps {
  userName: string;
  profile: ProfileData | null;
  courses: CourseItem[];
  topJobs?: TopJobItem[];
  scoreHistory?: ScoreHistoryItem[];
  cohortStats: {
    totalEvaluatedProfiles: number;
    percentile: number | null;
  };
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      duration: 0.25,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
    },
  },
};

export function DashboardClient({
  userName,
  profile,
  courses,
  topJobs = [],
  scoreHistory = [],
  cohortStats,
}: DashboardClientProps) {
  const firstName = userName ? userName.split(' ')[0] : 'Student';
  const hasResume = !!profile?.profileScore || !!profile?.resumeFileName;
  const score = profile?.profileScore ?? 0;

  // Label strictly following specs: 80+ "Excellent", 60-79 "Good", below 60 "Needs work"
  const scoreLabel =
    score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs work';
  const scoreBadgeColor =
    score >= 80
      ? 'bg-green-100 text-[var(--color-success-green)] border-green-200'
      : score >= 60
      ? 'bg-blue-100 text-[var(--color-primary-blue)] border-blue-200'
      : 'bg-amber-100 text-amber-800 border-amber-200';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* 1. WELCOME HEADER */}
      <motion.div variants={itemVariants} className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-dark-navy)] sm:text-4xl">
            Welcome, {firstName}! 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {hasResume
              ? 'Here is your real-time skills assessment, gap analysis, and tailored learning paths.'
              : 'Complete your profile and upload your resume to unlock AI scoring and curated recommendations.'}
          </p>
        </div>

        <Link href="/student/profile">
          <Button variant="secondary" size="sm" className="w-full sm:w-auto shadow-sm">
            <span>{hasResume ? 'Update Resume / Profile' : 'Upload Resume Now'}</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </motion.div>

      {/* EMPTY STATE IF NO RESUME ANALYZED */}
      {!hasResume ? (
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/30 to-green-50/20 p-8 sm:p-12 text-center shadow-sm"
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--color-primary-blue)] text-white shadow-lg">
            <UploadCloud className="h-10 w-10" />
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-dark-navy)]">
            Analyze Your Resume to Activate Your Dashboard
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-gray-600">
            Workly uses privacy-preserving, bias-free AI to benchmark your technical skills, uncover high-priority skill gaps, and match you with curated free courses.
          </p>

          <div className="mt-8 flex justify-center">
            <Link href="/student/profile">
              <Button size="lg" className="shadow-md">
                <span>Upload PDF Resume</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      ) : (
        /* ACTIVE DASHBOARD GRID */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* PROFILE SCORE CARD (5 cols) */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-5"
          >
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                  <Sparkles className="h-4 w-4 text-[var(--color-primary-blue)]" />
                  Profile Score
                </span>

                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold ${scoreBadgeColor}`}>
                  {scoreLabel}
                </span>
              </div>

              <div className="my-4 flex flex-col items-center justify-center text-center">
                <ScoreRing score={score} size={150} strokeWidth={12} />
                <h3 className="mt-4 text-xl font-extrabold text-[var(--color-dark-navy)]">
                  {score}/100 Merit Score
                </h3>
                {profile.scoreSummary && (
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed max-w-xs">
                    {profile.scoreSummary}
                  </p>
                )}
              </div>
            </div>

            {/* REAL DATABASE COHORT CLAIM - ONLY COMPUTED FROM REAL STORED SCORES */}
            <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-xs text-gray-600 border border-gray-100">
              {cohortStats.percentile !== null && cohortStats.totalEvaluatedProfiles > 1 ? (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[var(--color-primary-blue)] shrink-0" />
                  <span>
                    Outscores <strong className="text-[var(--color-dark-navy)]">{cohortStats.percentile}%</strong> of candidates based on {cohortStats.totalEvaluatedProfiles} verified student profiles in our database.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-success-green)] shrink-0" />
                  <span>
                    Evaluated objectively on skills, experience depth, and project outcomes.
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* TOP SKILLS CARD (7 cols) */}
          <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-7 flex flex-col justify-between"
          >
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-dark-navy)]">Top Skills</h3>
                  <p className="text-xs text-gray-500">
                    Demonstrated technical capabilities extracted from your resume.
                  </p>
                </div>
                <Badge variant="outline" className="border-blue-100 bg-blue-50 text-[var(--color-primary-blue)] font-bold">
                  {profile.skills?.length || 0} Identified
                </Badge>
              </div>

              <div className="space-y-3.5 mt-4">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.slice(0, 6).map((skill, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-[var(--color-dark-navy)]">
                        <span>{skill.name}</span>
                        <span className="text-gray-500 font-mono">{skill.level}%</span>
                      </div>
                      <ProgressBar value={skill.level} indicatorColor="bg-[var(--color-primary-blue)]" />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No skills extracted yet.</p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
              <span className="text-gray-400">Want to add more skills?</span>
              <Link href="/student/profile" className="font-bold text-[var(--color-primary-blue)] hover:underline flex items-center gap-1">
                <span>Update Resume</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </motion.div>

          {/* SKILL GAPS CARD (6 cols) */}
          <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-6 flex flex-col justify-between"
          >
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-dark-navy)]">Identified Skill Gaps</h3>
                  <p className="text-xs text-gray-500">
                    High-impact industry skills to unlock higher-tier roles.
                  </p>
                </div>
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800 font-bold">
                  Target Areas
                </Badge>
              </div>

              <div className="space-y-3 mt-4">
                {profile.skillGaps && profile.skillGaps.length > 0 ? (
                  profile.skillGaps.map((gap, idx) => {
                    const priorityClass =
                      gap.priority === 'ADVANCED'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : gap.priority === 'INTERMEDIATE'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200';

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/50 p-3.5 transition hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-sm text-[var(--color-dark-navy)]">
                            {gap.name}
                          </span>
                          <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold ${priorityClass}`}>
                            {gap.priority}
                          </span>
                        </div>

                        <a
                          href="#recommended-courses"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary-blue)] hover:underline"
                        >
                          <span>Improve now</span>
                          <TrendingUp className="h-3 w-3" />
                        </a>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400">No skill gaps identified yet.</p>
                )}
              </div>
            </div>

            <p className="mt-4 text-[11px] text-gray-400">
              Filling intermediate/advanced gaps increases interview callback rates by up to 3x.
            </p>
          </motion.div>

          {/* RECOMMENDED JOBS CARD (6 cols) */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-6"
          >
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-dark-navy)]">Recommended Jobs</h3>
                  <p className="text-xs text-gray-500">
                    Transparent skills alignment matching for you.
                  </p>
                </div>
                <Link href="/student/jobs">
                  <span className="text-xs font-semibold text-[var(--color-primary-blue)] hover:underline flex items-center gap-1">
                    View all <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </div>

              {topJobs && topJobs.length > 0 ? (
                <div className="space-y-3">
                  {topJobs.map((job) => {
                    const badgeColor =
                      job.matchScore >= 85
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : job.matchScore >= 60
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-gray-100 text-gray-700 border-gray-200';

                    return (
                      <Link
                        key={job._id}
                        href={`/student/jobs/${job._id}`}
                        className="group block rounded-2xl border border-gray-100 p-3.5 transition-all hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate font-semibold text-sm text-[var(--color-dark-navy)] group-hover:text-[var(--color-primary-blue)]">
                              {job.title}
                            </h4>
                            <p className="truncate text-xs text-gray-500">
                              {job.companyName} • {job.location}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${badgeColor}`}
                            >
                              {job.matchScore}% Match
                            </span>
                            <span className="text-[10px] text-gray-400 capitalize">
                              {job.type.replace('_', ' ').toLowerCase()}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="my-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-6 text-center">
                  <Briefcase className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <h4 className="font-bold text-sm text-[var(--color-dark-navy)]">
                    No matches computed yet
                  </h4>
                  <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                    Upload your resume to see personalized job recommendations with transparent match calculations!
                  </p>
                </div>
              )}
            </div>

            <Link href="/student/jobs" className="mt-4">
              <Button variant="ghost" size="sm" className="w-full text-xs text-gray-600">
                <span>Explore all opportunities</span>
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </motion.div>

          {/* SCORE PROGRESSION TRACKER CARD (Full 12 cols - Part C) */}
          <motion.div variants={itemVariants} className="lg:col-span-12">
            <ScoreProgressChart history={scoreHistory} currentScore={profile?.profileScore} />
          </motion.div>

          {/* RECOMMENDED COURSES CARD (Full 12 cols) */}
          <motion.div
            id="recommended-courses"
            variants={itemVariants}
            className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-12"
          >
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-[var(--color-primary-blue)]" />
                  <h3 className="text-xl font-bold text-[var(--color-dark-navy)]">
                    Curated Free Courses for Your Skill Gaps
                  </h3>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Targeted courses matched specifically to bridge your identified skill gaps. Never filler.
                </p>
              </div>

              <Link href="/student/courses" className="text-xs font-bold text-[var(--color-primary-blue)] hover:underline inline-flex items-center gap-1">
                <span>Browse Full Catalog ({courses.length}+ courses)</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {courses.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-gray-50/50 p-5 transition hover:border-blue-200 hover:bg-white hover:shadow-md"
                  >
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-[var(--color-primary-blue)] font-bold text-[11px]">
                          Target: {course.skillTag}
                        </Badge>
                        <span className="text-[11px] font-medium text-gray-400">
                          {course.provider}
                        </span>
                      </div>

                      <h4 className="line-clamp-2 text-sm font-bold text-[var(--color-dark-navy)]">
                        {course.title}
                      </h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-success-green)]">
                        <BookOpen className="h-3.5 w-3.5" />
                        100% Free
                      </span>

                      <a
                        href={course.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary-blue)] hover:underline"
                      >
                        <span>Learn Now</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
                <BookOpen className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p className="text-xs text-gray-500">
                  No courses found matching current gaps. Explore all free certifications in the Courses tab.
                </p>
                <Link href="/student/courses" className="mt-3 inline-block">
                  <Button size="sm" variant="ghost">View All Courses</Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
