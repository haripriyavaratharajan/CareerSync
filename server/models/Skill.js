import mongoose from 'mongoose';

// Skill catalogue + structured learning recommendations (no paid AI needed)
const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  aliases: [String],
  category: { type: String, default: 'tool' }, // free text: technology, business, education, ...
  learning: { summary: String, topics: [String] },
});
export default mongoose.model('Skill', skillSchema);
