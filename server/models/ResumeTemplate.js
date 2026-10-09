import mongoose from 'mongoose';

// `layout` + `style` tell the React renderer how to draw the resume (see client/src/components/Resume.jsx)
const templateSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  layout: { type: String, enum: ['single', 'sidebar-left', 'sidebar-right', 'two-column'], required: true },
  category: String,
  accentColor: String,
  bestFor: [String],
  suits: [String],
  defaultOrder: [String],
  style: { type: mongoose.Schema.Types.Mixed, default: {} },
});
export default mongoose.model('ResumeTemplate', templateSchema);
