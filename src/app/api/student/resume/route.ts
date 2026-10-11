import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PDFParse } from 'pdf-parse';
import { requireRoleApi } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { StudentProfile } from '@/models/StudentProfile';
import { ScoreHistory } from '@/models/ScoreHistory';
import { generateJson } from '@/lib/ai';
import { resumeAnalysisSchema, ResumeAnalysis } from '@/lib/validators';
import { analyzeResumeFallback } from '@/lib/resume-fallback';
import { checkResumeRateLimit } from '@/lib/rate-limit';
import { serializeDocument } from '@/lib/serialize';
import { computeMatchesForStudent } from '@/lib/matching';

export async function POST(req: Request) {
  // 1. Role verification
  const { session, error } = await requireRoleApi('STUDENT');
  if (error || !session?.user?.userId) {
    return error ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.userId;

  // 2. Parse Multipart Form Data
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form submission' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No resume file provided' }, { status: 400 });
  }

  // Validate format and size (5 MB limit)
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File size exceeds 5 MB limit' }, { status: 400 });
  }

  // 3. Extract text from PDF in-memory
  let extractedText = '';
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const parser = new PDFParse({ data: uint8Array });
    const parsed = await parser.getText();
    extractedText = (parsed.text || '').trim();
    await parser.destroy();
  } catch (err) {
    console.error('PDF parsing error:', err);
    return NextResponse.json(
      { error: "We couldn't read this PDF, try a text-based PDF" },
      { status: 400 }
    );
  }

  if (extractedText.length < 200) {
    return NextResponse.json(
      { error: "We couldn't read this PDF, try a text-based PDF" },
      { status: 400 }
    );
  }

  // 4. Compute SHA-256 hash of extracted text
  const resumeHash = crypto.createHash('sha256').update(extractedText).digest('hex');

  await connectDB();

  // 5. Check if cached analysis exists for identical resume
  const existingProfile = await StudentProfile.findOne({ userId });
  if (
    existingProfile &&
    existingProfile.resumeHash === resumeHash &&
    existingProfile.profileScore !== null &&
    existingProfile.profileScore !== undefined
  ) {
    return NextResponse.json({
      cached: true,
      profile: serializeDocument(existingProfile.toObject()),
    });
  }

  // 6. Rate limit check (30 seconds window per user)
  const rateLimit = checkResumeRateLimit(userId);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Please wait ${rateLimit.remainingSeconds}s before analyzing another resume to protect API quotas.`,
      },
      { status: 429 }
    );
  }

  // 7. Perform AI Analysis or Fallback
  let analysis: ResumeAnalysis;
  let fallbackUsed = false;

  const prompt = `You are an expert technical recruiter and resume evaluator for Workly, a fair talent platform.
Analyze the following resume text and generate a strict JSON assessment.

FAIRNESS & SCORING RULES:
1. Score ONLY based on technical skills, projects, experience, tangible achievements, and resume clarity.
2. COMPLETELY IGNORE name, gender, photos, age, nationality, and college prestige/pedigree.
3. Be rigorous and honest: do NOT inflate scores, and do NOT invent or hallucinate skills not present in the resume.
4. profileScore must be an integer between 0 and 100 based on the candidate's demonstrated skill depth and clarity.
5. Max 12 skills (with level 0-100 indicating relative proficiency demonstrated).
6. Max 5 skill gaps (skills they lack for modern industry expectations, with priority BEGINNER, INTERMEDIATE, or ADVANCED).
7. scoreSummary must be at most 2 sentences explaining the evaluation objectively.
8. strengths must have at most 3 items.
9. improvements must have at most 4 actionable, high-impact resume recommendations.

RESUME CONTENT:
"""
${extractedText.slice(0, 15000)}
"""

Respond with valid JSON matching this structure:
{
  "headline": "Brief professional headline (e.g., Full Stack Engineer | React & Node.js)",
  "skills": [{"name": "SkillName", "level": 85}],
  "skillGaps": [{"name": "SkillName", "priority": "INTERMEDIATE"}],
  "profileScore": 78,
  "scoreSummary": "Two sentence objective overview.",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Tip 1", "Tip 2"]
}`;

  try {
    analysis = await generateJson(prompt, resumeAnalysisSchema);
  } catch (err) {
    console.warn('Gemini analysis failed twice or was unavailable. Using rule-based fallback.', err);
    analysis = analyzeResumeFallback(extractedText);
    fallbackUsed = true;
  }

  // 8. Upsert StudentProfile in MongoDB
  const updatedProfile = await StudentProfile.findOneAndUpdate(
    { userId },
    {
      $set: {
        headline: analysis.headline,
        profileScore: analysis.profileScore,
        scoreSummary: analysis.scoreSummary,
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        skills: analysis.skills.map((s) => ({
          name: s.name,
          level: s.level,
          source: 'RESUME',
        })),
        skillGaps: analysis.skillGaps.map((g) => ({
          name: g.name,
          priority: g.priority,
        })),
        resumeText: extractedText,
        resumeFileName: file.name,
        resumeHash,
        fallbackUsed,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // 9. Record score progression in ScoreHistory collection
  try {
    await ScoreHistory.create({
      studentProfileId: updatedProfile._id,
      score: analysis.profileScore,
      createdAt: new Date(),
    });
  } catch (scoreHistErr) {
    console.warn('Failed to record score history entry:', scoreHistErr);
  }

  // 10. Automatically compute / refresh job matches for the student
  try {
    await computeMatchesForStudent(updatedProfile._id.toString(), { explainTop: true });
  } catch (matchErr) {
    console.warn('Failed to compute job matches in resume upload hook:', matchErr);
  }

  return NextResponse.json({
    cached: false,
    fallbackUsed,
    profile: serializeDocument(updatedProfile.toObject()),
  });
}
