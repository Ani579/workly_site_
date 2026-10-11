import { NextResponse } from 'next/server';
import { requireRoleApi } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Company } from '@/models/Company';
import { Job } from '@/models/Job';
import { Application } from '@/models/Application';
import { Match } from '@/models/Match';
import '@/models/StudentProfile';
import '@/models/User';
import { serializeDocument } from '@/lib/serialize';

export async function GET() {
  const { session, error } = await requireRoleApi('RECRUITER');
  if (error || !session) return error!;

  await connectDB();
  const company = await Company.findOne({ ownerUserId: session.user.userId }).lean();
  if (!company) {
    return NextResponse.json({
      hasCompany: false,
      company: null,
      stats: {
        activeJobs: 0,
        totalApplicants: 0,
        shortlistedCount: 0,
      },
      recentApplications: [],
    });
  }

  // Find all jobs for this recruiter's company
  const jobs = await Job.find({ companyId: company._id }).lean();
  const jobIds = jobs.map((j) => j._id);

  // Real database counts only
  const activeJobs = jobs.length;
  const totalApplicants = await Application.countDocuments({ jobId: { $in: jobIds } });
  const shortlistedCount = await Application.countDocuments({
    jobId: { $in: jobIds },
    status: 'SHORTLISTED',
  });

  // Recent applications (limit 10)
  const recentApps = await Application.find({ jobId: { $in: jobIds } })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('jobId', 'title type location')
    .populate({
      path: 'studentProfileId',
      select: 'userId headline skills profileScore location',
      populate: {
        path: 'userId',
        select: 'name email image',
      },
    })
    .lean();

  // Find match scores for these applicants to enrich the dashboard
  const appStudentIds = recentApps.map((a) => a.studentProfileId?._id).filter(Boolean);
  const matches = await Match.find({
    jobId: { $in: jobIds },
    studentProfileId: { $in: appStudentIds },
  }).lean();

  const matchScoreMap = new Map<string, number>();
  for (const m of matches) {
    matchScoreMap.set(`${m.jobId.toString()}_${m.studentProfileId.toString()}`, m.score);
  }

  const enrichedRecentApps = recentApps
    .filter((a) => a.jobId && a.studentProfileId)
    .map((app) => {
      const job = app.jobId as any;
      const profile = app.studentProfileId as any;
      const user = profile?.userId as any;
      const key = `${job._id.toString()}_${profile._id.toString()}`;

      return {
        _id: app._id.toString(),
        jobId: job._id.toString(),
        jobTitle: job.title,
        jobType: job.type,
        jobLocation: job.location,
        candidateId: profile._id.toString(),
        candidateName: user?.name || 'Candidate',
        candidateHeadline: profile.headline || 'Software Developer',
        candidateLocation: profile.location || 'Remote',
        profileScore: profile.profileScore,
        matchScore: matchScoreMap.get(key) ?? null,
        status: app.status,
        source: app.source,
        createdAt: (app as any).createdAt ? (app as any).createdAt.toISOString() : '',
      };
    });

  return NextResponse.json({
    hasCompany: true,
    company: serializeDocument(company),
    stats: {
      activeJobs,
      totalApplicants,
      shortlistedCount,
    },
    recentApplications: enrichedRecentApps,
  });
}

