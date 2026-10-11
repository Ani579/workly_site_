import { NextResponse } from 'next/server';
import { requireRoleApi } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Company } from '@/models/Company';
import { Job } from '@/models/Job';
import { Application } from '@/models/Application';
import { jobPostSchema } from '@/lib/validators';
import { computeMatchesForJob } from '@/lib/matching';
import { serializeDocument } from '@/lib/serialize';

export async function GET() {
  const { session, error } = await requireRoleApi('RECRUITER');
  if (error || !session) return error!;

  await connectDB();
  const company = await Company.findOne({ ownerUserId: session.user.userId }).lean();
  if (!company) {
    return NextResponse.json({ jobs: [], company: null });
  }

  const jobs = await Job.find({ companyId: company._id }).sort({ createdAt: -1 }).lean();
  const jobIds = jobs.map((j) => j._id);

  // Aggregate application counts grouped by jobId
  const appCounts = await Application.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    {
      $group: {
        _id: '$jobId',
        totalApplicants: { $sum: 1 },
        shortlistedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'SHORTLISTED'] }, 1, 0] },
        },
      },
    },
  ]);

  const countMap = new Map<string, { total: number; shortlisted: number }>();
  for (const c of appCounts) {
    countMap.set(c._id.toString(), {
      total: c.totalApplicants,
      shortlisted: c.shortlistedCount,
    });
  }

  const enrichedJobs = jobs.map((job) => {
    const counts = countMap.get(job._id.toString()) || { total: 0, shortlisted: 0 };
    return {
      ...serializeDocument<Record<string, any>>(job),
      totalApplicants: counts.total,
      shortlistedCount: counts.shortlisted,
    };
  });

  return NextResponse.json({
    jobs: enrichedJobs,
    company: serializeDocument(company),
  });
}

export async function POST(req: Request) {
  const { session, error } = await requireRoleApi('RECRUITER');
  if (error || !session) return error!;

  try {
    await connectDB();
    const company = await Company.findOne({ ownerUserId: session.user.userId });
    if (!company) {
      return NextResponse.json(
        { error: 'Company profile required before posting a job. Please create a company profile first.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = jobPostSchema.parse(body);

    // Normalize skills (trim, filter empty, deduplicate case-insensitively while preserving original case)
    const seen = new Set<string>();
    const normalizedSkills: string[] = [];
    for (const s of validated.requiredSkills) {
      const trimmed = s.trim();
      const lower = trimmed.toLowerCase();
      if (trimmed && !seen.has(lower)) {
        seen.add(lower);
        normalizedSkills.push(trimmed);
      }
    }

    if (normalizedSkills.length === 0) {
      return NextResponse.json({ error: 'At least 1 required skill must be specified' }, { status: 400 });
    }

    const newJob = await Job.create({
      companyId: company._id,
      title: validated.title.trim(),
      description: validated.description.trim(),
      requiredSkills: normalizedSkills,
      experienceLevel: validated.experienceLevel?.trim() || 'Entry Level',
      location: validated.location?.trim() || 'Remote',
      type: validated.type,
      isDemo: false,
    });

    // Compute Match documents for all analyzed students asynchronously
    const matchesCount = await computeMatchesForJob(newJob._id.toString());

    return NextResponse.json({
      ok: true,
      job: serializeDocument(newJob.toObject()),
      matchesComputed: matchesCount,
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: err.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Error creating job post:', err);
    return NextResponse.json({ error: 'Failed to create job post' }, { status: 500 });
  }
}
