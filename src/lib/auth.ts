import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

type Role = 'STUDENT' | 'RECRUITER';

/** Use in Server Components / page.tsx — redirects if wrong role */
export async function requireRole(role: Role) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (!session.user.role) redirect('/onboarding');
  if (session.user.role !== role) {
    redirect(role === 'STUDENT' ? '/recruiter/dashboard' : '/student/dashboard');
  }
  return session;
}

/** Use in API Route Handlers — returns 401/403 JSON responses */
export async function requireRoleApi(role: Role) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (session.user.role !== role) {
    return { session: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { session, error: null };
}

