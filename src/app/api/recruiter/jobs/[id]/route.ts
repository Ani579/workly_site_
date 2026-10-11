import { NextResponse } from 'next/server';
import { requireRoleApi } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Job } from '@/models/Job';
import '@/models/Company';
import { Match } from '@/models/Match';
import { Application } from '@/models/Application';
import '@/models/StudentProfile';
import '@/models/User';
import { serializeDocument } from '@/lib/serialize';
import { Types } from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireRoleApi('RECRUITER');
  if (error || !session) return error!;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  await connectDB();

  // Find job and verify ownership via company.ownerUserId
  const job = await Job.findById(id).populate('companyId').lean();
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  const company = job.companyId as any;
  if (!company || company.ownerUserId?.toString() !== session.user.userId) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  // Find all matches for this job, sorted by match score descending
  // PROJECTION PRIVACY ENFORCEMENT: Never select resumeText or resumeHash
  const matches = await Match.find({ jobId: id })
    .sort({ score: -1 })
    .populate({
      path: 'studentProfileId',
      select: 'userId headline bio education location profileScore strengths improvements skills skillGaps',
      populate: {
        path: 'userId',
        select: 'name email image',
      },
    })
    .lean();

  // Find all applications for this job
  const applications = await Application.find({ jobId: id }).lean();
  const appMap = new Map<string, { status: string; source: string; appliedAt: string }>();
  for (const app of applications) {
    appMap.set(app.studentProfileId.toString(), {
      status: app.status,
      source: app.source,
      appliedAt: (app as any).createdAt ? (app as any).createdAt.toISOString() : '',
    });
  }

  // Format matches with application status
  const candidateMatches = matches
    .filter((m) => m.studentProfileId) // Ensure profile exists
    .map((m) => {
      const studentProfile = m.studentProfileId as any;
      const user = studentProfile?.userId as any;
      const profileIdStr = studentProfile._id.toString();
      const appInfo = appMap.get(profileIdStr);

      return {
        _id: m._id.toString(),
        matchScore: m.score,
        reasons: m.reasons || [],
        missingSkills: m.missingSkills || [],
        explained: m.explained,
        candidate: {
          profileId: profileIdStr,
          userId: user?._id?.toString() || '',
          name: user?.name || 'Candidate',
          email: user?.email || '',
          image: user?.image || null,
          headline: studentProfile.headline || 'Aspiring Software Developer',
          bio: studentProfile.bio || '',
          education: studentProfile.education || '',
          location: studentProfile.location || 'Remote',
          profileScore: studentProfile.profileScore,
          strengths: studentProfile.strengths || [],
          improvements: studentProfile.improvements || [],
          skills: (studentProfile.skills || []).map((s: any) => ({
            name: s.name,
            level: s.level,
            source: s.source,
          })),
        },
        applicationStatus: appInfo?.status || null,
        applicationSource: appInfo?.source || null,
        appliedAt: appInfo?.appliedAt || null,
      };
    });

  return NextResponse.json({
    job: serializeDocument(job),
    matches: candidateMatches,
  });
}

