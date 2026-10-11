import { NextResponse } from 'next/server';
import { requireRoleApi } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { StudentProfile } from '@/models/StudentProfile';
import { profileUpdateSchema } from '@/lib/validators';
import { serializeDocument } from '@/lib/serialize';

export async function GET() {
  const { session, error } = await requireRoleApi('STUDENT');
  if (error || !session?.user?.userId) {
    return error ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const profile = await StudentProfile.findOne({ userId: session.user.userId });

  if (!profile) {
    return NextResponse.json({
      profile: {
        headline: '',
        bio: '',
        education: '',
        location: '',
        githubUsername: '',
        skills: [],
        skillGaps: [],
        profileScore: null,
        scoreSummary: '',
        strengths: [],
        improvements: [],
      },
    });
  }

  return NextResponse.json({
    profile: serializeDocument(profile.toObject()),
  });
}

export async function PUT(req: Request) {
  const { session, error } = await requireRoleApi('STUDENT');
  if (error || !session?.user?.userId) {
    return error ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', details: parsed.error.format() },
      { status: 400 }
    );
  }

  await connectDB();
  const updatedProfile = await StudentProfile.findOneAndUpdate(
    { userId: session.user.userId },
    {
      $set: {
        ...(parsed.data.headline !== undefined && { headline: parsed.data.headline }),
        ...(parsed.data.bio !== undefined && { bio: parsed.data.bio }),
        ...(parsed.data.education !== undefined && { education: parsed.data.education }),
        ...(parsed.data.location !== undefined && { location: parsed.data.location }),
        ...(parsed.data.githubUsername !== undefined && { githubUsername: parsed.data.githubUsername }),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return NextResponse.json({
    ok: true,
    profile: serializeDocument(updatedProfile.toObject()),
  });
}
