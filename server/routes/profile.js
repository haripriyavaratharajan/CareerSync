import { Router } from 'express';
import protect from '../middleware/auth.js';
import { getProfile, updateProfile } from '../controllers/profileController.js';

const router = Router();
router.use(protect);
router.route('/').get(getProfile).put(updateProfile);
export default router;
