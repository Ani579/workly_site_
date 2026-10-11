import { NextResponse } from 'next/server';
import { requireRoleApi } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { StudentProfile } from '@/models/StudentProfile';
import { Match } from '@/models/Match';
import { Job } from '@/models/Job';
import { Application } from '@/models/Application';
import { Company } from '@/models/Company'; // register model
import { computeMatchesForStudent } from '@/lib/matching';
import { serializeDocument } from '@/lib/serialize';

export async function GET(req: Request) {
  const { session, error } = await requireRoleApi('STUDENT');
  if (error || !session?.user?.userId) {
    return error ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const typeFilter = searchParams.get('type') || 'ALL';
  const locationFilter = searchParams.get('location') || 'ALL';
  const minScore = parseInt(searchParams.get('minScore') || '0', 10);
  const searchQuery = searchParams.get('search')?.toLowerCase().trim() || '';

  await connectDB();
  const profile = await StudentProfile.findOne({ userId: session.user.userId });

  if (!profile) {
    // Return all demo jobs with 0 match score if no resume uploaded yet
    const jobs = await Job.find({}).populate('companyId').lean();
    return NextResponse.json({
      hasProfile: false,
      jobs: jobs.map((j) => ({
        ...serializeDocument<any>(j),
        matchScore: 0,
        reasons: [],
        missingSkills: j.requiredSkills || [],
        matchedSkills: [],
        hasApplied: false,
      })),
    });
  }

  // Ensure matches exist for the student
  const matchCount = await Match.countDocuments({ studentProfileId: profile._id });
  if (matchCount === 0) {
    await computeMatchesForStudent(profile._id.toString(), { explainTop: true });
  }

  // Fetch applications to mark applied jobs
  const applications = await Application.find({ studentProfileId: profile._id }).lean();
  const appliedJobIdSet = new Set(applications.map((a) => a.jobId.toString()));

  // Query Matches joined with Job and Company
  const matches = await Match.find({ studentProfileId: profile._id })
    .populate({
      path: 'jobId',
      model: Job,
      populate: {
        path: 'companyId',
        model: Company,
      },
    })
    .sort({ score: -1 })
    .lean();

  // Filter and format results
  const rankedJobs = matches
    .filter((m) => {
      const job = m.jobId as any;
      if (!job) return false;

      // Filter by minScore
      if (m.score < minScore) return false;

      // Filter by type
      if (typeFilter !== 'ALL' && job.type !== typeFilter) return false;

      // Filter by location
      if (locationFilter !== 'ALL') {
        const jobLoc = (job.location || '').toLowerCase();
        if (!jobLoc.includes(locationFilter.toLowerCase())) return false;
      }

      // Filter by text search query
      if (searchQuery) {
        const titleMatch = job.title?.toLowerCase().includes(searchQuery);
        const compMatch = job.companyId?.name?.toLowerCase().includes(searchQuery);
        const skillsMatch = (job.requiredSkills || []).some((s: string) =>
          s.toLowerCase().includes(searchQuery)
        );
        if (!titleMatch && !compMatch && !skillsMatch) return false;
      }

      return true;
    })
    .map((m) => {
      const job = m.jobId as any;
      const studentSkillsLower = new Set(
        (profile.skills || []).map((s: { name: string }) => s.name.toLowerCase().trim())
      );

      const matchedSkills = (job.requiredSkills || []).filter((req: string) =>
        studentSkillsLower.has(req.toLowerCase().trim())
      );

      return {
        _id: job._id.toString(),
        title: job.title,
        description: job.description,
        requiredSkills: job.requiredSkills || [],
        experienceLevel: job.experienceLevel,
        location: job.location,
        type: job.type,
        company: job.companyId
          ? {
              _id: job.companyId._id.toString(),
              name: job.companyId.name,
              description: job.companyId.description,
              website: job.companyId.website,
              size: job.companyId.size,
            }
          : { name: 'Demo Company' },
        matchScore: m.score,
        reasons: m.reasons || [],
        missingSkills: m.missingSkills || [],
        matchedSkills,
        explained: m.explained,
        hasApplied: appliedJobIdSet.has(job._id.toString()),
      };
    });

  return NextResponse.json({
    hasProfile: true,
    studentSkills: profile.skills || [],
    jobs: rankedJobs,
  });
}
