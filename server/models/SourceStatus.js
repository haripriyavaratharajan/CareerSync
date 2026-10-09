import mongoose from 'mongoose';
// Last sync result per source, so the UI can show "unavailable" instead of fake data.
export default mongoose.model('SourceStatus', new mongoose.Schema({
  key: { type: String, unique: true }, name: String, kind: String, url: String,
  status: { type: String, enum: ['ok', 'error'] }, error: String, count: Number, lastFetched: Date,
}));
