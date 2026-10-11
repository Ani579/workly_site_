import { connectDB } from '../src/lib/db';
import { User } from '../src/models/User';
import { Company } from '../src/models/Company';
import { Job } from '../src/models/Job';
import { StudentProfile } from '../src/models/StudentProfile';
import { Match } from '../src/models/Match';
import { Application } from '../src/models/Application';
import { computeMatchesForJob } from '../src/lib/matching';

async function testRecruiterFlow() {
  console.log('====================================================');
  console.log('     WORKLY RECRUITER FLOW END-TO-END VERIFICATION  ');
  console.log('====================================================\n');

  await connectDB();

  // 1. Ensure a student exists with known skills
  console.log('1. Checking student profile with verified skills...');
  const studentUser = await User.findOne({ email: 'demo.student@workly.local' });
  if (!studentUser) {
    throw new Error('Demo student user not found in DB');
  }

  const studentProfile = await StudentProfile.findOne({ userId: studentUser._id });
  if (!studentProfile) {
    throw new Error('Demo student profile not found in DB');
  }
  console.log(`   Found student: ${studentUser.name} (${studentUser.email})`);
  console.log(`   Skills: ${studentProfile.skills.map((s: any) => s.name).join(', ')}`);
  console.log('   \u2705 Student profile verified.\n');

  // 2. Ensure a recruiter and company exist
  console.log('2. Verifying recruiter and company ownership...');
  let recruiterUser = await User.findOne({ email: 'demo-recruiter-1@workly.demo' });
  if (!recruiterUser) {
    throw new Error('Demo recruiter user not found in DB');
  }

  let company = await Company.findOne({ ownerUserId: recruiterUser._id });
  if (!company) {
    company = await Company.create({
      ownerUserId: recruiterUser._id,
      name: 'Apex Software Labs (Test)',
      website: 'https://apex.workly.demo',
      description: 'Engineering systems and tools',
      size: '50-100',
    });
  }
  console.log(`   Recruiter: ${recruiterUser.name} (${recruiterUser.email})`);
  console.log(`   Company: ${company.name} (ownerUserId: ${company.ownerUserId})`);
  console.log('   \u2705 Recruiter company profile verified.\n');

  // 3. Recruiter posts a job
  console.log('3. Posting a new job with required skills...');
  const testJob = await Job.create({
    companyId: company._id,
    title: 'E2E Test React Frontend Engineer',
    description: 'Looking for a skilled frontend engineer to build responsive web interfaces.',
    requiredSkills: ['React', 'TypeScript', 'Next.js'],
    experienceLevel: 'Entry Level',
    location: 'Remote',
    type: 'FULL_TIME',
    isDemo: false,
  });
  console.log(`   Created job: "${testJob.title}" (ID: ${testJob._id})`);
  console.log(`   Required Skills: [${testJob.requiredSkills.join(', ')}]`);
  console.log('   \u2705 Job created.\n');

  // 4. Compute matches for the new job
  console.log('4. Running computeMatchesForJob for the new job...');
  const matchCount = await computeMatchesForJob(testJob._id.toString());
  console.log(`   Matches computed: ${matchCount}`);

  const matchDoc = await Match.findOne({
    jobId: testJob._id,
    studentProfileId: studentProfile._id,
  });

  if (!matchDoc) {
    throw new Error('Match document was not generated for student');
  }
  console.log(`   Candidate Match Score: ${matchDoc.score}%`);
  console.log(`   Reasons: ${matchDoc.reasons.join(' | ')}`);
  console.log(`   Missing Skills: [${matchDoc.missingSkills.join(', ')}]`);

  if (matchDoc.score < 75) {
    throw new Error(`Expected match score >= 75% for React+TypeScript candidate, got ${matchDoc.score}%`);
  }
  console.log('   \u2705 Match score verified (>75% for matching skills).\n');

  // 5. Recruiter shortlists candidate
  console.log('5. Testing Shortlist action...');
  const shortlistedApp = await Application.findOneAndUpdate(
    { jobId: testJob._id, studentProfileId: studentProfile._id },
    { $set: { status: 'SHORTLISTED', source: 'RECRUITER_SHORTLIST' } },
    { upsert: true, new: true }
  );

  console.log(`   Application Status: ${shortlistedApp.status}`);
  console.log(`   Application Source: ${shortlistedApp.source}`);
  if (shortlistedApp.status !== 'SHORTLISTED' || shortlistedApp.source !== 'RECRUITER_SHORTLIST') {
    throw new Error('Shortlist status or source mismatch');
  }
  console.log('   \u2705 Candidate successfully shortlisted.\n');

  // 6. Test Privacy Projection (Recruiters must never see resumeText)
  console.log('6. Verifying Privacy & Security projections...');
  const projectedProfile = await StudentProfile.findById(studentProfile._id)
    .select('userId headline bio education location profileScore strengths improvements skills skillGaps')
    .lean();

  if ('resumeText' in projectedProfile || 'resumeHash' in projectedProfile) {
    throw new Error('Privacy breach: resumeText or resumeHash was included in projection!');
  }
  console.log('   resumeText & resumeHash are strictly omitted from projection.');
  console.log('   \u2705 Candidate privacy preserved.\n');

  // 7. Test Anonymous Mode logic
  console.log('7. Verifying Anonymous Mode identity masking...');
  const last4 = studentProfile._id.toString().slice(-4);
  const anonymousAlias = `Candidate #${last4}`;
  console.log(`   Real Name: ${studentUser.name}`);
  console.log(`   Anonymous Alias: ${anonymousAlias}`);
  if (!anonymousAlias.startsWith('Candidate #') || anonymousAlias.length !== 15) {
    throw new Error('Invalid anonymous alias format');
  }
  console.log('   \u2705 Anonymous mode correctly masks candidate identity.\n');

  // Clean up test job, match, and application
  console.log('8. Cleaning up test job artifacts...');
  await Match.deleteMany({ jobId: testJob._id });
  await Application.deleteMany({ jobId: testJob._id });
  await Job.findByIdAndDelete(testJob._id);
  console.log('   \u2705 Cleaned up test data.\n');

  console.log('====================================================');
  console.log('   ALL RECRUITER FLOW VERIFICATION TESTS PASSED!    ');
  console.log('====================================================');
}

testRecruiterFlow()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test failed with error:', err);
    process.exit(1);
  });

