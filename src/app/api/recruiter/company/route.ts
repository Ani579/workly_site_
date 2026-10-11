import { NextResponse } from 'next/server';
import { requireRoleApi } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Company } from '@/models/Company';
import { companySchema } from '@/lib/validators';
import { serializeDocument } from '@/lib/serialize';

export async function GET() {
  const { session, error } = await requireRoleApi('RECRUITER');
  if (error || !session) return error!;

  await connectDB();
  const company = await Company.findOne({ ownerUserId: session.user.userId }).lean();

  return NextResponse.json({
    company: company ? serializeDocument(company) : null,
  });
}

export async function POST(req: Request) {
  const { session, error } = await requireRoleApi('RECRUITER');
  if (error || !session) return error!;

  try {
    const body = await req.json();
    const validated = companySchema.parse(body);

    await connectDB();
    const updated = await Company.findOneAndUpdate(
      { ownerUserId: session.user.userId },
      {
        $set: {
          name: validated.name.trim(),
          website: validated.website?.trim() || '',
          description: validated.description?.trim() || '',
          size: validated.size?.trim() || '',
          ownerUserId: session.user.userId,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json({
      ok: true,
      company: serializeDocument(updated),
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: err.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Error saving company profile:', err);
    return NextResponse.json({ error: 'Failed to save company profile' }, { status: 500 });
  }
}

