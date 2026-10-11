'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  RefreshCw,
  Trophy,
  Lightbulb,
  Send,
  RotateCcw,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ScoreRing } from '@/components/ui/ScoreRing';

interface QuestionItem {
  question: string;
  answer?: string;
  score?: number | null;
  feedback?: string;
  betterAnswerTip?: string;
}

interface InterviewSessionData {
  _id: string;
  role: string;
  questions: QuestionItem[];
  overallScore: number | null;
  status: 'IN_PROGRESS' | 'COMPLETED';
}

export default function StudentInterviewPage() {
  const [targetRole, setTargetRole] = useState('Full-Stack Developer');
  const [suggestedRoles, setSuggestedRoles] = useState<string[]>([]);
  const [session, setSession] = useState<InterviewSessionData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileSuggestions = async () => {
    try {
      const res = await fetch('/api/student/profile');
      const data = await res.json();
      if (data.profile) {
        const gaps = (data.profile.skillGaps || []).map((g: any) => `${g.name} Specialist`);
        const defaultRoles = [
          'Full-Stack Developer',
          'Frontend Engineer',
          'Backend Engineer',
          'DevOps Engineer',
          'Data Engineer',
        ];
        const combined = Array.from(new Set([...gaps, ...defaultRoles])).slice(0, 5);
        setSuggestedRoles(combined);
      }
    } catch {
      // Fallback roles
      setSuggestedRoles([
        'Full-Stack Developer',
        'Frontend Engineer',
        'Backend Engineer',
        'DevOps Engineer',
      ]);
    }
  };

  useEffect(() => {
    // Load student profile to suggest roles from skill gaps
    fetchProfileSuggestions();
  }, []);

  const handleStartInterview = async () => {
    if (!targetRole.trim()) return;
    setStarting(true);
    setError(null);

    try {
      const res = await fetch('/api/student/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start interview');

      setSession(data.session);
      setCurrentQuestionIndex(0);
      setCurrentAnswer('');
    } catch (err: any) {
      setError(err.message || 'Failed to initialize interview');
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session || !currentAnswer.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/student/interview/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session._id,
          questionIndex: currentQuestionIndex,
          answer: currentAnswer.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit answer');

      setSession(data.session);
    } catch (err: any) {
      setError(err.message || 'Failed to evaluate answer. Please click retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (!session) return;
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
    }
  };

  // If interview is not started yet: show Role Setup
  if (!session) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[var(--color-primary-blue)]">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark-navy)]">
                AI Mock Interview
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
                Practice 5 realistic questions tailored to your target role and get instant AI feedback.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50 p-4 border border-rose-200 text-sm text-rose-800">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Select or Type Your Target Role
            </label>
            <div className="relative">
              <Target className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer, Node.js Backend Developer"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[var(--color-primary-blue)] focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          {suggestedRoles.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 mb-2">
                Suggested Based on Your Profile:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setTargetRole(role)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                      targetRole === role
                        ? 'border-blue-500 bg-blue-50 text-[var(--color-primary-blue)] font-bold'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 space-y-2 text-xs text-blue-900">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[var(--color-primary-blue)]" />
              <span>How the Mock Interview Works:</span>
            </p>
            <ul className="list-disc pl-5 space-y-1 text-blue-800">
              <li>Generates 5 tailored technical & situational questions for this specific role.</li>
              <li>Scores each answer from 0 to 10 with actionable tips and suggestions.</li>
              <li>Provides an overall interview performance score and summary at the end.</li>
            </ul>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              disabled={starting || !targetRole.trim()}
              onClick={handleStartInterview}
              variant="primary"
              size="md"
              className="min-w-44 justify-center"
            >
              {starting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Preparing Questions...</span>
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  <span>Start Interview</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Interview is COMPLETED: Show overall summary
  if (session.status === 'COMPLETED') {
    const overallScorePercent = Math.round((session.overallScore || 0) * 10);
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark-navy)]">
                Interview Completed!
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
                Performance evaluation for <span className="font-bold text-gray-700">{session.role}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Score Ring Summary Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-bold">
              {session.overallScore && session.overallScore >= 8
                ? 'Strong Hire Recommendation'
                : session.overallScore && session.overallScore >= 6
                ? 'Promising Candidate'
                : 'Needs Continued Practice'}
            </Badge>
            <h2 className="text-2xl font-black text-[var(--color-dark-navy)]">
              Overall Score: {session.overallScore} / 10
            </h2>
            <p className="text-xs text-gray-500 max-w-md">
              Evaluated across technical accuracy, structure, clarity, and practical problem-solving.
            </p>
          </div>

          <div className="shrink-0 flex items-center justify-center">
            <ScoreRing score={overallScorePercent} size={110} strokeWidth={9} />
          </div>
        </div>

        {/* Question-by-Question Breakdown */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[var(--color-dark-navy)]">
            Detailed Question Breakdown
          </h3>

          {session.questions.map((q, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-bold text-[var(--color-dark-navy)]">
                  Q{idx + 1}: {q.question}
                </h4>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold border shrink-0 ${
                    (q.score ?? 0) >= 8
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : (q.score ?? 0) >= 6
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {q.score} / 10
                </span>
              </div>

              <div className="rounded-2xl bg-gray-50 p-3 text-xs text-gray-700">
                <span className="font-semibold text-gray-500 block mb-0.5">Your Answer:</span>
                <p>{q.answer || 'No answer recorded.'}</p>
              </div>

              {q.feedback && (
                <div className="text-xs text-gray-600">
                  <span className="font-bold text-[var(--color-dark-navy)]">Feedback: </span>
                  {q.feedback}
                </div>
              )}

              {q.betterAnswerTip && (
                <div className="flex items-start gap-2 rounded-2xl bg-purple-50/60 p-3 text-xs text-purple-900 border border-purple-100">
                  <Lightbulb className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Pro Tip for Improvement: </span>
                    {q.betterAnswerTip}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-center">
          <Button
            type="button"
            variant="primary"
            onClick={() => setSession(null)}
            className="min-w-44 justify-center"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            <span>Practice Another Role</span>
          </Button>
        </div>
      </div>
    );
  }

  // Interview IN PROGRESS: Question step
  const currentQ = session.questions[currentQuestionIndex];
  const isCurrentAnswered = typeof currentQ.score === 'number';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Step Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-[var(--color-primary-blue)] font-bold">
            {session.role}
          </Badge>
          <span className="text-xs text-gray-400">
            Question {currentQuestionIndex + 1} of {session.questions.length}
          </span>
        </div>

        <div className="flex gap-1.5">
          {session.questions.map((q, idx) => (
            <div
              key={idx}
              className={`h-2.5 w-7 rounded-full transition-colors ${
                idx === currentQuestionIndex
                  ? 'bg-[var(--color-primary-blue)]'
                  : typeof q.score === 'number'
                  ? 'bg-emerald-500'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-2xl bg-rose-50 p-4 border border-rose-200 text-sm text-rose-800">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSubmitAnswer}
            className="text-xs text-rose-800 hover:bg-rose-100"
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            <span>Retry</span>
          </Button>
        </div>
      )}

      {/* Question Card */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Interviewer Asks:
          </span>
          <h2 className="mt-1 text-lg sm:text-xl font-bold text-[var(--color-dark-navy)] leading-snug">
            {currentQ.question}
          </h2>
        </div>

        {/* Answer input (if not answered yet) */}
        {!isCurrentAnswered ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                Your Answer
              </label>
              <textarea
                rows={6}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your response here. Focus on clear technical decisions, trade-offs, and examples..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[var(--color-primary-blue)] focus:bg-white focus:outline-none transition"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                disabled={submitting || !currentAnswer.trim()}
                onClick={handleSubmitAnswer}
                variant="primary"
                size="md"
                className="min-w-40 justify-center"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Evaluating with AI...</span>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Send className="h-4 w-4" />
                    <span>Submit Answer</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Answer Submitted: Show Feedback & Next button */
          <div className="space-y-5 pt-2 border-t border-gray-100">
            <div className="rounded-2xl bg-gray-50 p-4 text-xs text-gray-700">
              <span className="font-semibold text-gray-500 block mb-1">Your Submitted Response:</span>
              <p>{currentQ.answer}</p>
            </div>

            {/* Score & Feedback Box */}
            <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                  AI Evaluation
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black border ${
                    (currentQ.score ?? 0) >= 8
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : (currentQ.score ?? 0) >= 6
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-rose-100 text-rose-800 border-rose-200'
                  }`}
                >
                  Score: {currentQ.score} / 10
                </span>
              </div>

              <div className="text-xs text-gray-700">
                <span className="font-bold text-[var(--color-dark-navy)]">Feedback: </span>
                {currentQ.feedback}
              </div>

              {currentQ.betterAnswerTip && (
                <div className="flex items-start gap-2 pt-2 border-t border-purple-100/60 text-xs text-purple-900">
                  <Lightbulb className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Pro Tip for Next Time: </span>
                    {currentQ.betterAnswerTip}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={handleNextQuestion}
                className="min-w-40 justify-center"
              >
                <span>
                  {currentQuestionIndex < session.questions.length - 1
                    ? 'Next Question'
                    : 'View Overall Results'}
                </span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

