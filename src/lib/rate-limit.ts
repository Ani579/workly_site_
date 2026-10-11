// In-memory rate limiting map: userId -> lastTimestampMs
const userLastAnalysisTime = new Map<string, number>();

/**
 * Ensures a user can only perform one analysis every 30 seconds.
 */
export function checkResumeRateLimit(userId: string, windowMs = 30000): {
  allowed: boolean;
  remainingSeconds: number;
} {
  const now = Date.now();
  const lastTime = userLastAnalysisTime.get(userId);

  if (lastTime && now - lastTime < windowMs) {
    const remainingSeconds = Math.ceil((windowMs - (now - lastTime)) / 1000);
    return { allowed: false, remainingSeconds };
  }

  userLastAnalysisTime.set(userId, now);
  return { allowed: true, remainingSeconds: 0 };
}

