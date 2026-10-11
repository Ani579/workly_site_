'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  UserCheck,
  Briefcase,
  MapPin,
  Eye,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Skill {
  name: string;
  level: number;
  source?: string;
}

interface CandidateInfo {
  profileId: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  headline: string;
  bio?: string;
  education?: string;
  location: string;
  profileScore?: number | null;
  strengths: string[];
  improvements: string[];
  skills: Skill[];
}

interface CandidateMatch {
  _id: string;
  matchScore: number;
  reasons: string[];
  missingSkills: string[];
  explained: boolean;
  candidate: CandidateInfo;
  applicationStatus: 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | null;
  applicationSource: 'APPLIED' | 'RECRUITER_SHORTLIST' | null;
  appliedAt: string | null;
}

export default function RecruiterJobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<any>(null);
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Features
  const [anonymousMode, setAnonymousMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'APPLIED' | 'SHORTLISTED'>('ALL');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [viewingCandidate, setViewingCandidate] = useState<CandidateInfo | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchJobMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/recruiter/jobs/${jobId}`);
      if (res.status === 404) {
        setError('Job not found or you do not have permission to view this job.');
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch candidates');
      }
      setJob(data.job);
      setMatches(data.matches || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJobMatches();
    }
  }, [jobId]);

  const handleToggleShortlist = async (match: CandidateMatch) => {
    const isCurrentlyShortlisted = match.applicationStatus === 'SHORTLISTED';
    const newAction = isCurrentlyShortlisted ? 'UNSHORTLIST' : 'SHORTLIST';

    setActionLoadingId(match._id);
    try {
      const res = await fetch(`/api/recruiter/jobs/${jobId}/shortlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentProfileId: match.candidate.profileId,
          action: newAction,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update shortlist status');

      // Update local state
      setMatches((prev) =>
        prev.map((m) =>
          m._id === match._id
            ? {
                ...m,
                applicationStatus: data.status,
                applicationSource: data.source,
              }
            : m
        )
      );
    } catch (err) {
      console.error('Error toggling shortlist:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter matches based on active tab
  const filteredMatches = matches.filter((m) => {
    if (activeTab === 'APPLIED') {
      return m.applicationStatus === 'APPLIED' || (m.applicationStatus === 'SHORTLISTED' && m.applicationSource === 'APPLIED');
    }
    if (activeTab === 'SHORTLISTED') {
      return m.applicationStatus === 'SHORTLISTED';
    }
    return true; // 'ALL'
  });

  const appliedCount = matches.filter(
    (m) => m.applicationStatus === 'APPLIED' || (m.applicationStatus === 'SHORTLISTED' && m.applicationSource === 'APPLIED')
  ).length;
  const shortlistedCount = matches.filter((m) => m.applicationStatus === 'SHORTLISTED').length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-900">
        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-rose-600" />
        <h2 className="text-lg font-bold">Access Denied or Not Found</h2>
        <p className="mt-1 text-sm text-rose-700">{error || 'Job not found'}</p>
        <Link href="/recruiter/jobs" className="mt-4 inline-block">
          <Button variant="primary" size="sm" className="bg-purple-600 hover:bg-purple-700">
            Back to My Jobs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[var(--color-dark-navy)] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to My Jobs</span>
        </Link>
      </div>

      {/* Job Header Card */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark-navy)]">
                {job.title}
              </h1>
              <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 font-bold">
                {job.type.replace('_', ' ')}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                {job.location}
              </span>
              <span>•</span>
              <span>{job.experienceLevel}</span>
              <span>•</span>
              <span>{job.companyId?.name || 'Your Company'}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="text-xs font-bold text-gray-400 mr-1 self-center">Required Skills:</span>
              {job.requiredSkills.map((skill: string) => (
                <span
                  key={skill}
                  className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Anonymous Mode Toggle Card */}
          <div className="flex items-center gap-3 rounded-2xl border border-purple-200 bg-purple-50/70 p-3.5 self-start">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--color-dark-navy)]">
                  Anonymous Mode
                </span>
                <button
                  type="button"
                  onClick={() => setAnonymousMode(!anonymousMode)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    anonymousMode ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      anonymousMode ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[10px] text-gray-500">
                {anonymousMode
                  ? 'Active: Hiding demographic data for merit-based review.'
                  : 'Inactive: Showing candidate names.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Counter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`rounded-2xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'ALL'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All Candidates ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('APPLIED')}
            className={`rounded-2xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'APPLIED'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Applied ({appliedCount})
          </button>
          <button
            onClick={() => setActiveTab('SHORTLISTED')}
            className={`rounded-2xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'SHORTLISTED'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Shortlisted ({shortlistedCount})
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Ranked by deterministic skills overlap & AI explanation
        </p>
      </div>

      {/* Candidates List */}
      {filteredMatches.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
          <Briefcase className="mx-auto mb-3 h-10 w-10 text-gray-400" />
          <h3 className="text-base font-bold text-[var(--color-dark-navy)]">
            No candidates in this view
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {activeTab === 'SHORTLISTED'
              ? 'You have not shortlisted any candidates for this role yet.'
              : activeTab === 'APPLIED'
              ? 'No candidates have directly applied yet. You can shortlist top skill-matched candidates!'
              : 'No matching student profiles found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((item) => {
            const { candidate, matchScore, reasons, missingSkills, applicationStatus } = item;
            const isShortlisted = applicationStatus === 'SHORTLISTED';
            const isApplied = applicationStatus === 'APPLIED' || (isShortlisted && item.applicationSource === 'APPLIED');
            const isExpanded = expandedMatchId === item._id;

            // Score badge color
            const scoreColor =
              matchScore >= 85
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : matchScore >= 60
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-gray-100 text-gray-700 border-gray-200';

            // Display Name (Anonymous Mode vs Real Name)
            const idSuffix = candidate.profileId.slice(-4);
            const displayName = anonymousMode ? `Candidate #${idSuffix}` : candidate.name;

            // Initial for avatar (NEVER photo, to reduce bias as requested)
            const initials = anonymousMode
              ? `#${idSuffix}`
              : candidate.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

            return (
              <div
                key={item._id}
                className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-purple-200"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left: Avatar initials & candidate info */}
                  <div className="flex items-start gap-4">
                    {/* AVATAR INITIALS (Strictly NO photo to reduce bias) */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-sm shadow-sm">
                      {initials}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-[var(--color-dark-navy)]">
                          {displayName}
                        </h3>

                        {/* Application status tag */}
                        {isShortlisted && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            Shortlisted
                          </span>
                        )}
                        {isApplied && !isShortlisted && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[var(--color-primary-blue)] border border-blue-200">
                            Applied
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500">
                        {candidate.headline}
                      </p>

                      <p className="text-[11px] text-gray-400">
                        {candidate.location} {candidate.education && `• ${candidate.education}`}
                      </p>

                      {/* Top 5 skills */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {candidate.skills.slice(0, 5).map((skill) => (
                          <span
                            key={skill.name}
                            className="rounded-lg bg-gray-50 border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-700"
                          >
                            {skill.name} ({skill.level}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Match score & Action buttons */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${scoreColor}`}
                    >
                      {matchScore}% Match
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewingCandidate(candidate)}
                        className="text-xs text-gray-600 hover:text-[var(--color-dark-navy)]"
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        <span>Profile</span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        disabled={actionLoadingId === item._id}
                        onClick={() => handleToggleShortlist(item)}
                        className={`text-xs ${
                          isShortlisted
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {actionLoadingId === item._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : isShortlisted ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Shortlisted</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Shortlist</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* "Why this match" expander */}
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setExpandedMatchId(isExpanded ? null : item._id)}
                    className="flex w-full items-center justify-between text-xs font-semibold text-purple-700 hover:text-purple-900 transition"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                      <span>Why this match? (Evaluation details)</span>
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 rounded-2xl bg-purple-50/50 p-4 border border-purple-100/70 space-y-3 text-xs">
                      {reasons && reasons.length > 0 && (
                        <div>
                          <p className="font-bold text-[var(--color-dark-navy)] mb-1">
                            Alignment Factors:
                          </p>
                          <ul className="list-disc pl-4 space-y-0.5 text-gray-600">
                            {reasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {missingSkills && missingSkills.length > 0 && (
                        <div>
                          <p className="font-bold text-gray-600 mb-1">
                            Missing or Unverified Job Skills:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {missingSkills.map((s, i) => (
                              <span
                                key={i}
                                className="rounded-lg bg-white border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-500"
                              >
                                {s}
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

      {/* Candidate Profile Modal (WITHOUT resumeText to preserve privacy) */}
      {viewingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-[var(--color-dark-navy)]">
                  {anonymousMode
                    ? `Candidate #${viewingCandidate.profileId.slice(-4)}`
                    : viewingCandidate.name}
                </h3>
                <p className="text-xs text-gray-500">{viewingCandidate.headline}</p>
                <p className="text-xs text-gray-400">
                  {viewingCandidate.location} {viewingCandidate.education && `• ${viewingCandidate.education}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingCandidate(null)}
                className="rounded-full p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {viewingCandidate.bio && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Summary
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed">{viewingCandidate.bio}</p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Verified Technical Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {viewingCandidate.skills.map((s) => (
                  <span
                    key={s.name}
                    className="rounded-xl bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-bold text-purple-700"
                  >
                    {s.name} • {s.level}%
                  </span>
                ))}
              </div>
            </div>

            {viewingCandidate.strengths && viewingCandidate.strengths.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Core Strengths
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-xs text-gray-600">
                  {viewingCandidate.strengths.map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setViewingCandidate(null)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Close Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

