import { NextResponse } from 'next/server';
import { requireRoleApi } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { StudentProfile } from '@/models/StudentProfile';
import { InterviewSession } from '@/models/InterviewSession';
import { generateJson } from '@/lib/ai';
import { serializeDocument } from '@/lib/serialize';
import { z } from 'zod';
import { Types } from 'mongoose';

const answerEvaluationSchema = z.object({
  score: z.number().min(0).max(10),
  feedback: z.string().min(5),
  betterAnswerTip: z.string().min(5),
});

export async function POST(req: Request) {
  const { session, error } = await requireRoleApi('STUDENT');
  if (error || !session) return error!;

  try {
    const body = await req.json();
    const { sessionId, questionIndex, answer } = body;

    if (!sessionId || !Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json({ error: 'Invalid sessionId' }, { status: 400 });
    }

    if (typeof questionIndex !== 'number' || questionIndex < 0 || questionIndex > 4) {
      return NextResponse.json({ error: 'questionIndex must be between 0 and 4' }, { status: 400 });
    }

    if (!answer || typeof answer !== 'string' || !answer.trim()) {
      return NextResponse.json({ error: 'Please provide an answer before submitting.' }, { status: 400 });
    }

    await connectDB();
    const profile = await StudentProfile.findOne({ userId: session.user.userId }).lean();
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const interview = await InterviewSession.findOne({
      _id: sessionId,
      studentProfileId: profile._id,
    });

    if (!interview) {
      return NextResponse.json({ error: 'Interview session not found' }, { status: 404 });
    }

    const currentQuestion = interview.questions[questionIndex];
    if (!currentQuestion) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Call AI to evaluate answer
    let score = 7;
    let feedback = 'Solid attempt covering the fundamentals.';
    let betterAnswerTip = 'Consider structuring with the STAR framework (Situation, Task, Action, Result) and highlighting specific metrics or outcomes.';

    const prompt = `You are a fair, expert technical hiring manager evaluating an interview response for the role "${interview.role}".

QUESTION:
"${currentQuestion.question}"

CANDIDATE'S ANSWER:
"${answer.trim()}"

Evaluate the answer strictly based on technical accuracy, structure, depth, and clarity.
Assign an honest score from 0 to 10 (where 9-10 is exceptional, 7-8 is solid hire, 5-6 is basic with gaps, below 5 needs substantial work).

Respond ONLY with valid JSON:
{
  "score": 8,
  "feedback": "Constructive 1-2 sentence feedback on what was strong and what was missing.",
  "betterAnswerTip": "1-2 sentence actionable tip on how a senior engineer would elevate this response."
}`;

    try {
      const evaluation = await generateJson(prompt, answerEvaluationSchema);
      score = evaluation.score;
      feedback = evaluation.feedback;
      betterAnswerTip = evaluation.betterAnswerTip;
    } catch (aiErr) {
      console.warn('AI answer evaluation fallback triggered:', aiErr);
      const wordCount = answer.trim().split(/\s+/).length;
      if (wordCount < 10) {
        score = 4;
        feedback = 'Your answer is brief. In technical interviews, provide concrete technical details and rationale.';
        betterAnswerTip = 'Explain why you chose this approach, trade-offs involved, and practical implementation details.';
      } else if (wordCount > 40) {
        score = 8;
        feedback = 'Detailed and thoughtful response demonstrating relevant technical comprehension.';
        betterAnswerTip = 'Focus on quantitative impact and explain potential edge cases to demonstrate senior-level foresight.';
      } else {
        score = 6;
        feedback = 'Good baseline response, but could benefit from deeper technical specificity.';
        betterAnswerTip = 'Mention specific frameworks, best practices, or design patterns you would apply.';
      }
    }

    // Positional update in MongoDB
    const setQuery: Record<string, any> = {
      [`questions.${questionIndex}.answer`]: answer.trim(),
      [`questions.${questionIndex}.score`]: score,
      [`questions.${questionIndex}.feedback`]: feedback,
      [`questions.${questionIndex}.betterAnswerTip`]: betterAnswerTip,
    };

    // Check if this completes all questions
    interview.questions[questionIndex].answer = answer.trim();
    interview.questions[questionIndex].score = score;
    interview.questions[questionIndex].feedback = feedback;
    interview.questions[questionIndex].betterAnswerTip = betterAnswerTip;

    const allAnswered = interview.questions.every((q: any) => typeof q.score === 'number');
    if (allAnswered) {
      const totalScore = interview.questions.reduce((sum: number, q: any) => sum + (q.score || 0), 0);
      const avgScore = Math.round((totalScore / interview.questions.length) * 10) / 10;
      setQuery.overallScore = avgScore;
      setQuery.status = 'COMPLETED';
    }

    const updatedSession = await InterviewSession.findByIdAndUpdate(
      sessionId,
      { $set: setQuery },
      { new: true }
    ).lean();

    return NextResponse.json({
      ok: true,
      session: serializeDocument(updatedSession),
    });
  } catch (err: any) {
    console.error('Error submitting interview answer:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to evaluate answer' },
      { status: 500 }
    );
  }
}

