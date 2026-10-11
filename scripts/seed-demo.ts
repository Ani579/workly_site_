/**
 * scripts/seed-demo.ts
 * Run: npm run seed:demo
 *
 * Creates:
 * 1. Demo Student named Aditya Sharma (aditya@workly.demo) with a pre-analyzed profile & score history.
 * 2. Demo Recruiter (recruiter.apex@workly.demo) with company "Apex Innovations" and 3 realistic open jobs.
 * 3. Pre-computed match documents so Aditya's dashboard and job board are immediately populated.
 *
 * Fully idempotent!
 */
import { connectDB } from '../src/lib/db';
import { User } from '../src/models/User';
import { StudentProfile } from '../src/models/StudentProfile';
import { ScoreHistory } from '../src/models/ScoreHistory';
import { Company } from '../src/models/Company';
import { Job } from '../src/models/Job';
import { computeMatchesForStudent } from '../src/lib/matching';

async function main() {
  console.log('🚀 Connecting to MongoDB for Demo Seed…');
  await connectDB();

  // 1. DEMO STUDENT: ADITYA SHARMA
  const studentUser = await User.findOneAndUpdate(
    { email: 'aditya@workly.demo' },
    {
      $set: {
        name: 'Aditya Sharma',
        email: 'aditya@workly.demo',
        role: 'STUDENT',
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`✅ Demo Student User ready: ${studentUser.name} (${studentUser.email})`);

  // Upsert Student Profile
  const studentProfile = await StudentProfile.findOneAndUpdate(
    { userId: studentUser._id },
    {
      $set: {
        userId: studentUser._id,
        headline: 'Full-Stack Developer & Open Source Contributor',
        bio: 'Final-year Computer Science student passionate about building scalable, accessible web applications with React, TypeScript, and Node.js. Experienced with microservices, cloud deployments, and clean software architecture.',
        education: 'B.Tech in Computer Science & Engineering',
        location: 'Bangalore, India',
        githubUsername: 'adityasharma-dev',
        profileScore: 84,
        scoreSummary: 'Strong full-stack foundations with demonstrable React, TypeScript, and Node.js projects. Clear growth trajectory in cloud architecture and system design.',
        strengths: [
          'Production-ready React & TypeScript architectural experience with state management',
          'Clean backend REST API development using Node.js, Express, and MongoDB',
          'Familiarity with containerization workflows using Docker and CI/CD pipelines',
        ],
        improvements: [
          'Expand coverage on high-concurrency System Design patterns and load balancing',
          'Add automated integration testing suites with Jest or Playwright',
          'Explore Redis caching strategies for performance tuning database queries',
        ],
        skills: [
          { name: 'React', level: 88, source: 'RESUME' },
          { name: 'TypeScript', level: 85, source: 'RESUME' },
          { name: 'Node.js', level: 80, source: 'RESUME' },
          { name: 'Docker', level: 75, source: 'RESUME' },
          { name: 'SQL', level: 70, source: 'RESUME' },
          { name: 'Next.js', level: 82, source: 'RESUME' },
          { name: 'MongoDB', level: 78, source: 'RESUME' },
          { name: 'Git', level: 85, source: 'RESUME' },
          { name: 'Tailwind CSS', level: 88, source: 'RESUME' },
          { name: 'Python', level: 65, source: 'GITHUB' },
        ],
        skillGaps: [
          { name: 'System Design', priority: 'INTERMEDIATE' },
          { name: 'CI/CD', priority: 'BEGINNER' },
          { name: 'Testing', priority: 'INTERMEDIATE' },
        ],
        fallbackUsed: false,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`✅ Demo Student Profile ready (Score: ${studentProfile.profileScore}/100)`);

  // Seed Score History (for progression chart)
  const existingHistoryCount = await ScoreHistory.countDocuments({
    studentProfileId: studentProfile._id,
  });

  if (existingHistoryCount === 0) {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date();

    await ScoreHistory.insertMany([
      { studentProfileId: studentProfile._id, score: 72, createdAt: twoWeeksAgo },
      { studentProfileId: studentProfile._id, score: 78, createdAt: oneWeekAgo },
      { studentProfileId: studentProfile._id, score: 84, createdAt: today },
    ]);
    console.log('✅ Demo Score Progression History created (72 -> 78 -> 84)');
  }

  // 2. DEMO RECRUITER & COMPANY
  const recruiterUser = await User.findOneAndUpdate(
    { email: 'recruiter.apex@workly.demo' },
    {
      $set: {
        name: 'Priya Mehta',
        email: 'recruiter.apex@workly.demo',
        role: 'RECRUITER',
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`✅ Demo Recruiter User ready: ${recruiterUser.name} (${recruiterUser.email})`);

  const demoCompany = await Company.findOneAndUpdate(
    { ownerUserId: recruiterUser._id },
    {
      $set: {
        ownerUserId: recruiterUser._id,
        name: 'Apex Innovations (Demo)',
        description: 'High-growth developer tooling and SaaS enterprise company building intuitive platforms for modern engineers.',
        size: '50-100 employees',
        website: 'https://apex.workly.demo',
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`✅ Demo Company ready: ${demoCompany.name}`);

  // 3. SEED 3 REALISTIC OPEN JOBS FOR APEX INNOVATIONS
  const demoJobs = [
    {
      title: 'Frontend Engineer (React & TypeScript)',
      description: 'Join Apex Innovations to build next-generation developer tooling interfaces. You will work closely with product designers and engineers to create snappy, accessible, and type-safe user experiences using React and TypeScript.',
      requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Git'],
      experienceLevel: 'Entry / Junior',
      location: 'Remote',
      type: 'FULL_TIME',
    },
    {
      title: 'Full-Stack Developer (Node.js & React)',
      description: 'We are seeking a talented Full-Stack Developer to work across our high-performance web applications and backend microservices. You will implement REST APIs, manage database schemas, and deploy containerized services.',
      requiredSkills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker'],
      experienceLevel: 'Junior / Mid',
      location: 'Bangalore, India (Hybrid)',
      type: 'FULL_TIME',
    },
    {
      title: 'Software Engineering Intern - Web Systems',
      description: 'Opportunity for ambitious engineering students to gain hands-on experience building production web interfaces, participating in code reviews, and writing unit tests in a collaborative agile environment.',
      requiredSkills: ['JavaScript', 'React', 'Git', 'CSS', 'Node.js'],
      experienceLevel: 'Internship',
      location: 'Remote',
      type: 'INTERNSHIP',
    },
  ];

  for (const jobData of demoJobs) {
    await Job.findOneAndUpdate(
      { title: jobData.title, companyId: demoCompany._id },
      {
        $set: {
          companyId: demoCompany._id,
          title: jobData.title,
          description: jobData.description,
          requiredSkills: jobData.requiredSkills,
          experienceLevel: jobData.experienceLevel,
          location: jobData.location,
          type: jobData.type,
          isDemo: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`✅ 3 Demo Jobs seeded for ${demoCompany.name}`);

  // 4. PRE-COMPUTE MATCHES FOR ADITYA
  console.log('⚡ Computing job matches for Aditya Sharma…');
  const matchCount = await computeMatchesForStudent(studentProfile._id.toString(), {
    explainTop: true,
  });
  console.log(`✅ Pre-computed ${matchCount} job matches for demo student!`);

  console.log('\n🎉 Demo seed completed successfully!');
  console.log('--------------------------------------------------');
  console.log('Demo Student:   aditya@workly.demo (Role: STUDENT)');
  console.log('Demo Recruiter: recruiter.apex@workly.demo (Role: RECRUITER)');
  console.log('--------------------------------------------------');

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Demo seed failed:', err);
  process.exit(1);
});
