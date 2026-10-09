import mongoose from 'mongoose';
const { Schema } = mongoose;

const matchSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  score: Number,
  breakdown: { skills: Number, experience: Number, location: Number, education: Number },
  matchedSkills: [String], missingSkills: [String],
}, { timestamps: true });
matchSchema.index({ user: 1, job: 1 }, { unique: true });

export default mongoose.model('JobMatch', matchSchema);
