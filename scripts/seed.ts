/**
 * scripts/seed.ts
 * Run: npm run seed
 *
 * Seeds:
 * 1. 26 real, FREE courses across core skill tags.
 * 2. 6 demo companies with recruiter users.
 * 3. 20 realistic demo jobs across Frontend, Backend, AI/ML, Data, DevOps, Full-Stack, SDE Intern.
 *
 * Fully idempotent!
 */
import { connectDB } from '../src/lib/db';
import { Course } from '../src/models/Course';
import { Job } from '../src/models/Job';
import { Company } from '../src/models/Company';
import { User } from '../src/models/User';

const COURSES_SEED = [
  // React
  {
    title: 'React Official Documentation & Interactive Tutorial',
    provider: 'React.dev',
    url: 'https://react.dev/learn',
    skillTag: 'React',
  },
  {
    title: 'Front End Development Libraries (React & Redux)',
    provider: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/learn/front-end-development-libraries/#react',
    skillTag: 'React',
  },
  // TypeScript
  {
    title: 'TypeScript Official Handbook & Walkthrough',
    provider: 'TypeScriptlang.org',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    skillTag: 'TypeScript',
  },
  {
    title: 'Learn TypeScript - Full Course for Beginners',
    provider: 'freeCodeCamp (YouTube)',
    url: 'https://www.youtube.com/watch?v=BwuLxPH8IDs',
    skillTag: 'TypeScript',
  },
  // Python
  {
    title: "CS50's Introduction to Programming with Python",
    provider: 'Harvard University / edX',
    url: 'https://cs50.harvard.edu/python/',
    skillTag: 'Python',
  },
  {
    title: 'Scientific Computing with Python Certification',
    provider: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/learn/scientific-computing-with-python/',
    skillTag: 'Python',
  },
  // DSA
  {
    title: 'Algorithms and Data Structures Full Video Course',
    provider: 'freeCodeCamp (YouTube)',
    url: 'https://www.youtube.com/watch?v=8hly31xKli0',
    skillTag: 'DSA',
  },
  {
    title: 'Data Structures and Algorithms Concepts',
    provider: 'NeetCode.io',
    url: 'https://neetcode.io/courses',
    skillTag: 'DSA',
  },
  {
    title: 'Programming, Data Structures And Algorithms Using Python',
    provider: 'NPTEL',
    url: 'https://nptel.ac.in/courses/106106145', // VERIFY LINK
    skillTag: 'DSA',
  },
  // System Design
  {
    title: 'The System Design Primer (Interactive Architecture Guide)',
    provider: 'GitHub / Donne Martin',
    url: 'https://github.com/donnemartin/system-design-primer',
    skillTag: 'System Design',
  },
  {
    title: 'System Design Course for Beginners',
    provider: 'freeCodeCamp (YouTube)',
    url: 'https://www.youtube.com/watch?v=m8Icp_Cid5o',
    skillTag: 'System Design',
  },
  // Docker
  {
    title: 'Docker Official Getting Started Tutorial',
    provider: 'Docker Docs',
    url: 'https://docs.docker.com/get-started/',
    skillTag: 'Docker',
  },
  {
    title: 'Docker Tutorial for Beginners',
    provider: 'freeCodeCamp (YouTube)',
    url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
    skillTag: 'Docker',
  },
  // SQL
  {
    title: 'Relational Database Certification (PostgreSQL & Bash)',
    provider: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/learn/relational-database/',
    skillTag: 'SQL',
  },
  {
    title: 'SQL for Data Science (Free Audit)',
    provider: 'Coursera / UC Davis',
    url: 'https://www.coursera.org/learn/sql-for-data-science',
    skillTag: 'SQL',
  },
  {
    title: 'PostgreSQL Full Course for Beginners',
    provider: 'freeCodeCamp (YouTube)',
    url: 'https://www.youtube.com/watch?v=qw--VYLpxG4',
    skillTag: 'PostgreSQL',
  },
  // Spring Boot
  {
    title: 'Building an Application with Spring Boot Guides',
    provider: 'Spring.io Official',
    url: 'https://spring.io/guides/gs/spring-boot/',
    skillTag: 'Spring Boot',
  },
  {
    title: 'Spring Boot 3 Full Course',
    provider: 'Amigoscode (YouTube)',
    url: 'https://www.youtube.com/watch?v=9SGDpanrc8U',
    skillTag: 'Spring Boot',
  },
  // DevOps & CI/CD
  {
    title: 'DevOps Engineering Course for Beginners',
    provider: 'freeCodeCamp (YouTube)',
    url: 'https://www.youtube.com/watch?v=j5Zsa_eOXeY',
    skillTag: 'DevOps',
  },
  {
    title: 'Introduction to DevOps and SRE',
    provider: 'Linux Foundation / edX',
    url: 'https://www.edx.org/learn/devops', // VERIFY LINK
    skillTag: 'DevOps',
  },
  {
    title: 'GitHub Actions Official Quickstart Guide',
    provider: 'GitHub Docs',
    url: 'https://docs.github.com/en/actions/quickstart',
    skillTag: 'CI/CD',
  },
  {
    title: 'CI/CD Pipeline with GitHub Actions Tutorial',
    provider: 'freeCodeCamp (YouTube)',
    url: 'https://www.youtube.com/watch?v=R8_veQiYBjI',
    skillTag: 'CI/CD',
  },
  // Testing
  {
    title: 'JavaScript & React Unit Testing Guide',
    provider: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/news/test-driven-development-tutorial-how-to-test-javascript-and-reactjs-app/',
    skillTag: 'Testing',
  },
  {
    title: 'Testing Web Applications and Code Quality',
    provider: 'MDN Web Docs',
    url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Testing',
    skillTag: 'Testing',
  },
  // Communication
  {
    title: 'Technical Writing for Software Engineers',
    provider: 'Google Developers',
    url: 'https://developers.google.com/tech-writing',
    skillTag: 'Communication',
  },
  {
    title: 'Effective Communication Writing in the Workplace',
    provider: 'Coursera (Audit)',
    url: 'https://www.coursera.org/learn/effective-communication', // VERIFY LINK
    skillTag: 'Communication',
  },
];

const DEMO_COMPANIES_SEED = [
  {
    recruiterEmail: 'demo-recruiter-1@workly.demo',
    recruiterName: 'Apex Talent Team',
    name: 'Apex Software Labs (Demo)',
    description: 'Demo company building modern web development tools and developer platforms.',
    size: '50-100 employees',
    website: 'https://apex-demo.workly.local',
  },
  {
    recruiterEmail: 'demo-recruiter-2@workly.demo',
    recruiterName: 'CloudScale Hiring',
    name: 'CloudScale Systems (Demo)',
    description: 'Demo company specializing in distributed cloud infrastructure, microservices, and Kubernetes.',
    size: '100-250 employees',
    website: 'https://cloudscale-demo.workly.local',
  },
  {
    recruiterEmail: 'demo-recruiter-3@workly.demo',
    recruiterName: 'Nexus Data People',
    name: 'Nexus Data Works (Demo)',
    description: 'Demo company providing real-time data streaming and analytics platforms.',
    size: '20-50 employees',
    website: 'https://nexusdata-demo.workly.local',
  },
  {
    recruiterEmail: 'demo-recruiter-4@workly.demo',
    recruiterName: 'ByteWave Recruiting',
    name: 'ByteWave Interactive (Demo)',
    description: 'Demo company creating next-generation consumer web interfaces and collaborative applications.',
    size: '10-30 employees',
    website: 'https://bytewave-demo.workly.local',
  },
  {
    recruiterEmail: 'demo-recruiter-5@workly.demo',
    recruiterName: 'QuantumLogic AI HR',
    name: 'QuantumLogic Innovations (Demo)',
    description: 'Demo company applying modern AI and machine learning to industry workflows.',
    size: '50-100 employees',
    website: 'https://quantumlogic-demo.workly.local',
  },
  {
    recruiterEmail: 'demo-recruiter-6@workly.demo',
    recruiterName: 'NovaStack People Team',
    name: 'NovaStack Tech (Demo)',
    description: 'Demo company delivering scalable enterprise SaaS solutions.',
    size: '250-500 employees',
    website: 'https://novastack-demo.workly.local',
  },
];

const DEMO_JOBS_SEED = [
  // Apex Software Labs (0)
  {
    companyIndex: 0,
    title: 'Frontend Engineer (React & TypeScript)',
    description: 'Demo company opening for an enthusiastic frontend developer to build reusable design components and high-performance user interfaces.',
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Git'],
    experienceLevel: 'Entry / Junior',
    location: 'Remote',
    type: 'FULL_TIME',
  },
  {
    companyIndex: 0,
    title: 'Junior Full Stack Developer',
    description: 'Demo company role collaborating across modern web stack to implement REST APIs and responsive UI.',
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'],
    experienceLevel: 'Entry Level',
    location: 'Bangalore, India',
    type: 'FULL_TIME',
  },
  {
    companyIndex: 0,
    title: 'SDE Intern - Web Development',
    description: 'Demo company internship position for students passionate about modern front-end tooling and clean UX.',
    requiredSkills: ['JavaScript', 'React', 'HTML', 'CSS', 'Git'],
    experienceLevel: 'Internship',
    location: 'Remote',
    type: 'INTERNSHIP',
  },

  // CloudScale Systems (1)
  {
    companyIndex: 1,
    title: 'Backend Systems Engineer (Node.js & PostgreSQL)',
    description: 'Demo company seeking engineer to architect high-throughput APIs, database schemas, and microservice communication.',
    requiredSkills: ['Node.js', 'PostgreSQL', 'Express', 'Redis', 'REST API'],
    experienceLevel: 'Junior / Mid',
    location: 'Remote',
    type: 'FULL_TIME',
  },
  {
    companyIndex: 1,
    title: 'Go Backend & Microservices Developer',
    description: 'Demo company position focused on high-concurrency microservices, gRPC, and containerized cloud services.',
    requiredSkills: ['Go', 'Docker', 'Kubernetes', 'PostgreSQL', 'System Design'],
    experienceLevel: 'Mid Level',
    location: 'San Francisco, CA (Hybrid)',
    type: 'FULL_TIME',
  },
  {
    companyIndex: 1,
    title: 'DevOps & Cloud Engineer',
    description: 'Demo company seeking engineer to maintain automated CI/CD pipelines, Docker containers, and cloud deployments.',
    requiredSkills: ['Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Linux', 'AWS'],
    experienceLevel: 'Junior / Mid',
    location: 'Remote',
    type: 'FULL_TIME',
  },
  {
    companyIndex: 1,
    title: 'Site Reliability Engineering (SRE) Associate',
    description: 'Demo company role maintaining system resilience, log monitoring, and automated deployment scripts.',
    requiredSkills: ['Linux', 'Docker', 'Python', 'CI/CD', 'Bash'],
    experienceLevel: 'Entry Level',
    location: 'Austin, TX',
    type: 'FULL_TIME',
  },

  // Nexus Data Works (2)
  {
    companyIndex: 2,
    title: 'Python Backend Engineer (FastAPI & SQL)',
    description: 'Demo company role designing asynchronous data APIs and scalable backend architectures.',
    requiredSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'SQL'],
    experienceLevel: 'Junior',
    location: 'New York, NY',
    type: 'FULL_TIME',
  },
  {
    companyIndex: 2,
    title: 'Data Engineer - Pipeline Operations',
    description: 'Demo company role constructing automated ETL data pipelines and query performance tuning.',
    requiredSkills: ['Python', 'SQL', 'PostgreSQL', 'Docker', 'Pandas'],
    experienceLevel: 'Entry / Junior',
    location: 'Remote',
    type: 'FULL_TIME',
  },
  {
    companyIndex: 2,
    title: 'Junior Data Analyst',
    description: 'Demo company opportunity conducting exploratory data analysis, metric dashboards, and data transformations.',
    requiredSkills: ['SQL', 'Python', 'Pandas', 'NumPy'],
    experienceLevel: 'Entry Level',
    location: 'Chicago, IL',
    type: 'FULL_TIME',
  },
  {
    companyIndex: 2,
    title: 'SDE Intern - Data & Analytics',
    description: 'Demo company internship for students eager to analyze real-world data streams with Python and SQL.',
    requiredSkills: ['Python', 'SQL', 'Pandas', 'Git'],
    experienceLevel: 'Internship',
    location: 'Remote',
    type: 'INTERNSHIP',
  },

  // ByteWave Interactive (3)
  {
    companyIndex: 3,
    title: 'Senior Frontend Developer (Next.js & Performance)',
    description: 'Demo company opening for an experienced frontend specialist leading Core Web Vitals optimizations and complex client state.',
    requiredSkills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    experienceLevel: 'Senior',
    location: 'Remote',
    type: 'FULL_TIME',
  },
  {
    companyIndex: 3,
    title: 'UI Engineer (Design Systems)',
    description: 'Demo company position crafting accessible design tokens, component libraries, and cross-browser experiences.',
    requiredSkills: ['React', 'TypeScript', 'CSS', 'HTML', 'Jest'],
    experienceLevel: 'Junior',
    location: 'Seattle, WA',
    type: 'FULL_TIME',
  },
  {
    companyIndex: 3,
    title: 'SDE Intern - Backend Systems',
    description: 'Demo company internship focusing on API endpoints, data validation, and unit tests.',
    requiredSkills: ['Python', 'Node.js', 'REST API', 'SQL', 'Git'],
    experienceLevel: 'Internship',
    location: 'Remote',
    type: 'INTERNSHIP',
  },
  {
    companyIndex: 3,
    title: 'SDE Intern - Frontend UI',
    description: 'Demo company internship crafting responsive mobile-first UI with React and modern CSS.',
    requiredSkills: ['JavaScript', 'HTML', 'CSS', 'React'],
    experienceLevel: 'Internship',
    location: 'Remote',
    type: 'INTERNSHIP',
  },

  // QuantumLogic Innovations (4)
  {
    companyIndex: 4,
    title: 'Machine Learning Engineer',
    description: 'Demo company role implementing model evaluation pipelines, data preprocessing, and model inference serving.',
    requiredSkills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas'],
    experienceLevel: 'Junior / Mid',
    location: 'Boston, MA (Hybrid)',
    type: 'FULL_TIME',
  },
  {
    companyIndex: 4,
    title: 'AI Full Stack Developer',
    description: 'Demo company role connecting generative AI models with modern React web frontends and streaming responses.',
    requiredSkills: ['Next.js', 'React', 'Python', 'FastAPI', 'TypeScript'],
    experienceLevel: 'Junior',
    location: 'Remote',
    type: 'FULL_TIME',
  },

  // NovaStack Tech (5)
  {
    companyIndex: 5,
    title: 'Full Stack Engineer (Enterprise SaaS)',
    description: 'Demo company position building enterprise workflows, secure authentication, and database schemas.',
    requiredSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
    experienceLevel: 'Mid Level',
    location: 'Remote',
    type: 'FULL_TIME',
  },
  {
    companyIndex: 5,
    title: 'Junior Software Engineer (Java & Spring Boot)',
    description: 'Demo company role maintaining scalable Java services, dependency injection, and automated tests.',
    requiredSkills: ['Java', 'Spring Boot', 'SQL', 'Unit Testing', 'Git'],
    experienceLevel: 'Entry Level',
    location: 'London, UK (Remote)',
    type: 'FULL_TIME',
  },
  {
    companyIndex: 5,
    title: 'SDE Intern - Full Stack',
    description: 'Demo company student internship gaining exposure to both frontend components and server APIs.',
    requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Git'],
    experienceLevel: 'Internship',
    location: 'Remote',
    type: 'INTERNSHIP',
  },
];

async function main() {
  console.log('🌱 Connecting to MongoDB for Workly Seed…');
  await connectDB();

  // 1. SEED COURSES (Idempotent)
  const courseBulkOps = COURSES_SEED.map((c) => ({
    updateOne: {
      filter: { title: c.title, provider: c.provider },
      update: {
        $set: {
          title: c.title,
          provider: c.provider,
          url: c.url,
          skillTag: c.skillTag,
        },
      },
      upsert: true,
    },
  }));
  const courseResult = await Course.bulkWrite(courseBulkOps);
  const totalCourses = await Course.countDocuments();
  console.log(`✅ Courses ready! Total: ${totalCourses} (Upserted: ${courseResult.upsertedCount})`);

  // 2. SEED DEMO COMPANIES & RECRUITER USERS (Idempotent)
  const companyIds: any[] = [];

  for (const comp of DEMO_COMPANIES_SEED) {
    // Upsert demo recruiter user
    const user = await User.findOneAndUpdate(
      { email: comp.recruiterEmail },
      {
        $set: {
          name: comp.recruiterName,
          email: comp.recruiterEmail,
          role: 'RECRUITER',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Upsert demo company
    const company = await Company.findOneAndUpdate(
      { ownerUserId: user._id },
      {
        $set: {
          ownerUserId: user._id,
          name: comp.name,
          description: comp.description,
          size: comp.size,
          website: comp.website,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    companyIds.push(company._id);
  }
  console.log(`✅ 6 Demo Companies & Recruiters ready!`);

  // 3. SEED 20 DEMO JOBS (Idempotent)
  const jobBulkOps = DEMO_JOBS_SEED.map((j) => {
    const targetCompanyId = companyIds[j.companyIndex];
    return {
      updateOne: {
        filter: { title: j.title, companyId: targetCompanyId },
        update: {
          $set: {
            companyId: targetCompanyId,
            title: j.title,
            description: j.description,
            requiredSkills: j.requiredSkills,
            experienceLevel: j.experienceLevel,
            location: j.location,
            type: j.type,
            isDemo: true,
          },
        },
        upsert: true,
      },
    };
  });

  const jobResult = await Job.bulkWrite(jobBulkOps);
  const totalDemoJobs = await Job.countDocuments({ isDemo: true });
  console.log(`✅ 20 Demo Jobs ready! Total: ${totalDemoJobs} (Upserted: ${jobResult.upsertedCount}, Modified: ${jobResult.modifiedCount})`);

  console.log('\n🎉 Comprehensive database seed completed successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
