import mongoose from 'mongoose';
const { Schema } = mongoose;

const itemSchemas = {
  education: new Schema({ degree: String, college: String, university: String, graduationYear: String, score: String }, { _id: false }),
  experience: new Schema({ company: String, role: String, duration: String, description: String }, { _id: false }),
  project: new Schema({ name: String, description: String, technologies: [String], githubUrl: String, liveUrl: String }, { _id: false }),
  certification: new Schema({ name: String, issuer: String, date: String, credentialUrl: String }, { _id: false }),
  achievement: new Schema({ title: String, description: String, date: String }, { _id: false }),
  custom: new Schema({ title: String, content: String }, { _id: false }),
};

const careerSchema = new Schema({
  key: { type: String, required: true }, field: { type: String, required: true }, targetRoles: [String],
  headline: String, jobTitle: String,
  skills: { core: [String], tools: [String], knowledge: [String], soft: [String] },
  education: [itemSchemas.education], experience: [itemSchemas.experience], projects: [itemSchemas.project],
  certifications: [itemSchemas.certification], achievements: [itemSchemas.achievement], customSections: [itemSchemas.custom],
  preferences: {
    preferredLocations: [String], workMode: { type: String, enum: ['remote', 'hybrid', 'onsite', 'any'], default: 'any' },
    sector: { type: String, enum: ['government', 'private', 'both'], default: 'both' },
    experienceLevel: { type: String, enum: ['fresher', 'junior', 'mid', 'senior'], default: 'fresher' },
  },
}, { _id: false });

const profileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  phone: String, location: String, photoUrl: String, careerProfiles: { type: [careerSchema], default: [] },
  // Legacy fields remain so older databases continue to work.
  headline: String, professionalField: String, jobTitle: String,
  education: [itemSchemas.education], skills: { core: [String], tools: [String], knowledge: [String], soft: [String] },
  experience: [itemSchemas.experience], projects: [itemSchemas.project], certifications: [itemSchemas.certification],
  achievements: [itemSchemas.achievement], customSections: [itemSchemas.custom],
  preferences: {
    desiredRoles: [String], matchThreshold: { type: Number, default: 70 }, preferredLocations: [String],
    workMode: { type: String, enum: ['remote', 'hybrid', 'onsite', 'any'], default: 'any' },
    sector: { type: String, enum: ['government', 'private', 'both'], default: 'both' },
    experienceLevel: { type: String, enum: ['fresher', 'junior', 'mid', 'senior'], default: 'fresher' },
  },
}, { timestamps: true });

export default mongoose.model('Profile', profileSchema);
