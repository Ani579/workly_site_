'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  UserCheck,
  Building,
  Plus,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface RecentApp {
  _id: string;
  jobId: string;
  jobTitle: string;
  jobType: string;
  candidateId: string;
  candidateName: string;
  candidateHeadline: string;
  profileScore: number | null;
  matchScore: number | null;
  status: string;
  source: string;
  createdAt: string;
}

interface DashboardData {
  hasCompany: boolean;
  company: any;
  stats: {
    activeJobs: number;
    totalApplicants: number;
    shortlistedCount: number;
  };
  recentApplications: RecentApp[];
}

export default function RecruiterDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/recruiter/dashboard');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load recruiter dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const { hasCompany, company, stats, recentApplications } = data || {
    hasCompany: false,
    company: null,
    stats: { activeJobs: 0, totalApplicants: 0, shortlistedCount: 0 },
    recentApplications: [],
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark-navy)]">
            Recruiter Dashboard
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
            {hasCompany && company
              ? `Hiring portal for ${company.name}. Skill-based candidate screening.`
              : 'Welcome to Workly. Set up your organization to post jobs and review applicants.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/recruiter/jobs/new">
            <Button variant="primary" className="bg-purple-600 hover:bg-purple-700 text-xs">
              <Plus className="mr-1.5 h-4 w-4" />
              <span>Post a Job</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* If recruiter has no company profile yet */}
      {!hasCompany && (
        <div className="rounded-3xl border border-purple-200 bg-purple-50/70 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-600 text-white font-bold">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--color-dark-navy)]">
                  Complete Your Company Profile
                </h3>
                <p className="mt-1 text-xs text-gray-600 max-w-lg">
                  Before posting job listings, introduce your organization to candidates. It only takes a minute to set up!
                </p>
              </div>
            </div>
            <Link href="/recruiter/company">
              <Button variant="primary" className="bg-purple-600 hover:bg-purple-700 text-xs shrink-0">
                <span>Create Company Profile</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Real Stat Cards (Real DB counts only) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Active Jobs */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Active Job Posts
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--color-dark-navy)]">
              {stats.activeJobs}
            </span>
            <span className="text-xs text-gray-500">open roles</span>
          </div>
          <Link
            href="/recruiter/jobs"
            className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-600 hover:underline"
          >
            <span>View job listings</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Total Applicants */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Total Applicants
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[var(--color-primary-blue)]">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--color-dark-navy)]">
              {stats.totalApplicants}
            </span>
            <span className="text-xs text-gray-500">applied candidates</span>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            Across all active positions
          </p>
        </div>

        {/* Shortlisted */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Shortlisted
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--color-dark-navy)]">
              {stats.shortlistedCount}
            </span>
            <span className="text-xs text-gray-500">candidates</span>
          </div>
          <p className="mt-4 text-xs text-emerald-600 font-semibold">
            Ready for screening & interview
          </p>
        </div>
      </div>

      {/* Recent Applicants Section */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-dark-navy)]">
              Recent Applicants
            </h2>
            <p className="text-xs text-gray-500">
              Real candidates who applied to your open roles.
            </p>
          </div>
          <Link href="/recruiter/jobs">
            <Button variant="ghost" size="sm" className="text-xs text-purple-700 hover:bg-purple-50">
              <span>View All by Job</span>
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
            <Users className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <h4 className="font-bold text-sm text-[var(--color-dark-navy)]">
              No recent applications yet
            </h4>
            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
              When students apply to your jobs or you shortlist candidates from skills matching, they will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentApplications.map((app) => (
              <div
                key={app._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 first:pt-2 last:pb-2"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold text-xs">
                    {app.candidateName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--color-dark-navy)]">
                      {app.candidateName}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Applied for <span className="font-semibold text-gray-700">{app.jobTitle}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {app.matchScore !== null && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                        app.matchScore >= 85
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : app.matchScore >= 60
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {app.matchScore}% Match
                    </span>
                  )}

                  <Badge
                    variant={app.status === 'SHORTLISTED' ? 'default' : 'outline'}
                    className={
                      app.status === 'SHORTLISTED'
                        ? 'bg-emerald-600 text-white'
                        : 'border-blue-200 text-blue-700 bg-blue-50'
                    }
                  >
                    {app.status}
                  </Badge>

                  <Link href={`/recruiter/jobs/${app.jobId}`}>
                    <Button variant="ghost" size="sm" className="text-xs text-purple-700">
                      <span>Review</span>
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
