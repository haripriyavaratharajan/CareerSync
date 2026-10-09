import mongoose from 'mongoose';
const { Schema } = mongoose;

// "Jobs I like": any number of saved searches per user.
const savedSearchSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  q: { type: String, default: '' },
  location: { type: String, default: '' },
  field: { type: String, default: '' },
  sector: { type: String, default: '' },
  remote: { type: String, default: '' },
  level: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('SavedSearch', savedSearchSchema);
