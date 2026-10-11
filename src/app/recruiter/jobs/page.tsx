'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  Users,
  Plus,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface JobItem {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  experienceLevel: string;
  location: string;
  type: string;
  isDemo: boolean;
  totalApplicants: number;
  shortlistedCount: number;
  createdAt: string;
}

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/recruiter/jobs');
      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
      }
      if (data.company) {
        setCompany(data.company);
      }
    } catch (err) {
      console.error('Failed to fetch recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark-navy)]">
            My Job Postings
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
            {company
              ? `Manage open roles for ${company.name} and review skill-matched applicants.`
              : 'Manage open roles and review skill-matched candidates.'}
          </p>
        </div>

        <Link href="/recruiter/jobs/new">
          <Button variant="primary" className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-1.5 h-4 w-4" />
            <span>Post a New Job</span>
          </Button>
        </Link>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
          <Briefcase className="mx-auto mb-3 h-10 w-10 text-gray-400" />
          <h3 className="text-lg font-bold text-[var(--color-dark-navy)]">
            No Job Postings Yet
          </h3>
          <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
            Create your first job listing to find candidates with verified skill alignment.
          </p>
          <div className="mt-6">
            <Link href="/recruiter/jobs/new">
              <Button variant="primary" className="bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-1.5 h-4 w-4" />
                <span>Post Your First Job</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-purple-200 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-[var(--color-dark-navy)]">
                      {job.title}
                    </h2>
                    <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 font-semibold text-xs">
                      {job.type.replace('_', ' ')}
                    </Badge>
                    {job.isDemo && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                        Demo Role
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      {job.location}
                    </span>
                    <span>•</span>
                    <span>{job.experienceLevel}</span>
                  </div>

                  {/* Skills preview */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg bg-gray-50 border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right side: Applicants & Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-bold text-[var(--color-dark-navy)] flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-purple-600" />
                        <span>{job.totalApplicants} Applicants</span>
                      </p>
                      {job.shortlistedCount > 0 && (
                        <p className="text-[11px] font-semibold text-emerald-600">
                          {job.shortlistedCount} Shortlisted
                        </p>
                      )}
                    </div>
                  </div>

                  <Link href={`/recruiter/jobs/${job._id}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-xs flex items-center gap-1"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Review Matches</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

