'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building, Globe, Users, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function RecruiterCompanyPage() {
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    description: '',
    size: '11-50',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasExistingCompany, setHasExistingCompany] = useState(false);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/recruiter/company');
      const data = await res.json();
      if (data.company) {
        setFormData({
          name: data.company.name || '',
          website: data.company.website || '',
          description: data.company.description || '',
          size: data.company.size || '11-50',
        });
        setHasExistingCompany(true);
      }
    } catch (err) {
      console.error('Failed to load company:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/recruiter/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save company profile');
      }

      setHasExistingCompany(true);
      setSuccessMessage('Company profile saved successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark-navy)]">
              Company Profile
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
              {hasExistingCompany
                ? 'Manage your organization details and company information.'
                : 'Set up your company profile before publishing your first job post.'}
            </p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-sm text-emerald-800">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <Link href="/recruiter/jobs/new">
            <Button size="sm" variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-xs">
              <span>Post a Job</span>
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50 p-4 border border-rose-200 text-sm text-rose-800">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form card */}
      <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
            Company Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Acme Technologies"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:bg-white focus:outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
            Company Website
          </label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:bg-white focus:outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
            Company Size
          </label>
          <div className="relative">
            <Users className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <select
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-sm text-gray-900 focus:border-purple-600 focus:bg-white focus:outline-none transition"
            >
              <option value="1-10">1-10 employees (Startup / Seed)</option>
              <option value="11-50">11-50 employees (Early Growth)</option>
              <option value="51-200">51-200 employees (Scale-up)</option>
              <option value="201-500">201-500 employees (Mid-sized)</option>
              <option value="500+">500+ employees (Enterprise)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
            About Company / Description
          </label>
          <div className="relative">
            <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of what your company builds and your engineering mission..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:bg-white focus:outline-none transition"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            One company profile per recruiter account.
          </p>
          <Button
            type="submit"
            disabled={saving || !formData.name.trim()}
            variant="primary"
            size="md"
            className="bg-purple-600 hover:bg-purple-700 min-w-32 justify-center"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Company</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

