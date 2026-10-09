import { Router } from 'express';
import protect from '../middleware/auth.js';
import { register, login, me, logout, googleLogin } from '../controllers/authController.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/logout', protect, logout);
router.get('/me', protect, me);
export default router;
