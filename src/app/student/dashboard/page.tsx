import React from 'react';
import { requireRole } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { StudentProfile } from '@/models/StudentProfile';
import { ScoreHistory } from '@/models/ScoreHistory';
import { Course } from '@/models/Course';
import { Match } from '@/models/Match';
import { Job } from '@/models/Job';
import { Company } from '@/models/Company';
import { computeMatchesForStudent } from '@/lib/matching';
import { serializeDocument } from '@/lib/serialize';
import { DashboardClient } from '@/components/student/DashboardClient';

export default async function StudentDashboardPage() {
  const session = await requireRole('STUDENT');
  const userId = session.user.userId;

  await connectDB();

  // 1. Fetch Student Profile with lean query
  const rawProfile = await StudentProfile.findOne({ userId }).lean();
  const profile = rawProfile ? serializeDocument<any>(rawProfile) : null;

  // 2. Compute cohort percentile strictly from REAL stored database scores
  const totalEvaluatedProfiles = await StudentProfile.countDocuments({
    profileScore: { $ne: null },
  });

  let percentile: number | null = null;
  if (profile?.profileScore !== null && profile?.profileScore !== undefined && totalEvaluatedProfiles > 1) {
    const scoresBelow = await StudentProfile.countDocuments({
      profileScore: { $lt: profile.profileScore },
    });
    percentile = Math.round((scoresBelow / (totalEvaluatedProfiles - 1)) * 100);
  }

  // 3. For each skill gap, fetch matching courses with a single query using skillTag $in
  let matchingCourses: any[] = [];
  if (profile?.skillGaps && profile.skillGaps.length > 0) {
    const gapNames: string[] = profile.skillGaps.map((g: any) => g.name);

    // Case-insensitive regex matching for normalized skill tags
    const regexList = gapNames.map((name: string) => {
      // Escape special characters in skill names
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`^${escaped}$`, 'i');
    });

    const rawCourses = await Course.find({
      skillTag: { $in: regexList },
    })
      .sort({ skillTag: 1, title: 1 })
      .lean();

    matchingCourses = serializeDocument<any[]>(rawCourses);
  }

  // 4. Fetch Top 3 Matched Jobs for the student
  let topJobs: any[] = [];
  if (profile) {
    const matchCount = await Match.countDocuments({ studentProfileId: profile._id });
    if (matchCount === 0) {
      await computeMatchesForStudent(profile._id.toString(), { explainTop: true });
    }

    const rawMatches = await Match.find({ studentProfileId: profile._id })
      .populate({
        path: 'jobId',
        model: Job,
        populate: {
          path: 'companyId',
          model: Company,
        },
      })
      .sort({ score: -1 })
      .limit(3)
      .lean();

    topJobs = rawMatches
      .filter((m) => !!m.jobId)
      .map((m) => {
        const job = m.jobId as any;
        return {
          _id: job._id.toString(),
          title: job.title,
          companyName: job.companyId?.name || 'Demo Company',
          location: job.location || 'Remote',
          type: job.type,
          matchScore: m.score,
        };
      });
  }

  // 5. Fetch Score History for progress tracker
  let scoreHistory: any[] = [];
  if (profile) {
    const rawHistory = await ScoreHistory.find({ studentProfileId: profile._id })
      .sort({ createdAt: 1 })
      .lean();
    scoreHistory = serializeDocument<any[]>(rawHistory);

    if (scoreHistory.length === 0 && profile.profileScore !== null && profile.profileScore !== undefined) {
      scoreHistory = [
        {
          _id: 'baseline',
          score: profile.profileScore,
          createdAt: new Date().toISOString(),
        },
      ];
    }
  }

  return (
    <DashboardClient
      userName={session.user.name || 'Student'}
      profile={profile}
      courses={matchingCourses}
      topJobs={topJobs}
      scoreHistory={scoreHistory}
      cohortStats={{
        totalEvaluatedProfiles,
        percentile,
      }}
    />
  );
}
