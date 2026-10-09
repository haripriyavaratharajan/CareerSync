import Profile from '../../models/Profile.js';
import User from '../../models/User.js';
import nodemailer from 'nodemailer';
import Notification from '../../models/Notification.js';
import { match } from '../matching/matcher.js';

// Creates one in-app notification per (user, job) when the match score reaches the threshold.
const smtpReady = () => Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  process.env.MAIL_FROM
);

const transporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

function jobLink(job) {
  return job.applicationUrl || job.notificationUrl || job.sourceUrl || '';
}

async function sendMatchEmail(user, job, score) {
  if (!smtpReady()) return { sent: false, reason: 'SMTP not configured' };
  const link = jobLink(job);
  const subject = `New ${score}% job match: ${job.title}${job.company ? ` at ${job.company}` : ''}`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:680px;margin:auto">
      <h2 style="color:#2563eb">CareerSync AI — New Job Match</h2>
      <p>Hi ${user.name || 'there'},</p>
      <p>We found a new job that matches your profile.</p>
      <div style="padding:18px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc">
        <h3 style="margin:0 0 8px">${job.title}</h3>
        <p style="margin:4px 0"><strong>Company:</strong> ${job.company || 'Not specified'}</p>
        <p style="margin:4px 0"><strong>Match:</strong> ${score}%</p>
        <p style="margin:4px 0"><strong>Location:</strong> ${job.location || 'Not specified'}</p>
      </div>
      ${link ? `<p><a href="${link}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px">View Job</a></p>` : ''}
      <p style="color:#6b7280;font-size:13px">This email was sent because this job matched your CareerSync AI profile.</p>
    </div>`;
  await transporter().sendMail({ from: process.env.MAIL_FROM, to: user.email, subject, html, text: `New ${score}% job match: ${job.title} at ${job.company || 'Unknown company'}. ${link}` });
  return { sent: true };
}

// Creates one in-app notification and one email per (user, job) when the match score reaches the threshold.
export async function notifyMatches(jobs) {
  let created = 0, emailed = 0, emailSkipped = 0;
  const profiles = await Profile.find();
  for (const profile of profiles) {
    if (!profile.careerProfiles?.length) continue; // nothing to match against yet
    const user = await User.findById(profile.user).select('name email');
    if (!user) continue;
    for (const job of jobs) {
      const { score, field } = match(profile, job);
      const threshold = profile.preferences?.matchThreshold ?? Number(process.env.MATCH_NOTIFY_THRESHOLD || 70);
      if (score < threshold) continue;
      const existing = await Notification.findOne({ user: profile.user, job: job._id, type: 'job-match' });
      if (existing) continue;
      await Notification.create({ user: profile.user, type: 'job-match', job: job._id, title: 'New job match', message: `${job.title} at ${job.company || 'Unknown company'} — ${score}% match${field ? ` for your ${field} profile` : ''}` });
      created++;
      try {
        const result = await sendMatchEmail(user, job, score);
        if (result.sent) emailed++; else emailSkipped++;
      } catch (e) {
        emailSkipped++;
        console.error(`Match email failed for ${user.email}:`, e.message);
      }
    }
  }
  return { created, emailed, emailSkipped };
}
