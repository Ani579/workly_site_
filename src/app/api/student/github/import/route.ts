import { NextResponse } from 'next/server';
import { requireRoleApi } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { StudentProfile } from '@/models/StudentProfile';
import { computeMatchesForStudent } from '@/lib/matching';
import { serializeDocument } from '@/lib/serialize';

export async function POST(req: Request) {
  const { session, error } = await requireRoleApi('STUDENT');
  if (error || !session) return error!;

  try {
    const body = await req.json();
    const rawUsername = body.githubUsername || '';
    const username = rawUsername.trim().replace(/^@/, '');

    if (!username) {
      return NextResponse.json({ error: 'Please enter a GitHub username.' }, { status: 400 });
    }

    // 1. Fetch public user profile from GitHub REST API (No private scopes, public data only)
    const headers = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Workly-App-Skills-Importer',
    };

    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers,
    });

    if (userRes.status === 404) {
      return NextResponse.json(
        { error: `GitHub user "${username}" was not found.` },
        { status: 404 }
      );
    }

    if (userRes.status === 403 || userRes.status === 429) {
      return NextResponse.json(
        { error: 'GitHub public API rate limit reached. Please try again in a few minutes.' },
        { status: 429 }
      );
    }

    if (!userRes.ok) {
      return NextResponse.json(
        { error: 'Failed to communicate with GitHub API.' },
        { status: userRes.status }
      );
    }

    const userData = await userRes.json();

    // 2. Fetch public repositories
    const reposRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=30&sort=pushed`,
      { headers }
    );

    let reposData: any[] = [];
    if (reposRes.ok) {
      reposData = await reposRes.json();
    }

    // Aggregate statistics
    let totalStars = 0;
    const languageCounts: Record<string, number> = {};

    for (const repo of reposData) {
      totalStars += repo.stargazers_count || 0;
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
    }

    // Sort languages by frequency
    const topLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);

    await connectDB();
    const profile = await StudentProfile.findOne({ userId: session.user.userId });
    if (!profile) {
      return NextResponse.json(
        { error: 'Please upload a resume first to create your student profile.' },
        { status: 400 }
      );
    }

    profile.githubUsername = username;

    // Merge languages into the embedded skills array with source "GITHUB"
    // Default level: 60 (modest baseline for public repositories, marked from GitHub)
    const currentSkills = profile.skills || [];
    const skillNameMap = new Map<string, number>();

    for (let i = 0; i < currentSkills.length; i++) {
      skillNameMap.set(currentSkills[i].name.toLowerCase().trim(), i);
    }

    for (const lang of topLanguages) {
      const lowerLang = lang.toLowerCase().trim();
      if (!skillNameMap.has(lowerLang)) {
        // Add new skill from GitHub
        profile.skills.push({
          name: lang,
          level: 60,
          source: 'GITHUB',
        });
      } else {
        // Already exists: if existing is GITHUB source, update to ensure consistency
        const idx = skillNameMap.get(lowerLang)!;
        if (profile.skills[idx].source === 'GITHUB') {
          profile.skills[idx].level = 60;
        }
      }
    }

    await profile.save();

    // Recalculate job matches with newly merged GitHub skills
    await computeMatchesForStudent(profile._id.toString());

    return NextResponse.json({
      ok: true,
      stats: {
        username: userData.login,
        publicRepos: userData.public_repos ?? reposData.length,
        totalStars,
        topLanguages,
        avatarUrl: userData.avatar_url,
      },
      skills: profile.skills,
      profile: serializeDocument(profile.toObject()),
    });
  } catch (err: any) {
    console.error('Error importing GitHub profile:', err);
    return NextResponse.json(
      { error: err.message || 'An error occurred while importing GitHub data' },
      { status: 500 }
    );
  }
}

