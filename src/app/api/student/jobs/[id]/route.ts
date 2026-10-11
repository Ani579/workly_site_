import { NextResponse } from 'next/server';
import { requireRoleApi } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { StudentProfile } from '@/models/StudentProfile';
import { Job } from '@/models/Job';
import { Match } from '@/models/Match';
import { Application } from '@/models/Application';
import '@/models/Company';
import { calculateDeterministicMatch } from '@/lib/matching';
import { serializeDocument } from '@/lib/serialize';
import { Types } from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireRoleApi('STUDENT');
  if (error || !session?.user?.userId) {
    return error ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: jobId } = await params;
  if (!Types.ObjectId.isValid(jobId)) {
    return NextResponse.json({ error: 'Invalid Job ID' }, { status: 400 });
  }

  await connectDB();
  const profile = await StudentProfile.findOne({ userId: session.user.userId });
  const rawJob = await Job.findById(jobId).populate('companyId').lean();

  if (!rawJob) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  const job = serializeDocument<any>(rawJob);

  let matchScore = 0;
  let reasons: string[] = [];
  let missingSkills = job.requiredSkills || [];
  let matchedSkills: string[] = [];
  let hasApplied = false;

  if (profile) {
    // Check match document
    const match = await Match.findOne({
      jobId: job._id,
      studentProfileId: profile._id,
    }).lean();

    if (match) {
      matchScore = match.score;
      reasons = match.reasons || [];
      missingSkills = match.missingSkills || [];
    } else {
      const computed = calculateDeterministicMatch(profile.skills || [], {
        requiredSkills: job.requiredSkills || [],
        type: job.type,
        experienceLevel: job.experienceLevel,
      });
      matchScore = computed.score;
      missingSkills = computed.missingSkills;
    }

    const studentSkillsLower = new Set(
      (profile.skills || []).map((s: any) => s.name.toLowerCase().trim())
    );
    matchedSkills = (job.requiredSkills || []).filter((req: string) =>
      studentSkillsLower.has(req.toLowerCase().trim())
    );

    const app = await Application.findOne({
      jobId: job._id,
      studentProfileId: profile._id,
    }).lean();
    hasApplied = !!app;
  }

  return NextResponse.json({
    job: {
      ...job,
      matchScore,
      reasons,
      missingSkills,
      matchedSkills,
      hasApplied,
    },
  });
}

