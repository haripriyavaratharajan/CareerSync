import User from '../models/User.js';
import Profile from '../models/Profile.js';
import { signToken } from '../utils/token.js';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'node:crypto';

const emailOk = (e) => /^\S+@\S+\.\S+$/.test(e || '');
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, theme: u.theme, authProvider: u.authProvider });
const googleClient = () => new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
    if (!emailOk(email)) return res.status(400).json({ message: 'Valid email is required' });
    if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    await Profile.create({ user: user._id });
    res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!emailOk(email) || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: signToken(user._id), user: publicUser(user) });
  } catch (e) { next(e); }
}

export const me = (req, res) => res.json({ user: publicUser(req.user) });

// JWT is stateless; the client discards the token.
export const logout = (req, res) => res.json({ message: 'Logged out' });


export async function googleLogin(req, res, next) {
  try {
    const { credential } = req.body || {};
    if (!credential) return res.status(400).json({ message: 'Google credential is required' });
    if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).json({ message: 'Google Sign-In is not configured on the server' });

    const ticket = await googleClient().verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload?.email || payload.email_verified !== true) {
      return res.status(401).json({ message: 'Google account could not be verified' });
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email }] }).select('+password');

    if (!user) {
      user = await User.create({
        name: payload.name || payload.email.split('@')[0],
        email,
        password: crypto.randomBytes(32).toString('hex'),
        googleId: payload.sub,
        authProvider: 'google',
      });
      await Profile.create({ user: user._id });
    } else {
      if (!user.googleId) user.googleId = payload.sub;
      if (user.authProvider !== 'google') user.authProvider = 'google';
      if (payload.name && !user.name) user.name = payload.name;
      await user.save();
      if (!(await Profile.exists({ user: user._id }))) await Profile.create({ user: user._id });
    }

    res.json({ token: signToken(user._id), user: publicUser(user) });
  } catch (e) {
    console.error('Google Sign-In error:', e.message);
    res.status(401).json({ message: 'Google Sign-In failed. Please try again.' });
  }
}
