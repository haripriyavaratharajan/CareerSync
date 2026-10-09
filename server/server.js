import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import jobRoutes from './routes/jobs.js';
import { matchesRouter, skillGapRouter } from './routes/matches.js';
import applicationRoutes from './routes/applications.js';
import notificationRoutes from './routes/notifications.js';
import resumeRoutes from './routes/resume.js';
import savedSearchRoutes from './routes/savedSearches.js';
import Resume from './models/Resume.js';
import { ensureTemplates } from './services/templates.js';
import { syncAll } from './services/jobSources/index.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();
app.use(helmet());

// Allowed browser origins: CLIENT_URL (comma separated) + any localhost port while developing (Vite may pick 5174, 5175...)
const allowed = (process.env.CLIENT_URL || '').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
const isLocal = (o) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);
app.use(cors({ origin: (origin, cb) => cb(null, !origin || allowed.includes(origin) || (process.env.NODE_ENV !== 'production' && isLocal(origin))), credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/', (req, res) => res.json({ name: 'CareerSync API', status: 'running', docs: 'Open the React app at http://localhost:5173' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/matches', matchesRouter);
app.use('/api/skill-gap', skillGapRouter);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/saved-searches', savedSearchRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB()
  .then(async () => {
    await ensureTemplates();                                  // templates are always available – no seed needed
    await Resume.syncIndexes().catch(() => {});               // drops the old "one resume per field" unique index if it exists
    app.listen(PORT, () => {
      console.log(`API running on port ${PORT}`);
      if (process.env.AUTO_SYNC !== 'false') { // fetch real jobs on start, then periodically
        const run = () => syncAll().then(() => console.log('Job sync done')).catch((e) => console.error('Job sync failed', e.message));
        run(); setInterval(run, (Number(process.env.SYNC_INTERVAL_HOURS) || 12) * 3600e3);
      }
    });
  })
  .catch((err) => { console.error('Could not start:', err.message); process.exit(1); });
