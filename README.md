# CareerSync AI – multi-field edition

React (Vite) + Node/Express + MongoDB (Mongoose). Same stack as before, nothing new to install.

## What changed

| Request | What it does now |
|---|---|
| Useful for every field | 29 career fields (teaching, healthcare, finance, trades, design, law, government, hospitality…). Skill / role suggestions adapt to the field. Job matching no longer assumes IT. |
| Choose fields; one person in many fields | After sign-up you pick **one or more** fields. Career Profile has a tab per field, each with its own skills, experience, target roles and preferences. Add or remove fields any time. |
| Resume templates | 17 templates (ATS, Executive, Scholar, Care, Blueprint, Fresh Start, Ledger, Counsel, Studio, Workshop…). Pick one, see a **live preview with your own data**, switch template later. |
| Separate resumes per field / any number | Unlimited resumes: several per field, per role, or tailored to one job. Gallery, duplicate, rename, delete, reorder/hide sections, **Download PDF** (A4). |
| Job seekers search any jobs, any number | Search any keyword (also asks Remotive/Adzuna online). Save **any number of searches** and save any jobs with the heart; track them on the Job Tracker. |
| Attractive, not a stock blue template | New warm design: cream + vermilion → raspberry → plum, floating gradient orbs, animated hero, scroll reveals, hover lifts, animated score rings, field marquee, dark mode. Respects "reduce motion". |
| Existing data deleted | `npm run reset` wipes every user, resume, job, application. Templates are re-created automatically. |

### Bugs fixed (the "things not working")
- Saving **Settings** used to erase the whole profile (it sent a partial update that overwrote everything). Updates are now partial and validated.
- One resume per field was enforced by a unique database index; removed (old index is dropped on start).
- Profile edits silently overwrote resumes; now resumes are independent, with an explicit **Refresh from profile** button.
- Job scoring ignored job titles and treated postings without skills as 0%; fixed (unknowable parts are left out, not counted as zero).
- Jobs from Remotive were fetched with a hard-coded tech query; now broad, and searches are on demand + cached.
- Invalid IDs / expired tokens crashed pages; now handled (404 / automatic logout).
- Loading, empty and error states added to every page.

## Run it (Windows PowerShell or any terminal)

You need Node 18+ and MongoDB running locally (or a MongoDB Atlas URL).

**1. Backend**
```
cd server
npm install
copy .env.example .env        # (Mac/Linux: cp .env.example .env)  then edit MONGODB_URI / JWT_SECRET
npm run reset                 # type YES  -> deletes ALL old data, creates templates
npm run dev
```
**2. Frontend** (new terminal)
```
cd client
npm install
npm run dev
```
Open http://localhost:5173 → Get started → create an account → choose your fields.

Optional `client/.env`: `VITE_API_URL=http://localhost:5000/api`, `VITE_GOOGLE_CLIENT_ID=…`

## Getting jobs for every profession
The free public sources are mostly remote **tech** jobs. For teachers, nurses, accountants, trades etc. add free keys from https://developer.adzuna.com to `server/.env`:
```
ADZUNA_APP_ID=...
ADZUNA_APP_KEY=...
ADZUNA_COUNTRY=in
```
Restart the server. Jobs sync on start and every 12 hours, steered by the roles your users target; searching also fetches live results. You can trigger it with **Sync all sources** on the Jobs page.

## Adding things later
- New profession: add one entry in `server/data/fields.js`.
- New resume template: add one entry in `server/data/templates.js` and restart (layouts: single, sidebar-left, sidebar-right, two-column).

## Structure
```
server/  data/ (fields, templates)  models/  routes/  services/ (matching, jobSources, resume parser, notifier)  seed/seed.js (reset)
client/src/  pages/  components/ (Resume.jsx = template renderer)  lib/  context/  hooks/  index.css  resume.css
```

## Honest notes
- Tested here with a real browser + MongoDB-compatible database: sign-up, multi-field profile, 17 templates, unlimited resumes, editing, PDF, job search, saved jobs/searches, tracker, settings, dark mode, mobile. 38 API checks and 27 browser steps pass.
- **Not testable in my sandbox** (no internet): live calls to Remotive/Adzuna, government job scrapers, Google Sign-In, e-mail alerts. They are wired up but verify them on your machine. Government scrapers depend on third-party websites and can break when those sites change.
- Resume PDF uses the browser's print dialog: choose **Save as PDF**, and untick "Headers and footers".
- Google Fonts load from the internet; offline, safe fallback fonts are used.
