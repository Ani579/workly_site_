import { z } from 'zod';

export const resumeSkillSchema = z.object({
  name: z.string().min(1),
  level: z.number().min(0).max(100),
});

export const resumeSkillGapSchema = z.object({
  name: z.string().min(1),
  priority: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
});

export const resumeAnalysisSchema = z.object({
  headline: z.string().min(1),
  skills: z.array(resumeSkillSchema).max(12),
  skillGaps: z.array(resumeSkillGapSchema).max(5),
  profileScore: z.number().min(0).max(100),
  scoreSummary: z.string().min(1),
  strengths: z.array(z.string()).max(3),
  improvements: z.array(z.string()).max(4),
});

export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;

export const profileUpdateSchema = z.object({
  headline: z.string().max(120).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  education: z.string().max(200).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  githubUsername: z.string().max(50).optional().nullable(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  website: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  description: z.string().max(1000).optional(),
  size: z.string().max(50).optional(),
});

export type CompanyInput = z.infer<typeof companySchema>;

export const jobPostSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters').max(120),
  description: z.string().min(20, 'Job description must be at least 20 characters').max(5000),
  requiredSkills: z.array(z.string().min(1)).min(1, 'At least 1 required skill must be added'),
  experienceLevel: z.string().max(50).optional(),
  location: z.string().max(100).optional(),
  type: z.enum(['INTERNSHIP', 'FULL_TIME']),
});

export type JobPostInput = z.infer<typeof jobPostSchema>;

