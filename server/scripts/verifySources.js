// Live check of every job source (no database needed): npm run verify:sources
import 'dotenv/config';
import { SOURCES } from '../services/jobSources/index.js';

for (const s of SOURCES) {
  try {
    const jobs = await s.fn();
    const ex = jobs[0] || {};
    console.log(`\n[OK ] ${s.name}  (${s.url})\n  jobs fetched: ${jobs.length}\n  example title: ${ex.title || '-'}\n  notification URL: ${ex.notificationUrl || ex.sourceUrl || '-'}\n  application URL: ${ex.applicationUrl || 'Application link not available'}`);
  } catch (e) { console.log(`\n[UNAVAILABLE] ${s.name}  (${s.url})\n  reason: ${e.message}`); }
}
process.exit(0);
