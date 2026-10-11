import { ResumeAnalysis } from './validators';

export const COMMON_TECH_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin',
  'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'Node.js', 'Express', 'NestJS', 'FastAPI', 'Django', 'Flask', 'Spring Boot',
  'HTML', 'CSS', 'Tailwind CSS', 'Sass', 'GraphQL', 'REST API',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Prisma', 'Mongoose',
  'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Linux', 'Git',
  'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas', 'NumPy',
  'Unit Testing', 'Jest', 'Cypress', 'Playwright', 'Agile', 'Scrum', 'System Design'
];

/**
 * Deterministic rule-based fallback when AI is unavailable or fails twice.
 * Extracts keywords, applies scoring formula, and identifies skill gaps.
 */
export function analyzeResumeFallback(text: string): ResumeAnalysis & { fallbackUsed: boolean } {
  const normalizedText = text.toLowerCase();

  // Find matched skills
  const matchedSkills: { name: string; level: number }[] = [];
  for (const skill of COMMON_TECH_SKILLS) {
    // Word boundary or token check
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(normalizedText)) {
      // Deterministic level between 65 and 85 based on frequency
      const occurrences = (normalizedText.match(new RegExp(skill.toLowerCase(), 'g')) || []).length;
      const level = Math.min(88, 65 + occurrences * 4);
      matchedSkills.push({ name: skill, level });
    }
  }

  // Ensure up to 12 skills
  const finalSkills = (matchedSkills.length > 0
    ? matchedSkills.slice(0, 12)
    : [
        { name: 'Problem Solving', level: 70 },
        { name: 'Git', level: 65 },
        { name: 'Software Development', level: 65 },
      ]);

  // Find gaps from popular skills not present in resume
  const popularMustHaves = ['TypeScript', 'Docker', 'Testing', 'CI/CD', 'System Design', 'PostgreSQL'];
  const skillGaps: { name: string; priority: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' }[] = [];

  for (const mustHave of popularMustHaves) {
    if (!finalSkills.some((s) => s.name.toLowerCase() === mustHave.toLowerCase())) {
      const priority = skillGaps.length === 0 ? 'INTERMEDIATE' : 'ADVANCED';
      skillGaps.push({ name: mustHave, priority });
      if (skillGaps.length >= 4) break;
    }
  }

  // Calculate score formula: 45 base + 4 points per matched skill (max 82)
  const profileScore = Math.min(85, Math.max(50, 48 + finalSkills.length * 3));

  // Generate headline
  const topSkillNames = finalSkills.slice(0, 2).map((s) => s.name).join(' & ');
  const headline = topSkillNames
    ? `Software Developer skilled in ${topSkillNames}`
    : 'Junior Software Engineer';

  const strengths = [
    `Demonstrated familiarity with key development technologies (${finalSkills.slice(0, 3).map((s) => s.name).join(', ')}).`,
    'Clearly structured project or work experience highlights.',
    'Solid technical foundation with hands-on implementation details.',
  ].slice(0, 3);

  const improvements = [
    'Quantify project outcomes with concrete metrics (e.g., latency reduction, user count, test coverage).',
    'Add links to public GitHub repositories or deployed demo applications.',
    'Highlight experience with modern automated testing or containerization tools.',
    'Keep descriptions focused on technical problem solving and specific contributions.',
  ].slice(0, 4);

  return {
    headline,
    skills: finalSkills,
    skillGaps,
    profileScore,
    scoreSummary: `Profile demonstrates solid practical knowledge across ${finalSkills.length} key competencies. High potential with scope to add quantified achievements.`,
    strengths,
    improvements,
    fallbackUsed: true,
  };
}

