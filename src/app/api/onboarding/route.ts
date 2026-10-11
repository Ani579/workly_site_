import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Don't allow changing the role once set
  const { role } = await req.json();
  if (!['STUDENT', 'RECRUITER'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  await connectDB();
  const dbUser = await User.findById(session.user.userId);
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (dbUser.role) {
    return NextResponse.json({ error: 'Role already set' }, { status: 409 });
  }

  dbUser.role = role;
  await dbUser.save();

  return NextResponse.json({ ok: true, role });
}

