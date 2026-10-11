import { NextResponse } from 'next/server';
import { requireRoleApi } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Job } from '@/models/Job';
import { Application } from '@/models/Application';
import { Types } from 'mongoose';

export async function POST(
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
  const job = await Job.findById(id).populate('companyId').lean();
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  const company = job.companyId as any;
  if (!company || company.ownerUserId?.toString() !== session.user.userId) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { studentProfileId, action = 'SHORTLIST' } = body;

    if (!studentProfileId || !Types.ObjectId.isValid(studentProfileId)) {
      return NextResponse.json({ error: 'Invalid studentProfileId' }, { status: 400 });
    }

    const newStatus = action === 'UNSHORTLIST' ? 'APPLIED' : 'SHORTLISTED';

    const existingApp = await Application.findOne({
      jobId: id,
      studentProfileId,
    });

    let app;
    if (existingApp) {
      existingApp.status = newStatus;
      app = await existingApp.save();
    } else {
      app = await Application.create({
        jobId: id,
        studentProfileId,
        status: newStatus,
        source: 'RECRUITER_SHORTLIST',
      });
    }

    return NextResponse.json({
      ok: true,
      status: app.status,
      source: app.source,
    });
  } catch (err: any) {
    console.error('Error updating candidate shortlist status:', err);
    return NextResponse.json({ error: 'Failed to update shortlist status' }, { status: 500 });
  }
}

