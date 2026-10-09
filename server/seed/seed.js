// FULL RESET:  npm run reset      (asks for confirmation)   |   npm run reset -- --yes   (no question)
// Deletes ALL users, profiles, resumes, jobs, applications, notifications and saved searches,
// then re-creates only the resume templates and the skill-learning catalogue. After this, people simply sign up and log in.
import 'dotenv/config';
import readline from 'node:readline/promises';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Job from '../models/Job.js';
import Skill from '../models/Skill.js';
import ResumeTemplate from '../models/ResumeTemplate.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import Resume from '../models/Resume.js';
import SavedSearch from '../models/SavedSearch.js';
import SourceStatus from '../models/SourceStatus.js';
import { ensureTemplates } from '../services/templates.js';
import { FIELD_CATALOG } from '../data/fields.js';

const L = (name, category, summary, topics) => ({ name, category, learning: { summary, topics } });
const hand = [
  L('Communication', 'soft', 'Clear written and verbal communication.', ['Presentation', 'Writing', 'Active listening']),
  L('Leadership', 'soft', 'Leading people, projects, or initiatives.', ['Team leadership', 'Delegation', 'Decision making']),
  L('Problem Solving', 'soft', 'Structured approach to solving practical problems.', ['Analysis', 'Critical thinking', 'Decision making']),
  L('Teamwork', 'soft', 'Collaborative work across teams and functions.', ['Collaboration', 'Coordination', 'Conflict resolution']),
  L('Project Management', 'business', 'Planning and delivering projects.', ['Planning', 'Scheduling', 'Risk management']),
  L('Excel', 'tool', 'Spreadsheet analysis and reporting.', ['Formulas', 'Pivot tables', 'Charts']),
  L('Accounting', 'business', 'Financial recording and reporting fundamentals.', ['Bookkeeping', 'Financial statements', 'Reconciliation']),
  L('Tally', 'tool', 'Accounting software widely used in India.', ['Ledgers and vouchers', 'GST entries', 'Reports']),
  L('Recruitment', 'business', 'Talent sourcing and hiring processes.', ['Screening', 'Interview coordination', 'Onboarding']),
  L('Digital Marketing', 'marketing', 'Online marketing and audience engagement.', ['SEO', 'Content', 'Analytics']),
  L('Sales', 'business', 'Customer acquisition and relationship development.', ['Prospecting', 'Negotiation', 'CRM']),
  L('Teaching', 'education', 'Instruction and learner support.', ['Lesson planning', 'Assessment', 'Classroom management']),
  L('Research', 'academic', 'Structured investigation and evidence gathering.', ['Literature review', 'Data collection', 'Analysis']),
  L('AutoCAD', 'engineering', 'Computer-aided technical drafting.', ['2D drafting', '3D modeling', 'Technical drawings']),
  L('Python', 'technology', 'General-purpose programming and data work.', ['Syntax and data types', 'Functions and modules', 'Automation scripts']),
  L('SQL', 'data', 'Relational data querying and analysis.', ['Joins', 'Aggregation', 'Reporting']),
  L('React', 'technology', 'Component-based user interface development.', ['Components', 'Hooks', 'Routing']),
  L('Node.js', 'technology', 'JavaScript runtime for backend applications.', ['APIs', 'Modules', 'Middleware']),
  L('MongoDB', 'data', 'Document database.', ['CRUD', 'Aggregation', 'Indexes']),
  L('Git', 'tool', 'Version control and collaboration.', ['Branching', 'Merging', 'Pull requests']),
];
// every catalogue skill gets an entry so the skill-gap page can always show something useful
const have = new Set(hand.map((s) => s.name));
const generated = [...new Set(FIELD_CATALOG.flatMap((f) => [...f.skills.core, ...f.skills.tools]))].filter((n) => !have.has(n))
  .map((n) => L(n, 'general', `Build practical working knowledge of ${n}.`, ['Fundamentals', 'Hands-on practice with a real task', 'Add it to your resume once you have used it']));

async function run() {
  if (!process.argv.includes('--yes')) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const a = await rl.question('This DELETES every user, resume, job and application in the database. Type YES to continue: ');
    rl.close();
    if (a.trim() !== 'YES') { console.log('Cancelled. Nothing was changed.'); process.exit(0); }
  }
  await connectDB();
  const models = [User, Profile, Job, Skill, ResumeTemplate, Resume, Application, Notification, SavedSearch, SourceStatus];
  await Promise.all(models.map((M) => M.deleteMany({})));
  await Promise.all(models.map((M) => M.syncIndexes().catch(() => {}))); // also removes stale indexes from older versions
  const t = await ensureTemplates();
  await Skill.insertMany([...hand, ...generated]);
  console.log(`\nDatabase reset complete.\n  - all old users, resumes, jobs and applications removed\n  - ${t} resume templates ready\n  - ${hand.length + generated.length} skill-learning entries ready\nStart the server (npm run dev) and sign up as a new user. Jobs are fetched automatically on start.`);
  await mongoose.disconnect();
}
run().catch((e) => { console.error(e); process.exit(1); });
