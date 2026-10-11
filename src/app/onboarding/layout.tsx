import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

/**
 * Wrap the onboarding page in a server check:
 * If the user already has a role, skip straight to their dashboard.
 */
export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  // Already onboarded — send to their dashboard
  if (session.user.role) {
    redirect(session.user.role === 'STUDENT' ? '/student/dashboard' : '/recruiter/dashboard');
  }

  return <>{children}</>;
}

