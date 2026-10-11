import { NextResponse } from 'next/server';
import { requireRoleApi } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { StudentProfile } from '@/models/StudentProfile';
import { computeMatchesForStudent } from '@/lib/matching';

export async function POST() {
  const { session, error } = await requireRoleApi('STUDENT');
  if (error || !session?.user?.userId) {
    return error ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const profile = await StudentProfile.findOne({ userId: session.user.userId });
  if (!profile) {
    return NextResponse.json(
      { error: 'Please upload a resume first to compute job matches.' },
      { status: 400 }
    );
  }

  const updatedCount = await computeMatchesForStudent(profile._id.toString(), {
    explainTop: true,
  });

  return NextResponse.json({
    ok: true,
    message: `Updated matches for ${updatedCount} available jobs.`,
    matchesCount: updatedCount,
  });
}

