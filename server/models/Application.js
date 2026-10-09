import mongoose from 'mongoose';
const { Schema } = mongoose;

export const STATUSES = ['saved', 'applied', 'interview', 'rejected', 'offer'];

const applicationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  status: { type: String, enum: STATUSES, default: 'saved' },
  notes: String,
  appliedAt: Date,
}, { timestamps: true });
applicationSchema.index({ user: 1, job: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);
