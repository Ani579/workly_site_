'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  X,
  Building,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NewJobPage() {
  const router = useRouter();

  const [company, setCompany] = useState<any>(null);
  const [checkingCompany, setCheckingCompany] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    type: 'FULL_TIME' as 'FULL_TIME' | 'INTERNSHIP',
    location: 'Remote',
    experienceLevel: 'Entry Level',
    description: '',
  });

  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Node.js']);
  const [currentSkillInput, setCurrentSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkCompany = async () => {
    try {
      setCheckingCompany(true);
      const res = await fetch('/api/recruiter/company');
      const data = await res.json();
      if (data.company) {
        setCompany(data.company);
      }
    } catch (err) {
      console.error('Failed to check company:', err);
    } finally {
      setCheckingCompany(false);
    }
  };

  useEffect(() => {
    checkCompany();
  }, []);

  const handleAddSkill = () => {
    const trimmed = currentSkillInput.trim();
    if (!trimmed) return;
    if (!skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, trimmed]);
    }
    setCurrentSkillInput('');
  };

  const handleKeyDownSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (skills.length === 0) {
      setErrorMessage('Please add at least 1 required skill.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/recruiter/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          requiredSkills: skills,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to post job');
      }

      // Success: redirect to candidate match list for this new job
      router.push(`/recruiter/jobs/${data.job._id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  if (checkingCompany) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-purple-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
          <Building className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-dark-navy)]">
          Company Profile Required
        </h2>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          Before creating a job listing, you must set up your company profile so students can see who is hiring.
        </p>
        <div className="mt-6">
          <Link href="/recruiter/company">
            <Button variant="primary" className="bg-purple-600 hover:bg-purple-700">
              <span>Set Up Company Profile</span>
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark-navy)]">
              Post a New Job
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
              Posting on behalf of <span className="font-semibold text-gray-700">{company.name}</span>. Matches will compute automatically.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50 p-4 border border-rose-200 text-sm text-rose-800">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
            Job Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Junior Full-Stack Engineer"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3 px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:bg-white focus:outline-none transition"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Employment Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as 'FULL_TIME' | 'INTERNSHIP' })
              }
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3 px-3 text-sm text-gray-900 focus:border-purple-600 focus:bg-white focus:outline-none transition"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Experience Level
            </label>
            <select
              value={formData.experienceLevel}
              onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3 px-3 text-sm text-gray-900 focus:border-purple-600 focus:bg-white focus:outline-none transition"
            >
              <option value="Intern">Intern / Student</option>
              <option value="Entry Level">Entry Level (0-1 yrs)</option>
              <option value="Junior">Junior (1-2 yrs)</option>
              <option value="Mid-Level">Mid-Level (2-4 yrs)</option>
              <option value="Senior">Senior (5+ yrs)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Remote, Austin, TX"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3 px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:bg-white focus:outline-none transition"
            />
          </div>
        </div>

        {/* Tag input for required skills */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
              Required Technical Skills <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-gray-400">Press Enter or comma to add</span>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50/40 p-3 space-y-3 focus-within:border-purple-600 focus-within:bg-white transition">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700 border border-purple-200"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="rounded-full p-0.5 hover:bg-purple-200 text-purple-800 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={currentSkillInput}
                onChange={(e) => setCurrentSkillInput(e.target.value)}
                onKeyDown={handleKeyDownSkill}
                placeholder="Type skill name (e.g. Docker, Python, SQL) and press Enter"
                className="flex-1 bg-transparent py-1 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              />
              <Button
                type="button"
                onClick={handleAddSkill}
                variant="ghost"
                size="sm"
                className="text-xs text-purple-700 hover:bg-purple-100"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                <span>Add</span>
              </Button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
            Job Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={6}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed description of responsibilities, technical environment, and expectations..."
            className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3 px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:bg-white focus:outline-none transition"
          />
        </div>

        <div className="pt-2 flex items-center justify-between">
          <Link href="/recruiter/jobs">
            <Button type="button" variant="ghost" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting || !formData.title.trim() || skills.length === 0}
            variant="primary"
            size="md"
            className="bg-purple-600 hover:bg-purple-700 min-w-40 justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Calculating Matches...</span>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span>Publish & Match</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

