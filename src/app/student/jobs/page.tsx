'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  Building,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface JobItem {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  experienceLevel?: string;
  location?: string;
  type: string;
  company: {
    _id?: string;
    name: string;
    description?: string;
    website?: string;
    size?: string;
  };
  matchScore: number;
  reasons: string[];
  missingSkills: string[];
  matchedSkills: string[];
  explained?: boolean;
  hasApplied?: boolean;
}

export default function StudentJobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [minScoreFilter, setMinScoreFilter] = useState(0);

  // Expanded explanations: jobId -> boolean
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});

  async function fetchJobs() {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.set('type', typeFilter);
      if (minScoreFilter > 0) params.set('minScore', minScoreFilter.toString());
      if (search) params.set('search', search);

      const res = await fetch(`/api/student/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const params = new URLSearchParams();
        if (typeFilter !== 'ALL') params.set('type', typeFilter);
        if (minScoreFilter > 0) params.set('minScore', minScoreFilter.toString());
        if (search) params.set('search', search);

        const res = await fetch(`/api/student/jobs?${params.toString()}`);
        if (res.ok && !ignore) {
          const data = await res.json();
          setJobs(data.jobs || []);
        }
      } catch (err) {
        console.error('Failed to load jobs:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [typeFilter, minScoreFilter]);

  async function handleRefreshMatches() {
    setRefreshing(true);
    try {
      const res = await fetch('/api/student/matches/refresh', { method: 'POST' });
      if (res.ok) {
        await fetchJobs();
      }
    } catch (err) {
      console.error('Failed to refresh matches:', err);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleApply(jobId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    setApplyingJobId(jobId);
    try {
      const res = await fetch(`/api/student/jobs/${jobId}/apply`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) => (j._id === jobId ? { ...j, hasApplied: true } : j))
        );
      } else {
        alert(data.error || 'Failed to submit application');
      }
    } catch (err: any) {
      alert(err.message || 'Error applying to job');
    } finally {
      setApplyingJobId(null);
    }
  }

  const toggleExplanation = (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedExplanations((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 85) {
      return 'bg-green-100 text-[var(--color-success-green)] border-green-200';
    }
    if (score >= 60) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-dark-navy)]">
            Explore Matched Opportunities
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Jobs ranked objectively by skills overlap and qualification depth.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleRefreshMatches}
          disabled={refreshing}
          className="shadow-sm"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing Matches...' : 'Recalculate AI Matches'}</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-center">
          {/* Search Box */}
          <div className="relative sm:col-span-5">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by role, company, or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
              className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-[var(--color-primary-blue)] focus:outline-none"
            />
          </div>

          {/* Job Type Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[var(--color-primary-blue)] focus:outline-none bg-white"
            >
              <option value="ALL">All Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>

          {/* Min Match Score */}
          <div className="sm:col-span-3">
            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(parseInt(e.target.value, 10))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[var(--color-primary-blue)] focus:outline-none bg-white"
            >
              <option value="0">All Match Scores</option>
              <option value="60">Good Match (60%+)</option>
              <option value="85">Top Match (85%+)</option>
            </select>
          </div>

          <div className="sm:col-span-1 flex justify-end">
            <Button size="sm" onClick={fetchJobs} className="w-full sm:w-auto">
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary-blue)]" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Briefcase className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h3 className="text-base font-bold text-[var(--color-dark-navy)]">
            No matching jobs found
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Try adjusting your search criteria or reset filters to see all available openings.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSearch('');
              setTypeFilter('ALL');
              setMinScoreFilter(0);
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const isExpanded = !!expandedExplanations[job._id];
            const badgeClass = getScoreBadgeClass(job.matchScore);

            return (
              <div
                key={job._id}
                className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                {/* Top Row: Title, Company, Score */}
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-[var(--color-dark-navy)]">
                        {job.title}
                      </h2>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-black ${badgeClass}`}
                      >
                        {job.matchScore}% Match
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1 font-semibold text-gray-700">
                        <Building className="h-3.5 w-3.5 text-gray-400" />
                        {job.company?.name || 'Demo Company'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        {job.location || 'Remote'}
                      </span>
                      <span>•</span>
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 font-medium text-gray-600">
                        {job.type === 'INTERNSHIP' ? 'Internship' : 'Full Time'}
                      </span>
                      {job.experienceLevel && (
                        <>
                          <span>•</span>
                          <span>{job.experienceLevel}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link href={`/student/jobs/${job._id}`}>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      onClick={(e) => handleApply(job._id, e)}
                      disabled={job.hasApplied || applyingJobId === job._id}
                      className={job.hasApplied ? 'bg-green-600 hover:bg-green-600' : ''}
                    >
                      {applyingJobId === job._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : job.hasApplied ? (
                        <>
                          <Check className="mr-1.5 h-4 w-4" />
                          Applied
                        </>
                      ) : (
                        'Quick Apply'
                      )}
                    </Button>
                  </div>
                </div>

                {/* Description snippet */}
                <p className="mt-3 text-xs text-gray-600 line-clamp-2">
                  {job.description}
                </p>

                {/* Skills Row: Matched Skills Highlighted */}
                <div className="mt-4">
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Required Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills.map((reqSkill, idx) => {
                      const isMatched = (job.matchedSkills || []).some(
                        (m) => m.toLowerCase().trim() === reqSkill.toLowerCase().trim()
                      );

                      return (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold ${
                            isMatched
                              ? 'bg-blue-50 text-[var(--color-primary-blue)] border border-blue-200'
                              : 'bg-gray-100 text-gray-600 border border-transparent'
                          }`}
                        >
                          {isMatched && <CheckCircle2 className="h-3 w-3 text-[var(--color-primary-blue)]" />}
                          <span>{reqSkill}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* "Why this match" Expander */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => toggleExplanation(job._id, e)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary-blue)] hover:underline"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Why this match ({job.matchScore}%)</span>
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-3 rounded-2xl bg-gradient-to-br from-blue-50/50 to-transparent p-4 border border-blue-100/60 text-xs text-gray-700">
                      <div>
                        <span className="font-bold text-[var(--color-dark-navy)] block mb-1.5">
                          Match Alignment Breakdown:
                        </span>
                        <ul className="space-y-1">
                          {job.reasons && job.reasons.length > 0 ? (
                            job.reasons.map((reason, rIdx) => (
                              <li key={rIdx} className="flex items-start gap-1.5">
                                <span className="text-[var(--color-primary-blue)] font-bold">•</span>
                                <span>{reason}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-gray-500">Calculated based on skill overlap.</li>
                          )}
                        </ul>
                      </div>

                      {job.missingSkills && job.missingSkills.length > 0 && (
                        <div>
                          <span className="font-bold text-gray-500 block mb-1">
                            Skills You Could Pick Up for This Role:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {job.missingSkills.map((sk, mIdx) => (
                              <span
                                key={mIdx}
                                className="inline-block rounded-lg bg-white px-2 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
