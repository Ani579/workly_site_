import { NextResponse } from 'next/server';
import { requireRoleApi } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { StudentProfile } from '@/models/StudentProfile';
import { InterviewSession } from '@/models/InterviewSession';
import { generateJson } from '@/lib/ai';
import { serializeDocument } from '@/lib/serialize';
import { z } from 'zod';

const interviewQuestionsSchema = z.object({
  questions: z.array(z.string().min(5)).min(5).max(5),
});

export async function POST(req: Request) {
  const { session, error } = await requireRoleApi('STUDENT');
  if (error || !session) return error!;

  try {
    const body = await req.json();
    const role = (body.role || 'Full-Stack Developer').trim();

    await connectDB();
    const profile = await StudentProfile.findOne({ userId: session.user.userId }).lean();
    if (!profile) {
      return NextResponse.json(
        { error: 'Please upload a resume first to create your profile.' },
        { status: 400 }
      );
    }

    const studentSkills = (profile.skills || []).map((s: any) => s.name).slice(0, 8);
    const skillGaps = (profile.skillGaps || []).map((g: any) => g.name);

    // Prompt Gemini AI to generate 5 tailored technical & situational interview questions
    let generatedQuestions: string[] = [];

    const prompt = `You are a principal technical interviewer conducting a mock interview for the role "${role}".
The candidate has background in: [${studentSkills.join(', ')}].
Their identified growth areas include: [${skillGaps.join(', ')}].

Generate exactly 5 realistic, high-impact interview questions tailored to the role "${role}".
Include:
- 2 core technical / architecture questions reflecting real-world engineering challenges for this role
- 1 question touching on practical problem-solving or debugging
- 1 question assessing system design / scalability or state management
- 1 behavioral / engineering collaboration question

Respond ONLY with valid JSON:
{
  "questions": [
    "Question 1...",
    "Question 2...",
    "Question 3...",
    "Question 4...",
    "Question 5..."
  ]
}`;

    try {
      const aiResult = await generateJson(prompt, interviewQuestionsSchema);
      generatedQuestions = aiResult.questions;
    } catch (aiErr) {
      console.warn('AI question generation fallback triggered:', aiErr);
      // High-quality role-based fallback questions
      generatedQuestions = [
        `How would you explain the core architectural principles you rely on when building scalable applications in a ${role} role?`,
        `Describe a challenging technical bug or performance bottleneck you encountered recently. How did you identify the root cause and resolve it?`,
        `When designing a high-traffic API or client-server interaction, how do you approach caching, error handling, and state synchronization?`,
        `How do you choose between different technologies or libraries when starting a new feature, balancing developer velocity and long-term maintainability?`,
        `Tell me about a time when you disagreed with a teammate or technical requirement. How did you communicate and achieve a consensus?`,
      ];
    }

    const newSession = await InterviewSession.create({
      studentProfileId: profile._id,
      role,
      questions: generatedQuestions.map((q) => ({
        question: q,
        answer: '',
        score: null,
        feedback: '',
        betterAnswerTip: '',
      })),
      overallScore: null,
      status: 'IN_PROGRESS',
    });

    return NextResponse.json({
      ok: true,
      session: serializeDocument(newSession.toObject()),
    });
  } catch (err: any) {
    console.error('Error starting interview session:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to start interview session' },
      { status: 500 }
    );
  }
}

