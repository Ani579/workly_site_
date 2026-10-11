import { calculateDeterministicMatch } from '../src/lib/matching';

interface TestCase {
  name: string;
  studentSkills: { name: string; level: number }[];
  job: {
    title: string;
    requiredSkills: string[];
    type?: string;
    experienceLevel?: string;
  };
  expectedCondition: (score: number) => boolean;
  expectedDescription: string;
}

const testCases: TestCase[] = [
  {
    name: '1. Frontend React Student vs. Frontend Job',
    studentSkills: [
      { name: 'React', level: 90 },
      { name: 'TypeScript', level: 85 },
      { name: 'Next.js', level: 80 },
      { name: 'Tailwind CSS', level: 90 },
      { name: 'JavaScript', level: 85 },
      { name: 'Git', level: 80 },
    ],
    job: {
      title: 'Frontend Developer',
      requiredSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
      type: 'FULL_TIME',
      experienceLevel: 'Entry Level',
    },
    expectedCondition: (score) => score > 80,
    expectedDescription: 'expected match > 80%',
  },
  {
    name: '2. Frontend React Student vs. Python/Data Job',
    studentSkills: [
      { name: 'React', level: 90 },
      { name: 'TypeScript', level: 85 },
      { name: 'CSS', level: 80 },
      { name: 'HTML', level: 90 },
    ],
    job: {
      title: 'Data Science & ML Engineer',
      requiredSkills: ['Python', 'Pandas', 'SQL', 'Machine Learning', 'PyTorch'],
      type: 'FULL_TIME',
      experienceLevel: 'Mid-Senior',
    },
    expectedCondition: (score) => score < 40,
    expectedDescription: 'expected match < 40%',
  },
  {
    name: '3. Fullstack/Backend Student vs. SDE Intern Job',
    studentSkills: [
      { name: 'JavaScript', level: 85 },
      { name: 'Node.js', level: 80 },
      { name: 'Express', level: 75 },
      { name: 'MongoDB', level: 80 },
      { name: 'Git', level: 80 },
      { name: 'Python', level: 70 },
    ],
    job: {
      title: 'Software Development Engineer Intern',
      requiredSkills: ['JavaScript', 'Node.js', 'MongoDB', 'Git'],
      type: 'INTERNSHIP',
      experienceLevel: 'Intern',
    },
    expectedCondition: (score) => score > 65,
    expectedDescription: 'expected match > 65%',
  },
];

console.log('====================================================');
console.log('   WORKLY DETERMINISTIC MATCHING TEST SUITE        ');
console.log('====================================================\n');

let allPassed = true;

for (const tc of testCases) {
  const result = calculateDeterministicMatch(tc.studentSkills, tc.job);
  const passed = tc.expectedCondition(result.score);

  console.log(`Test: ${tc.name}`);
  console.log(`  Role: "${tc.job.title}" (${tc.job.type || 'N/A'}, ${tc.job.experienceLevel || 'N/A'})`);
  console.log(`  Job Required Skills: [${tc.job.requiredSkills.join(', ')}]`);
  console.log(`  Candidate Matched Skills: [${result.matchedSkills.join(', ')}]`);
  console.log(`  Missing Skills: [${result.missingSkills.join(', ')}]`);
  console.log(`  Calculated Score: ${result.score}% (${tc.expectedDescription})`);

  if (passed) {
    console.log(`  Status: PASS \u2705\n`);
  } else {
    console.log(`  Status: FAIL \u274C\n`);
    allPassed = false;
  }
}

console.log('====================================================');
if (allPassed) {
  console.log('All 3 matching engine test cases PASSED successfully!');
  process.exit(0);
} else {
  console.error('One or more test cases FAILED.');
  process.exit(1);
}

