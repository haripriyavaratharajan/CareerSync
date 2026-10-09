import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  googleId: { type: String, unique: true, sparse: true, index: true },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10); // never store plain text
  next();
});
userSchema.methods.matchPassword = function (plain) { return bcrypt.compare(plain, this.password); };

export default mongoose.model('User', userSchema);
