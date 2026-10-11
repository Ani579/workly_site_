'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Building,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ScoreRing } from '@/components/ui/ScoreRing';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobDetail() {
      try {
        const res = await fetch(`/api/student/jobs/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setJob(data.job);
        }
      } catch (err) {
        console.error('Failed to load job:', err);
      } finally {
        setLoading(false);
      }
    }
    if (jobId) {
      fetchJobDetail();
    }
  }, [jobId]);

  async function handleApply() {
    setApplying(true);
    setApplyMessage(null);
    try {
      const res = await fetch(`/api/student/jobs/${jobId}/apply`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok) {
        setJob((prev: any) => ({ ...prev, hasApplied: true }));
        setApplyMessage(data.message || 'Application submitted successfully!');
      } else {
        alert(data.error || 'Failed to submit application');
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting application');
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary-blue)]" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <h2 className="text-xl font-bold text-[var(--color-dark-navy)]">Job Not Found</h2>
        <p className="mt-1 text-xs text-gray-500">
          The requested job posting may have been closed or is unavailable.
        </p>
        <Link href="/student/jobs" className="mt-4 inline-block">
          <Button size="sm">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  const score = job.matchScore || 0;
  const badgeClass =
    score >= 85
      ? 'bg-green-100 text-[var(--color-success-green)] border-green-200'
      : score >= 60
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/student/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[var(--color-primary-blue)]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to All Jobs</span>
      </Link>

      {/* Main Grid: Details (8 cols) & Match Breakdown (4 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Job Info */}
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark-navy)]">
                  {job.title}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1 font-semibold text-gray-800">
                    <Building className="h-4 w-4 text-gray-400" />
                    {job.company?.name || 'Demo Company'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {job.location || 'Remote'}
                  </span>
                  <span>•</span>
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 font-bold text-[var(--color-primary-blue)] text-xs">
                    {job.type === 'INTERNSHIP' ? 'Internship' : 'Full Time'}
                  </span>
                </div>
              </div>

              {/* Apply Button */}
              <div className="shrink-0">
                <Button
                  size="lg"
                  onClick={handleApply}
                  disabled={job.hasApplied || applying}
                  className={`w-full sm:w-auto shadow-md ${
                    job.hasApplied ? 'bg-green-600 hover:bg-green-600' : ''
                  }`}
                >
                  {applying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : job.hasApplied ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Applied
                    </>
                  ) : (
                    'Apply Now'
                  )}
                </Button>
              </div>
            </div>

            {applyMessage && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs font-semibold text-[var(--color-success-green)]">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{applyMessage}</span>
              </div>
            )}

            {/* Description */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-lg font-bold text-[var(--color-dark-navy)]">About the Role</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {/* Required Skills Checklist */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-lg font-bold text-[var(--color-dark-navy)]">Required Skills</h2>
              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {job.requiredSkills.map((reqSkill: string, idx: number) => {
                  const isMatched = (job.matchedSkills || []).some(
                    (m: string) => m.toLowerCase().trim() === reqSkill.toLowerCase().trim()
                  );

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 rounded-2xl p-3 border text-xs font-semibold ${
                        isMatched
                          ? 'border-blue-200 bg-blue-50/50 text-[var(--color-primary-blue)]'
                          : 'border-gray-200 bg-gray-50/50 text-gray-600'
                      }`}
                    >
                      {isMatched ? (
                        <CheckCircle2 className="h-4 w-4 text-[var(--color-primary-blue)] shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-gray-300 shrink-0" />
                      )}
                      <span>{reqSkill}</span>
                      {isMatched && (
                        <span className="ml-auto text-[10px] font-bold text-[var(--color-primary-blue)] uppercase">
                          In Your Profile
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Match Breakdown */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                <Sparkles className="h-4 w-4 text-[var(--color-primary-blue)]" />
                Match Analysis
              </span>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-black ${badgeClass}`}>
                {score}% Match
              </span>
            </div>

            <div className="my-4 flex flex-col items-center justify-center text-center">
              <ScoreRing score={score} size={130} strokeWidth={11} />
              <h3 className="mt-3 font-bold text-[var(--color-dark-navy)] text-base">
                {score >= 85
                  ? 'Strong Candidate Fit'
                  : score >= 60
                  ? 'Promising Fit'
                  : 'Skills Development Opportunity'}
              </h3>
            </div>

            {/* Reasons */}
            {job.reasons && job.reasons.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Why You Match
                </h4>
                <ul className="space-y-2 text-xs text-gray-700">
                  {job.reasons.map((reason: string, rIdx: number) => (
                    <li key={rIdx} className="flex items-start gap-2">
                      <span className="text-[var(--color-primary-blue)] font-bold">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Skills */}
            {job.missingSkills && job.missingSkills.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">
                  Target Skills to Add
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {job.missingSkills.map((sk: string, idx: number) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

