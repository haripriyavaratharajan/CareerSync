import mongoose from 'mongoose';
const { Schema } = mongoose;

// A user can have ANY number of resumes: several per career field, one per job role, tailored to a job, etc.
const resumeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  careerFieldKey: { type: String, required: true, index: true },
  field: { type: String, required: true },
  title: { type: String, default: 'My Resume' },
  targetRole: String,
  job: { type: Schema.Types.ObjectId, ref: 'Job' },
  template: { type: Schema.Types.ObjectId, ref: 'ResumeTemplate' },
  originalFileName: String,
  data: {
    name: String, photo: String, email: String, phone: String, location: String, summary: String,
    professionalField: String, jobTitle: String, targetRoles: [String], skills: [String],
    education: [Schema.Types.Mixed], experience: [Schema.Types.Mixed], projects: [Schema.Types.Mixed],
    certifications: [Schema.Types.Mixed], achievements: [Schema.Types.Mixed], customSections: [Schema.Types.Mixed],
  },
  sectionOrder: { type: [String], default: ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'achievements', 'customSections'] },
  score: { total: Number, breakdown: [{ label: String, passed: Boolean, note: String }] },
  version: { type: Number, default: 1 },
}, { timestamps: true });
resumeSchema.index({ user: 1, updatedAt: -1 }); // NOTE: no unique index – many resumes per field are allowed

export default mongoose.model('Resume', resumeSchema);
