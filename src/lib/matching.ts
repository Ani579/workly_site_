import { z } from 'zod';
import { generateJson } from './ai';
import { Job } from '@/models/Job';
import { Match } from '@/models/Match';
import { StudentProfile } from '@/models/StudentProfile';

export interface MatchScoreResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  reasons: string[];
}

const aiMatchExplanationSchema = z.object({
  reasons: z.array(z.string()).max(3),
  missingSkills: z.array(z.string()),
});

/**
 * 1. DETERMINISTIC SCORE (0 - 100)
 * Weighted skill overlap between student skills and job requiredSkills,
 * plus small bonus for experience-level fit. Works with zero AI.
 */
export function calculateDeterministicMatch(
  studentSkills: { name: string; level: number }[],
  job: {
    requiredSkills: string[];
    type?: string;
    experienceLevel?: string;
  }
): {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
} {
  const reqSkills = job.requiredSkills || [];
  if (reqSkills.length === 0) {
    return { score: 70, matchedSkills: [], missingSkills: [] };
  }

  // Normalize student skills map for fast lookup
  const studentSkillMap = new Map<string, number>();
  for (const s of studentSkills) {
    studentSkillMap.set(s.name.trim().toLowerCase(), s.level);
  }

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  let totalSkillWeight = 0;

  for (const req of reqSkills) {
    const normalizedReq = req.trim().toLowerCase();
    let foundLevel: number | null = null;

    if (studentSkillMap.has(normalizedReq)) {
      foundLevel = studentSkillMap.get(normalizedReq)!;
    } else {
      // Check partial token match (e.g. "React.js" matches "React")
      for (const [stName, stLevel] of studentSkillMap.entries()) {
        if (
          stName.includes(normalizedReq) ||
          normalizedReq.includes(stName)
        ) {
          foundLevel = Math.round(stLevel * 0.85);
          break;
        }
      }
    }

    if (foundLevel !== null) {
      matchedSkills.push(req);
      // Normalized weight from 0.0 to 1.0 based on candidate proficiency
      totalSkillWeight += Math.min(1, Math.max(0.4, foundLevel / 100));
    } else {
      missingSkills.push(req);
    }
  }

  // Fraction of required skills covered, scaled to max 85 base points
  const coverageRatio = totalSkillWeight / reqSkills.length;
  let score = Math.round(coverageRatio * 85);

  // Bonus for experience fit (up to 15 points)
  if (matchedSkills.length > 0) {
    const expLower = (job.experienceLevel || '').toLowerCase();
    const typeLower = (job.type || '').toLowerCase();

    if (typeLower === 'internship' || expLower.includes('intern') || expLower.includes('entry') || expLower.includes('junior')) {
      score += 15;
    } else {
      score += 10;
    }
  }

  // Cap between 0 and 100
  score = Math.min(100, Math.max(0, score));

  return {
    score,
    matchedSkills,
    missingSkills,
  };
}

/**
 * 2. OPTIONAL AI EXPLANATION FOR TOP MATCHES
 * Generates reasons and missing skills using ONLY skills data without personal identifiers.
 */
export async function generateMatchExplanation(
  jobTitle: string,
  matchedSkills: string[],
  missingSkills: string[],
  score: number
): Promise<{ reasons: string[]; missingSkills: string[] }> {
  // Rule-based fallback explanation generator
  const fallbackReasons = [
    matchedSkills.length > 0
      ? `Strong verified competency in core role requirements: ${matchedSkills.slice(0, 3).join(', ')}.`
      : 'Entry-level foundation with growth potential in this domain.',
    `Demonstrated match alignment score of ${score}%.`,
    missingSkills.length > 0
      ? `Can enhance fit by acquiring familiarity with: ${missingSkills.slice(0, 2).join(', ')}.`
      : 'Meets or exceeds all listed prerequisite technical proficiencies.',
  ].slice(0, 3);

  if (!process.env.GEMINI_API_KEY) {
    return { reasons: fallbackReasons, missingSkills };
  }

  const prompt = `You are an objective skills evaluation engine for Workly.
Given the candidate's matched and missing skills for the job "${jobTitle}", provide an evaluation explanation.

CRITICAL RULES:
- Use ONLY the provided skill names and score.
- NEVER invent or reference name, gender, college, or age.
- Provide at most 3 concise, objective reasons explaining why this is a good fit.

DATA:
- Job Title: ${jobTitle}
- Deterministic Match Score: ${score}%
- Matched Skills: ${matchedSkills.join(', ') || 'None'}
- Missing Skills: ${missingSkills.join(', ') || 'None'}

Respond with JSON:
{
  "reasons": ["Reason 1", "Reason 2"],
  "missingSkills": ["Skill 1"]
}`;

  try {
    const aiResult = await generateJson(prompt, aiMatchExplanationSchema);
    return {
      reasons: aiResult.reasons.length > 0 ? aiResult.reasons : fallbackReasons,
      missingSkills: aiResult.missingSkills.length > 0 ? aiResult.missingSkills : missingSkills,
    };
  } catch {
    return { reasons: fallbackReasons, missingSkills };
  }
}

/**
 * 3. COMPUTE AND PERSIST MATCHES FOR A STUDENT
 * Calculates deterministic scores for all jobs, explains the top 5, and upserts Match docs.
 */
export async function computeMatchesForStudent(
  studentProfileId: string,
  options: { explainTop?: boolean } = { explainTop: true }
): Promise<number> {
  const profile = await StudentProfile.findById(studentProfileId);
  if (!profile) return 0;

  const jobs = await Job.find({}).lean();
  if (jobs.length === 0) return 0;

  // Calculate scores for all jobs
  const scoredJobs = jobs.map((job) => {
    const det = calculateDeterministicMatch(profile.skills || [], {
      requiredSkills: job.requiredSkills || [],
      type: job.type,
      experienceLevel: job.experienceLevel,
    });
    return {
      job,
      ...det,
    };
  });

  // Sort descending by score
  scoredJobs.sort((a, b) => b.score - a.score);

  // Generate AI explanations for top 5 if requested
  const topCount = options.explainTop ? Math.min(5, scoredJobs.length) : 0;
  const explainedMatches = new Map<string, { reasons: string[]; missingSkills: string[] }>();

  for (let i = 0; i < topCount; i++) {
    const item = scoredJobs[i];
    const explanation = await generateMatchExplanation(
      item.job.title,
      item.matchedSkills,
      item.missingSkills,
      item.score
    );
    explainedMatches.set(item.job._id.toString(), explanation);
  }

  // Bulk upsert into MongoDB Match collection
  const bulkOps = scoredJobs.map((item) => {
    const jobIdStr = item.job._id.toString();
    const explanation = explainedMatches.get(jobIdStr);

    return {
      updateOne: {
        filter: {
          jobId: item.job._id,
          studentProfileId: profile._id,
        },
        update: {
          $set: {
            score: item.score,
            missingSkills: explanation ? explanation.missingSkills : item.missingSkills,
            reasons: explanation
              ? explanation.reasons
              : [
                  item.matchedSkills.length > 0
                    ? `Strong overlap in ${item.matchedSkills.slice(0, 3).join(', ')}`
                    : 'Entry foundation',
                  `Calculated match score of ${item.score}%`,
                ],
            explained: explainedMatches.has(jobIdStr),
          },
        },
        upsert: true,
      },
    };
  });

  const res = await Match.bulkWrite(bulkOps);
  return (res.upsertedCount || 0) + (res.modifiedCount || 0);
}

/**
 * 4. COMPUTE AND PERSIST MATCHES FOR A JOB ACROSS ALL ANALYZED STUDENTS
 * After posting a job, computes Match documents for all students who have an analyzed profile.
 */
export async function computeMatchesForJob(
  jobId: string,
  options: { explainTop?: boolean } = { explainTop: true }
): Promise<number> {
  const job = await Job.findById(jobId).lean();
  if (!job) return 0;

  // Find all students with analyzed profile (profileScore not null)
  const profiles = await StudentProfile.find({ profileScore: { $ne: null } }).lean();
  if (profiles.length === 0) return 0;

  // Calculate scores for all students
  const scoredCandidates = profiles.map((profile) => {
    const det = calculateDeterministicMatch(profile.skills || [], {
      requiredSkills: job.requiredSkills || [],
      type: job.type,
      experienceLevel: job.experienceLevel,
    });
    return {
      profile,
      ...det,
    };
  });

  // Sort descending by score
  scoredCandidates.sort((a, b) => b.score - a.score);

  // Generate AI explanations for top 5 candidates
  const topCount = options.explainTop ? Math.min(5, scoredCandidates.length) : 0;
  const explainedMatches = new Map<string, { reasons: string[]; missingSkills: string[] }>();

  for (let i = 0; i < topCount; i++) {
    const item = scoredCandidates[i];
    const explanation = await generateMatchExplanation(
      job.title,
      item.matchedSkills,
      item.missingSkills,
      item.score
    );
    explainedMatches.set(item.profile._id.toString(), explanation);
  }

  // Bulk upsert into MongoDB Match collection
  const bulkOps = scoredCandidates.map((item) => {
    const profileIdStr = item.profile._id.toString();
    const explanation = explainedMatches.get(profileIdStr);

    return {
      updateOne: {
        filter: {
          jobId: job._id,
          studentProfileId: item.profile._id,
        },
        update: {
          $set: {
            score: item.score,
            missingSkills: explanation ? explanation.missingSkills : item.missingSkills,
            reasons: explanation
              ? explanation.reasons
              : [
                  item.matchedSkills.length > 0
                    ? `Strong overlap in ${item.matchedSkills.slice(0, 3).join(', ')}`
                    : 'Entry foundation',
                  `Calculated match score of ${item.score}%`,
                ],
            explained: explainedMatches.has(profileIdStr),
          },
        },
        upsert: true,
      },
    };
  });

  const res = await Match.bulkWrite(bulkOps);
  return (res.upsertedCount || 0) + (res.modifiedCount || 0);
}


