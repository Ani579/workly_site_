import { NextResponse } from 'next/server';
import { requireRoleApi } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { StudentProfile } from '@/models/StudentProfile';
import { Job } from '@/models/Job';
import { Application } from '@/models/Application';
import { Types } from 'mongoose';

export async function POST(
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
  if (!profile) {
    return NextResponse.json(
      { error: 'Please upload a resume and complete your profile before applying.' },
      { status: 400 }
    );
  }

  const job = await Job.findById(jobId);
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  try {
    const application = await Application.create({
      jobId: job._id,
      studentProfileId: profile._id,
      status: 'APPLIED',
      source: 'APPLIED',
    });

    return NextResponse.json({
      ok: true,
      message: 'Application submitted successfully!',
      status: application.status,
    });
  } catch (err: any) {
    // Mongo duplicate key error (code 11000) for compound index (jobId, studentProfileId)
    if (err.code === 11000) {
      return NextResponse.json({
        ok: true,
        alreadyApplied: true,
        message: 'You have already applied for this position.',
        status: 'APPLIED',
      });
    }

    console.error('Job application error:', err);
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}

