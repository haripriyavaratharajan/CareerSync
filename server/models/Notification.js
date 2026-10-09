import mongoose from 'mongoose';
const { Schema } = mongoose;

const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['job-match', 'resume', 'profile', 'deadline', 'skill-gap'], required: true },
  title: { type: String, required: true },
  message: String,
  job: { type: Schema.Types.ObjectId, ref: 'Job' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
