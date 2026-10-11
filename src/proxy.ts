// src/proxy.ts — Next.js 16 "proxy" (renamed from middleware)
// Protects /student/*, /recruiter/*, and /onboarding based on JWT role.
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthed = !!token;
  const role = token?.role as string | null | undefined;

  // Unauthenticated users trying to access protected areas → /login
  if (
    !isAuthed &&
    (pathname.startsWith('/student') ||
      pathname.startsWith('/recruiter') ||
      pathname.startsWith('/onboarding'))
  ) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Already onboarded users trying to visit /onboarding → their dashboard
  if (pathname.startsWith('/onboarding') && role) {
    return NextResponse.redirect(
      new URL(role === 'STUDENT' ? '/student/dashboard' : '/recruiter/dashboard', request.url)
    );
  }

  // Student trying to access recruiter area
  if (pathname.startsWith('/recruiter') && role !== 'RECRUITER') {
    return NextResponse.redirect(new URL('/student/dashboard', request.url));
  }

  // Recruiter trying to access student area
  if (pathname.startsWith('/student') && role !== 'STUDENT') {
    return NextResponse.redirect(new URL('/recruiter/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/student/:path*', '/recruiter/:path*', '/onboarding'],
};
