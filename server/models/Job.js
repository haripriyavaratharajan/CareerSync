import mongoose from 'mongoose';

// Every job source (Adzuna, Remotive, ...) normalizes into this one shape.
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: String, location: String, description: String,
  responsibilities: [String], requirements: [String],
  skills: [String],
  fields: [String], // career fields this job belongs to (auto-classified)
  experience: { min: { type: Number, default: 0 }, max: Number },
  salary: { min: Number, max: Number, currency: String },
  employmentType: { type: String, default: 'full-time' },
  remoteType: { type: String, enum: ['remote', 'hybrid', 'onsite'], default: 'onsite' },
  sector: { type: String, enum: ['government', 'private'], default: 'private' },
  source: { type: String, required: true },
  sourceUrl: String, applicationUrl: String,
  postedDate: Date, // only what the source states; never invented
  level: { type: String, enum: ['central', 'state'] }, state: String,
  vacancies: Number, qualification: String, eligibility: String, salaryText: String,
  applicationStart: Date, applicationDeadline: Date, importantDates: [{ label: String, date: Date }],
  notificationUrl: String, sourceSite: String,
  dedupeKey: { type: String, unique: true, sparse: true }, // title+company+location
}, { timestamps: true });

jobSchema.index({ title: 'text', company: 'text', skills: 'text' });
export default mongoose.model('Job', jobSchema);
