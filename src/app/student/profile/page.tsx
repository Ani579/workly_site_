'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  Sparkles,
  MapPin,
  GraduationCap,
  Code2,
  Save,
  Check,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

interface Skill {
  name: string;
  level: number;
  source?: string;
}

interface SkillGap {
  name: string;
  priority: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

interface ProfileData {
  headline?: string;
  bio?: string;
  education?: string;
  location?: string;
  githubUsername?: string;
  resumeFileName?: string;
  profileScore?: number | null;
  scoreSummary?: string;
  strengths?: string[];
  improvements?: string[];
  skills?: Skill[];
  skillGaps?: SkillGap[];
  fallbackUsed?: boolean;
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    headline: '',
    bio: '',
    education: '',
    location: '',
    githubUsername: '',
    skills: [],
    skillGaps: [],
    strengths: [],
    improvements: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Resume upload states
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GitHub import states
  const [githubImporting, setGithubImporting] = useState(false);
  const [githubStats, setGithubStats] = useState<{
    publicRepos: number;
    totalStars: number;
    topLanguages: string[];
  } | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [githubSuccess, setGithubSuccess] = useState<string | null>(null);

  const handleImportGithub = async () => {
    if (!profile.githubUsername?.trim()) {
      setGithubError('Please enter a GitHub username first.');
      return;
    }

    setGithubImporting(true);
    setGithubError(null);
    setGithubSuccess(null);

    try {
      const res = await fetch('/api/student/github/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUsername: profile.githubUsername.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to import GitHub data');
      }

      setGithubStats(data.stats);
      if (data.skills) {
        setProfile((prev) => ({ ...prev, skills: data.skills }));
      }
      setGithubSuccess(`Imported ${data.stats.topLanguages.length} top languages from ${data.stats.publicRepos} public repositories!`);
      setTimeout(() => setGithubSuccess(null), 5000);
    } catch (err: any) {
      setGithubError(err.message || 'Error importing GitHub repositories');
    } finally {
      setGithubImporting(false);
    }
  };

  // Load existing profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/student/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile(data.profile);
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Save profile info (headline, bio, education, location, githubUsername)
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: profile.headline,
          bio: profile.bio,
          education: profile.education,
          location: profile.location,
          githubUsername: profile.githubUsername,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save profile');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  }

  // Upload and analyze resume
  async function handleResumeUpload(file: File) {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setUploadError('Only PDF files are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5 MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccessMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/student/resume', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      setProfile(data.profile);
      setUploadSuccessMessage(
        data.cached
          ? `Loaded cached analysis for ${file.name}`
          : `Resume analyzed successfully with AI!`
      );
    } catch (err: any) {
      setUploadError(err.message || 'Error processing resume');
    } finally {
      setIsUploading(false);
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleResumeUpload(e.dataTransfer.files[0]);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary-blue)]" />
      </div>
    );
  }

  const hasScore = profile.profileScore !== null && profile.profileScore !== undefined;

  return (
    <div className="space-y-6">
      <main className="mx-auto max-w-7xl">
        {/* Header navigation breadcrumb */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/student/dashboard" className="hover:text-[var(--color-primary-blue)]">
                Dashboard
              </Link>
              <span>/</span>
              <span className="font-semibold text-[var(--color-dark-navy)]">Profile & AI Analysis</span>
            </div>
            <h1 className="mt-1 text-3xl font-extrabold text-[var(--color-dark-navy)]">
              Student Profile & Resume Analysis
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* LEFT COLUMN: Upload & Profile Form (7 cols) */}
          <div className="space-y-6 lg:col-span-7">
            {/* Resume Upload Card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-dark-navy)]">Upload Resume</h2>
                  <p className="text-sm text-gray-500">
                    Upload your PDF resume (max 5 MB) for AI skills extraction and scoring.
                  </p>
                </div>
                {profile.resumeFileName && (
                  <Badge variant="outline" className="hidden sm:inline-flex">
                    <FileText className="mr-1 h-3 w-3" />
                    {profile.resumeFileName}
                  </Badge>
                )}
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                  isDragging
                    ? 'border-[var(--color-primary-blue)] bg-blue-50/50'
                    : 'border-gray-200 hover:border-[var(--color-primary-blue)] hover:bg-gray-50/50'
                } ${isUploading ? 'pointer-events-none opacity-75' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleResumeUpload(e.target.files[0]);
                    }
                  }}
                />

                {isUploading ? (
                  <div className="flex flex-col items-center py-4">
                    <Loader2 className="mb-3 h-10 w-10 animate-spin text-[var(--color-primary-blue)]" />
                    <p className="font-semibold text-[var(--color-dark-navy)]">
                      Analyzing your resume with AI...
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Extracting skills, gaps, and computing objective merit score
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[var(--color-primary-blue)]">
                      <UploadCloud className="h-7 w-7" />
                    </div>
                    <p className="font-semibold text-[var(--color-dark-navy)]">
                      Drag & drop your resume PDF here, or <span className="text-[var(--color-primary-blue)] underline">browse</span>
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      PDF format only (up to 5 MB). In-memory text extraction.
                    </p>
                  </div>
                )}
              </div>

              {/* Status messages */}
              {uploadError && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccessMessage && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-[var(--color-success-green)]">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{uploadSuccessMessage}</span>
                </div>
              )}
            </div>

            {/* Profile Fields Form */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-[var(--color-dark-navy)]">
                Personal & Profile Details
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[var(--color-dark-navy)]">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Full Stack Developer | React & Node.js"
                    value={profile.headline || ''}
                    onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[var(--color-primary-blue)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-[var(--color-dark-navy)]">
                    Bio / Summary
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Share a short summary about your career goals and interests..."
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[var(--color-primary-blue)] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-dark-navy)]">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      Education
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. B.Tech in Computer Science"
                      value={profile.education || ''}
                      onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[var(--color-primary-blue)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-dark-navy)]">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bangalore, India"
                      value={profile.location || ''}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[var(--color-primary-blue)] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-dark-navy)]">
                    <Code2 className="h-4 w-4 text-gray-500" />
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. octocat"
                    value={profile.githubUsername || ''}
                    onChange={(e) => setProfile({ ...profile, githubUsername: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[var(--color-primary-blue)] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Profile Changes
                      </>
                    )}
                  </Button>

                  {saveSuccess && (
                    <span className="flex items-center gap-1 text-sm font-medium text-[var(--color-success-green)]">
                      <Check className="h-4 w-4" />
                      Saved!
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* GITHUB INTEGRATION CARD (Part B) */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
                    <Code2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--color-dark-navy)]">
                      GitHub Repos & Skills Import
                    </h3>
                    <p className="text-xs text-gray-500">
                      Import top languages from public repositories into your skills profile (read-only).
                    </p>
                  </div>
                </div>
              </div>

              {githubError && (
                <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                  {githubError}
                </div>
              )}

              {githubSuccess && (
                <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
                  {githubSuccess}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="GitHub username (e.g. octocat)"
                  value={profile.githubUsername || ''}
                  onChange={(e) => setProfile({ ...profile, githubUsername: e.target.value })}
                  className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2 text-xs focus:border-[var(--color-primary-blue)] focus:outline-none"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={githubImporting || !profile.githubUsername?.trim()}
                  onClick={handleImportGithub}
                  className="text-xs shrink-0"
                >
                  {githubImporting ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      <span>Syncing Repos...</span>
                    </>
                  ) : (
                    <span>Import Public Repos</span>
                  )}
                </Button>
              </div>

              {githubStats && (
                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="rounded-lg bg-white p-2.5 border border-gray-200/60">
                      <p className="text-base font-black text-[var(--color-dark-navy)]">{githubStats.publicRepos}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Public Repos</p>
                    </div>
                    <div className="rounded-lg bg-white p-2.5 border border-gray-200/60">
                      <p className="text-base font-black text-[var(--color-dark-navy)]">{githubStats.totalStars}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Total Stars</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1.5">Top Languages Detected:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {githubStats.topLanguages.map((lang) => (
                        <span key={lang} className="rounded-lg bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-xs font-bold text-purple-700">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: AI Analysis & Score Insights (5 cols) */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[var(--color-primary-blue)]" />
                  <h2 className="text-xl font-bold text-[var(--color-dark-navy)]">
                    AI Profile Score
                  </h2>
                </div>

                {profile.fallbackUsed && (
                  <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Rule-based
                  </Badge>
                )}
              </div>

              {hasScore ? (
                <div className="space-y-6">
                  {/* Score Ring Display */}
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-blue-50/50 to-transparent p-6 text-center">
                    <ScoreRing score={profile.profileScore ?? 0} size={140} strokeWidth={12} />
                    <h3 className="mt-3 text-lg font-bold text-[var(--color-dark-navy)]">
                      {(profile.profileScore ?? 0) >= 80
                        ? 'Excellent Profile Match'
                        : (profile.profileScore ?? 0) >= 60
                        ? 'Competitive Foundation'
                        : 'Developing Profile'}
                    </h3>
                    {profile.scoreSummary && (
                      <p className="mt-1 max-w-sm text-sm text-gray-600">
                        {profile.scoreSummary}
                      </p>
                    )}
                  </div>

                  {/* Strengths */}
                  {profile.strengths && profile.strengths.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-success-green)]">
                        Key Strengths
                      </h4>
                      <div className="space-y-2">
                        {profile.strengths.map((str, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success-green)]" />
                            <span>{str}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actionable Improvements */}
                  {profile.improvements && profile.improvements.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-primary-blue)]">
                        Actionable Resume Tips
                      </h4>
                      <div className="space-y-2">
                        {profile.improvements.map((imp, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary-blue)]" />
                            <span>{imp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Extracted Skills */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div>
                      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                        Top Skills Extracted ({profile.skills.length})
                      </h4>
                      <div className="space-y-3">
                        {profile.skills.slice(0, 10).map((skill, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-[var(--color-dark-navy)]">
                              <span className="flex items-center gap-1.5">
                                {skill.name}
                                {skill.source === 'GITHUB' && (
                                  <span className="rounded bg-purple-100 px-1.5 py-0.2 text-[9px] font-bold text-purple-700">
                                    from GitHub
                                  </span>
                                )}
                              </span>
                              <span className="text-gray-500">{skill.level}%</span>
                            </div>
                            <ProgressBar value={skill.level} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skill Gaps */}
                  {profile.skillGaps && profile.skillGaps.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        Recommended Skill Gaps to Fill
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.skillGaps.map((gap, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-xl bg-gray-100 px-3 py-1 text-xs font-medium text-[var(--color-dark-navy)]"
                          >
                            {gap.name}
                            <span className="ml-1.5 text-[10px] font-bold text-gray-400">
                              ({gap.priority.toLowerCase()})
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-semibold text-[var(--color-dark-navy)]">
                    No Resume Analysis Yet
                  </h3>
                  <p className="mt-1 max-w-xs text-xs text-gray-500">
                    Upload your resume on the left to see your AI profile score, top skills, and personalized career recommendations.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
